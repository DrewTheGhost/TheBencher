let mainController = require("../mainController.json"),
    voiceLines = mainController.voiceNames
    
module.exports = {
    name: "site",
    aliases: [],
    description: "Tells you what fuckin site to go to.",
    controlled: false,
    fn(message, _suffix, bot) {
        let randomVoiceLine = voiceLines[Math.floor(Math.random() * voiceLines.length)],
            channelID = message.member.voice.channelID

        if(channelID === null) {
            return message.channel.send("You're not even in a voice channel, dumbass!")
        } else if(bot.voice.connections.filter(m => m.channelID !== null).size > 0) {
            if(bot.voice.connections.filter(m => m.channelID !== null).first().speaking) {
                return message.channel.send("I'm already playing something, fuck off")
            }
        } else {
            message.member.voice.channel.join().then(connection => {
                if(connection.speaking) {
                    connection.setSpeaking(0)
                }
                const dispatcher = connection.play(`./runtime/commandsContainer/voiceFiles/${randomVoiceLine}`, {volume: 1})
                dispatcher.on("speaking", val => {
                    if(val == 0) {
                        connection.disconnect()
                    }
                })
            }).catch(err => {
                console.error(err)
                return message.channel.send("Error joining voice channel or failed to play file. Dumbass code bro.")
            })
        }
    }
}