const util = require("util"), // Do NOT remove, used for debugging
      config = require("../../../config.json"),
      { Manager } = require("@lavacord/discord.js"),
      nodes = [
        { id: "1", host: config.lavalink.host, port: config.lavalink.port, password: config.lavalink.password}
      ],
      fetch = require("node-fetch"),
      { URLSearchParams } = require("url"),
      linkTest = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)


module.exports = {
    name: "play",
    aliases: ["music"],
    description: "Plays some good shiiiiit",
    controlled: false,
    async fn(params) {
        const message = params.message,
            suffix = params.suffix,
            bot = params.bot,
            db = params.db,
            logger = params.logger
            
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
            logger.debug("Creating error listener for bot.manager")
            bot.manager.on("error", (error, node) => {
                logger.error(`[play.js:41] Lavalink error: ${error}\nWith node: ${node}`)
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
                await insertMultipleSongs(message, db, results).then(async () => {
                    if(!bot.player.playing) {
                        await playSong(message, bot, db).catch(err => {
                            logger.error(`[play.js:66 ${err}`)
                        })
                    }
                }).catch(err => {
                    logger.error(`[play.js:70] ${err}`)
                })
            } else {
                await insertSingleSong(message, db, results).then(async () => {
                    if(!bot.player.playing) {
                        await playSong(message, bot, db).catch(err => {
                            logger.error(`[play.js:76] ${err}`)
                        })
                    }
                }).catch(err => {
                    logger.error(`[play.js:80] ${err}`)
                })
            }

            if(bot.player.listenerCount("error") <= 1) {
                 bot.player.on("error", async (err) => {
                    logger.debug("Creating player error handler.")
                    await dropCurrentSong(db).then(async () => {
                        await playSong(message, bot, db).catch(err => {
                            message.channel.send(`[${err.exception.severity}]\nError playing song, dropping it from queue.\nErr: ${err.error}\nCause: ${err.exception.cause}`)
                            logger.error(`[play.js:90] ${err}`)
                        })
                    }).catch(err => {
                        logger.error(`${err.msg} ${err.error}`)
                    })
                    logger.error(`[play.js:95] ${err}`)
                })
            }

            if(bot.player.listenerCount("end") == 0) {
                logger.debug("Creating player song end handler.")
                bot.player.on("end", async (data) => {
                    await dropCurrentSong(db).then(async () => {
                        if(data.reason == "REPLACED") return;
                        await playSong(message, bot, db).catch(err => {
                            logger.error(`[play.js:105] ${err}`)
                        })
                    }).catch(err => {
                        logger.error(`${err.msg} ${err.error}`)
                    })
                })
            }
        }).catch(err => {
            logger.error(`[play.js:113] ${err}`)
        })
    }
}

let id = 1;
async function getSongs(search, bot) {
    const node = bot.manager.idealNodes[0]
    const params = new URLSearchParams()
    params.append("identifier", search)

    return await fetch(`http://${node.host}:${node.port}/loadtracks?${params}`, { headers: { Authorization: node.password } })
    .then(res => res.json())
    .catch(err => {
        logger.error(`[play.js:127] ${err}`)
        return null
    })
}

async function playSong(message, bot, db) {
    return await new Promise(async (resolve, reject) => {
        await db.query("SELECT * FROM queue ORDER BY id;").then(async result => {
            if(result.rows.length > 0) {
                bot.player.play(result.rows[0].track64)
                message.channel.send(`🎵 **Now playing \`${result.rows[0].title}\` Requested by ${result.rows[0].requester}**`)
                resolve()
            } else {
                id = 1
                message.channel.send("Nothing left in queue, leaving!")
                await bot.player.destroy()
                await bot.manager.leave(message.channel.guild.id)
                bot.player = undefined
                resolve() 
            }
        }).catch(err => {
            message.channel.send("Fucked up playing song somehow, database is literally imploding. What the fuck did you do??")
            reject(err)
        })
    })
}

async function dropCurrentSong(db) {
    return await new Promise(async (resolve, reject) => {
        let queue = []

        await db.query("DELETE FROM queue WHERE id IN (SELECT id FROM queue ORDER BY id ASC LIMIT 1) RETURNING *;").then((result) => {
            logger.debug(`dropCurrentSong DELETE SPECIFIC FROM queue:\n${result}`)
        }).catch(err => {
            err = {msg: "dropCurrentSong: First DB Query", error: err}
            reject(err)
        })

        await db.query("SELECT * FROM queue ORDER BY id;").then(result => {
            logger.debug(`dropCurrentSong SELECT FROM queue:\n${result}`)
            queue = result.rows
        }).catch(err => {
            err = {msg: "dropCurrentSong: Second DB Query", error: err}
            reject(err)
        })

        await db.query("DELETE FROM queue;").then(async () => {
            logger.debug(`dropCurrentSong DELETE ALL FROM queue`)
            await fixId(queue).then(async (newQueue) => {
                logger.debug(`dropCurrentSong:fixId Queue Fixed Results:\n${newQueue}`)
                await db.query(`INSERT INTO queue(title, url, requester, id, track64, duration) VALUES${newQueue};`).then(result => {
                    logger.debug(`dropCurrentSong:fixId MULTI INSERT INTO QUEUE:\n${result}`)
                    resolve()
                }).catch(err => {
                    err = {msg: "dropCurrentSong: Fourth DB Query", error: err}
                    reject(err)
                })
            })
        }).catch(err => {
            err = {msg: "dropCurrentSong: Third DB Query", error: err}
            reject(err)
        })
    })
}

async function insertSingleSong(message, db, results) {
    return await new Promise(async (resolve, reject) => {
        let title = results.tracks[0].info.title, 
            url = results.tracks[0].info.uri
            username = message.author.username,
            track64 = results.tracks[0].track,
            duration = results.tracks[0].info.length;

        await db.query("SELECT * FROM queue ORDER BY id DESC;").then(result => {
            if(result.rows.length > 0) {
                id = result.rows[0].id + 1
            } else if(result.rows.length == 0) {
                id = 1
            }
        }).catch(err => {
            message.channel.send("Holy shit the database is literally on fire, this shit errored.")
            reject(err)
        })

        await db.query("INSERT INTO queue(title, url, requester, id, track64, duration) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;", [title, url, username, id, track64, duration]).then(result => {
            const embeds = [{
                "title": title,
                "url": url,
                "color": 4192773,
                "fields": [
                    {
                        "name": "Song Position",
                        "value": result.rows[0].id,
                        "inline": true
                    },
                    {
                        "name": "Queue Size",
                        "value": result.rows.length,
                        "inline": true
                    },
                    {
                        "name": "Requester",
                        "value": `${username}#${message.author.discriminator}`
                    }
                ]
            }]
            logger.debug(`${username} Requested: ${title}`)
            message.channel.send({content: "🎵 **Song added to queue**", embeds: embeds})
            resolve()
        }).catch(err => {
            message.channel.send(`There was an error requesting the song, this has been logged.`)
            reject(err)
        })
    })
}

async function insertMultipleSongs(message, db, results) {
    return await new Promise(async (resolve, reject) => {
        const playlistSongs = []
        await db.query("SELECT * FROM queue ORDER BY id DESC;").then(result => {
            if(result.rows.length > 0) {
                id = result.rows[0].id + 1
            } else if(result.rows.length == 0) {
                id = 1
            }
        }).catch(err => {
            reject(err)
        })
    
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
    
        await db.query(`INSERT INTO queue (title, url, requester, id, track64, duration) VALUES${playlistSongs} RETURNING *;`).then((result) => {
            logger.debug(`${message.author.username} Requested Playlist: ${results.playlistInfo.name}`)
        }).catch(err => {
            reject(err)
        })
    
        await db.query("SELECT * FROM queue;").then(result => {
            const embeds = [{
                "title": results.playlistInfo.name,
                "color": 4192773,
                "fields": [
                    {
                        "name": "Playlist Size",
                        "value": results.tracks.length,
                        "inline": true
                    },
                    {
                        "name": "Queue Size",
                        "value": result.rows.length,
                        "inline": true
                    },
                    {
                        "name": "Requester",
                        "value": `${message.author.username}#${message.author.discriminator}`
                    }
                ]
            }]
            message.channel.send({content: "🎶 **Playlist added to queue**", embeds: embeds})
            resolve()
        }).catch(err => {
            reject(err)
        })
    })
}

async function fixId(queue) {
    let newQueue = []
    return await new Promise((resolve, reject) => {
        try {
            for(const item of queue) {
                let currentIndex = queue.indexOf(item)
                queue[currentIndex].id = currentIndex + 1
                newQueue.push(`('${item.title}', '${item.url}', '${item.requester}', ${queue[currentIndex].id}, '${item.track64}', '${item.duration}')`)
            }
            resolve(newQueue)
        } catch(err) {
            reject(err)
        }
    })
}