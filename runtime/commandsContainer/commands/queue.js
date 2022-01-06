module.exports = {
    name: "queue",
    aliases: ["q"],
    description: "Drops the whole queue for the dapper ones in chat.",
    controlled: false,
    fn(message, _suffix, _bot, db) {
        let fields = [], queue = []
        db.query("SELECT * FROM queue ORDER BY id;", function(err, result) {
            if(err) {
                console.error(err)
            }
            for(const rows of result.rows) {
                if(fields.length >= 25) {
                    break
                }
                fields.push({
                    "name": `${rows.id}. ${rows.title}`,
                    "value": `Requested by ${rows.requester}`,
                    "inline": true
                })
            }
            if(fields.length == 0) {
                return message.channel.send("Aint nothin in here! Not a damn thing! Not one! It's entirely fucking empty, you hear?! Stop fucking asking!")
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