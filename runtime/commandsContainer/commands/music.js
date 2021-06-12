const ytdl = require("ytdl-core"),
      ytpl = require("ytpl"),
      chalk = require("chalk")
let queue = [],
    dispatcher,
    currentVoiceConnection

/** 
 * New queue schema
 * {
 *     "url": urlhere,
 *     "title": songtitlehere,
 *     "requester": username
 * }
 * requesting would be like queue[0].url
 * Significantly speeds up queue things as no longer need to request more than once for information
 * Can keep track of who is requesting what
*/

module.exports = {
    name: "music",
    aliases: ["play"],
    description: "Plays some good shiiiiit",
    controlled: false,
    async fn(message, suffix, bot) {
        let channelID = message.member.voice.channelID,
            requestInfo,
            queueObject = {}
        if(channelID === null) {
            return message.channel.send("You aren't even in a voice channel to listen to anything, dumbass.")
        }
        if(!ytdl.validateURL(suffix) && !ytpl.validateID(suffix)) {
            return message.channel.send("Can't seem to pull info from that. Did you actually put in a youtube link, dumbass?")
        }

        /**
        * This is the block for singular song requesting, the block for playlists is below this at line 82 currently
        * separate blocks required due to needing different behaviors with playlists
        */
        if(ytdl.validateURL(suffix)) {
            requestInfo = await ytdl.getBasicInfo(suffix)

            if(requestInfo.videoDetails.isLiveContent) {
                return message.channel.send("Guess again if you think I'm about to let you queue a fucking livestream.")
            }
    
            queueObject.url = suffix
            queueObject.title = requestInfo.videoDetails.title
            queueObject.requester = message.author.username
            queue.push(queueObject)
    
            console.log(`${chalk.blue("Music:")}${chalk.reset()} ${chalk.yellow(message.author.username)}${chalk.reset()} Requested ${suffix}`)
            console.log(`${chalk.blue("Music:")} Song title - ${chalk.yellow(queueObject.title)}${chalk.reset()}\n`)
            console.log(`${chalk.blue("Music:")}${chalk.reset()} Queue length now ${queue.length}\n`)
    
            message.delete()
            message.channel.send(`\`${message.author.username} requested ${queueObject.title}. Added to the queue at position ${queue.length}.\``)
        
            if(bot.voice.connections.filter(m => m.channelID !== null).size == 0) {
                message.member.voice.channel.join().then(connection => {
                    currentVoiceConnection = connection
                    console.log(`${chalk.blue("Music:")}${chalk.reset()} Joined voice channel to play ${chalk.yellow(queueObject.title)}${chalk.reset()}`)
                    console.log(`${chalk.blue("Music:")}${chalk.reset()} Current queueObject.title is ${queueObject.title}\n`)
                    playSong()
                }).catch(err => {
                    message.channel.send("What the fuck did you do? Shit errored.")
                    console.error(err)
                })
            } else {
                currentVoiceConnection = bot.voice.connections.first()
                if(bot.voice.connections.filter(m => m.channelID !== null).size > 0) {
                    if(queue.length > 0 && bot.voice.connections.filter(m => m.channelID !== null).first().speaking == 0) {
                        playSong()
                    }
                }
            }
        }

        /**
         * This is for playlists, I had to entirely subject it to another block as I was really unsure of how to do it without making it have its own code
         */
        if(ytpl.validateID(suffix)) {
            let ID = await ytpl.getPlaylistID(suffix)
            await ytpl(ID).then(m => {
                for(const items of m.items) {
                    queueObject = {}
                    queueObject.url = items.shortUrl
                    queueObject.title = items.title
                    queueObject.requester = message.author.username
                    queue.push(queueObject)
                }
            })

            console.log(`${chalk.blue("Music:")}${chalk.reset()} ${chalk.yellow(message.author.username)}${chalk.reset()} Requested Playlist ${suffix}`)
            console.log(`${chalk.blue("Music:")}${chalk.reset()} Queue length now ${queue.length}\n`)
    
            message.delete()
            message.channel.send(`\`${message.author.username} requested a playlist. Added to the queue, new length ${queue.length}.\``)
        
            if(bot.voice.connections.filter(m => m.channelID !== null).size == 0) {
                message.member.voice.channel.join().then(connection => {
                    currentVoiceConnection = connection
                    console.log(`${chalk.blue("Music:")}${chalk.reset()} Joined voice channel to play ${chalk.yellow(queue[0].title)}${chalk.reset()}`)
                    console.log(`${chalk.blue("Music:")}${chalk.reset()} Current queue[0].title is ${queue[0].title}\n`)
                    playSong()
                }).catch(err => {
                    message.channel.send("What the fuck did you do? Shit errored.")
                    console.error(err)
                })
            } else {
                currentVoiceConnection = bot.voice.connections.first()
                if(bot.voice.connections.filter(m => m.channelID !== null).size > 0) {
                    if(queue.length > 0 && bot.voice.connections.filter(m => m.channelID !== null).first().speaking == 0) {
                        playSong()
                    }
                }
            }
        }

        async function playSong() {
            console.log(`${chalk.blue("Music:")}${chalk.reset()} playSong() function executed\n`)
            dispatcher = await currentVoiceConnection.play(ytdl(queue[0].url, {quality: "highestaudio"}))
            dispatcher.setVolume(0.25)
            dispatcher.player.voiceConnection.on("disconnect", () => {
                queue = []
            })
            dispatcher.on("speaking", async val => {
                if(val == 0) {
                    console.log(`${chalk.blue("Music:")}${chalk.reset()} end event received`)
                    queue.shift()
                    console.log(`${chalk.blue("Music:")}${chalk.reset()} Queue shifted, new length ${queue.length}`)
                    if(queue.length > 0) {
                        playSong()
                    } else {
                        currentVoiceConnection.disconnect()
                        return message.channel.send("Nothing left in queue, leaving!")
                    }
                }
            })
            message.channel.send(`Now playing ${queue[0].title} - Requested by ${queue[0].requester}`)
        }
    }
}