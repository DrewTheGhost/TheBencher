const util = require("util")
let pages = {},
    pageLimit = 1,
    time = 1000 * 60 * 5

module.exports = {
    name: "queue",
    aliases: ["q"],
    description: "Drops the whole queue for the dapper ones in chat.",
    controlled: false,
    async fn(params) {
        let embeds = [],
            message = params.message,
            id = message.author.id,
            bot = params.bot,
            db = params.db,
            logger = params.logger,
            filter = (reaction, user) => user.id === message.author.id && (reaction.emoji.name === "◀️" || reaction.emoji.name === "▶️")
            
        let allSongs = [],
            descriptions = [],
            collector
            pages[id] = 0
        
        await db.query("SELECT * FROM queue ORDER BY id;").then(async result => {
            if(result.rows.length == 0) {
                return message.channel.send("Aint nothin in here! Not a damn thing! Not one! It's entirely fucking empty, you hear?! Stop fucking asking!")
            }
            pageLimit = Math.ceil(result.rows.length/10)
            const descriptionLoop = await new Promise((resolve, reject) => {
                for(let song of result.rows) {
                    allSongs.push(`\`${song.id}\` [${song.title}](${song.url}) | \`Requested by: ${song.requester}\`\n\n`)
                }
                resolve()
            })
            const whileLoop = await new Promise((resolve, reject) => {
                while(allSongs.length) {
                    descriptions.push(allSongs.splice(0, 10))
                }
                resolve()
            })
            await Promise.all([descriptionLoop, whileLoop])
            for(let i = 0; i < pageLimit; i++) {
                embeds.push({"title": "Current Queue", "color": 5814783, "description": descriptions[i].join(""), "footer": { "text": `${result.rows.length} songs in queue | (WIP) in total length`} })
            }
        }).catch(err => {
            logger.err(err)
        })
        message.channel.send({embeds: [embeds[pages[id]]]}).then(message => {
            message.react("◀️")
            message.react("▶️")

            collector = message.createReactionCollector({filter, time})

            collector.on("collect", (reaction) => {
                if(reaction.emoji.name === "◀️" && pages[id] > 0) {
                    pages[id]--
                } else if(reaction.emoji.name === "▶️" && pages[id] < embeds.length - 1) {
                    pages[id]++
                }
                if(message) {
                    message.edit({
                        embeds: [embeds[pages[id]]]
                    }).catch(err => {
                        logger.error(err)
                    })
                    reaction.users.remove(id)
                }
            })
        }).catch(err => {
            logger.error(err)
        })
    }
}