let boosted = false;
module.exports = {
    name: "bassboost",
    aliases: ["bb"],
    description: "Boost the bass..",
    controlled: false,
    fn(message, _suffix, bot) {
        let bands,
            gainAmount = 0.5; // Potential use in the future, unsure yet
        if(bot.player == undefined) {
            return message.channel.send("Bass.. Based on what?")
        }
        if(message.member.voice.channelId == null) {
            return message.channel.send("Bro, you tryna fuck with people in the VC? Homies jamming to tunes? And you think you DESERVE control of the volume knob? Think again, knob.")
        }
        if(boosted) {
            for(let i = 0; i < 15; i++) {
                bands = []
                bands.push({"bands": i, "gain": 0})
            }
            bot.player.equalizer(bands)
            boosted = false;
            return message.channel.send("Unboosted. Vibes natty again.")
            
        }
        bands = [{"band": 0, "gain": 0.25}, {"band": 1, "gain": 0.25}, {"band": 2, "gain": 0.25}, {"band": 4, "band": -0.05},{"band": 5, "band": -0.05},{"band": 6, "band": -0.05},{"band": 7, "band": -0.05}]
        bot.player.equalizer(bands)
        boosted = true;
        message.channel.send("Boosted that shit!")
    }
}