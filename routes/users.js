var express = require('express');
var router = express.Router();
var User = require('../models/user.model');
var mongoose = require('mongoose');
var mongoDB = 'mongodb://127.0.0.1/test_db';
var validateToken = require('../utils').validateToken;
var bcrypt = require("bcrypt-nodejs");
var request = require('request');
var rp = require('request-promise');
const jwt = require('jsonwebtoken');
var ObjectId = require('mongodb').ObjectID
mongoose.connect(mongoDB, { useNewUrlParser: true })
var db = mongoose.connection;
router.get('/all', validateToken, function(req, res){
	//mongoose.connect(mongoDB, { useNewUrlParser: true }, (err) => {
      let result = {};
      let status = 200;
      var err = '';
        const payload = req.decoded;
       // if (payload && payload.user === 'admin') {
        if (payload) {
          User.find({}, (err, users) => {
            if (!err) {
              result.status = status;
              result.error = err;
              result.result = users;
            } else {
              status = 500;
              result.status = status;
              result.error = err;
            }
            res.status(status).send(result);
          });
        } else {
          status = 401;
          result.status = status;
          result.error = `Authentication error`;
          res.status(status).send(result);
        }
   // });
});

router.post('/login', function(req, res){	
	const { name, password } = req.body;
    mongoose.connect(mongoDB, { useNewUrlParser: true }, (err) => {
      let result = {};
      let status = 200;
      if(!err) {
        User.findOne({name}, (err, user) => {
			 console.log(user)
          if (!err && user) {			 
            // We could compare passwords in our model instead of below as well
            bcrypt.compare(password, user.password, function(err, match) {
              if (match) {
                status = 200;
                // Create a token
                const payload = { user: user.name };
                const options = { expiresIn: '2d', issuer: 'https://scotch.io' };
                const secret = 'addjsonwebtokensecretherelikeQuiscustodietipsoscustodes';//process.env.JWT_SECRET;
                const token = jwt.sign(payload, secret, options);

                result.token = token;
                result.status = status;
                result.result = user;
              } else {
                status = 401;
                result.status = status;
                result.error = `Authentication error`;
              }
              res.status(status).send(result);
		  });
          } else {
            status = 404;
            result.status = status;
            result.error = err;
            res.status(status).send(result);
          }
        });
      } else {
        status = 500;
        result.status = status;
        result.error = err;
        res.status(status).send(result);
      }
    });
});

router.post('/add', function(req, res){
	 let result = {};
      let status = 201;
      mongoose.connect(mongoDB, { useNewUrlParser: true }, (err) => {
      if (!err) {
        const { name, password } = req.body;
        const user = new User({ name, password }); // document = instance of a model
        // TODO: We can hash the password here as well before we insert
       user.save((err, user) => {
			console.log(err);
			console.log(user);
          if (!err) {
            result.status = status;
            result.result = user;
          } else {
            status = 500;
            result.status = status;
            result.error = err;
          }
          res.status(status).send(result);
        });
      } else {
        status = 500;
        result.status = status;
        result.error = err;
        res.status(status).send(result);
      }
  });
});

module.exports = router;
