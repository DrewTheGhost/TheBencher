const { AudioPlayerStatus } = require("@discordjs/voice")
let player = require("./play.js").player

module.exports = {
    name: "pause",
    aliases: ["stop"],
    description: "Pauses the current song.",
    controlled: false,
    fn(message) {
        if(player.state.status == AudioPlayerStatus.Paused) {
            player.unpause()
            message.channel.send("Startin' the phat beats back up, you know this shit all natty.")
        } else if(player.state.status == (AudioPlayerStatus.Idle || AudioPlayerStatus.Buffering)) {
            message.channel.send("Pause.. Pause what? Pause deez nuts.")
        } else {
            player.pause()
            message.channel.send("Okay I'll pause it but you gotta let me speak too bro. You guys talk all the time and never invite me. At least let me play sometimes.")
        }
    }
} 