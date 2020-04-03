var mongoose = require('mongoose')
var OtpSchema  = new mongoose.Schema({
  otp : {
    type : 'Number',
    required : true,
    trim : true
  },
  phone : {
    type : 'Number',
    required : true,
    trim : true,
    unique : true
  },
   status : {
    type : 'Number',
    required : true,
    trim : true
  },
  createdAt : {
    type : 'Date',
    required : true,
    trim : true
  },
   updatedAt : {
    type : 'Date',
    required : true,
    trim : true
  }
},{
    versionKey: false
})
var Otp = mongoose.model('Otp', OtpSchema)
module.exports = Otp;
