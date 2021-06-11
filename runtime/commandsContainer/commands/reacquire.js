module.exports = {
    name: "reacquire",
    aliases: ["acquire"],
    description: "Reacquire commands, dynamic reload",
    controlled: true,
    fn(message, suffix, bot) {
        let fs = require('fs')
        let fullPath = "D:\\Users\\Drew\\Desktop\\Bots\\TheBencher\\runtime\\commandsContainer\\commands\\"
        if(suffix) {
            try {
                if(require.cache[`${fullPath}${suffix}.js`]) {
                    delete require.cache[`${fullPath}${suffix}.js`]
                }
                let command = require(`./${suffix}.js`)
                bot.commands.set(command.name, command)
                return message.channel.send(`Successfully reacquired ${suffix}.`)
            } catch(err) {
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
        }
        message.channel.send("Reacquired commands.")
    }
}