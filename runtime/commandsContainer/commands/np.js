module.exports = {
    name: "np",
    aliases: ["playing"],
    description: "Shows what currently is playing.",
    controlled: false,
    fn(message, _suffix, bot, db) {
        let adapter = (bot.voice.adapters.size == 0) ? undefined : bot.voice.adapters.get(message.guild.id),
            embed = []
        if(adapter == undefined) {
            return message.channel.send("I'm literally not even playing anything, skip yourself asshole!")
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
                "image": {
                    "url": `${result.rows[0].thumbnail}`
                },
                "url": `${result.rows[0].url}`
            }]
            message.channel.send({embeds: embed})
        })
    }
}