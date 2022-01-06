module.exports = {
    name: "skip",
    aliases: [],
    description: "Skips a song.",
    controlled: false,
    fn(message, _suffix, bot, db) {
        if(bot.player == undefined) {
            return message.channel.send("I'm literally not even playing anything, skip yourself asshole!")
        }
        if(message.member.voice.channelId == null) {
            return message.channel.send("You literally aren't even listening, fuck off.")
        }
        db.query("SELECT * FROM queue ORDER BY id ASC LIMIT 1;", async function(err, result) {
            if(err) {
                console.error(err)
                return message.channel.send("Select query errored, aborting skip.")
            }
            bot.player.seek(`${parseInt(result.rows[0].duration)}`)
            message.channel.send(`Skipping ${result.rows[0].title}`)
        })
    }
}