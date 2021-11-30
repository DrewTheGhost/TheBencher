const chalk = require("chalk"),
      util = require("util"), // Do NOT remove, used for debugging
      config = require("../../../config.json"),
      { Manager } = require("@lavacord/discord.js"),
      nodes = [
          { id: "1", host: config.lavalink.host, port: config.lavalink.port, password: config.lavalink.password}
      ],
      fetch = require("node-fetch"),
      { URLSearchParams } = require("url")
let id = 0, player, manager;

module.exports = {
    name: "play",
    aliases: ["music"],
    description: "Plays some good shiiiiit",
    controlled: false,
    async fn(message, suffix, bot, db) {
        let title, requester;
        if(manager == undefined) {
            manager = new Manager(bot, nodes, { user: "801939642261307393", shards: 1 })
            await manager.connect()
            bot.manager = manager
        }

        if(message.member.voice.channelId === null) {
            return message.channel.send("You aren't even in a voice channel to listen to anything, dumbass.")
        }
        if(suffix == "" || !suffix) {
            return message.channel.send("Actually fucking type something after play!!")
        }
        if(manager.listenerCount("error") == 0) {
            console.debug("Creating error listener for manager.")
            manager.on("error", (error, node) => {
                console.error(`Lavalink error: ${error}\nWith node: ${node}`)
            })
        }
        let searchQuery;
        if(suffix.split(" ")[0] == "playlist") {
            suffix = suffix.split(" ")
            suffix.shift()
            searchQuery = suffix.join(" ")
            console.log(searchQuery)
        } else {
            searchQuery = `ytsearch:${suffix}`
        }
        getSongs(searchQuery).then(async results => {
            if(results.tracks.length == 0) {
                return message.channel.send("No results found.")
            }
            if(results.loadType == "PLAYLIST_LOADED") {
                for(const track of results.tracks) {
                    if(id >= 50) {
                        break
                    }
                    id++
                    db.client.query("INSERT INTO queue (title, url, requester, id, track64) VALUES ($1, $2, $3, $4, $5);", [track.info.title, track.info.uri, message.author.username, id, track.track], function(err, _result) {
                        if(err) {
                            return console.error(err)
                        }
                    })
                }
                db.client.query("SELECT * FROM queue;", (err, result) => {
                    if(err) {
                        return console.error(err)
                    }
                    message.channel.send(`${message.author.username} requested a playlist. New queue length is ${result.rows.length}.`)
                })
            } else {
                db.client.query("INSERT INTO queue(title, url, requester, id, track64) VALUES($1, $2, $3, $4, $5) RETURNING *;", [results.tracks[0].info.title, results.tracks[0].info.uri, message.author.username, id, results.tracks[0].track], function(err, result) {
                    if(err) {
                        console.error(err)
                        return message.channel.send(`There was an error requesting the song, this has been logged.`)
                    }
    
                    title = result.rows[0].title
                    requester = result.rows[0].requester
                    console.debug(`${chalk.blue("Music:")}${chalk.reset()} ${chalk.yellow(result.rows[0].requester)}${chalk.reset()} Requested ${title}`)
                    console.debug(`${chalk.blue("Music:")} Song title - ${chalk.yellow(title)}${chalk.reset()}\n`)
                    message.channel.send(`\`${requester} requested ${title}. Added to the queue at position ${result.rows.length}.\``)
                })
                id++
            }
            
            if(player == undefined) {
                player = await manager.join({
                    guild: message.channel.guild.id,
                    channel: message.member.voice.channelId,
                    node: manager.idealNodes[0].id
                })
                bot.player = player
            }

            db.client.query("SELECT * FROM queue ORDER BY id ASC LIMIT 1;", (err, result) => {
                if(err) {
                    console.error(err)
                    return message.channel.send("Error running SELECT query to play music.")
                }
                
                if(!player.playing) {
                    player.play(result.rows[0].track64)
                    message.channel.send(`Now playing ${result.rows[0].title} - Requested by ${result.rows[0].requester}`)
                }

                if(player.listenerCount("error") <= 1) {
                    player.on("error", err => {
                        console.debug("Creating player error handler.")
                        db.client.query("DELETE FROM queue WHERE id IN (SELECT id FROM queue ORDER BY id ASC LIMIT 1)", (err, _result) => {
                            if(err) {
                                id--;
                                console.error(err)
                            }
                        })
                        console.error(err)
                        db.client.query("SELECT * FROM queue ORDER BY id;", async (err, result) => {
                            if(err) {
                                console.error(err)
                            }
                            if(result.rows.length > 0) {
                                player.play(result.rows[0].track64)
                                message.channel.send(`Now playing ${result.rows[0].title} requested by ${result.rows[0].requester}`)
                            } else {
                                id = 0
                                message.channel.send("Nothing left in queue, leaving!")
                                player.destroy()
                                await manager.leave(message.channel.guild.id)
                                player = undefined
                                bot.player = player
                            }
                        })
                    })
                }

                if(player.listenerCount("end") == 0) {
                    console.debug("Creating player song end handler.")
                    player.on("end", data => {
                        db.client.query("DELETE FROM queue WHERE id IN (SELECT id FROM queue ORDER BY id ASC LIMIT 1)", (err, _result) => {
                            id--;
                            if(err) {
                                console.error(err)
                            }
                        })
                        if(data.reason == "REPLACED") return;
                        db.client.query("SELECT * FROM queue ORDER BY id;", async (err, result) => {
                            if(err) {
                                console.error(err)
                            }
                            if(result.rows.length > 0) {
                                player.play(result.rows[0].track64)
                                message.channel.send(`Now playing ${result.rows[0].title} requested by ${result.rows[0].requester}`)
                            } else {
                                id = 0;
                                message.channel.send("Nothing left in queue, leaving!")
                                player.destroy()
                                await manager.leave(message.channel.guild.id)
                                player = undefined
                                bot.player = player
                            }
                        })
                    })
                }
            })
        })

        async function getSongs(search) {
            const node = manager.idealNodes[0]
            const params = new URLSearchParams()
            params.append("identifier", search)

            return fetch(`http://${node.host}:${node.port}/loadtracks?${params}`, { headers: { Authorization: node.password } })
            .then(res => res.json())
            .catch(err => {
                console.error(err)
                return null
            })
        }
    }
}