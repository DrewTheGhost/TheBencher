module.exports = {
    name: "restart",
    aliases: [],
    description: "Restarts the bot.",
    controlled: true,
    fn(message) {
        setTimeout(() => {
            process.exit(0)
        }, 200)
        message.channel.send("Restart executed, beginning restart process now.")
    }
}