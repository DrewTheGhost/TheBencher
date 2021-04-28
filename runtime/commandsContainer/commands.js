const util = require("util"),                           // For inspecting my evals or debugging other things
    mainController = require("./mainController.json"),  // Handles all random link getting
    ytdl = require("ytdl-core"),                        // Downloads youtube audio for streaming
    fs = require("fs"),                                 // Handles opening the audio files and creating buffer streams
    config = require("../../config.json"),              // Config folder
    mysql = require("mysql"),
    db = mysql.createConnection({                       // Database connection
        host: config.mysql.host,
        user: config.mysql.user,
        password: config.mysql.password,
        database: "bencher"
    }),
    weatherKey = config.weatherAPIKey,                  // Accessing OpenWeather API
    sharp = require("sharp")                            // This is for combining images
    sharp.cache({files: 1})                             // Set cache to 1 file otherwise it never creates a new file after the first
var lastBenched,                                        // The last person benched who will be excluded next run
    queue = [],                                         // The music queue
    voteSkippers = [],                                  // Array of voice members that have voted to skip
    leakConnection,                                     // VoiceConnection object leaked after joining the channel for music
    sussyCache = []

const Eris = require("eris"),
    client = new Eris.CommandClient(config.token, 
        {
            getAllUsers: true,
            seedVoiceConnections: true,
            opusOnly: true,
            maxResumeAttempts: 3,
            maxReconnectAttempts: 999,
            latencyThreshold: 1500,
            disableEvents: {
                "GUILD_BAN_ADD": true,
                "GUILD_BAN_REMOVE": true,
                "GUILD_MEMBER_REMOVE": true,
                "MESSAGE_DELETE": true,
                "MESSAGE_DELETE_BULK": true,
                "TYPING_START": true,
            },
        },
        {
            description: "I fuck shit up.",
            owner: `Drew 👻#2567`,
            prefix: ["@mention ", config.prefix],
            defaultCommandOptions: {
                caseInsensitive: true,
                cooldown: 1000,
                cooldownMessage: "Dude. Chill. Holy shit. You're using my juices up too fast.",
                cooldownReturns: 1
            }
        }
)

// Register eval command
client.registerCommand("eval", function(message, suffix) {
    console.log(`Eval command executed.`)
    try {
        let evaled = eval(suffix.join(" "))     // Save the evaluation to a variable
        evaled = util.inspect(evaled, {         // Inspect the result with a depth of 1 so you don't get those annoying [object Object] responses.
            depth: 1
        })                              
        evaled = evaled.replace(new RegExp(client.token, "gi"), "Token leak! Censored.") // RegExp for replacing the bot token so it doesn't leak in eval
        if(evaled.length >= 1900) {                                                      // Discord has a 2000 character limit
         evaled = evaled.substr(0, 1800)
            evaled = evaled + "....."
        }
        return `\`\`\`js\n${evaled}\n\`\`\``
    } catch(err) {
        if(err.length >= 1900) {
            err = err.substr(0, 1800)
            err = err + "....."
        }
        return `Error caught\n\`\`\`js\n${err}\n\`\`\``
    }
}, {
    argsRequired: true,
    hidden: true,
    requirements: {
        userIDs: config.owner
    },
    invalidUsageMessage: "You fucked up, give me some shit to put in.",
    permissionMessage: "You think you're special or something kid?",
    errorMessage: "The fucking command failed. Either you fucked up or I'm a dumbass, and I dunno about you but I don't have the capacity to be stupid."
})

// Register ping command
client.registerCommand("ping", function() {
    return `Domer latency: ${client.shards.get(0).latency}ms`
}, {
    description: "Gets the latency of the bot",
    fullDescription: "Did you really just use the help command.. for ping? Just type fucking ping dumbass.",
})

// Register restart command
client.registerCommand("restart", function() {
    console.log(`Restart command executed.`)
    setTimeout(() => {
        process.exit()
    }, 200)
    return "Restart executed, beginning restart process now."
}, {
    hidden: true,
    requirements: {
        userIDs: config.owner
    },
    permissionMessage: "You think you're special or something kid?"
})

// Register drip command
client.registerCommand("drip", function() {
    const dripVideos = mainController.dripNames                                 // Drip videos
    console.log(`Drip command executed.`)
    let chosenVideo = dripVideos[Math.floor(Math.random() * dripVideos.length)] // Selects a random video from mainController.json
    return `Lemme pull up some fat drip for ya..\n${chosenVideo}`
}, {
    description: "Sends a video with some phat drip for domers.",
    fullDescription: "Sends a video with some phat drip for domers."
})

// Register sussy command
client.registerCommand("sussy", function() {
    let susVideos = mainController.susNames                                   // List of all videos for hesston's command
    console.log(`Sussy command executed`)
    if(sussyCache.length > 5) {                                              // Cache of last 5 videos so repeats don't happen
        sussyCache.shift()
    }
    if(sussyCache[0]) {
        for(let cache of sussyCache) {
            susVideos.splice(susVideos.indexOf(cache), 1)
        }
    }
    let chosenVideo = susVideos[Math.floor(Math.random() * susVideos.length)] // Selects a random video from mainController.json
    sussyCache.push(chosenVideo)
    return `Lemme pull up somethin' sussy for ya..\n${chosenVideo}`
}, {
    permissionMessage: "Ayo do you think you're hesston or something, stupid?",
    description: "Grabs a random sussy video and sends it.",
    fullDescription: "It sends some sussy shit! What more do you want!?",
    aliases: ["sus"]
})

// Register bench command
client.registerCommand("bench", async function(message) {
    let responseStrings = []
    console.log(`Bench command executed`)
    // This command looks like hell I am so sorry I have no idea how to make it look better
    // Welcome to variable hell :}

    const domers = "779446753606238258",                // This is the ID of the domer role
          lines = mainController.lines,                 // This is the entire array of random one-liners for the bench command
          image = require("image-js"),                  // Image editor (grayscaling)
          download = require("image-downloader")        // Yeah.. downloads images because I don't want to write HTTP requests to do it myself
    let imageBuffer                                     // imageBuffer saves the buffer data from images created later
    let embed = {
        embed: {
            title: "Hahahaha gay baby jail!",
            image: {
                url: "attachment://gaybabyjail.png"     // attachment:// shows that the image should be set as the file we are uploading
            }
        }
    }
    let foundDomers = client.guilds.get(message.guildID).members.filter(m => m.roles.indexOf(domers) !== -1)                          // foundDomers filters through everyone with the domer role and returns an array with member objects of everyone with the role
    if(lastBenched) {
        foundDomers.splice(foundDomers.indexOf(lastBenched), 1)
    }
    let chosenDomer = foundDomers[(Math.floor(Math.random() * (foundDomers.length-1)))]                                               // chosenDomer picks a random index from the foundDomer array as the person who will sit out, this is their entire member object
    let chosenLine = lines[Math.floor(Math.random() * (lines.length-1))].replace(new RegExp("pname", "gi"), `${chosenDomer.mention}`) // chosenLine picks a random line response from mainController.lines and inserts their name into it
        lastBenched = chosenDomer
    
    responseStrings.push("I'm spinnin' the wheel! Some unlucky fucker is sittin' out this domin' round!")
    responseStrings.push(chosenLine)                   // Sends the random one-liner with who is sitting out

    const options = {                                  // options saves the options for downloading the chosen person's avatar
        url: chosenDomer.avatarURL,
        dest: './runtime/commandsContainer/domerImage.jpg'
    }
    await download.image(options).then()
        .catch(err => {
            console.error(`${err}`)
        })
    let domerImage = await image.Image.load("./runtime/commandsContainer/domerImage.jpg")
        domerImage = domerImage.grey()
    await domerImage.save("./runtime/commandsContainer/domerImage.jpg")


    sharp("./runtime/commandsContainer/jailbars.png")           // Opens jailbars for use
        .resize({                                               // Sharp is funky with varying image sizes, resize everything to 128
            fit: sharp.fit.contain,
            height: 128
        })
        .toBuffer()                                             // png -> buffer so we can use this data
        .then(data => {
            sharp('./runtime/commandsContainer/domerImage.jpg')
                .resize(128, 128)                               // Sharp really doesn't like images that don't match in size, 128x128
                .composite([{                                   // Mash jailbars.png on top of the person's avatar
                    input: data
                }])
                .toFile('./runtime/commandsContainer/gaybabyjail.png', (err, info) => {
                })
        })
        .catch(err => {
            console.error(`${err}`)
    })

    setTimeout(() => {                                          // If we start this too fast, it will grab the last person's avatar rather than the new one created
        sharp("./runtime/commandsContainer/gaybabyjail.png")    // Load up the mashed image
            .toBuffer()                                         // Turn it into a useable buffer
            .then(data => {                                     // We save the mashed image buffer data into imageBuffer for uploading later
                imageBuffer = data
            })
            .catch(err => {
                console.error(`${err}`)
        })
    }, 300)

    setTimeout(() => {
        message.channel.createMessage(embed, {
            file: imageBuffer,
            name: "gaybabyjail.png"
        }).catch(err => {
            console.error(`${err}`)
        })
    }, 400)
    return responseStrings.join("\n")
}, {
    description: "Benches a random domer.",
    fullDescription: "Grabs a random person to bench for the next 5-man match. Automatically excludes the previous bench from being chosen next."
})

// Register assemble command
client.registerCommand("assemble", function(message) {
    console.log(`Assemble command executed`)

    // Filter through all voiceStates and return an array of all states where the person is in the waiting room
    let waiters = message.member.guild.voiceStates.filter(m => m.channelID == "784537245616439296")
    
    // Filter through all voiceStates and return an array of all states where the person is already in the penthouse
    let nonWaitersVoiceStates = message.member.guild.voiceStates.filter(m => m.channelID == "773245943218307082")
    let nonWaiters = []
    
    nonWaitersVoiceStates.forEach(nonwaiter => {
        nonWaiters.push(message.member.guild.members.find(m => m.id == nonwaiter.id && m.id !== "466767464902950922").mention)
    })

    waiters.forEach(waiter => {
        message.member.guild.members.find(m => m.id == waiter.id).edit({channelID: "773245943218307082"})
    })
    // Iterate through the array of nonWaiters and push all their mentions to an array for shaming later
    // Iterate through the array of waiters and move them to the penthouse


    if(waiters.length <= 0) {
        return "Hey, dumbass. There's no one waiting."
    } else if(waiters.length > 0 && nonWaiters.length <= 0) {
        return "Avengers! Assemble at The Penthouse!"
    } else {
        let plural = "Bitch"
        if(nonWaiters.length > 1) {
            plural = "Bitches"
        }
        nonWaiters = nonWaiters.join(", ") 
        // This will take the array of mentions for people who didn't wait and join them into one string delimited by commas
        // Ex: ["<@160960464719708161>", "<@197114859316314112>", "<@161014852368859137>"] -> "<@160960464719708161>, <@197114859316314112>, <@161014852368859137>"
        return `Avengers! Assemble at The Penthouse!\nHonorable mention: ${nonWaiters}. ${plural} that didn't wait for the Captain.`
    }
}, {
    requirements: {
        userIDs: ["466767464902950922"]
    },
    permissionMessage: "This is a Caelan only command, retard!",
    description: "Assembles the domers into the penthouse.",
    fullDescription: "Moves all people from the waiting room into The Penthouse. Automatically shames those who don't wait for the captain."
})

// Register ttt command
client.registerCommand("ttt", function() {}, {
    description: "Starts a game of tic-tac-toe.",
    fullDescription: "Starts a game of tic-tac-toe with either the AI or a person. Mention someone after the command to play with them."
})

// Register site command
client.registerCommand("site", function(message) {
    let voiceLines = mainController.voiceNames
    let randomVoiceLine = voiceLines[Math.floor(Math.random() * voiceLines.length)]
    let channelID = message.member.voiceState.channelID
    if(channelID === null) {
        return "You're not even in a voice channel, dumbass!"
    } else if(client.voiceConnections.filter(m => m.channelID !== null).length > 0) {
        if(client.voiceConnections.filter(m => m.channelID !== null)[0].playing) {
            return "I'm already playing something, fuck off"
        }
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
            console.error(err)
            return "Error joining voice channel or failed to play file. Dumbass code bro."
        })
    }
}, {
    description: "Tells you what site to go to in CS:GO.",
    fullDescription: "Joins the voice channel to play a line describing what to do in a CS:GO match pre-round."
})

// Register music command
client.registerCommand("music", async function(message, suffix) {
    let channelID = message.member.voiceState.channelID,
    buffer,
    titleSuffixDetails,
    titleSuffix,
    titleQueueDetails,
    titleQueue

    if(channelID === null) {
        return "You aren't even in a voice channel to listen to anything, dumbass."
    }
    if(!ytdl.validateURL(suffix)) {
        return "Can't seem to pull info from that. Did you actually put in a youtube video, dumbass?"
    }
    if(queue.length >= 10) {
        if(queue.length > 10) {
            queue.pop()
        }
        return "Slow down there tiger. Too many things in queue."
    }
    titleSuffixDetails = await ytdl.getBasicInfo(suffix)
    if(titleSuffixDetails.videoDetails.isLiveContent) {
        return "Guess again if you think I'm about to let you queue a fucking livestream."
    }

    queue.push(suffix)
    console.log(`Music: ${message.author.username} Requested ${suffix}`)
    titleSuffix = titleSuffixDetails.videoDetails.title
    console.log(`Music: Song title ${titleSuffix}`)
    console.log(`Music: Queue length now ${queue.length}`)
    message.channel.createMessage(`Alright, added ${titleSuffix} to the queue at position ${queue.length}.`)

    if(client.voiceConnections.filter(m => m.channelID !== null).length == 0) {
        client.joinVoiceChannel(channelID, {opusOnly: true, shared: false}).then(connection => {
            console.log(`Music: Joined voice channel to play ${queue[0]}`)
            console.log(`Music: Current titleSuffix is ${titleSuffix}`)
            leakConnection = connection
            connection.setVolume(0.1)
            console.log(`Music: Set volume to 0.1`)
            if(connection.playing) {
                console.log(`Music: stopPlaying() sent, should not be playing anything yet`)
                connection.stopPlaying()
            }
            playSong()
            console.log(`Music: playSong() function executed`)
            connection.on("end", function() {
                console.log(`Music: end event received`)
                if(connection.playing) {
                    connection.stopPlaying()
                }
                queue.shift()
                console.log(`Music: Queue shifted, new length ${queue.length}`)
                if(queue.length > 0) {
                    playSong()
                }
            })
        }).catch(err => {
            message.channel.createMessage("What the fuck did you do? Shit errored.")
            console.error(err)
        })
    } else {
        if(client.voiceConnections.filter(m => m.channelID !== null).length > 0) {
            if(queue.length > 0 && !client.voiceConnections.filter(m => m.channelID !== null)[0].playing) {
                playSong()
                console.log(`Music: playSong() function executed`)
            }
        }
    }
    async function playSong() {
        buffer = ytdl(queue[0], {quality: "highestaudio"})
        titleQueueDetails = await ytdl.getBasicInfo(queue[0])
        titleQueue = titleQueueDetails.videoDetails.title
        client.voiceConnections.filter(m => m.channelID !== null)[0].play(buffer, {inlineVolume: true})
        message.channel.createMessage(`Now playing ${titleQueue}`)
        voteSkippers = []
    }
}, {
    description: "Joins and plays music :}",
    fullDescription: "Joins the voice channel you're in and plays a song you request or adds it to the queue.",
    argsRequired: true,
    usage: "[youtube url] or [subcommand]",
    aliases: ["play"],
    invalidUsageMessage: "Give me something to play >:{"
})

// Register volume subcommand of music
client.commands.music.registerSubcommand("volume", function(message, suffix) {
    console.log(`Music: Volume command executed by ${message.author.username}`)
    if(client.voiceConnections.filter(m => m.channelID).length == 0) {
        return "There's literally nothing to change the volume of. Get checked for schizophrenia."
    }
    if(message.member.voiceState.channelID !== client.voiceConnections.filter(m => m.channelID)[0].channelID) {
        return "Bro, you tryna fuck with people in the VC? Homies jamming to tunes? And you think you DESERVE control of the volume knob? Think again, knob."
    }
    if(!Number.isInteger(parseInt(suffix))) {
        return "Put in a number next time, dumbass."
    }
    suffix = parseInt(suffix)
    suffix = suffix/100
    if(suffix < 0) {
        return "Shit is too small. Enter a bigger number, dumbass!"
    }
    if(suffix > 1) {
        return "Shit is too fucking big! Enter a smaller number, dumbass."
    }
    client.voiceConnections.filter(m => m.channelID)[0].setVolume(suffix)
    console.log(`Music: Adjusted volume to ${suffix}`)
    return `Adjusting the volume for ya, now set to ${suffix*100}`
}, {
    argsRequired: true,
    description: "Sets the volume",
    fullDescription: "Sets the volume of the current music stream. Can be any number 0-100.",
    usage: "0-100",
    aliases: ["vol"]
})

// Register voteskip subcommand of music
client.commands.music.registerSubcommand("voteskip", function(message, suffix) {
    let voiceChannelID
    if(client.voiceConnections.filter(m => m.channelID).length == 0) {
        return "You hear that? Yeah, me neither. Maybe cus I'm not playing anything in the first place, dumbass!"
    }
    if(client.voiceConnections.filter(m => m.channelID !== null).length > 0) {
        voiceChannelID = client.voiceConnections.filter(m => m.channelID !== null)[0].channelID
    }

    if(message.member.voiceState.channelID !== client.voiceConnections.filter(m => m.channelID)[0].channelID) {
        if(voteSkippers.indexOf(message.member) !== -1) {
            voteSkippers.splice(voteSkippers.indexOf(message.member), 1)
        }
        return "You're.. trying to voteskip when you aren't even listening? Fuck off, shithead."
    }
    if(!leakConnection.playing) {
        return "I'm literally not playing anything. The fuck are you trying to skip?"
    }
    let voiceMembers = client.guilds.get(message.guildID).channels.get(voiceChannelID).voiceMembers.map(m => m)
    /* 
    if(suffix) {
        if(!Number.isInteger(parseInt(suffix))) {
            return message.channel.createMessage("You didn't put in a number, try putting in a position next time dumbass.")
        }
        if(queue[suffix]) {

        }
    }
    */
    if(voteSkippers.indexOf(message.member) !== -1) {
        return "You already voted to skip... Stop trying to rig the vote #stopthecount."
    }
    voteSkippers.push(message.member)
    message.channel.createMessage(`${message.author.username} voted to skip. ${voteSkippers.length}/${Math.ceil((voiceMembers.length-1) / 2)} required.`)
    if(voteSkippers.length >= Math.ceil((voiceMembers.length-1) / 2)) {
        voteSkippers = []
        leakConnection.emit("end")
        return `Requirement met to skip song, skipping.`

    }
}, {
    description: "Votes to skip something",
    fullDescription: "Votes to skip the song currently streaming, requires half the voice members minus the bot rounded up to pass.",
    aliases: ["skip"]
})

// Register queue subcommand of music
client.commands.music.registerSubcommand("queue", async function(message) {
    if(queue.length == 0) {
        return "There's nothing in the queue."
    }
    let fields = []
    for(let song of queue) {
        let videoInfo = await ytdl.getBasicInfo(song)
        let title = videoInfo.videoDetails.title
        fields.push({
            "name": "Song Name",
            "value": `${title}`,
            "inline": true
        })
        fields.push({
            "name": "Position",
            "value": `${queue.indexOf(song)+1}`,
            "inline": true
        })
        if(fields.length % 3 == 2) {
            fields.push({
                "name": "\u200B",
                "value": "\u200B",
                "inline": true
            })
        }
    }
    let embed = {
        embed: {
            "color": 165920,
            fields: fields
        }
    }
    return message.channel.createMessage(embed)
}, {
    description: "Checks the queue",
    fullDescription: "Returns back the full queue with all song positions"
})

// Register stop subcommand of music
client.commands.music.registerSubcommand("stop", function() {
    queue.splice(0, queue.length-1)
    voteSkippers = []
    leakConnection.emit("end")
    return "God, fuck, shit, fine, I'll stop playing."
}, {
    description: "Cleans current music session",
    fullDescription: "Clears the queue and stops the bot from playing."
})

// Register disconnect subcommand of music
client.commands.music.registerSubcommand("disconnect", function(message) {
    queue = []
    voteSkippers = []
    if(leakConnection) {
        client.leaveVoiceChannel(leakConnection.channelID)
        return `lol bye dumbass ${message.member.mention}`        
    }
    client.leaveVoiceChannel(client.voiceConnections.filter(m => m.channelID !== null)[0].channelID)
    return `lol bye dumbass ${message.member.mention}`
}, {
    description: "Disconnects the bot from the voice channel",
    fullDescription: "Disconnects the bot from the channel which clears the queue and all music data."
})

client.registerCommand("stocks", function (message, suffix) {
    let https = require("https")
    let symbol = (!suffix[0]) ? "GME" : suffix[0].toUpperCase()
    https.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${config.finnhub.apiKey}`, res => {
        res.on("data", d => {
            d = d.toString("utf8")
            d = JSON.parse(d)
            data = `${symbol} Data\n**Last close:** \$${d.pc}\n**Opened at:** \$${d.o}\n\n**High of:** \$${d.h}\n**Low of:** \$${d.l}\n\n**Current:** \$${d.c}`
            
            message.channel.createMessage(`${data}`)
        })
    })
}, {
    description: "Returns stock price.",
    fullDescription: "Returns stock data for GME by default, else whatever symbol you put in.",
    aliases: ["stock"]
})

client.registerCommand("shorts", function(message) {
    let https = require("https")
    https.get(`https://finnhub.io/api/v1/stock/short-interest?symbol=GME&from=2020-12-31&to=2021-02-01&token=${config.finnhub.apiKey}`, res => {
        res.on("data", d => {
            d = d.toString("utf8")
            d = JSON.parse(d)
            let data = `Short Interest Data GME\n\nShort Interest Volume: ${d.data[0].shortInterest}\nDate: ${d.data[0].date}\n\nUpdates twice monthly (15th and 29th/30th/31st)`
            message.channel.createMessage(`${data}`)
        })
    })
}, {
    description: "Returns short information on GME.",
    fullDescription: "Returns short interest data for a time period on GME.",
    aliases: ["short"]
})

client.registerCommand("cipher", async function(message, suffix) {
    suffix = suffix.join(" ")
    function rotRight(str) {
        str = (typeof str == "string") ? str : "" 
        return str.split('').map(x => rotRight.lookup[x] || x).join('')
    }
    rotRight.input  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    rotRight.output = 'SNVFRGHJOKL:<MP{WTDYIBECUXsnvfrghjokl;,mp[wtdyibecux'.split('')
    rotRight.lookup = rotRight.input.reduce((m,k,i) => Object.assign(m, {[k]: rotRight.output[i]}), {})
    
    message.channel.createMessage(`${rotRight(suffix)}`)
}, {
    argsRequired: true,
    hidden: true,
    requirements: {
        userIDs: ["197114859316314112","161014852368859137"]
    },
    invalidUsageMessage: "You fucked up, give me some shit to put in.",
    permissionMessage: "?",
    errorMessage: "The fucking command failed. Either you fucked up or I'm a dumbass, and I dunno about you but I don't have the capacity to be stupid.",
    dmOnly: true
})

client.registerCommand("solve", async function(message, suffix) {
    suffix = suffix.join(" ")
    function rotLeft(str) {
        str = (typeof str == "string") ? str : "" 
        return str.split('').map(x => rotLeft.lookup[x] || x).join('')
    }
    rotLeft.input = 'SNVFRGHJOKL:<MP{WTDYIBECUXsnvfrghjokl;,mp[wtdyibecux'.split('')
    rotLeft.output  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    rotLeft.lookup = rotLeft.input.reduce((m,k,i) => Object.assign(m, {[k]: rotLeft.output[i]}), {})
    
    message.channel.createMessage(`${rotLeft(suffix)}`)
}, {
    argsRequired: true,
    hidden: true,
    requirements: {
        userIDs: ["197114859316314112","161014852368859137"]
    },
    invalidUsageMessage: "You fucked up, give me some shit to put in.",
    permissionMessage: "?",
    errorMessage: "The fucking command failed. Either you fucked up or I'm a dumbass, and I dunno about you but I don't have the capacity to be stupid.",
    dmOnly: true
})

client.registerCommand("register", async function(message) {
    db.query(`SELECT id FROM player WHERE id = ${message.author.id}`, (err, results) => {
        if (err) {
            console.error(err)
            return message.channel.createMessage("Somethin' fucked up bro.. I dunno.")
        }
        if (!results[0]) {
            db.query(`INSERT INTO player (id) VALUES ("${message.author.id}")`, (err) => {
                if (err) {
                    console.error(err)
                    return message.channel.createMessage("Somethin' fucked up during registration..")
                }
                message.channel.createMessage("Alrriiiiighty. You're set to FUCKING GOOOOO now.")
            })
        } else {
            return message.channel.createMessage("You tryna register when you already exist or somethin' stupid?")
        }
    })
}, {
    description: "Registers you as a player.",
    fullDescription: "Registers you as a player in the database if you aren't one."
})

client.registerCommand("balance", function(message, suffix) {
    if(!suffix[0]) {
        db.query(`SELECT currency FROM player WHERE id = ${message.author.id}`, (err, results) => {
            if(err) {
                console.error(err)
                return message.channel.createMessage("Somethin' fucked up bro.. I dunno.")
            } else if(!results[0]) {
                return message.channel.createMessage("You're trying to check your balance without even being registered.. Bro use !register.")
            } else {
                return message.channel.createMessage(`Looks like you got ${results[0].currency} oz of cringe on ya.`)
            }
        })
    } else if(message.mentions.length > 0) {
        db.query(`SELECT currency FROM player WHERE id = ${message.mentions[0].id}`, (err, results) => {
            if(err) {
                console.error(err)
                return message.channel.createMessage("Somethin' fucked up bro.. I dunno.")
            } else if(!results[0]) {
                return message.channel.createMessage("Yo, that person don't exist bro. Tell them to register or somethin'.")
            } else {
                return message.channel.createMessage(`Looks like they got ${results[0].currency} oz of cringe on em.`)
            }
        })
    } else {
        if(!client.users.get(suffix[0])) {
            return message.channel.createMessage("Yo, gimme a valid ID next time dipshit.")
        } else {
            db.query(`SELECT currency FROM player WHERE id = ${suffix[0]}`, (err, results) => {
                if(err) {
                    console.error(err)
                    return message.channel.createMessage("Somethin' fucked up bro.. I dunno.")
                } else if(!results[0]) {
                    return message.channel.createMessage("Yo, that person don't exist bro. Tell them to register or somethin'.")
                } else {
                    return message.channel.createMessage(`Looks like they got ${results[0].currency} oz of cringe on em.`)
                }
            })
        }
    }
}, {
    description: "Grabs the liquid balance of someone.",
    fullDescription: "Grabs the liquid balance of you or the person specified.",
    aliases: ["bal", "currency", "money"]
})

client.registerCommand("profile", function(message, suffix) {
    if(!suffix[0]) {
        db.query(`SELECT * FROM player WHERE id = ${message.author.id}`, (err, results) => {
            if(err) {
                console.error(err)
                return message.channel.createMessage("Somethin' fucked up bro.. I dunno.")
            } else if(!results[0]) {
                return message.channel.createMessage("You're trying to check your profile without even being registered.. Bro use !register.")
            } else {
                let player = client.users.get(results[0].id).username,
                    currency = results[0].currency,
                    losses = results[0].losses,
                    wins = results[0].wins,
                    cards = (results[0].cards !== null) ? results[0].cards.length : "None",
                    decks = (results[0].decks !== null) ? results[0].decks.length : "None"
                return message.channel.createMessage(`${player}'s Profile\n------------------------\nDecks:\n${decks}\n------------------------\nCards:\n${cards}\n------------------------\nWins: ${wins}\nLosses: ${losses}\n------------------------\nLiquid Cringe: ${currency} oz`)
            }
        })
    } else if(message.mentions.length > 0) {
        db.query(`SELECT * FROM player WHERE id = ${message.mentions[0].id}`, (err, results) => {
            if(err) {
                console.error(err)
                return message.channel.createMessage("Somethin' fucked up bro.. I dunno.")
            } else if(!results[0]) {
                return message.channel.createMessage("Yo, that person don't exist bro. Tell them to register or somethin'.")
            } else {
                let player = client.users.get(results[0].id).username,
                    currency = results[0].currency,
                    losses = results[0].losses,
                    wins = results[0].wins,
                    cards = (results[0].cards !== null) ? results[0].cards.length : "None",
                    decks = (results[0].decks !== null) ? results[0].decks.length : "None"
                return message.channel.createMessage(`${player}'s Profile\n------------------------\nDecks:\n${decks}\n------------------------\nCards:\n${cards}\n------------------------\nWins: ${wins}\nLosses: ${losses}\n------------------------\nLiquid Cringe: ${currency} oz`)
            }
        })
    } else {
        if(!client.users.get(suffix[0])) {
            return message.channel.createMessage("Yo, gimme a valid ID next time dipshit.")
        } else {
            db.query(`SELECT * FROM player WHERE id = ${suffix[0]}`, (err, results) => {
                if(err) {
                    console.error(err)
                    return message.channel.createMessage("Somethin' fucked up bro.. I dunno.")
                } else if(!results[0]) {
                    return message.channel.createMessage("Yo, that person don't exist bro. Tell them to register or somethin'.")
                } else {
                    let player = client.users.get(suffix[0]).username,
                        currency = results[0].currency,
                        losses = results[0].losses,
                        wins = results[0].wins,
                        cards = (results[0].cards !== null) ? results[0].cards.length : "None",
                        decks = (results[0].decks !== null) ? results[0].decks.length : "None"
                    return message.channel.createMessage(`${player}'s Profile\n------------------------\nDecks:\n${decks}\n------------------------\nCards:\n${cards}\n------------------------\nWins: ${wins}\nLosses: ${losses}\n------------------------\nLiquid Cringe: ${currency} oz`)
                }
            })
        }
    }
}, {
    description: "Gets a profile :}",
    fullDescription: "Gets the profile of you or someone you specify."
})

client.registerCommand("warn", function(message, suffix) {
    if(!suffix[0]) {
        return message.channel.createMessage(`?? Warn someone, hello?`)
    }
    if(message.mentions.length < 1) {
        return message.channel.createMessage(`Dude. Ping the bastard.`)
    }
    return message.channel.createMessage(`Alright, domer. You've done some fucked up shit. You messed up. The first step is admitting you have a problem. Own up to it, ${message.mentions[0].mention}, and maybe we'll forgive you. You've been warned, shithead.`)
}, {
    description: "Warns a bad boy..",
    fullDescription: "Warns a very bad boy.. Mention that fucker by the way.",
    argsRequired: true,
    invalidUsageMessage: "You fucked up, give me some shithead (pronounced shuh-theed) to warn."
})

/* whenever you decide to stop being lazy, make an embed response and add multi-location functionality using geo lookup api they provide
client.registerCommand("weather", function(message, suffix) {
    let lat, 
        lon;
    let https = require('https')
    if(!suffix[0]) {
        lat = "-35.0526"
        lon = "-97.9364"
        https.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly&appid=${weatherKey}`, res => {
            let partialData = "";
            res.on("data", chunk => {
                partialData += chunk;
            })
            res.on("end", () => {
                message.channel.createMessage({
                    embed: {
                        
                    }
                })
            })
        }).on('error', err => {
            console.error(err)
        })
    }
}, {
    description: "Grabs some weather :)",
    fullDescription: "Gets some funky weather deets!",
    argsRequired: false,
    invalidUsageMessage: "You fucked up somehow. I dunno.",
    cooldown: 0,
    cooldownMessage: "Ayo, API don't like it when I request a location more than once per 10 minutes. Sorry fucker."
}) 
*/

// Exports the client to be accessible to the main file which logs in and handles ready, warn, and error events
exports.client = client