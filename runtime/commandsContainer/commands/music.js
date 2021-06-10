const ytdl = require("ytdl-core"),
      chalk = require("chalk")
let queue = [],
    dispatcher,
    currentVoiceConnection

module.exports = {
    name: "music",
    aliases: ["play"],
    description: "Plays some good shiiiiit",
    controlled: false,
    async fn(message, suffix, bot) {
        let channelID = message.member.voice.channelID,
        titleSuffixDetails,
        titleSuffix,
        titleQueueDetails,
        titleQueue
    
        if(channelID === null) {
            return message.channel.send("You aren't even in a voice channel to listen to anything, dumbass.")
        }
        if(!ytdl.validateURL(suffix)) {
            return message.channel.send("Can't seem to pull info from that. Did you actually put in a youtube video, dumbass?")
        }
        if(queue.length >= 10) {
            if(queue.length > 10) {
                queue.pop()
            }
            return message.channel.send("Slow down there tiger. Too many things in queue.")
        }
        titleSuffixDetails = await ytdl.getBasicInfo(suffix)
        if(titleSuffixDetails.videoDetails.isLiveContent) {
            return message.channel.send("Guess again if you think I'm about to let you queue a fucking livestream.")
        }
    
        queue.push(suffix)
        console.log(`${chalk.blue("Music:")}${chalk.reset()} ${chalk.yellow(message.author.username)}${chalk.reset()} Requested ${suffix}`)
        titleSuffix = titleSuffixDetails.videoDetails.title
        console.log(`${chalk.blue("Music:")} Song title - ${chalk.yellow(titleSuffix)}${chalk.reset()}\n`)
        console.log(`${chalk.blue("Music:")}${chalk.reset()} Queue length now ${queue.length}\n`)
        message.delete()
        message.channel.send(`\`${message.author.username} requested ${titleSuffix}. Added to the queue at position ${queue.length}.\``)
    
        if(bot.voice.connections.filter(m => m.channelID !== null).size == 0) {
            message.member.voice.channel.join().then(connection => {
                currentVoiceConnection = connection
                console.log(`${chalk.blue("Music:")}${chalk.reset()} Joined voice channel to play ${chalk.yellow(queue[0])}${chalk.reset()}`)
                console.log(`${chalk.blue("Music:")}${chalk.reset()} Current titleSuffix is ${titleSuffix}\n`)
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
        async function playSong() {
            console.log(`${chalk.blue("Music:")}${chalk.reset()} playSong() function executed\n`)
            dispatcher = await currentVoiceConnection.play(ytdl(queue[0], {quality: "highestaudio"}))
            module.exports.dispatcher = dispatcher
            dispatcher.setVolume(0.5)
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
            titleQueueDetails = await ytdl.getBasicInfo(queue[0])
            titleQueue = titleQueueDetails.videoDetails.title
            message.channel.send(`Now playing ${titleQueue}`)
        }
    }
}