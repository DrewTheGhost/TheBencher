let voteSkippers = []

module.exports = {
    name: "voteskip",
    aliases: ["skip"],
    description: "Voteskips a song.",
    controlled: false,
    fn(message, _suffix, bot) {
        let music = require("./music.js"),
            voiceMembers = []
        if(bot.voice.connections.filter(m => m.channelID !== null).size == 0) {
            return message.channel.send("You hear that? Yeah, me neither. Maybe cus I'm not playing anything in the first place, dumbass!")
        }
    
        if(message.member.voice.channelID !== bot.voice.connections.filter(m => m.channelID !== null).first().channel.id) {
            if(voteSkippers.indexOf(message.member.id) !== -1) {
                voteSkippers.splice(voteSkippers.indexOf(message.member.id), 1)
            }
            return message.channel.send("You're.. trying to voteskip when you aren't even listening? Fuck off, shithead.")
        }
        if(music.dispatcher.player.voiceConnection.speaking == 0) {
            return message.channel.send("I'm literally not playing anything. The fuck are you trying to skip?")
        }
        for(const [key, _value] of bot.voice.connections.first().channel.members) {
            voiceMembers.push(key)
        }
        /* 
        if(suffix) {
            if(!Number.isInteger(parseInt(suffix))) {
                return message.channel.createMessage("You didn't put in a number, try putting in a position next time dumbass.")
            }
            if(queue[suffix]) {
    
            }
        }
        */
        if(voteSkippers.indexOf(message.member.id) !== -1) {
            return message.channel.send("You already voted to skip... Stop trying to rig the vote #stopthecount.")
        }
        voteSkippers.push(message.member.id)
        message.channel.send(`${message.author.username} voted to skip. ${voteSkippers.length}/${Math.ceil((voiceMembers.length-1) / 2)} required.`)
        if(voteSkippers.length >= Math.ceil((voiceMembers.length-1) / 2)) {
            voteSkippers = []
            music.dispatcher.emit("speaking", 0)
            return message.channel.send(`Requirement met to skip song, skipping.`)
        }
    }
}