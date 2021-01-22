const config = require("./config.json")
const Eris = require("eris")
const runtime = require("./runtime/runtime.js")
const commands = runtime.commandsContainer.commands.Commands
const client = new Eris(config.token, {getAllUsers: true})
const prefix = config.prefix || `${client.user.mention} ` || `<@!801939642261307393> `
const util = require("util")

client.on("ready", () => {
    console.log("Eris ready!")
    console.log(`Current Prefix: ${prefix}`)
})

client.on("messageCreate", message => {
    var cmd
    var suffix
    if(message.content.indexOf(prefix) === 0) {
        cmd = message.content.substring(prefix.length).split(' ')[0].toLowerCase()
        suffix = message.content.substr(prefix.length).split(' ')
        suffix = suffix.slice(1, suffix.length).join(' ')
    }
    if(cmd) {
        if(commands[cmd]) {
            if(typeof commands[cmd] !== "object") {
                return
            }
            if(commands[cmd].private && message.author.id !== config.owner) {
                return client.createMessage(message.channel.id, "This is a Drew only command.")
            }
            try {
                commands[cmd].fn(message, client, suffix)
            } catch(e) {
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