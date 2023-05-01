module.exports = {
    name: "np",
    aliases: ["playing", "nowplaying"],
    description: "Shows what currently is playing.",
    controlled: false,
    async fn(params) {
        let message = params.message,
            bot = params.bot,
            db = params.db,
            logger = params.logger;
        
        let embed = [],
            duration,
            currentPos,
            index,
            timestampBar;
        
        if(bot.player == undefined) {
            return message.channel.send("I'm.. not playing anything. Idiot.")
        }
        if(message.member.voice.channelId == null) {
            return message.channel.send("You literally aren't even listening, fuck off.")
        }
        await db.query("SELECT * FROM queue ORDER BY id ASC LIMIT 1;").then(async result => {
            if(result.rows[0] == undefined) {
                return message.channel.send("There is somehow.. nothing playing, yet you were able to get to this stage in my code. Empty database. What the fuck. How are you even here right now? In theory, no one should ever be able to get here. Yet here you are. Celebrate, for you are fucked.")
            }
            
            duration = await convertMilliToReadable(result.rows[0].duration)
            currentPos = await convertMilliToReadable(Date.now() - bot.player.timestamp)
            index = Math.round(((Date.now() - bot.player.timestamp)/result.rows[0].duration)*10)
            timestampBar = `▬▬▬▬▬▬▬▬▬▬`.substring(0, index) + "🔘" + `▬▬▬▬▬▬▬▬▬▬`.substring(index + 1)

            embed = [{
                "title": `${result.rows[0].title}`,
                "color": 5814783,
                "url": `${result.rows[0].url}`,
                "description": `\`${timestampBar}\`\n\n\`${currentPos}\`/\`${duration}\`\n\n\`Requested By:\` ${result.rows[0].requester}`
            }]

            message.channel.send({embeds: embed})
        }).catch(err => {
            logger.error(err)
        })
    }
}

async function convertMilliToReadable(milliseconds) {
    let seconds, minutes, hours;
    seconds = Math.trunc((milliseconds/1000)%60)
    minutes = Math.trunc((milliseconds/(1000*60))%60)
    hours = Math.trunc((milliseconds/(1000*60*60))%24)
    
    if(seconds < 10) {
        seconds = `0${seconds}`
    }
    if(minutes < 10) {
        minutes = `0${minutes}`
    }
    if(hours < 10 && hours != 0) {
        hours = `0${hours}`
    }
    
    if(hours > 0 && hours != `00`) {
        return `${hours}:${minutes}:${seconds}`
    } else {
        return `${minutes}:${seconds}`
    }
}