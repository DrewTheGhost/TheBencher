module.exports = {
    name: "warn",
    aliases: [],
    description: "Warns a domer for doing some stupid shit.",
    controlled: false,
    fn(message, suffix, bot) {
        suffix = suffix.split(" ")
        if(!suffix[0]) {
            message.channel.send(`?? Warn someone, hello?`)
        } else if(message.mentions.users.size == 0) {
            message.channel.send(`Dude. Ping the bastard.`)
        } else if(message.mentions.users.has(bot.user.id)) {
            message.channel.send("Alright.. For one, fuck you. I'm the one who issues the warnings, you pathetic little cunt. Secondly, where do you get off thinking I did something warn worthy? I'm literally the embodiment of all that is based. Go back to your little cum hole, sissy bitch.")
        } else {
            message.channel.send(`Alright, domer. You've done some fucked up shit. You messed up. The first step is admitting you have a problem. Own up to it, <@${message.mentions.users.first().id}>, and maybe we'll forgive you. You've been warned, shithead.`)
        }
    }
}