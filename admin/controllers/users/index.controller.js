var model  = require('../../../models/index.model');
var config = require('../../../config/index');
const jwt = require('jsonwebtoken');
var bcrypt = require("bcrypt-nodejs");
var async = require("async");

module.exports = {
	index : async (req,res)=> {
		console.log(model);
		var record = await model.user.find({ status : '1' });	
		console.log(record);
		res.render('admin/user/view',{ title: 'Users', authenticated : true, records : [] } );
	},
	
	add : (req, res) => {		
		res.render('admin/user/add', { title : "User Add", authenticated : true });
	},
	
	add_user : (req, res) => {			
		var hash = bcrypt.hashSync(req.body.password);
		 var admin_data = {
			name : req.body.name,
			lastname : req.body.fname,
			email : req.body.email,
			dob : new Date(req.body.dob),
			phone : parseInt(req.body.phonenumber),
			password : hash,
			deletedAt : 0,
			createdAt : new  Date(),
			updatedAt : new  Date()
		}
		//res.send(admin_data);
		model.user.create(admin_data, (err, user_data) => {
			console.log(err);
			console.log(user_data);
			res.redirect('/admin/users');
	   });
	}
}
