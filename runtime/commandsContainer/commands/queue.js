module.exports = {
    name: "queue",
    aliases: ["q"],
    description: "Drops the whole queue for the dapper ones in chat.",
    controlled: false,
    fn(message, _suffix, _bot, db) {
        let fields = [], queue = []
        db.client.query("SELCT * FROM Equeue;", function(err, result) {
            if(err) {
                console.error(err)
            }
            for(const rows of result.rows) {
                fields.push({
                    "name": `${rows.id}. ${rows.title}`,
                    "value": `Requested by ${rows.requester}`,
                    "inline": true
                })
            }
            queue = [
                {
                    "title": "Current Queue",
                    "color": 5814783,
                    "fields": fields
                }
            ]
            message.channel.send({content: "Here's your fuckin queue!", embeds: queue})
        })
    }
} 