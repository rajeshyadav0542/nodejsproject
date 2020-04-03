var mongoose = require('mongoose');
//const parseSchema = require('mongodb-schema');
var CategorySchema =new mongoose.Schema({
	_id : {
		type: Number,
		required: true
	},
	url : {
		type: String,
		required: true
	},	
	parent_id : {
		type: Number,
		default : 0
	},
	img : {
		type: String,
		default : ''
	},
	comment : {
		type: String,
		default : ''
	},	
	category_name : {
		type: String,
		required: true
	},	
	cat_description : {
		type: String,
		default : ''
	},	
	description : {
		type: Object
	},
	meta_title : {
		type: Object
	},
	meta_description : {
		type: Object
	},
	meta_keyword : {
		type: Object
	},
	name : {
		type: Object
	},
	status : {
		type: String,
		required : true,
		default : '1'
	},
	units : {
		type : String,
		default: ''
	},	
	created_at : {
		type: 'Date',
		required: true,
		trim: true
  },
   updated_at : {
		type: 'Date',
		required: true,
		trim: true
  }
}, {collection : 'category'})

var Category = mongoose.model('Category', CategorySchema)
module.exports = Category;
