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
          "name": "🟨 Caelan",
          "value": "Not active!",
          "inline": true
        },
        {
          "name": "🟨 Drew",
          "value": "Not active!",
          "inline": true
        },
        {
          "name": "🟨 Luke",
          "value": "Not active!",
          "inline": true
        },
        {
          "name": "🟨 Mark",
          "value": "Not active!",
          "inline": true
        },
        {
          "name": "🟨 Tyler",
          "value": "Not active!",
          "inline": true
        },
        {
          "name": "🟨 Zoe",
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
    async fn(message, _suffix, bot) {
        if(embedMessage != undefined) {
            myEmbed = {
                "title": "Domer Roll-Caaaall!",
                "description": "Let's check on some domers...",
                "color": 16711680,
                "fields": [
                    {
                      "name": "🟨 Caelan",
                      "value": "Not active!",
                      "inline": true
                    },
                    {
                      "name": "🟨 Drew",
                      "value": "Not active!",
                      "inline": true
                    },
                    {
                      "name": "🟨 Luke",
                      "value": "Not active!",
                      "inline": true
                    },
                    {
                      "name": "🟨 Mark",
                      "value": "Not active!",
                      "inline": true
                    },
                    {
                      "name": "🟨 Tyler",
                      "value": "Not active!",
                      "inline": true
                    },
                    {
                      "name": "🟨 Zoe",
                      "value": "Not active!",
                      "inline": true
                    }
                ]
            }
            await embedMessage.unpin()
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
        message.channel.send(`${domerID}`, {embed: myEmbed}).then(async m => {
            m.react("<:Active:857075629627015169>")
            m.react("<:SittingOut:857073545322037250>")
            embedMessage = m;
            await m.pin()
        })
        bot.on("messageReactionAdd", (reaction, user) => {
            if(user.bot) return
            if(user.id == message.author.id) return
            if(reaction.message == embedMessage && reaction.emoji.id == "857075629627015169") {
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
            if(reaction.message == embedMessage && reaction.emoji.id == "857073545322037250") {
                switch(user.id) {
                    case caelanID:
                        myEmbed.fields[0] = {
                            "name": ":x: Caelan",
                            "value": "Sitting Out",
                            "inline": true
                        }
                        break;
                    case drewID:
                        myEmbed.fields[1] = {
                            "name": ":x: Drew",
                            "value": "Sitting Out",
                            "inline": true
                        }
                        break;
                    case lukeID:
                        myEmbed.fields[2] = {
                            "name": ":x: Luke",
                            "value": "Sitting Out",
                            "inline": true
                        }
                        break;
                    case markID:
                        myEmbed.fields[3] = {
                            "name": ":x: Mark",
                            "value": "Sitting Out",
                            "inline": true
                        }
                        break;
                    case tylerID:
                        myEmbed.fields[4] = {
                            "name": ":x: Tyler",
                            "value": "Sitting Out",
                            "inline": true
                        }
                        break;
                    case zoeID:
                        myEmbed.fields[5] = {
                            "name": ":x: Zoe",
                            "value": "Sitting Out",
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