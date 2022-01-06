module.exports = {
    name: "np",
    aliases: ["playing", "nowplaying"],
    description: "Shows what currently is playing.",
    controlled: false,
    fn(message, _suffix, bot, db) {
        let embed = [],
            duration,
            currentPos
        if(bot.player == undefined) {
            return message.channel.send("I'm.. not playing anything. Idiot.")
        }
        if(message.member.voice.channelId == null) {
            return message.channel.send("You literally aren't even listening, fuck off.")
        }
        db.query("SELECT * FROM queue ORDER BY id ASC LIMIT 1;", function(err, result) {
            if(err || result.rows[0] == undefined) {
                console.error(err)
                return message.channel.send("There is somehow.. nothing playing, yet you were able to get to this stage in my code. Empty database. What the fuck. How are you even here right now? In theory, no one should ever be able to get here. Yet here you are. Celebrate, for you are fucked.")
            }
            duration = convertMilliToReadable(result.rows[0].duration)
            currentPos = convertMilliToReadable(Date.now() - bot.player.timestamp)
            embed = [{
                "title": `${result.rows[0].title}`,
                "color": 5814783,
                "url": `${result.rows[0].url}`,
                fields: [
                    {"name": "Position", "value": `${currentPos}/${duration}`}
                ]
            }]
            message.channel.send({embeds: embed})
        })
    }
}

function convertMilliToReadable(milliseconds) {
    let seconds, minutes, hours;
    seconds = Math.trunc((milliseconds/1000)%60)
    minutes = Math.trunc((milliseconds/(1000*60))%60)
    hours = Math.trunc((milliseconds/(1000*60*60))%24)
    
    if(hours == 0) {
        hours = "00"
    }
    if(hours > 0 && hours < 10) {
        hours = `0${hours}`
    }
    if(minutes == 0) {
        minutes = "00"
    }
    if(minutes > 0 && minutes < 10) {
        minutes = `0${minutes}`
    }
    if(seconds < 10) {
        seconds = `0${seconds}`
    }
    return `${hours}:${minutes}:${seconds}`
}