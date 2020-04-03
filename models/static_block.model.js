var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var Static_blockSchema = new mongoose.Schema({
  name : {
    type : 'String',
    require : true,
    trim : true
  },
  unique_key : {
    type : 'String',
    required : true,
    unique : true,
    trim : true
  },
  short_desc : {
    type : 'String',
    required : true
  },
  long_desc : {
    type : 'String',
    required : true
  },
  deleted_at : {
    type : 'Number',
    required : true,
    trim : true
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
},
{
  versionKey : false
})
var Static_block = mongoose.model('Static_block', Static_blockSchema);
module.exports = Static_block;
