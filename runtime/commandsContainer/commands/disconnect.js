module.exports = {
    name: "disconnect",
    aliases: ["dc"],
    description: "Disconnects the bot",
    controlled: false,
    async fn(message, _suffix, bot, db) {
        if(bot.player == undefined) {
            return message.channel.send("Errr.. Disconnect.. From where??")
        }
        if(message.member.voice.channelId == null) {
            return message.channel.send("Yeah, try doing that shit when you're actually in the fucking channel. Yeah go on, join the homies listening to music. Let them put you on blast, dumbass.")
        }
        await bot.player.destroy()
        await bot.manager.leave(message.channel.guild.id)

        message.channel.send("Okay bye :)!")
        db.query("DELETE FROM queue;", function(err, res) {
            if(err) {
                console.error(err)
            }
            console.log(`Dropping queue from disconnect command, rowCount: ${res.rowCount}`)
        })
    }
} 