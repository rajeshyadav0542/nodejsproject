var express = require('express');
var app = express();

var userRoutes = require('./api/user.routes');

var router = express.Router();
console.log(router);
app.use('',router);
userRoutes(app);

