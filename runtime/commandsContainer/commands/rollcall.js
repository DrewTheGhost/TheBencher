const caelanID = "466767464902950922",
    drewID = "161014852368859137",
    lukeID = "206215515960508417",
    markID = "197114859316314112",
    tylerID = "161182773875441664",
    zoeID = "160960464719708161",
    domerID = "<@&779446753606238258>"

let myEmbed = {
    "title": "Domer Roll-Caaaall!",
    "description": "Let's check on some domers...",
    "color": 16711680,
    "fields": [
        {
          "name": ":x: Caelan",
          "value": "Not active!",
          "inline": true
        },
        {
          "name": ":x: Drew",
          "value": "Not active!",
          "inline": true
        },
        {
          "name": ":x: Luke",
          "value": "Not active!",
          "inline": true
        },
        {
          "name": ":x: Mark",
          "value": "Not active!",
          "inline": true
        },
        {
          "name": ":x: Tyler",
          "value": "Not active!",
          "inline": true
        },
        {
          "name": ":x: Zoe",
          "value": "Not active!",
          "inline": true
        }
    ]
    },
    embedMessage

module.exports = {
    name: "rollcall",
    aliases: [],
    description: "Starts a roll-call for the domers..",
    controlled: false,
    fn(message, suffix, bot) {
        if(embedMessage != undefined) {
            myEmbed = {
                "title": "Domer Roll-Caaaall!",
                "description": "Let's check on some domers...",
                "color": 16711680,
                "fields": [
                    {
                      "name": ":x: Caelan",
                      "value": "Not active!",
                      "inline": true
                    },
                    {
                      "name": ":x: Drew",
                      "value": "Not active!",
                      "inline": true
                    },
                    {
                      "name": ":x: Luke",
                      "value": "Not active!",
                      "inline": true
                    },
                    {
                      "name": ":x: Mark",
                      "value": "Not active!",
                      "inline": true
                    },
                    {
                      "name": ":x: Tyler",
                      "value": "Not active!",
                      "inline": true
                    },
                    {
                      "name": ":x: Zoe",
                      "value": "Not active!",
                      "inline": true
                    }
                ]
            }
            embedMessage.unpin()
        }
        switch(message.author.id) {
            case caelanID:
                myEmbed.fields[0] = {
                    "name": ":white_check_mark: Caelan",
                    "value": "Active!",
                    "inline": true
                }
                break;
            case drewID:
                myEmbed.fields[1] = {
                    "name": ":white_check_mark: Drew",
                    "value": "Active!",
                    "inline": true
                }
                break;
            case lukeID:
                myEmbed.fields[2] = {
                    "name": ":white_check_mark: Luke",
                    "value": "Active!",
                    "inline": true
                }
                break;
            case markID:
                myEmbed.fields[3] = {
                    "name": ":white_check_mark: Mark",
                    "value": "Active!",
                    "inline": true
                }
                break;
            case tylerID:
                myEmbed.fields[4] = {
                    "name": ":white_check_mark: Tyler",
                    "value": "Active!",
                    "inline": true
                }
                break;
            case zoeID:
                myEmbed.fields[5] = {
                    "name": ":white_check_mark: Zoe",
                    "value": "Active!",
                    "inline": true
                }
                break;
            default:
                break;
        }
        message.channel.send(`${domerID}`, {embed: myEmbed}).then(m => {
            m.react("✋")
            embedMessage = m
            m.pin()
        })
        bot.on("messageReactionAdd", (reaction, user) => {
            if(user.bot) return
            if(user.id == message.author.id) return
            if(reaction.message == embedMessage && reaction.emoji.name == "✋") {
                switch(user.id) {
                    case caelanID:
                        myEmbed.fields[0] = {
                            "name": ":white_check_mark: Caelan",
                            "value": "Active!",
                            "inline": true
                        }
                        break;
                    case drewID:
                        myEmbed.fields[1] = {
                            "name": ":white_check_mark: Drew",
                            "value": "Active!",
                            "inline": true
                        }
                        break;
                    case lukeID:
                        myEmbed.fields[2] = {
                            "name": ":white_check_mark: Luke",
                            "value": "Active!",
                            "inline": true
                        }
                        break;
                    case markID:
                        myEmbed.fields[3] = {
                            "name": ":white_check_mark: Mark",
                            "value": "Active!",
                            "inline": true
                        }
                        break;
                    case tylerID:
                        myEmbed.fields[4] = {
                            "name": ":white_check_mark: Tyler",
                            "value": "Active!",
                            "inline": true
                        }
                        break;
                    case zoeID:
                        myEmbed.fields[5] = {
                            "name": ":white_check_mark: Zoe",
                            "value": "Active!",
                            "inline": true
                        }
                        break;
                    default:
                        break;
                }
                message.channel.messages.fetch(embedMessage.id).then(m => { 
                    m.edit(`${domerID}`, {embed: myEmbed}) 
                })
            }
        })
    }
}