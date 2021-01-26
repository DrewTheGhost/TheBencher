const config = require("./config.json"),                          // My config file
    runtime = require("./runtime/runtime.js"),
    client = runtime.commandsContainer.commands.client            // Prefix for the bot to respond to (user mentions currently not working, I'm bad at programming.)
    chalk = require("chalk"),                                     // Console coloring
    error = `${chalk.redBright("[ERROR]")}${chalk.reset()}`,      // Error message coloring
    warning = `${chalk.yellowBright("[WARN]")}${chalk.reset()}`,  // Warning message coloring
    log = `${chalk.greenBright("[LOG]")}${chalk.reset()}`,        // Log message coloring
    Discord = require("discord.js"),                              // Please god forgive this sin of using two different libraries in the same bot
    bot = new Discord.Client(),                                   // This is like a slap to all bot devs everywhere I am so sorry please don't roast me
    ticTacToe = require("discord-tictactoe"),                     // This goofy ass tictactoe didn't state that it would ONLY work with discord.js and I want it okay
    ttt = new ticTacToe({                                         // roast them not me please
        command: "!!ttt",
        language: "en"
    }, bot),
    util = require("util")                                        // Do not delete this variable even if unused, can debug with it
var readyCount = 0                                                // Track eris ready events for debug


replaceLog()
replaceWarning()
replaceError()

bot.on("ready", () => {
    console.log(`Discord.js ready`)
})
client.on("ready", () => {
    // Ready event sent when Eris is ready
    readyCount++ 
    console.log(`Eris ready!`)
    let prefix = config.prefix
    console.log(`Current Prefix: ${prefix}`)
    console.warn(`${readyCount} ready events without restart.`)
    client.editStatus({name: "Type !help for a list of commands or !help commandname to get command info."})
    setTimeout(() => {
        if(client.voiceConnections.filter(m => m.channelID !== null).length !== 0) {
            client.leaveVoiceChannel(client.voiceConnections.filter(m => m.channelID !== null)[0].channelID)
        }
    }, 350)

})

client.on("error", err => {
    console.error(`${err}`)
})

client.on("warn", err => {
    console.warn(`${err}`)
})

function replaceLog() {
    let oldInfo = console.log
    console.log = function() {
        Array.prototype.unshift.call(arguments, `${log}`)
        oldInfo.apply(this, arguments)
    }
}
function replaceWarning() {
    let oldInfo = console.warn
    console.warn = function() {
        Array.prototype.unshift.call(arguments, `${warning}`)
        oldInfo.apply(this, arguments)
    }
}
function replaceError() {
    let oldInfo = console.error
    console.error = function() {
        Array.prototype.unshift.call(arguments, `${error}`)
        oldInfo.apply(this, arguments)
    }
}

client.connect()
bot.login(config.token) // I repent 🙏