const config = require("./config.json")                             // My config file
const Eris = require("eris")                                        // My discord js library
const runtime = require("./runtime/runtime.js")                     // The hashmap creator
const commands = runtime.commandsContainer.commands.Commands        // All commands found through my runtime
const client = new Eris(config.token, {getAllUsers: true})          // my client constructor 
const prefix = config.prefix                                        // Prefix for the bot to respond to (user mentions currently not working, I'm bad at programming.)
const chalk = require("chalk")
const error = `${chalk.redBright("[ERROR]")}${chalk.reset()}`
const warning = `${chalk.yellowBright("[WARN]")}${chalk.reset()}`
const log = `${chalk.greenBright("[LOG]")}${chalk.reset()}`
var readyCount = 0

client.on("ready", () => {
    // Ready event sent when Eris is ready
    readyCount++
    console.log(`${log} Eris ready!`)
    console.log(`${log} Current Prefix: ${prefix}`)
    console.log(`${warning} ${readyCount} ready events without restart.`)
    client.editStatus({name: "Type !help for a list of commands or !help commandname to get command info."})
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
        if(cmd == "help") {
            // okay this is gonna be really hacky but it's the only viable way to do the help command by iterating through the commands object
            let embed = {}
            let fields = []
            if (!suffix) {
                for(let command of Object.keys(commands)) {
                    fields.push({
                        name: `${command}`,
                        value: `${commands[command].help}`
                    })
                }
                embed = {
                    embed: {
                        footer: {
                            text: "Help Command | Parentheses signify required values, brackets signify optional values"
                        },
                        color: 45568,
                        fields: fields
                    }
                }
            } else {
                if (commands[suffix]) {
                    fields = [
                        {
                            name: `${suffix}`,
                            value: `${commands[suffix].help}`
                        },
                        {
                            name: `Usage`,
                            value: `${commands[suffix].usage}`
                        }
                    ]
                    embed = {
                        embed: {
                            footer: {
                                text: "Help Command | Parentheses signify required values, brackets signify optional values"
                            },
                            color: 45568,
                            fields: fields
                        }
                    }
                } else {
                    return message.channel.createMessage("There's no command with that name, dumbass. Try running `!help` by itself instead.")
                }
    
            }
            return message.channel.createMessage(embed).catch(err => {
                message.channel.createMessage("Help command errored.")
                console.log(`${error} ${err}`)
            })
        }
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
                console.log(`${error} ${e}`)
            }
        }
    }
})

client.on("error", err => {
    console.log(`${error} ${err}`)
})

client.on("warn", err => {
    console.log(`${warning} ${err}`)
})

client.connect()