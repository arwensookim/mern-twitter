// module.exports = {
//     mongoURI: "mongodb+srv://admin:BKa7b2ctNqBj3Jl4@cluster0.7fhqr.mongodb.net/mern-twitter?retryWrites=true&w=majority",
//     secretOrKey: "secret"
// }

if (process.env.NODE_ENV === 'production') {
    module.exports = require('./keys_prod');
  } else {
    module.exports = require('./keys_dev');
  }