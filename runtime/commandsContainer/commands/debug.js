const util = require('util')

module.exports = {
    name: "debug",
    aliases: ["ping"],
    description: "Provides the bot's current latency.",
    controlled: false,
    async fn(params) {
        const message = params.message,
            bot = params.bot,
            logger = params.logger;
        
        let event = Date.now(),
            uptimeSeconds = Math.trunc(bot.uptime/1000),
            uptimeMinutes = Math.trunc(uptimeSeconds/60),
            uptimeHours = Math.trunc(uptimeMinutes/60),
            uptimeDays = Math.trunc(uptimeHours/24),
            fields = []
            fields.push({
                "name": "WebSocket latency",
                "value": `\`${bot.ws.ping} ms\``,
                "inline": true
            })
            fields.push({
                "name": "Message Event Latency",
                "value": `\`${event - message.createdTimestamp} ms\``,
                "inline": true
            })
            fields.push({
                "name": "Uptime",
                "value": `${uptimeDays}d:${uptimeHours % 24}h:${uptimeMinutes % 60}m:${uptimeSeconds % 60}s`,
                "inline": false
            })
            fields.push({
                "name": "Command Modules",
                "value": `${Array.from(await bot.commands.keys()).join(", ")}`,
                "inline": false
            })
            fields.push({
                "name": "Client Options",
                "value": `\`\`\`js\n${util.inspect(bot.options, {depth: 1})}\n\`\`\``,
                "inline": false
            })
        let debug = [
            {
                "content": null,
                "title": "The Bencher Debug",
                "color": 5814783,
                "fields": fields
            }
        ]
        message.channel.send({embeds: debug})
    }
}