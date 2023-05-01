module.exports = {
    name: "remove",
    aliases: [],
    description: "Skips a song in a specific position for the queue ;)",
    controlled: false,
    async fn(params) {
        let message = params.message,
            suffix = params.suffix,
            db = params.db,
            logger = params.logger;
        let idInput;
        try {
            idInput = parseInt(suffix)
            logger.debug(`Received skip ID of ${idInput}`)
        } catch(err) {
            return message.channel.send("Give me a number to skip next time asshole..")
        }
        await db.query("SELECT * FROM queue;").then(async result => {
            if(idInput > result.rows.length) {
                return message.channel.send("Shit man, you put in an ID larger than the amount of songs even in the queue. Are you stupid?")
            } else if(idInput < 1) {
                return message.channel.send("You.. gave me a number less than 1. What the fuck did you expect was going to happen?")
            } else if(idInput == 1) {
                return message.channel.send("If you want to skip the song playing.. use !skip dude.")
            }
            await db.query(`DELETE FROM queue WHERE id = ${idInput} RETURNING *;`).then(res => {
                message.channel.send(`Removing \`${res.rows[0].title}\` requested by ${res.rows[0].requester} from the queue.`)
            }).catch(err => {
                logger.error(err)
            })
        }).catch(err => {
            logger.error(err)
        })

        await db.query("SELECT * FROM queue ORDER BY id;").then(async result => {
            db.query(`DELETE FROM queue;`).then(() => {
                insertMultipleSongs(result.rows).catch(err => {
                    logger.error(err)
                })
            }).catch(err => {
                logger.error(err)
            })
        }).catch(err => {
            logger.error(err)
        })

        async function fixId(queue) {
            let newQueue = []
            return await new Promise((resolve, reject) => {
                try {
                    for(const item of queue) {
                        let currentIndex = queue.indexOf(item)
                        queue[currentIndex].id = currentIndex + 1
                        newQueue.push(`('${item.title}', '${item.url}', '${item.requester}', ${queue[currentIndex].id}, '${item.track64}', '${item.duration}')`)
                    }
                    resolve(newQueue)
                } catch(err) {
                    reject(err)
                }
            })
        }
        
        async function insertMultipleSongs(queue) {
            return await new Promise(async (resolve, reject) => {
                queue = await fixId(queue)
                await db.query(`INSERT INTO queue (title, url, requester, id, track64, duration) VALUES${queue} RETURNING *;`).then(() => {
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        }
    }
}

