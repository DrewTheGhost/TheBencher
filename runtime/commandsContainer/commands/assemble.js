module.exports = {
    name: "assemble",
    aliases: [],
    description: "Assembles the domers.",
    controlled: false,
    fn(message) {
        // Filter through all voiceStates and return an array of all states where the person is in the waiting room
        let waiters = message.member.guild.voiceStates.cache.filter(m => m.channelID == "784537245616439296")

        // Filter through all voiceStates and return an array of all states where the person is already in the penthouse
        let nonWaitersVoiceStates = message.member.guild.voiceStates.cache.filter(m => m.channelID == "773245943218307082"),
            nonWaiters = []
        
        nonWaitersVoiceStates.each(nonwaiter => {
            try {
                nonWaiters.push(`<@${message.guild.members.cache.find(m => m.id == nonwaiter.id && m.id !== "466767464902950922").id}>`)
            } catch(e) {
                message.channel.send("An error happened, this can happen when only caelan is in the penthouse and everyone else isn't. Prolly will still work.")
                console.error(e)
            }
        })
        // Iterate through the array of nonWaiters and push all their mentions to an array for shaming later
        
        waiters.each(waiter => {
            try {
                message.guild.members.cache.find(m => m.id == waiter.id).edit({channel: "773245943218307082"})
            } catch(e) {
                console.error(e)
            }
        })
        // Iterate through the array of waiters and move them to the penthouse
    
        if(waiters.size <= 0) {
            message.channel.send("Hey, dumbass. There's no one waiting.")
        } else if(waiters.size > 0 && nonWaiters.length <= 0) {
            message.channel.send("Avengers! Assemble at The Penthouse!")
        } else {
            let plural = "Bitch"
            if(nonWaiters.length > 1) {
                plural = "Bitches"
            }
            nonWaiters = nonWaiters.join(", ") 
            // This will take the array of mentions for people who didn't wait and join them into one string delimited by commas
            // Ex: ["<@160960464719708161>", "<@197114859316314112>", "<@161014852368859137>"] -> "<@160960464719708161>, <@197114859316314112>, <@161014852368859137>"
            message.channel.send(`Avengers! Assemble at The Penthouse!\nHonorable mention: ${nonWaiters}. ${plural} that didn't wait for the Captain.`)
        }
    }
}