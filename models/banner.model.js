var mongoose = require('mongoose')
var BannerSchema  = new mongoose.Schema({
	name: {
    type: 'String',
    required: true,
    trim: true
  },
  image : {
    type: 'String',
    required: true,
    trim: true
  },
   deleted_at: {
    type: 'Number',
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
})
var Banner = mongoose.model('Banner', BannerSchema)
module.exports = Banner;
