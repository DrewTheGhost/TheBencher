module.exports = {
    name: "drip",
    aliases: [],
    description: "Get some phat drip.",
    controlled: false,
    fn(message) {
        const mainController = require("../mainController.json"),
              dripVideos = mainController.dripNames                                 // Drip videos
        let chosenVideo = dripVideos[Math.floor(Math.random() * dripVideos.length)] // Selects a random video from mainController.json
        message.channel.send(`Lemme pull up some fat drip for ya..\n${chosenVideo}`)
    }
}