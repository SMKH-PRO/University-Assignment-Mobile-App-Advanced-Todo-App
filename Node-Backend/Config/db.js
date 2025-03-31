var mongoose = require("mongoose");

const mongoUri = process.env.MONGODB_URI;

console.log(mongoUri, 'mongoUri')
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = mongoose;
