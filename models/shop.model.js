var mongoose = require('mongoose');
//const parseSchema = require('mongodb-schema');
var ShopSchema = new mongoose.Schema({
	 _id : {
		type: Number,
		required: true
	},
	user_id : {
		type : Number,
		required : true
	},
	shop_url : {
		type: String,
		required: true
	},	
	ph_number : {
		type: String,
		default : ''
	},
	panel_no : {
		type: String,
		required: true
	},
	description : {
		type: Object,
		default : ''
	},	
	shop_name : {
		type: String,
		required: true
	},	
	citizen_id : {
		type: String,
		required: true
	},	
	market : {
		type: String
	},
	logo : {
		type: String,
		default : ''
	},
	banner : {
		type: String,
		default : ''
	},
	status : {
		type: String,
		required : true,
		default : '1'
	},
	shop_status : {
		type : String,
		required : true,
		default: 'open'
	},	
	bargaining : {
		type : String,
		default: 'yes'
	},	
	register_from : {
		type : String,
		required : true,
		default: 'mobile'
	},	
	product_pickup_time : {
		type : Number,
		required : true,
		default: 0
	},	
	center_pickup_time : {
		type : Number,
		required : true,
		default: 0
	},	
	open_time : {
		type : String,
		default: ''
	},
	close_time : {
		type : String,
		default: ''
	},
	map_image : {
		type : Array,
		default: []
	},
	shop_image : {
		type : Array,
		default: []
	},
	shop_category : {
		type : Array,
		default: []
	},
	translate_data : {
		type : Array,
		default: []
	},
	avg_rating : {
		type : Number,
		default: 0
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
  },
}, {collection : 'shop'})

var Shop = mongoose.model('Shop', ShopSchema)
module.exports = Shop;
