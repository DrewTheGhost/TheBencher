module.exports = {
    name: "disconnect",
    aliases: [],
    description: "Disconnects the bot",
    controlled: false,
    fn(message, _suffix, bot) {
        let music = require("./music.js")
        if(bot.voice.connections.filter(m => m.channelID !== null).size == 0) {
            return message.channel.send("I'm not even in a voice channel, how could I leave???")
        }
        if(message.member.voice.channelID !== bot.voice.connections.first().channel.id) {
            return message.channel.send("Bro, you tryna fuck with people in the VC? Homies jamming to tunes? And you think you DESERVE that power? fuck you")
        }
        music.dispatcher.player.voiceConnection.disconnect()
        message.channel.send("bye :))")
    }
}