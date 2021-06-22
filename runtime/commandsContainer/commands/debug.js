const util = require('util')

module.exports = {
    name: "debug",
    aliases: ["ping"],
    description: "Provides the bot's current latency.",
    controlled: false,
    async fn(message, suffix, bot) {
        let event = Date.now(),
            response = [],
            uptimeSeconds = Math.trunc(bot.uptime/1000),
            uptimeMinutes = Math.trunc(uptimeSeconds/60),
            uptimeHours = Math.trunc(uptimeMinutes/60),
            uptimeDays = Math.trunc(uptimeHours/24)

        response.push("```js")
        response.push(`WebSocket latency: ${bot.ws.ping} ms`)
        response.push(`Message Event Latency: ${event - message.createdTimestamp} ms`)
        response.push(`Uptime: ${uptimeDays}d:${uptimeHours % 24}h:${uptimeMinutes % 60}m:${uptimeSeconds % 60}s`)
        response.push(`Command modules: [${await bot.commands.map(m => `"${m.name}"`)}]`)
        response.push(`Client Options: ${util.inspect(bot.options, {depth: 1})}`)
        response.push("```")
        message.channel.send(response.join("\n\n"))
    }
}