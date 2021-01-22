const Commands = [] // Array of all commands which I will append objects to
const util = require("util") // For inspecting my evals or debugging other things
const domers = "779446753606238258" // This is the ID of the domer role
const lines = require("./benchRandoms.json").lines // This is the entire array of random one-liners for the bench command

// All commands must contain an `fn:` value and a `private:` value.
// fn: must be a function that can use message, client, and suffix in that order, but does not have to use everything. I.E., you can just use message.
// private: is a boolean value that determines if only the bot owner can run the command. If set to true, the command will reject everyone but the person with the owner ID in the config.

Commands.eval = {
    fn: function(message, client, suffix) {
        try {
            let evaled = eval(suffix) // Save the evaluation to a variable
            evaled = util.inspect(evaled, {
                depth: 1
            }) // Inspect the result with a depth of 1 so you don't get those annoying [object Object] responses.
            evaled = evaled.replace(new RegExp(client.token, "gi"), "Token leak! Censored.") // RegExp for replacing the bot token so it doesn't leak in eval
            if(evaled.length >= 1900) {
                evaled = evaled.substr(0, 1800)
                evaled = evaled + "....."
                // Cuts eval results off at 1800 characters and appends "....." because of the 2000 character limit in discord
            }
            message.channel.createMessage("```js\n" + evaled + "\n```") 
        } catch(e) {
            if(e.length >= 1900) {
                e = e.substr(0, 1800)
                e = e + "....."
                // Cuts error off at 1800 characters and appends "....." because of the 2000 character limit in discord
            }
            message.channel.createMessage("Error Caught```js\n" + e + "\n```")
        }
    },
    private: true
}

Commands.ping = {
    fn: function(message, client) {
        // Just grabs the latency value of the first and only shard
        message.channel.createMessage(`Shard latency: ${client.shards.get(0).latency}ms`)
    },
    private: false
}

Commands.bench = {
    fn: async function(message, client) {

        message.channel.createMessage("I'm spinnin the wheel! Some unlucky fucker is sittin' out this domin' round!")
        // foundDomers filters through everyone with the domer role and returns an array with member objects of everyone with the role
        let foundDomers = await client.guilds.get(message.guildID).members.filter(m => m.roles.indexOf(domers) !== -1)
        // domerName picks a random index from the list as the person who will sit out and grabs their mention
        let domerName = foundDomers[(Math.floor(Math.random() * 6))].mention
        // Picks a random line response from benchRandoms.json and inserts their name into it
        let chosenLine = lines[Math.floor(Math.random() * lines.length - 1)].replace(new RegExp("pname", "gi"), `${domerName}`)
        // Sends the random oneliner with who is sitting out
        message.channel.createMessage(chosenLine)
    },
    private: false
}

// Exports the entire Commands array to be accessible outside the commands file
exports.Commands = Commands