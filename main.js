const config = require("./config.json"),                          // My config file
    runtime = require("./runtime/runtime.js"),
    bot = runtime.commandsContainer.commands.bot,
    chalk = require("chalk"),                                     // Console coloring
    error = `${chalk.redBright("[ERROR]")}${chalk.reset()}`,      // Error message coloring
    warning = `${chalk.yellowBright("[WARN]")}${chalk.reset()}`,  // Warning message coloring
    log = `${chalk.greenBright("[LOG]")}${chalk.reset()}`,        // Log message coloring
    debug = `${chalk.magentaBright("[DEBUG]")}${chalk.reset()}`,                             
    util = require("util")                                        // Do not delete this variable even if unused, can debug with it

replaceLog()
replaceWarning()
replaceError()
replaceDebug()

bot.on("ready", () => {
    // Ready event sent when discord.js is ready
    console.log(`Discord.js ready`)
    console.log(`Current Prefix: ${config.prefix}`)
    bot.user.setPresence({activity: {name: "Type !help for a list of commands or !help commandname to get command info."}})
})

bot.on("message", message => {
    let cmd,
    suffix
    if(message.author.bot) return
    if(message.content.indexOf(config.prefix) === 0) { // If the prefix is used, do this
        cmd = message.content.substring(config.prefix.length).split(' ')[0].toLowerCase()
        suffix = message.content.substr(config.prefix.length).split(' ')
        suffix = suffix.slice(1, suffix.length).join(' ')
    }
    if(cmd) {
        if(bot.commands.get(cmd)) {
            if(bot.commands.get(cmd).controlled && config.owner.indexOf(message.author.id) == -1) {
                return message.channel.send("Can't use this one, dumbass!")
            }
            try {
                bot.commands.get(cmd).fn(message, suffix, bot)
                console.log(`${cmd} command executed.`)
            } catch (err) {
                message.channel.send("Command errored, I fucked something up oh jesus christ")
                console.error(err)
            }
        }
    }
})

bot.on("debug", log => {
    console.debug(`${log}`)
})

bot.on("error", err => {
    console.error(`${err}`)
})

bot.on("warn", err => {
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

function replaceDebug() {
    let oldInfo = console.debug
    console.debug = function () {
        Array.prototype.unshift.call(arguments, `${debug}`)
        oldInfo.apply(this, arguments)
    }
}

bot.login(config.token) // I repent 🙏