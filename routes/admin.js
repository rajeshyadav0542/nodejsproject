var express = require('express');
var session = require('express-session');
var auth = require("../middleware/auth");
var bcrypt = require("bcrypt-nodejs");
var db = require("../config/db");
var bodyParser = require('body-parser');
var User = require('../models/user.model');
//var MongoClient = require('mongodb').MongoClient;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {	
  res.render('login', { title: 'Admin Login', authenticated : false });
});

/* login admin page. */
router.get('/login', auth, function(req, res, next) {		 
	if(req.session.username){
		res.render('admin/dashboard/index', { title: 'Dashboard', authenticated : true });
	}else{
		res.redirect('/admin');
	}
});

/* admin Dashboard */
router.post('/dashboard', function(req, res, next){
	db.collection("user").find({ email : req.body.username}).toArray(function(error, result) {
		var user_data = (result && result.length > 0) ? result[0] :{};
		if(result && result.length > 0){
			bcrypt.compare(req.body.password, result[0].password, function(err, match) {
				if(match){
					req.session.username = (user_data && user_data.username) ? user_data.username : ''
					res.render('admin/dashboard/index', { title: 'Dashboard', authenticated : true });
				}else{
					res.redirect('/admin');
				}
			});
		}else{
			res.redirect('/admin');
		}
	});
});

/* logout admin */
router.get('/logout', function(req, res, next){
	req.session.destroy();
	res.redirect('/admin')
});

module.exports = router;
