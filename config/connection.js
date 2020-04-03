var mongoose = require('mongoose');
var mongoDB = 'mongodb://127.0.0.1/smm_market_mongo_test';
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
module.exports =  db;
