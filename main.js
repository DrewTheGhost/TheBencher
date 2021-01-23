const config = require("./config.json")                                                // My config file
const Eris = require("eris")                                                           // My discord js library
const runtime = require("./runtime/runtime.js")                                        // The hashmap creator
const commands = runtime.commandsContainer.commands.Commands                           // All commands found through my runtime
const client = new Eris(config.token, {getAllUsers: true})                             // my client constructor 
const prefix = config.prefix || `${client.user.mention} ` || `<@!801939642261307393> ` // Prefix for the bot to respond to (user mentions currently not working, I'm bad at programming.)

client.on("ready", () => {
    // Ready event sent when Eris is ready
    console.log("Eris ready!")
    console.log(`Current Prefix: ${prefix}`)
})

client.on("messageCreate", message => {
    // Event sent when a message is sent on Discord
    var cmd
    var suffix
    if(message.content.indexOf(prefix) === 0) {
        // If the message has the prefix as the first character
        cmd = message.content.substring(prefix.length).split(' ')[0].toLowerCase()
        // cmd is everything after the prefix but still attached to the prefix, the command name
        suffix = message.content.substr(prefix.length).split(' ')
        suffix = suffix.slice(1, suffix.length).join(' ')
        // Suffix is everything after the command name, this is for commands that can take user input (only eval as of writing this)
    }
    if(cmd) {
        // If a cmd is found attached to a prefix
        if(commands[cmd]) {
            // If the command is an actual command
            if(typeof commands[cmd] !== "object") {
                // If the command isn't an object, the command is fundamentally broken and should not go any further
                return
            }
            if(commands[cmd].private && message.author.id !== config.owner) {
                // If the command's private value is set to true and the person executing the command is not the bot owner
                return client.createMessage(message.channel.id, "This is a Drew only command.")
            }
            try {
                // Tries to execute the command after all checks are passed
                commands[cmd].fn(message, client, suffix)
            } catch(e) {
                // If an error is caught when executing the command
                client.createMessage(message.channel.id, "Error when executing command. Details logged to console.")
                console.error(e)
            }
        }
    }
})

client.on("error", err => {
    console.log(`\nError:\n${err}\n`)
})

client.on("warn", err => {
    console.log(`\nWarning:\n${err}\n`)
})

client.connect()