var mongoose = require('mongoose');
var bcrypt = require("bcrypt-nodejs");
const jwt = require('jsonwebtoken');
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;
var UserSchema  = new mongoose.Schema({
  name: {
    type: 'String',
    required: true,
    trim: true
  },
  lastname: {
    type: 'String',
    required: true,
    trim: true
  },
  email: {
    type: 'String',
    trim: true
  },
  dob: {
    type: 'Date',
    required: true,
    trim: true
  },
  phone: {
    type: 'Number',
    trim: true
  },
  password: {
    type: 'String',
    required: true,
    trim: true
  },
   updatedAt : {
    type: 'Date',
    required: true,
    trim: true
  },
   createdAt : {
    type: 'Date',
    required: true,
    trim: true
  },
   deletedAt : {
    type: 'Number',
    required: true,
    trim: true
  },
},{
    versionKey: false
})


// encrypt password before save
UserSchema.pre('save', function(next) {	
  const user = this;
  if(!user.isModified || !user.isNew) {
    next();
  } else {
	  bcrypt.genSalt(10, function (err, salt) {
		bcrypt.hash(user.password, salt, null, function(err, hash) {
		  if (err) {
			console.log('Error hashing password for user', user.name);
			next(err);
		  } else {
			user.password = hash;
			next();
		  }
		});
	});
  }
});
UserSchema.plugin(uniqueValidator)
var User = mongoose.model('User', UserSchema)
module.exports = User;
