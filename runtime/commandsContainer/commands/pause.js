const { getVoiceConnection, createAudioResource } = require("@discordjs/voice")

module.exports = {
    name: "pause",
    aliases: ["stop"],
    description: "Pauses the current song.",
    controlled: false,
    fn(message, _suffix, bot, db) {
        // TODO
    }
} 