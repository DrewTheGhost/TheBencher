const ytdl = require("ytdl-core"),
      ytpl = require("ytpl"),
      chalk = require("chalk"),
      { AudioPlayerStatus, StreamType, createAudioPlayer, createAudioResource, joinVoiceChannel } = require("@discordjs/voice"),
      util = require("util"), // Do NOT remove, used for debugging
      player = createAudioPlayer()
let id = 0;
/** 
 * New queue schema
 * {
 *     "url": urlhere,
 *     "title": songtitlehere,
 *     "requester": username
 * }
 * requesting would be like result.rows[0].url
 * Significantly speeds up queue things as no longer need to request more than once for information
 * Can keep track of who is requesting what
*/

module.exports = {
    name: "play",
    aliases: ["music"],
    description: "Plays some good shiiiiit",
    controlled: false,
    async fn(message, suffix, bot, db) {
        let channelID = message.member.voice.channelId,
            requestInfo
        if(channelID === null) {
            return message.channel.send("You aren't even in a voice channel to listen to anything, dumbass.")
        }
        if(!ytdl.validateURL(suffix) && !ytpl.validateID(suffix)) {
            return message.channel.send("Can't seem to pull info from that. Did you actually put in a youtube link, dumbass?")
        }

        /**
        * This is the block for singular song requesting, the block for playlists is below this at line 64 currently
        * separate blocks required due to needing different behaviors with playlists
        */
        if(ytdl.validateURL(suffix)) {
            let title, requester;
            requestInfo = await ytdl.getInfo(suffix)
            if(requestInfo.videoDetails.isLiveContent) {
                return message.channel.send("Guess again if you think I'm about to let you queue a fucking livestream.")
            }
            id++;
            db.client.query("INSERT INTO queue(title, url, requester, id, thumbnail) VALUES($1, $2, $3, $4, $5) RETURNING *;", [requestInfo.videoDetails.title, suffix, message.author.username, id, requestInfo.videoDetails.thumbnail[-1].url], function(err, result) {
                title = result.rows[0].title
                requester = result.rows[0].requester
                if(err) {
                    console.error(err)
                    message.channel.send(`Errr.. Fucked up requestin' that one! Master has been alerted of this error :)`)
                } else {
                    console.debug(`${chalk.blue("Music:")}${chalk.reset()} ${chalk.yellow(result.rows[0].requester)}${chalk.reset()} Requested ${result.rows[0].title}`)
                    console.debug(`${chalk.blue("Music:")} Song title - ${chalk.yellow(result.rows[0].title)}${chalk.reset()}\n`)
                }
            })
            db.client.query("SELECT * FROM queue;", function(err, result) {
                if(err) {
                    console.error(err)
                }
                message.delete()
                console.debug(`${chalk.blue("Music:")}${chalk.reset()} Queue length now ${result.rows.length}\n`)
                message.channel.send(`\`${requester} requested ${title}. Added to the queue at position ${result.rows.length}.\``)
            })
        }

        /**
         * This is for playlists, I had to entirely subject it to another block as I was really unsure of how to do it without making it have its own code
         */
        if(ytpl.validateID(suffix)) {
            let ID = await ytpl.getPlaylistID(suffix)
            await ytpl(ID).then(m => {
                console.debug(`${chalk.blue("Music:")}${chalk.reset()} ${chalk.yellow(message.author.username)}${chalk.reset()} Requested Playlist ${suffix}`)
                for(const items of m.items) {
                    id++
                    db.client.query("INSERT INTO queue (title, url, requester, id, thumbnail) VALUES ($1, $2, $3, $4, $5);", [items.title, items.shortUrl, message.author.username, id, items.thumbnails[0].url], function(err, _result) {
                        if(err) {
                            console.error(err)
                        }
                    })
                }
                message.delete()
                db.client.query("SELECT * FROM queue;", function(err, result) {
                    if(err) {
                        console.error(err)
                    }
                    message.channel.send(`\`${message.author.username} requested a playlist. Added to the queue, new length ${result.rows.length}.\``)
                })
            })
        }
        
        if(bot.voice.adapters.get(message.guild.id) == undefined) {
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.channel.guild.id,
                adapterCreator: message.channel.guild.voiceAdapterCreator
            });
            db.client.query("SELECT * FROM queue ORDER BY id ASC LIMIT 1;", (err, result) => {
                if(err) {
                    console.error(err)
                }
                console.debug(`${chalk.blue("Music:")}${chalk.reset()} Joined voice channel to play ${chalk.yellow(result.rows[0].title)}${chalk.reset()}`)
                var stream = ytdl(result.rows[0].url, {filter: "audioonly", quality: "highestaudio"})
                var resource = createAudioResource(stream, { inputType: StreamType.Arbitrary })
                player.play(resource)
                connection.subscribe(player)
                if(player.listenerCount("error" == 0)) {
                    player.on("error", error => {
                        console.error(`Error: ${error.message} with resource ${util.inspect(error.resource)}`)
                        db.client.query("DELETE FROM queue WHERE id IN (SELECT id FROM queue ORDER BY id ASC LIMIT 1);", (err, _result) => {
                            if(err) {
                                console.error(err)
                            }
                            message.channel.send("I fucked up playing the song somehow, skipping it for now.")
                        })
                        db.client.query("SELECT * FROM queue;", function(err, result) {
                            if(err) {
                                console.error(err)
                            }
                            if(result.rows.length > 0) {
                                db.client.query("SELECT * FROM queue ORDER BY id ASC LIMIT 1;", (err, result) => {
                                    if(err) {
                                        console.error(err)
                                    }
                                    stream = ytdl(result.rows[0].url, {filter: "audioonly", quality: "highestaudio"})
                                    resource = createAudioResource(stream, { inputType: StreamType.Arbitrary })
                                    player.play(resource)
                                })
                            }
                        })
                    })
                    if(player.listenerCount("stateChange") == 0) {
                        player.on("stateChange", (oldState, newState) => {
                            if(oldState.status == AudioPlayerStatus.Playing && newState.status == AudioPlayerStatus.Idle) {
                                console.debug(`${chalk.blue("Music:")}${chalk.reset()} end event received`)
                                db.client.query("DELETE FROM queue WHERE id IN (SELECT id FROM queue ORDER BY id ASC LIMIT 1)", (err, _result) => {
                                    if(err) {
                                        console.error(err)
                                    }
                                })
                                db.client.query("SELECT * FROM queue", function(err, result) {
                                    if(err) {
                                        console.error(err)
                                    }
                                    console.debug(`${chalk.blue("Music:")}${chalk.reset()} Queue shifted, new length ${result.rows.length}`)
                                    if(result.rows.length > 0) {
                                        db.client.query("SELECT * FROM queue ORDER BY id ASC LIMIT 1;", (err, result) => {
                                            if(err) {
                                                console.error(err)
                                            }
                                            stream = ytdl(result.rows[0].url, {filter: "audioonly", quality: "highestaudio"})
                                            resource = createAudioResource(stream, { inputType: StreamType.Arbitrary })
                                            player.play(resource)
                                            message.channel.send(`Now playing ${result.rows[0].title} - Requested by ${result.rows[0].requester}`)
                                        })
                                    } else {
                                        id = 0
                                        connection.destroy()
                                        return message.channel.send("Nothing left in queue, leaving!")
                                    }
                                })
                            }
                        })
                    }
                }
            })
            // Why do I have this in here twice? Can't remember but it somehow isn't breaking anything or acting weird so I'll keep it
            db.client.query("SELECT * FROM queue ORDER BY id ASC LIMIT 1;", (err, result) => {
                if(err) {
                    console.error(err)
                }
                message.channel.send(`Now playing ${result.rows[0].title} - Requested by ${result.rows[0].requester}`)
            })
        }
    },
    player: player
}
