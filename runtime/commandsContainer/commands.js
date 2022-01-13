global.AbortController = require("abort-controller")    // Fix for discordjs/voice aborts while playing, node version post 14 are fucked and have to use this to use anything older than v16
const fs = require("fs"),                               // Handles opening the audio files and creating buffer streams
    Discord = require("discord.js"),                    // Please god forgive this sin of using two different libraries in the same bot
    bot = new Discord.Client({
        fetchAllMembers: true,
        intents: 1923
    }),
    ticTacToe = require("discord-tictactoe"),
    ttt = new ticTacToe({                               // do not delet this command has its own handler
        command: "!ttt",
        language: "en"
    }, bot),
    commandFiles = fs.readdirSync('runtime/commandsContainer/commands').filter(file => file.endsWith('.js'))

    bot.commands = new Discord.Collection()
    for(const file of commandFiles) {
        const command = require(`./commands/${file}`)
        bot.commands.set(command.name, command)
        for(const alias of command.aliases) {
            if(alias.length == 0 || alias == command.name) break;
            bot.commands.set(alias, command)
        }
    }

// Exports the client to be accessible to the main file which logs in and handles ready, warn, and error events
exports.bot = bot