const Commands = []
const util = require("util")
const domers = "779446753606238258"
const lines = require("./benchRandoms.json").lines

Commands.eval = {
    fn: function(message, client, suffix) {
        try {
            let evaled = eval(suffix)
            evaled = util.inspect(evaled, {
                depth: 1
            })
            evaled = evaled.replace(new RegExp(client.token, "gi"), "Token leak! Censored.")
            if(evaled.length >= 1900) {
                evaled = evaled.substr(0, 1800)
                evaled = evaled + "....."
            }
            message.channel.createMessage("```js\n" + evaled + "\n```") 
        } catch(e) {
            if(e.length >= 1900) {
                e = e.substr(0, 1800)
                e = e + "....."
            }
            message.channel.createMessage("Error Caught```js\n" + e + "\n```")
        }
    },
    private: true
}

Commands.ping = {
    fn: function(message, client) {
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
exports.Commands = Commands