let fs = require('fs')

module.exports = {
    name: "reacquire",
    aliases: ["acquire"],
    description: "Reacquire commands, dynamic reload",
    controlled: true,
    fn(message, suffix, bot) {
        let fullPath = "D:\\Users\\Drew\\Desktop\\Bots\\TheBencher\\runtime\\commandsContainer\\commands\\"
        if(suffix) {
            try {
                if(require.cache[`${fullPath}${suffix}.js`]) {
                    delete require.cache[`${fullPath}${suffix}.js`]
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
            if(require.cache[`${fullPath}${file}`]) {
                delete require.cache[`${fullPath}${file}`]
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