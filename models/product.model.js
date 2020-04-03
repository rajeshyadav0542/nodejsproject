//var mongoose = require('mongoose');
//const parseSchema = require('mongodb-schema');
//var ProductSchema =new mongoose.Schema({}, {collection : 'product'})
/*var ProductSchema  = new mongoose.Schema({
	name: {
    type: 'String',
    required: true,
    trim: true
  },
  quantity: {
    type: 'Number',
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
})*/
//var Product = mongoose.model('Product', ProductSchema)
//module.exports = Product;


var mongoose = require('mongoose');
//const parseSchema = require('mongodb-schema');
var ProductSchema = new mongoose.Schema({
	 _id : {
		type: Number,
		required: true
	},
	shop_id : {
		type : Number,
		required : true
	},
	url : {
		type: String,
		default : ''
	},
	sku : {
		type : String,
		required : true
	},	
	avg_rating : {
		type: Number,
		default : 0
	},
	cat_id : {
		type: Number,
		required: true
	},
	badge_id : {
		type: Number,
		required: true
	},	
	show_price : {
		type: String,
		default: '0'
	},	
	unit_price : {
		type: Number,
		default : 0
	},
	stock : {
		type: String,
		default : '0'
	},
	quantity : {
		type: Number,
		default : 0
	},
	order_qty_limit : {
		type : String,
		default : '0'
	},
	min_order_qty : {
		type : String,
		default : '0'
	},
	thumbnail_image : {
		type : String,
		default : ''
	},
	is_tier_price : {
		type : String,
		default : '0'
	},
	package_id : {
		type : Number,
		required : true
	},
	base_unit_id : {
		type : String,
		default : '0'
	},
	weight_per_unit : {
		type : String,
		default : '0'
	},
	status : {
		type: String,
		required : true,
		default : '1'
	},
	
	register_from : {
		type : String,
		required : true,
		default: 'mobile'
	},	
	created_by : {
		type : Number,
		required : true
	},	
	updated_by : {
		type : Number,
		required : true
	},	
	created_from : {
		type : String,
		default: 'seller'
	},
	updated_from : {
		type : String,
		default: 'seller'
	},
	description : {
		type : Object,
		default: ''
	},
	image : {
		type : Array,
		default: []
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
}, {collection : 'product'})

var Product = mongoose.model('Product', ProductSchema)
module.exports = Product;
