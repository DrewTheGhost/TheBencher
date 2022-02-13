const caelanID = "466767464902950922",
    drewID = "161014852368859137",
    lukeID = "206215515960508417",
    markID = "197114859316314112",
    tylerID = "161182773875441664",
    zoeID = "160960464719708161",
    domerID = "<@&779446753606238258>",
    Discord = require("discord.js"),
    masterEmbed = {
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
    
module.exports = {
    name: "rollcall",
    aliases: [],
    description: "Starts a roll-call for the domers..",
    controlled: false,
    async fn(message, _suffix, bot, db) {
        /*
        let buttonRow = new Discord.MessageActionRow().addComponents([
            new Discord.MessageButton({
                label: "Active",
                customId: "active",
                style: 3,
                emoji: "<:Active:857075629627015169>"
            }),
            new Discord.MessageButton({
                label: "Sitting Out",
                customId: "idle",
                style: 4,
                emoji: "<:SittingOut:857073545322037250>"
            })
        ]),
        myEmbed = masterEmbed;
        */
       return message.channel.send("This command has been disabled temporarily due to its buggy nature, rewrite still in progress.")
    }
}
/*
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
}

message.channel.send({
    content: `${domerID}`,
    embeds: [ myEmbed ],
    components: [ buttonRow ]
})

if(bot.listenerCount("interactionCreate") <= 0) {
    bot.on("interactionCreate", interaction => {
        if(!interaction.isButton) return
        if(interaction.customId == "active") {
            switch(interaction.user.id) {
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
    
            interaction.update({
                content: `${domerID}`,
                embeds: [ myEmbed ],
                components: [ buttonRow ]
            }).then()
            .catch(console.error)
            
            interaction.followUp({
                content: "You're active, that's fucking poggers!", 
                ephemeral: true
            }).then()
            .catch(console.error)
        }
    
        if(interaction.customId == "idle") {
            switch(interaction.user.id) {
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
    
            interaction.update({
                content: `${domerID}`,
                embeds: [ myEmbed ],
                components: [ buttonRow ]
            }).then()
            .catch(console.error)
    
            interaction.followUp({
                content: "You're sitting out... little shitter.",
                ephemeral: true
            }).then()
            .catch(console.error)
        }
    })
}
*/