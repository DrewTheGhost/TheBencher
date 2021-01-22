const directory = require('require-directory')
// This creates a hashmap of every directory for me so I can easily access multi-file things
module.exports = directory(module)