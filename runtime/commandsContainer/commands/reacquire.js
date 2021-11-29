const fs = require('fs')

module.exports = {
    name: "reacquire",
    aliases: ["acquire"],
    description: "Reacquire commands, dynamic reload",
    controlled: true,
    fn(message, suffix, bot) {
        if(suffix) {
            if(!(fs.existsSync(`./${suffix}.js`))) {
                return message.channel.send(`Module ${suffix} not found.`)
            }
            try {
                if(require.cache[`${__dirname}\\${suffix}.js`]) {
                    delete require.cache[`${__dirname}\\${suffix}.js`]
                }
                let command = require(`./${suffix}.js`)
                bot.commands.set(command.name, command)
                if(command.aliases.length != 0) {
                    for(const alias of command.aliases) {
                        if(alias != command.name) {
                            bot.commands.set(alias, command)
                        }
                    }
                }
                return message.channel.send(`Successfully reacquired ${suffix}.`)
            } catch(err) {
                console.error(err)
                return message.channel.send(`An error occurred. This is likely due to a module not being found.`)
            }
        }
        commandFilesAll = fs.readdirSync('runtime/commandsContainer/commands').filter(file => file.endsWith('.js') && file !== "reacquire.js")
        for(const file of commandFilesAll) {
            if(require.cache[`${__dirname}\\${file}`]) {
                delete require.cache[`${__dirname}\\${file}`]
            }
            let command = require(`./${file}`)
            bot.commands.set(command.name, command)
            for(const alias of command.aliases) {
                if(alias.length == 0 || alias == command.name) return
                bot.commands.set(alias, command)
            }
        }
        message.channel.send("Reacquired commands.")
    }
}