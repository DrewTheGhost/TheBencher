module.exports = {
    name: "disconnect",
    aliases: ["dc"],
    description: "Disconnects the bot",
    controlled: false,
    async fn(params) {
        const message = params.message,
            bot = params.bot,
            db = params.db,
            logger = params.logger
        
        if(bot.player == undefined) {
            return message.channel.send("Errr.. Disconnect.. From where??")
        }
        if(message.member.voice.channelId == null) {
            return message.channel.send("Yeah, try doing that shit when you're actually in the fucking channel. Yeah go on, join the homies listening to music. Let them put you on blast, dumbass.")
        }
        await bot.player.destroy()
        bot.player = undefined
        await bot.manager.leave(message.channel.guild.id)

        message.channel.send("Okay bye :)!")
        await db.query("DELETE FROM queue;", function(err, res) {
            if(err) {
                return logger.error(err)
            }
            logger.info(`Dropping queue from disconnect command, rowCount: ${res.rowCount}`)
        })
    }
} 