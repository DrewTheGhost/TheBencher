const chalk = require("chalk"),
      util = require("util"), // Do NOT remove, used for debugging
      config = require("../../../config.json"),
      { Manager } = require("@lavacord/discord.js"),
      nodes = [
          { id: "1", host: config.lavalink.host, port: config.lavalink.port, password: config.lavalink.password}
      ],
      fetch = require("node-fetch"),
      { URLSearchParams } = require("url")
let id = 0;

module.exports = {
    name: "play",
    aliases: ["music"],
    description: "Plays some good shiiiiit",
    controlled: false,
    async fn(message, suffix, bot, db) {
        let title, requester, player;
        const manager = new Manager(bot, nodes, { user: "801939642261307393", shards: 1 })
        await manager.connect()

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

        getSongs(`ytsearch:${suffix}`).then(async results => {
            if(results == []) {
                return message.channel.send("No results found.")
            }

            id++
            db.client.query("INSERT INTO queue(title, url, requester, id, track64) VALUES($1, $2, $3, $4, $5) RETURNING *;", [results[0].info.title, results[0].info.uri, message.author.username, id, results[0].track], function(err, result) {
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

            player = await manager.join({
                guild: message.channel.guild.id,
                channel: message.member.voice.channelId,
                node: "1"
            })

            db.client.query("SELECT * FROM queue ORDER BY id ASC LIMIT 1;", (err, result) => {
                if(err) {
                    console.error(err)
                    return message.channel.send("Error running SELECT query to play music.")
                }
                
                player.play(result.rows[0].track64)
                message.channel.send(`Now playing ${result.rows[0].title} - Requested by ${result.rows[0].requester}`)

                player.once("error", err => {
                    db.client.query("DELETE FROM queue WHERE id IN (SELECT id FROM queue ORDER BY id ASC LIMIT 1)", (err, _result) => {
                        if(err) {
                            console.error(err)
                        }
                    })
                    console.error(err)
                })

                player.once("end", data => {
                    db.client.query("DELETE FROM queue WHERE id IN (SELECT id FROM queue ORDER BY id ASC LIMIT 1)", (err, _result) => {
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
                        } else {
                            await manager.leave(message.channel.guild.id)
                        }
                    })
                })

            })
        })

        async function getSongs(search) {
            const node = manager.idealNodes[0]
            const params = new URLSearchParams()
            params.append("identifier", search)

            return fetch(`http://${node.host}:${node.port}/loadtracks?${params}`, { headers: { Authorization: node.password } })
            .then(res => res.json())
            .then(data => data.tracks)
            .catch(err => {
                console.error(err)
                return null
            })
        }
    }
}