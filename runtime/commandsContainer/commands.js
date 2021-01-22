const Commands = []                                // Array of all commands which I will append objects to
const util = require("util")                       // For inspecting my evals or debugging other things
const domers = "779446753606238258"                // This is the ID of the domer role
const lines = require("./benchRandoms.json").lines // This is the entire array of random one-liners for the bench command
const image = require("image-js")                  // Image editor (grayscaling)
const download = require("image-downloader")       // Yeah.. downloads images because I don't want to write HTTP requests to do it myself
const sharp = require("sharp")                     // This is for combining images
sharp.cache({files: 1})                            // Set cache to 1 file otherwise it never creates a new file after the first
const susVideos = require("./hesstonFiles/videoController.json").names // List of all videos for hesston's command
const fs = require("fs")                                               // Used for mp4 -> buffer to upload files

// All commands must contain an `fn:` value and a `private:` value.
// fn: must be a function that can use message, client, and suffix in that order, but does not have to use everything. I.E., you can just use message.
// private: is a boolean value that determines if only the bot owner can run the command. If set to true, the command will reject everyone but the person with the owner ID in the config.

Commands.eval = {
    fn: function(message, client, suffix) {
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
    private: true
}

Commands.ping = {
    fn: function(message, client) {
        // Just grabs the latency value of the first and only shard
        message.channel.createMessage(`Shard latency: ${client.shards.get(0).latency}ms`)
    },
    private: false
}

Commands.bench = {
    fn: async function(message, client) {
        let imageBuffer
        let foundDomers = await client.guilds.get(message.guildID).members.filter(m => m.roles.indexOf(domers) !== -1) 
        let domerName = foundDomers[(Math.floor(Math.random() * (foundDomers.length+1)))]
        let chosenLine = lines[Math.floor(Math.random() * (lines.length-1))].replace(new RegExp("pname", "gi"), `${domerName.mention}`)        
        const options = {
            url: domerName.avatarURL,
            dest: './runtime/commandsContainer/domerImage.jpg'
        }
        // imageBuffer saves the buffer data from images created later
        // foundDomers filters through everyone with the domer role and returns an array with member objects of everyone with the role
        // domerName picks a random index from the list as the person who will sit out and grabs their mention
        // chosenLine picks a random line response from benchRandoms.json and inserts their name into it
        // options saves the options for downloading the chosen person's avatar
        message.channel.createMessage("I'm spinnin the wheel! Some unlucky fucker is sittin' out this domin' round!")
        
        await download.image(options)
        .then(() => {
        })
        .catch(e => {
            console.error("Saving file failed:", e)
        })
        let domerImage = await image.Image.load("./runtime/commandsContainer/domerImage.jpg")
        domerImage = domerImage.grey()
        await domerImage.save("./runtime/commandsContainer/domerImage.jpg")
        
        // Sends the random one-liner with who is sitting out
        message.channel.createMessage(chosenLine)

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
                console.error("Error2: ", err)
        })

        setTimeout(() => {                                         // If we start this too fast, it will grab the last person's avatar rather than the new one created
            sharp("./runtime/commandsContainer/gaybabyjail.png")   // Load up the mashed image
            .toBuffer()                                            // Turn it into a useable buffer
            .then(data => {                                        // We save the mashed image buffer data into imageBuffer for uploading later
                imageBuffer = data
            })
            .catch(e => {
                console.error("Error buffering gaybabyjail", e)
            })
        }, 300)

        let embed = {
            embed: {
                title: "Hahahaha gay baby jail!",
                image: {
                    url: "attachment://gaybabyjail.png"             // attachment:// shows that the image should be set as the file we are uploading
                }
            }
        }

        setTimeout(() => {
            message.channel.createMessage(embed, {
                file: imageBuffer,
                name: "gaybabyjail.png"
            }).catch(e => {
                console.error("Error uploading gaybabyjail", e)
            })
        }, 1000)
    },
    private: false
}

Commands.assemble = {
    fn: function(message, client) {
        if(message.author.id !== "466767464902950922") {
            return message.channel.createMessage("This is a Caelan only command, retard!")
        }
        
        // Filter through all voiceStates and return an array of all states where the person is in the waiting room
        let waiters = client.guilds.get(message.guildID).voiceStates.filter(m => m.channelID == "784537245616439296")
        
        // Filter through all voiceStates and return an array of all states where the person is already in the penthouse
        let nonWaitersVoiceStates = client.guilds.get(message.guildID).voiceStates.filter(m => m.channelID == "773245943218307082")
        let nonWaiters = []
        
        nonWaitersVoiceStates.forEach(nonwaiter => {
            nonWaiters.push(client.guilds.get(message.guildID).members.find(m => m.id == nonwaiter.id).mention)
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
    }
}

Commands.sussy = {
    fn: function(message, client) {
        if(message.author.id !== "160960464719708161") {
            return message.channel.createMessage("Ayo do you think you're hesston or something stupid?")
        }
        let chosenVideo = susVideos[Math.floor(Math.random() * (susVideos.length-1))]              // Selects a random video from videoController.json
        message.channel.createMessage("Lemme pull up somethin' sussy for ya..")                    // Lets the person know to wait for something coming, video uploads can be slow
        fs.readFile(`./runtime/commandsContainer/hesstonFiles/${chosenVideo}`, (err, buffer) => {  // get the file chosen and send the buffer data to createMessage so we can upload the video
            message.channel.createMessage("", {
                file: buffer,
                name: `${chosenVideo}`
            }).catch(e => {
                message.channel.createMessage("Ayo, Drew's coding kinda sussy. Tell him he fucked up.")
                console.error("Sussy video failed to send", e)
            })
        })
    }
}

// Exports the entire Commands array to be accessible outside the commands file
exports.Commands = Commands