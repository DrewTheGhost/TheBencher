const sharp = require("sharp"),                             // This is for combining images
      domers = "779446753606238258",                        // This is the ID of the domer role
      mainController = require("../mainController.json"),   // All the one-liners
      lines = mainController.lines,                         // This is the entire array of random one-liners for the bench command
      image = require("image-js"),                          // Image editor (grayscaling)
      download = require("image-downloader")                // Yeah.. downloads images because I don't want to write HTTP requests to do it myself
      sharp.cache({files: 1})                               // Set cache to 1 file otherwise it never creates a new file after the first
let lastBenched

module.exports = {
    name: "bench",
    aliases: [],
    description: "Benches a domer to sit out.",
    controlled: false,
    async fn(params) {
        const message = params.message,
            logger = params.logger

        let embed = {
            title: "Hahahaha gay baby jail!",
            image: {
                url: "attachment://gaybabyjail.png"         // attachment:// shows that the image should be set as the file we are uploading
            }
        },
        domerImage;                                         // Unused because grayscaling is bugging
        const responseStrings = [],
              foundDomers = [];
        
        /*
        Grayscaling is absolutely broken, don't know why
        sharp("./runtime/commandsContainer/commands/domerImage.jpg").png().toBuffer().then(async buffer => {
            domerImage = await image.Image.load(buffer)
            domerImage = domerImage.grey()
        }).catch(e => {
            logger.error(e)
        })
        setTimeout(() => {
            domerImage.save("./runtime/commandsContainer/commands/domerImage.jpg")
        }, 100)
        */
    
        message.guild.roles.cache.get(domers).members.map(m => foundDomers.push(m))
        if(lastBenched) {
            foundDomers.splice(foundDomers.indexOf(lastBenched), 1)
        }
        chosenDomer = foundDomers[(Math.floor(Math.random() * (foundDomers.length-1)))]                                             // chosenDomer picks a random index from the foundDomer array as the person who will sit out, this is their entire member object        lastBenched = chosenDomer
        chosenLine = lines[Math.floor(Math.random() * (lines.length-1))].replace(new RegExp("pname", "gi"), `<@${chosenDomer.id}>`) // chosenLine picks a random line response from mainController.lines and inserts their name into it
        options = {                                                                                                                 // options saves the options for downloading the chosen person's avatar
            url: chosenDomer.user.displayAvatarURL(),
            dest: './runtime/commandsContainer/commands/domerImage.jpg'
        }

        await download.image(options)
        .then()
        .catch(err => {
            logger.error(`${err}`)
        })

        sharp("./runtime/commandsContainer/commands/jailbars.png")  // Opens jailbars for use
        .resize({                                                   // Sharp is funky with varying image sizes, resize everything to 128
            fit: sharp.fit.contain,
            height: 128
        })
        .toBuffer()                                                 // png -> buffer so we can use this data
        .then(data => {
            sharp('./runtime/commandsContainer/commands/domerImage.jpg')
                .resize(128, 128)                                   // Sharp really doesn't like images that don't match in size, 128x128
                .composite([{                                       // Mash jailbars.png on top of the person's avatar
                    input: data
                }])
                .toFile('./runtime/commandsContainer/commands/gaybabyjail.png', (err, info) => {
                })
        })
        .catch(err => {
            logger.error(`${err}`)
        })

        responseStrings.push("I'm spinnin' the wheel! Some unlucky fucker is sittin' out this domin' round!")
        responseStrings.push(chosenLine)                            // Sends the random one-liner with who is sitting out
        setTimeout(() => {
            message.channel.send({
                content: responseStrings.join("\n"),
                embeds: [
                    embed
                ],
                files: [{
                    attachment: 'D:\\Users\\Drew\\Desktop\\Bots\\TheBencher\\runtime\\commandsContainer\\commands\\gaybabyjail.png',
                    name: "gaybabyjail.png"
                }]
            })
        }, 500)
    }
}