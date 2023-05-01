const config = require("./config.json")
const runtime = require("./runtime/runtime.js")
const bot = runtime.commandsContainer.commands.bot
const util = require("util") // Do not delete this variable even if unused, can debug with it
const { Client } = require("pg")
const client = new Client({
        user: config.mysql.user,
        host: config.mysql.host,
        database: config.mysql.database,
        password: config.mysql.password,
        port: config.mysql.port
    })
const { format, createLogger, transports} = require("winston")
const { combine, timestamp, printf, colorize} = format
const myFormat = printf(({level, message, timestamp}) => {
        return `[${timestamp}] [${level}]: ${message}`
    })
const logger = createLogger({
        level: config.logger.level,
        format: combine(
            colorize(),
            timestamp({format: "HH:mm:ss YYYY-MM-DD"}),
            myFormat
        ),
        transports: [new transports.Console()]
    })

let db
client.connect(function (err, client) {
    if(err) {
        return logger.error("Client failed to connect to DB")
    }
    db = client
})

bot.on("ready", async () => {
    // Ready event sent when discord.js is ready
    logger.info("Discord.js READY")
    logger.info(`Current Prefix: ${config.prefix}`)
    bot.user.setPresence({activity: {name: "Type !help for a list of commands or !help commandname to get command info."}})
    client.query("DELETE FROM queue;", function(err, res) {
        if(err) {
            return logger.error(err)
        }
        logger.info(`Dropping queue on READY, rowCount: ${res.rowCount}`)
    })
})

bot.on("messageCreate", message => {
    let cmd,
        suffix
    if(message.author.bot) return
    if(message.content.indexOf(config.prefix) === 0) {
        // If the prefix is used, do this
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
                const params = { message: message, suffix: suffix, bot: bot, db: db, logger: logger}
                bot.commands.get(cmd).fn(params)
                logger.info(`${cmd} command executed.`)
            } catch (err) {
                message.channel.send("Command errored, I fucked something up oh jesus christ")
                logger.error(err)
            }
        }
    }
})

/*
 * Don't really care about this right now 
bot.on("debug", log => {
    console.debug(`${log}`)
})
*/

bot.on("error", err => {
    logger.error(`${err}`)
})

bot.on("warn", err => {
    logger.warn(`${err}`)
})

bot.login(config.token)

exports.logger = logger