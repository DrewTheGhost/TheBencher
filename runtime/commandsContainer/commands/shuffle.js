module.exports = {
    name: "shuffle",
    aliases: [],
    description: "Shuffles the list of songs.",
    controlled: false,
    async fn(params) {
        let message = params.message,
            db = params.db,
            logger = params.logger,
            valuesArray = [];

        let queue = [],
            values = undefined;

        if(message.member.voice.channelId === null) {
            return message.channel.send("You aren't even in a voice channel to listen to anything, dumbass.")
        }

        db.query("SELECT * FROM queue ORDER BY id;", (err, result) => { 
            if(err) {
                return message.channel.send("Bro.. if you're seeing this error.. things are bad. REALLY bad. It shouldn't even be physically possible to get here. You some kind of fucking magician? Dude. What the fuck. You gotta tell Drew about this shit immediately.")
            }
            if(result.rows.length == 0) {
                return message.channel.send("Nothing in the queue to shuffle, fuckhead!")
            }

            // Need to remove the currently playing song before we send it off to get shuffled. This avoids duplicates since the song is only removed after it *finishes* playing. 
            currentSong = result.rows.shift()
            queue = result.rows
            queue = shuffle(queue, currentSong)
            
            for(let item of queue) {
                item.title = item.title.replace(/[\)]/g, "\]")
                item.title = item.title.replace(/[\(]/g, "\[")
                item.title = item.title.replace(/[\']/g, "")
                valuesArray.push(`('${item.title}', '${item.url}', '${item.requester}', ${item.id}, '${item.track64}', '${item.duration}')`)
            
            }
            values = valuesArray.join(",")
        })

        db.query("DELETE FROM queue;", (err, res) => {
            if(err) {
                return message.channel.send("Fucked up deleting the queue somehow while replacing it. Errmm... Command failed! :)")
            }
        })

        setTimeout(() => {
            db.query(`INSERT INTO queue(title, url, requester, id, track64, duration) VALUES${values} RETURNING *;`, (err, result) => {
                if(err) {
                    logger.error(err)
                    return message.channel.send("Error while inserting shuffled queue into DB.")
                }
                message.channel.send(`Shuffled ${result.rows.length} songs! Enjoy ;)`)
            })
        }, 10)

    }
}

function shuffle(array, currentSong) {
    let currentIndex = array.length, 
        randomIndex

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]]
    }

    // Makes sure the currently playing song is still #1 in the shuffled list. This will ensure it isn't shuffled into the playlist again later, causing a dupe.
    array.unshift(currentSong) 

    for(const item of array) {
        let currentIndex = array.indexOf(item)
        array[currentIndex].id = currentIndex + 1
    }
    
    return array
  }
  