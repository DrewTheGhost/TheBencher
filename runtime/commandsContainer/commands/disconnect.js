module.exports = {
    name: "disconnect",
    aliases: ["dc"],
    description: "Disconnects the bot",
    controlled: false,
    async fn(message, _suffix, bot, db) {
        let manager = bot.manager,
            player = bot.player
        if(player == undefined) {
            return message.channel.send("Errr.. Disconnect.. From where??")
        }
        if(message.member.voice.channelId == null) {
            return message.channel.send("Yeah, try doing that shit when you're actually in the fucking channel. Yeah go on, join the homies listening to music. Let them put you on blast, dumbass.")
        }
        player.destroy()
        await manager.leave(message.channel.guild.id)
        bot.player = undefined

        message.channel.send("Okay bye :)!")
        db.client.query("DELETE FROM queue;", function(err, res) {
            if(err) {
                console.error(err)
            }
            console.log(`Dropping queue from disconnect command, rowCount: ${res.rowCount}`)
        })
    }
} 