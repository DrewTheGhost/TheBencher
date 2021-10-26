const { voiceLines } = require("../mainController.json"),
    { readFile } = require("fs"),
    { AudioPlayerStatus, StreamType, createAudioPlayer, createAudioResource, joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice"),
    { player } = require("./play.js")
    
module.exports = {
    name: "site",
    aliases: [],
    description: "Tells you what fuckin site to go to.",
    controlled: false,
    fn(message, _suffix, bot) {
        let randomVoiceLine = voiceLines[Math.floor(Math.random() * voiceLines.length)],
            adapter = bot.voice.adapters.get(message.guild.id) == undefined

        if(!adapter) {
            return message.channel.send("You're not even in a voice channel, dumbass!")
        } /*else if(bot.voice.connections.filter(m => m.channelID !== null).size > 0) {
            if(bot.voice.connections.filter(m => m.channelID !== null).first().speaking) {
                return message.channel.send("I'm already playing something, fuck off")
            }
          */
        else {
            let connection = joinVoiceChannel({
                channelId: message.member.voice.channelId,
                guildId: message.channel.guild.id,
                adapterCreator: message.channel.guild.voiceAdapterCreator
            }),
            stream = readFile(`./runtime/commandsContainer/voiceFiles/${randomVoiceLine}`),
            resource = createAudioResource(stream, { inputType: StreamType.Arbitrary })

            player.play(resource)
            connection.subscribe(player)

        }
    }
}