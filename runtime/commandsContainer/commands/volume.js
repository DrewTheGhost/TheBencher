module.exports = {
    name: "volume",
    aliases: ["vol"],
    description: "Changes the volume of the tunes.",
    controlled: false,
    fn(message, suffix, bot) {
        let music = require("./music.js")
        if(bot.voice.connections.filter(m => m.channelID !== null).size == 0) {
            return message.channel.send("I'm not even in a voice channel, how could I have a volume to change??")
        }
        if(message.member.voice.channelID !== bot.voice.connections.first().channel.id) {
            return message.channel.send("Bro, you tryna fuck with people in the VC? Homies jamming to tunes? And you think you DESERVE control of the volume knob? Think again, knob.")
        }
        if(!Number.isInteger(parseInt(suffix))) {
            return message.channel.send("Errr.. Put in a number next time, dumbass.")
        }
        suffix = parseInt(suffix)
        suffix = Math.trunc(suffix)
        suffix = suffix/100
        if(suffix < 0) {
            return message.channel.send("Shit is too small. Enter a bigger number, dumbass!")
        }
        if(suffix > 2) {
            return "Shit is too fucking big! Enter a smaller number, dumbass."
        }
        music.dispatcher.setVolume(suffix)
        console.log(`Music: Adjusted volume to ${suffix}`)
        message.channel.send(`Adjusting the volume for ya, now set to ${suffix*100}`)
    }
}