let sussyCache = [],
    mainController = require("../mainController.json"),
    susVideos = mainController.susNames                                          // List of all videos for zoe's command

module.exports = {
    name: "sussy",
    aliases: ["sus"],
    description: "Sends some real sussy shit...",
    controlled: false,
    fn(message) {
        if(sussyCache.length > 5) {                                              // Cache of last 5 videos so repeats don't happen
            sussyCache.shift()
        }
        if(sussyCache[0]) {
            for(let cache of sussyCache) {
                susVideos.splice(susVideos.indexOf(cache), 1)
            }
        }
        let chosenVideo = susVideos[Math.floor(Math.random() * susVideos.length)] // Selects a random video from mainController.json
        sussyCache.push(chosenVideo)
        message.channel.send(`Lemme pull up somethin' sussy for ya..\n${chosenVideo}`)
    }
}