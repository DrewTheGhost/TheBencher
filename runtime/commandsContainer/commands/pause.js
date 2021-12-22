module.exports = {
    name: "pause",
    aliases: ["stop"],
    description: "Pauses the current song.",
    controlled: false,
    fn(message, _suffix, bot) {
        if(!bot.player.playing || bot.player == undefined) {
            message.channel.send("Pause.. Pause what? Pause deez nuts.")
        } else if(bot.player.paused) {
            bot.player.pause(false)
            message.channel.send("Startin' the phat beats back up, you know this shit all natty.")
        } else {
            bot.player.pause(true)
            message.channel.send("Okay I'll pause it but you gotta let me speak too bro. You guys talk all the time and never invite me. At least let me play sometimes.")
        }
    }
} 