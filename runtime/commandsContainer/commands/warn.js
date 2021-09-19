module.exports = {
    name: "warn",
    aliases: [],
    description: "Warns a domer for doing some stupid shit.",
    controlled: false,
    fn(message, suffix) {
        suffix = suffix.split(" ")
        if(!suffix[0]) {
            return message.channel.send(`?? Warn someone, hello?`)
        }
        if(message.mentions.users.size == 0) {
            return message.channel.send(`Dude. Ping the bastard.`)
        }
        message.channel.send(`Alright, domer. You've done some fucked up shit. You messed up. The first step is admitting you have a problem. Own up to it, <@${message.mentions.users.first().id}>, and maybe we'll forgive you. You've been warned, shithead.`)
    }
}