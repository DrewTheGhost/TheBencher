const chalk = require("chalk"),
      util = require("util"), // Do NOT remove, used for debugging
      config = require("../../../config.json"),
      { Manager } = require("@lavacord/discord.js"),
      nodes = [
        { id: "1", host: config.lavalink.host, port: config.lavalink.port, password: config.lavalink.password}
      ],
      fetch = require("node-fetch"),
      { URLSearchParams } = require("url"),
      linkTest = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi); 


module.exports = {
    name: "play",
    aliases: ["music"],
    description: "Plays some good shiiiiit",
    controlled: false,
    async fn(message, suffix, bot, db) {
        if(bot.manager == undefined) {
            bot.manager = new Manager(bot, nodes, { user: "801939642261307393", shards: 1 })
            await bot.manager.connect()
        }

        if(message.member.voice.channelId === null) {
            return message.channel.send("You aren't even in a voice channel to listen to anything, dumbass.")
        }

        if(suffix === "" || !suffix) {
            return message.channel.send("Actually fucking type something after play!!")
        }

        if(bot.manager.listenerCount("error") == 0) {
            console.debug("Creating error listener for manager.")
            bot.manager.on("error", (error, node) => {
                console.error(`Lavalink error: ${error}\nWith node: ${node}`)
            })
        }

        if(!suffix.match(linkTest)) {
            suffix = "ytsearch:" + suffix
            // If there's no match for a link, we need to prepend the identifier ytsearch: to the actual search so LavaLink knows
        }

        await getSongs(suffix, bot).then(async results => {
            if(results.tracks.length == 0) {
                return message.channel.send("No results found.")
            }

            if(bot.player == undefined) {
                bot.player = await bot.manager.join({
                    guild: message.channel.guild.id,
                    channel: message.member.voice.channelId,
                    node: `${bot.manager.idealNodes[0].id}`
                })
            }

            if(results.loadType == "PLAYLIST_LOADED") {
                insertMultipleSongs(message, db, results).then(() => {
                    if(!bot.player.playing) {
                        playSong(message, bot, db).catch(err => {
                            console.error(err)
                        })
                    }
                }).catch(err => {
                    console.error(err)
                })
            } else {
                insertSingleSong(message, db, results).then(() => {
                    if(!bot.player.playing) {
                        playSong(message, bot, db).catch(err => {
                            console.error(err)
                        })
                    }
                }).catch(err => {
                    console.error(err)
                })
            }

            if(bot.player.listenerCount("error") <= 1) {
                 bot.player.on("error", async (err) => {
                    console.debug("Creating player error handler.")
                    dropCurrentSong(db).then(() => {
                        playSong(message, bot, db).catch(err => {
                            console.error(err)
                        })
                    }).catch(err => {
                        console.error(err)
                    })
                })
            }

            if(bot.player.listenerCount("end") == 0) {
                console.debug("Creating player song end handler.")
                bot.player.on("end", async (data) => {
                    dropCurrentSong(db).then(() => {
                        if(data.reason == "REPLACED") return;
                        playSong(message, bot, db).catch(err => {
                            console.error(err)
                        })
                    }).catch(err => {
                        console.error(err)
                    })
                })
            }
        }).catch(err => {
            console.error(err)
        })
    }
}

let id = 1;
async function getSongs(search, bot) {
    const node = bot.manager.idealNodes[0]
    const params = new URLSearchParams()
    params.append("identifier", search)

    return fetch(`http://${node.host}:${node.port}/loadtracks?${params}`, { headers: { Authorization: node.password } })
    .then(res => res.json())
    .catch(err => {
        console.error(err)
        return null
    })
}

function playSong(message, bot, db) {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM queue ORDER BY id;", async (err, result) => {
            if(err) {
                message.channel.send("Fucked up playing song somehow, database is literally imploding. What the fuck did you do??")
                reject(err)
            }
            if(result.rows.length > 0) {
                bot.player.play(result.rows[0].track64)
                message.channel.send(`Now playing ${result.rows[0].title} Requested by ${result.rows[0].requester}`)
                resolve()
            } else {
                id = 1
                message.channel.send("Nothing left in queue, leaving!")
                await bot.player.destroy()
                await bot.manager.leave(message.channel.guild.id)
                bot.player = undefined
                resolve()
            }
        })
    })

}

function dropCurrentSong(db) {
    return new Promise((resolve, reject) => {
        let queue = []
        db.query("DELETE FROM queue WHERE id IN (SELECT id FROM queue ORDER BY id ASC LIMIT 1);", (err, _result) => {
            if(err) reject(err)
        })
        setTimeout(() => {
            db.query("SELECT * FROM queue ORDER BY id;", async (err, result) => {
                if(err) reject(err)
                queue = result.rows
            })
        }, 10)
        setTimeout(() => {
            db.query("DELETE FROM queue;", (err, _result) => {
                if(err) reject(err)
            })
        }, 20)
        setTimeout(() => {
            fixId(queue).then((newQueue) => {
                db.query(`INSERT INTO queue(title, url, requester, id, track64, duration) VALUES${newQueue};`, (err, result) => {
                    if(err) reject(err)
                })
                resolve()
            })
        }, 30)
    })
}

function insertSingleSong(message, db, results) {
    return new Promise((resolve, reject) => {
        let title = results.tracks[0].info.title, 
            url = results.tracks[0].info.uri
            username = message.author.username,
            track64 = results.tracks[0].track,
            duration = results.tracks[0].info.length;

        db.query("SELECT * FROM queue ORDER BY id DESC;", (err, result) => {
            if(err) {
                message.channel.send("Holy shit the database is literally on fire, this shit errored.")
                reject(err)
            } else if(result.rows.length > 0) {
                id = result.rows[0].id + 1
            } else if(result.rows.length == 0) {
                id = 1
            }
        })

        setTimeout(() => {
            db.query("INSERT INTO queue(title, url, requester, id, track64, duration) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;", [title, url, username, id, track64, duration], function(err, result) {
                if(err) {
                    message.channel.send(`There was an error requesting the song, this has been logged.`)
                    reject(err)
                }
                console.debug(`${chalk.blue("Music:")}${chalk.reset()} ${chalk.yellow(username)}${chalk.reset()} Requested ${title}`)
                console.debug(`${chalk.blue("Music:")} Song title - ${chalk.yellow(title)}${chalk.reset()}\n`)
                message.channel.send(`\`${username} requested ${title}. Added to the queue at position ${result.rows[0].id}.\``)
                resolve()
            })
        }, 2)

    })
}

function insertMultipleSongs(message, db, results) {
    return new Promise((resolve, reject) => {
        const playlistSongs = []
        db.query("SELECT * FROM queue ORDER BY id DESC;", (err, result) => {
            if(err) {
                reject(err)
            } else if(result.rows.length > 0) {
                id = result.rows[0].id + 1
            } else if(result.rows.length == 0) {
                id = 1
            }
        })
    
        if(id >= 500) {
            message.channel.send("Too many songs in queue.")
            reject()
        } else if(results.tracks.length >= 500) {
            message.channel.send("Too many songs in playlist.")
            reject()
        }
    
        for(let track of results.tracks) {
            let title = track.info.title,
                url = track.info.uri,
                username = message.author.username,
                track64 = track.track,
                duration = track.info.length;

            title = title.replace(/[\)]/g, "\]")
            title = title.replace(/[\(]/g, "\[")
            title = title.replace(/[\']/g, "")
            playlistSongs.push(`('${title}', '${url}', '${username}', ${id}, '${track64}', '${duration}')`)   
            id++
        }
    
        setTimeout(() => {
            db.query(`INSERT INTO queue (title, url, requester, id, track64, duration) VALUES${playlistSongs} RETURNING *;`, function(err, result) {
                if(err) reject(err)
            })
        }, 1)
    
        setTimeout(() => {
            db.query("SELECT * FROM queue;", (err, result) => {
                if(err) reject(err)
                message.channel.send(`${message.author.username} requested a playlist. New queue length is ${result.rows.length}.`)
                resolve()
            })
        }, 500)

    })

}

function fixId(queue) {
    let newQueue = []
    return new Promise((resolve, reject) => {
        for(const item of queue) {
            let currentIndex = queue.indexOf(item)
            queue[currentIndex].id = currentIndex + 1
            newQueue.push(`('${item.title}', '${item.url}', '${item.requester}', ${queue[currentIndex].id}, '${item.track64}', '${item.duration}')`)
        }
        resolve(newQueue)
    })
}