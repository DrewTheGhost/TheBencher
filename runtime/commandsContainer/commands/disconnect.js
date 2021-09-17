const { getVoiceConnection } = require("@discordjs/voice")
module.exports = {
    name: "disconnect",
    aliases: [],
    description: "Disconnects the bot",
    controlled: false,
    fn(message, _suffix, _bot, db) {
        const connection = getVoiceConnection(message.guild.id)
        if(connection == undefined) {
            return message.channel.send("Errr.. Disconnect.. From where??")
        }
        if(message.member.voice.channelId == null) {
            return message.channel.send("Yeah, try doing that shit when you're actually in the fucking channel. Yeah go on, join the homies listening to music. Let them put you on blast, dumbass.")
        }
        connection.destroy()
        message.channel.send("Okay bye :)!")
        db.client.query("DELETE FROM queue;", function(err, res) {
            if(err) {
                console.error(err)
            }
            console.log(`Dropping queue from disconnect command, rowCount: ${res.rowCount}`)
        })
    }
} 