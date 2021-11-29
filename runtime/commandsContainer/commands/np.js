module.exports = {
    name: "np",
    aliases: ["playing", "nowplaying"],
    description: "Shows what currently is playing.",
    controlled: false,
    fn(message, _suffix, bot, db) {
        let player = bot.player,
            embed = []
        if(player == undefined) {
            return message.channel.send("I'm.. not playing anything. Idiot.")
        }
        if(message.member.voice.channelId == null) {
            return message.channel.send("You literally aren't even listening, fuck off.")
        }
        db.client.query("SELECT * FROM queue ORDER BY id ASC LIMIT 1;", function(err, result) {
            if(err) {
                console.error(err)
            }
            embed = [{
                "title": `${result.rows[0].title}`,
                "color": 5814783,
                "url": `${result.rows[0].url}`
            }]
            message.channel.send({embeds: embed})
        })
    }
}