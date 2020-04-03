var mongoose = require('mongoose')
var AdminSchema  = new mongoose.Schema({
	name: {
    type: 'String',
    required: true,
    trim: true
  },
  username : {
    type: 'String',
    required: true,
    trim: true,
    unique: true
  },
  status : {
    type: 'Boolean',
    required: true,
    trim: true
  },
  email: {
    type: 'String',
    required: true,
    trim: true,
    unique: true
  },
   deleted_at: {
    type: 'Number',
    required: true,
    trim: true
  },
   password: {
    type: 'String',
    required: true,
    trim: true
  },
  createdAt: {
    type: 'Date',
    required: true,
    trim: true
  },
   updatedAt: {
    type: 'Date',
    required: true,
    trim: true
  }
},{
    versionKey: false
},{collection : 'admin'})
var Admin = mongoose.model('Admin', AdminSchema)
module.exports = Admin;
