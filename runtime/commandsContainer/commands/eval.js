const util = require('util')

module.exports = {
    name: "eval",
    aliases: [],
    description: "Executes code in JavaScript.",
    controlled: true,
    fn(message, suffix, bot) {
        try {
            let evaled = eval(suffix)               // Save the evaluation to a variable
            evaled = util.inspect(evaled, {         // Inspect the result with a depth of 1 so you don't get those annoying [object Object] responses.
                depth: 1
            })                              
            evaled = evaled.replace(new RegExp(bot.token, "gi"), "Token leak! Censored.")    // RegExp for replacing the bot token so it doesn't leak in eval
            if(evaled.length >= 1900) {                                                      // Discord has a 2000 character limit
             evaled = evaled.substr(0, 1800)
                evaled = evaled + "....."
            }
            message.channel.send(`\`\`\`js\n${evaled}\n\`\`\``)
        } catch(err) {
            if(err.length >= 1900) {
                err = err.substr(0, 1800)
                err = err + "....."
            }
            message.channel.send(`Error caught\n\`\`\`js\n${err}\n\`\`\``)
        }
    }
}