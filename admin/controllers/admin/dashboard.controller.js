var {user}  = require('../../../models/index.model');
var config = require('../../../config/index');
const jwt = require('jsonwebtoken');
var bcrypt = require("bcrypt-nodejs");

module.exports = {
	index : (req,res) => {		
		res.render('login', { title: 'Admin Login', authenticated : false });
	}
}
