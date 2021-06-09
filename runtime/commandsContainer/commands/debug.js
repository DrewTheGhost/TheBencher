module.exports = {
    name: "debug",
    aliases: ["ping"],
    description: "Provides the bot's current latency.",
    controlled: false,
    fn(message, suffix, bot) {
        let response = []
        let uptimeSeconds = Math.trunc(bot.uptime/1000),
            uptimeMinutes = Math.trunc(uptimeSeconds/60),
            uptimeHours = Math.trunc(uptimeMinutes/60),
            uptimeDays = Math.trunc(uptimeHours/24)

        response.push(`Domer latency: ${bot.ws.ping}ms`)
        response.push(`Uptime: ${uptimeDays}d:${uptimeHours % 24}h:${uptimeMinutes % 60}m:${uptimeSeconds % 60}s`)

        message.channel.send(response.join("\n"))
    }
}