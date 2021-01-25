const Commands = []                                // Array of all commands which I will append objects to
const util = require("util")                       // For inspecting my evals or debugging other things
const domers = "779446753606238258"                // This is the ID of the domer role
const sharp = require("sharp")                                         // This is for combining images
sharp.cache({files: 1})                                                // Set cache to 1 file otherwise it never creates a new file after the first
const chalk = require("chalk")                                         // Colored logging module
const { connect } = require("http2")
const error = `${chalk.redBright("[ERROR]")}${chalk.reset()}`          // Colored logs for errors
const warning = `${chalk.yellowBright("[WARN]")}${chalk.reset()}`      // Colored logs for warnings
const log = `${chalk.greenBright("[LOG]")}${chalk.reset()}`            // Colored logs for general logs
var lastBenched                                                        // The last person benched who will be excluded next run


// All commands must contain `fn: function()`, `private: boolean`, `help: string, and `usage: string`
// fn: must be a function that can use message, client, and suffix in that order, but does not have to use everything. I.E., you can just use message.
// private: is a boolean value that determines if only the bot owner can run the command. If set to true, the command will reject everyone but the person with the owner ID in the config.
// help: is a string that contains information about the command, this is automatically grabbed by the help command.
// usage: a string that contains usage information such as what values a command accepts.

Commands.eval = {
    fn: function(message, client, suffix) {
        console.log(`${log} Eval command executed`)
        try {
            let evaled = eval(suffix)       // Save the evaluation to a variable
            evaled = util.inspect(evaled, { // Inspect the result with a depth of 1 so you don't get those annoying [object Object] responses.
                depth: 1
            })                              
            evaled = evaled.replace(new RegExp(client.token, "gi"), "Token leak! Censored.") // RegExp for replacing the bot token so it doesn't leak in eval
            if(evaled.length >= 1900) {                                                      // Discord has a 2000 character limit
                evaled = evaled.substr(0, 1800)
                evaled = evaled + "....."
            }
            message.channel.createMessage("```js\n" + evaled + "\n```") 
        } catch(e) {
            if(e.length >= 1900) {
                e = e.substr(0, 1800)
                e = e + "....."
            }
            message.channel.createMessage("Error Caught```js\n" + e + "\n```")
        }
    },
    private: true,
    help: "Evaluates JavaScript code. (Drew Only)",
    usage: "!eval (code)"
}

Commands.ping = {
    fn: function(message, client) {
        console.log(`${log} Ping command executed`)
        message.channel.createMessage(`Dome latency: ${client.shards.get(0).latency}ms`)
    },
    private: false,
    help: "Grabs the latency value of the first - and only - shard.",
    usage: "!ping"
}

Commands.bench = {
    fn: async function(message, client) {
        // This command looks like hell I am so sorry I have no idea how to make it look better
        // Welcome to variable hell :}

        console.log(`${log} Bench command executed`)

        const lines = require("./benchRandoms.json").lines // This is the entire array of random one-liners for the bench command
        const image = require("image-js")                  // Image editor (grayscaling)
        const download = require("image-downloader")       // Yeah.. downloads images because I don't want to write HTTP requests to do it myself
        let imageBuffer                                    // imageBuffer saves the buffer data from images created later
        let embed = {
            embed: {
                title: "Hahahaha gay baby jail!",
                image: {
                    url: "attachment://gaybabyjail.png"    // attachment:// shows that the image should be set as the file we are uploading
                }
            }
        }
        let foundDomers = await client.guilds.get(message.guildID).members.filter(m => m.roles.indexOf(domers) !== -1)                    // foundDomers filters through everyone with the domer role and returns an array with member objects of everyone with the role
        let chosenDomer = foundDomers[(Math.floor(Math.random() * (foundDomers.length-1)))]                                               // chosenDomer picks a random index from the foundDomer array as the person who will sit out, this is their entire member object
        let chosenLine = lines[Math.floor(Math.random() * (lines.length-1))].replace(new RegExp("pname", "gi"), `${chosenDomer.username}`) // chosenLine picks a random line response from benchRandoms.json and inserts their name into it
            lastBenched = chosenDomer
        const options = {                                  // options saves the options for downloading the chosen person's avatar
            url: chosenDomer.avatarURL,
            dest: './runtime/commandsContainer/domerImage.jpg'
        }
        await download.image(options).then()
            .catch(err => {
                console.log(`${error} ${err}`)
            })
        let domerImage = await image.Image.load("./runtime/commandsContainer/domerImage.jpg")
            domerImage = domerImage.grey()
        await domerImage.save("./runtime/commandsContainer/domerImage.jpg")

        if(lastBenched) {
            foundDomers.splice(foundDomers.indexOf(lastBenched), 1)
        }

        message.channel.createMessage("I'm spinnin the wheel! Some unlucky fucker is sittin' out this domin' round!")
        message.channel.createMessage(chosenLine)                   // Sends the random one-liner with who is sitting out

        sharp("./runtime/commandsContainer/jailbars.png")           // Opens jailbars for use
            .resize({                                               // Sharp is funky with varying image sizes, resize everything to 128
                fit: sharp.fit.contain,
                height: 128
            })
            .toBuffer()                                             // png -> buffer so we can use this data
            .then(data => {
                sharp('./runtime/commandsContainer/domerImage.jpg')
                .resize(128, 128)                                   // Sharp really doesn't like images that don't match in size, 128x128
                .composite([{                                       // Mash jailbars.png on top of the person's avatar
                    input: data
                }])
                .toFile('./runtime/commandsContainer/gaybabyjail.png', (err, info) => {
                })
            })
            .catch(err => {
                console.log(`${error} ${err}`)
        })

        setTimeout(() => {                                         // If we start this too fast, it will grab the last person's avatar rather than the new one created
            sharp("./runtime/commandsContainer/gaybabyjail.png")   // Load up the mashed image
                .toBuffer()                                        // Turn it into a useable buffer
                .then(data => {                                    // We save the mashed image buffer data into imageBuffer for uploading later
                    imageBuffer = data
                })
                .catch(err => {
                    console.log(`${error} ${err}`)
                })
        }, 300)

        setTimeout(() => {
            message.channel.createMessage(embed, {
                file: imageBuffer,
                name: "gaybabyjail.png"
            }).catch(err => {
                console.log(`${error} ${err}`)
            })
        }, 400)
    },
    private: false,
    help: "Grabs a random person to bench for the next 5-man match. Automatically excludes the previous bench from being chosen next.",
    usage: "!bench"
}

Commands.assemble = {
    fn: function(message, client) {
        console.log(`${log} Assemble command executed`)
        if(message.author.id !== "466767464902950922") {
            return message.channel.createMessage("This is a Caelan only command, retard!")
        }
        
        // Filter through all voiceStates and return an array of all states where the person is in the waiting room
        let waiters = client.guilds.get(message.guildID).voiceStates.filter(m => m.channelID == "784537245616439296")
        
        // Filter through all voiceStates and return an array of all states where the person is already in the penthouse
        let nonWaitersVoiceStates = client.guilds.get(message.guildID).voiceStates.filter(m => m.channelID == "773245943218307082")
        let nonWaiters = []
        
        nonWaitersVoiceStates.forEach(nonwaiter => {
            nonWaiters.push(client.guilds.get(message.guildID).members.find(m => m.id == nonwaiter.id && m.id !== "466767464902950922").mention)
        })
        waiters.forEach(waiter => {
            client.guilds.get(message.guildID).members.find(m => m.id == waiter.id).edit({channelID: "773245943218307082"})
        })
        // Iterate through the array of nonWaiters and push all their mentions to an array for shaming later
        // Iterate through the array of waiters and move them to the penthouse

        nonWaiters = nonWaiters.join(", ") 
        // This will take the array of mentions for people who didn't wait and join them into one string delimited by commas
        // Ex: ["<@160960464719708161>", "<@197114859316314112>", "<@161014852368859137>"] -> "<@160960464719708161>, <@197114859316314112>, <@161014852368859137>"

        if(waiters.length <= 0) {
            return message.channel.createMessage("Hey, dumbass. There's no one waiting.")
        }

        message.channel.createMessage("Avengers! Assemble at The Penthouse!")

        if(nonWaiters.length > 0) {
            message.channel.createMessage(`Honorable mention: ${nonWaiters}. Bitches that didn't wait for the Captain.`)
        }
    },
    private: false,
    help: "Moves everyone from the waiting room to the penthouse and shames those who didn't wait for the captain.",
    usage: "!assemble"
}

Commands.sussy = {
    fn: function(message, client) {
        const susVideos = require("./susController.json").names                         // List of all videos for hesston's command
        console.log(`${log} Sussy command executed`)
        if(message.author.id !== "160960464719708161") {
            return message.channel.createMessage("Ayo do you think you're hesston or something, stupid?")
        }
        let chosenVideo = susVideos[Math.floor(Math.random() * (susVideos.length-1))]                  // Selects a random video from videoController.json
        message.channel.createMessage(`Lemme pull up somethin' sussy for ya..\n${chosenVideo}`)        // Lets the person know to wait for something coming, video uploads can be slow
    },
    private: false,
    help: "Grabs a random sussy video and sends it.",
    usage: "!sussy"
}

Commands.restart = {
    fn: function(message, client) {
        console.log(`${warning} Restart command executed.`)
        message.channel.createMessage("Restart executed, beginning restart process now.")
        setTimeout(() => {
            eval("process.exit()")
        }, 200)
    },
    private: true,
    help: "Restarts the bot. (Drew Only)",
    usage: "!restart"
}

Commands.help = {
    fn: function() {}, // In theory, this should never ever be run because the command handler returns if the command is "help", but I'm keeping it just in case
    private: false,
    help: "Provides information about a command or grabs the entire list of commands.",
    usage: "!help [commandName]"
}

Commands.drip = {
    fn: function(message) {
        const dripVideos = require("./dripController.json").names                    // Drip videos
        console.log(`${log} Drip command executed.`)
        let chosenVideo = dripVideos[Math.floor(Math.random() * (susVideos.length-1))]         // Selects a random video from videoController.json
        message.channel.createMessage(`Lemme pull up some fat drip for ya..\n${chosenVideo}`)  // Lets the person know to wait for something coming, video uploads can be slow
    },
    private: false,
    help: "Sends a video with some phat drip for domers.",
    usage: "!drip"
}

Commands.ttt = {
    fn: function() {
        // This exists solely as a means to provide help and usage values
    },
    private: false,
    help: "Starts a tic-tac-toe game.",
    usage: "!ttt [@user]"
}

Commands.site = {
    fn: function(message, client) {
        let voiceLines = require("./voiceFiles/voiceControl.json").names
        let randomVoiceLine = voiceLines[Math.floor(Math.random() * voiceLines.length)]
        let channelID = message.member.voiceState.channelID
        if(channelID === null) {
            return message.channel.createMessage("You're not even in a voice channel, dumbass!")
        } else {
            client.joinVoiceChannel(channelID).then(connection => {
                if(connection.playing) {
                    connection.stopPlaying()
                }
                connection.play(`./runtime/commandsContainer/voiceFiles/${randomVoiceLine}`)
                connection.once("end", function() {
                    client.leaveVoiceChannel(channelID)
                })
            }).catch(err => {
                message.channel.createMessage("Error joining voice channel or failed to play file. Dumbass code bro.")
                console.log(`${error} ${err}`)
            })
        }
    },
    private: false,
    help: "Joins the voice channel to tell you what site to choose.",
    usage: "!site"
}
// Exports the entire Commands array to be accessible outside the commands file
exports.Commands = Commands