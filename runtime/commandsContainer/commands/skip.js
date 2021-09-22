const { getVoiceConnection } = require("@discordjs/voice")
module.exports = {
    name: "skip",
    aliases: [],
    description: "Skips a song.",
    controlled: false,
    fn(message, _suffix, _bot, db) {
        const connection = getVoiceConnection(message.guild.id)
        if(connection == undefined) {
            return message.channel.send("I'm literally not even playing anything, skip yourself asshole!")
        }
        if(message.member.voice.channelId == null) {
            return message.channel.send("You literally aren't even listening, fuck off.")
        }
        let player = require("./play.js").player
        db.client.query("DELETE FROM queue WHERE id IN (SELECT id FROM queue ORDER BY id ASC LIMIT 1) RETURNING title;", function(err, result) {
            if(err) {
                console.error(err)
            }
            message.channel.send(`Skipping ${result.rows[0].title}`)
        })
        player.pause()
    }
} 