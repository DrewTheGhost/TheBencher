let voteSkippers = []

module.exports = {
    name: "skip",
    aliases: [],
    description: "Skips a song.",
    controlled: false,
    fn(message, _suffix, bot, db) {
        /* TODO, Old Code
        let adapter = (bot.voice.adapters.size == 0) ? undefined : bot.voice.adapters.get(message.guild.id)
        if(adapter == undefined) {
            return message.channel.send("I'm apparently not playing anything! THERE'S NO VOICE DISPATCHER IDIOT!!")
        }
        if(message.member.voice.channelID !== bot.voice.connections.filter(m => m.channelID !== null).first().channel.id) {
            if(voteSkippers.indexOf(message.member.id) !== -1) {
                voteSkippers.splice(voteSkippers.indexOf(message.member.id), 1)
            }
            return message.channel.send("You're.. trying to voteskip when you aren't even listening? Fuck off, shithead.")
        }
        if(dispatcher.player.voiceConnection.speaking == 0) {
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
        if(voteSkippers.indexOf(message.member.id) !== -1) {
            return message.channel.send("You already voted to skip... Stop trying to rig the vote #stopthecount.")
        }
        voteSkippers.push(message.member.id)
        message.channel.send(`${message.author.username} voted to skip. ${voteSkippers.length}/${Math.ceil((voiceMembers.length-1) / 2)} required.`)
        if(voteSkippers.length >= Math.ceil((voiceMembers.length-1) / 2)) {
            return message.channel.send(`Requirement met to skip song, skipping.`)
        }
        */
    }
} 