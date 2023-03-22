module.exports = {
    name: "restart",
    aliases: [],
    description: "Restarts the bot.",
    controlled: true,
    async fn(params) {
        const message = params.message,
            logger = params.logger;
        
        await message.channel.send("Restart executed, beginning restart process now.")
        process.exit(0)
    }
}