var mongoose = require('mongoose');
//const parseSchema = require('mongodb-schema');
var Smm_shipping_addressSchema = new mongoose.Schema({
	 _id : {
		type: Number,
		required: true
	},
	user_id : {
		type : Number,
		required : true
	},
	title : {
		type: String,
		default : ''
	},
	salutation : {
		type : String,
		default : ''
	},	
	first_name : {
		type: String,
		required : true
	},	
	last_name : {
		type: String,
		required : true
	},
	email : {
		type: String,
		default : ''
	},	
	address : {
		type: String,
		default : ''
	},
	road : {
		type: String,
		default : ''
	},
	isd_code : {
		type: Number,
		required : true
	},	
	country_id : {
		type: Number,
		required : true
	},	
	province_state_id : {
		type: Number,
		required : true
	},
	city_district_id : {
		type: Number,
		required : true
	},
	sub_district_id : {
		type: Number,
		required : true
	},
	sub_district : {
		type: String,
		required : true
	},	
	province_state : {
		type: String,
		required : true
	},	
	province_state : {
		type: String,
		required : true
	},	
	country : {
		type: String,
		default : 'NULL'
	},
	zip_code : {
		type: Number,
		required : true
	},	
	ph_number : {
		type: String,
		required : true
	},	
	is_company_add : {
		type: Boolean,
		default : '0'
	},
	company_name : {
		type: String,
		default : ''
	},
	branch : {
		type: String,
		default : ''
	},	
	tax_id : {
		type: String,
		default : ''
	},	
	company_address : {
		type: String,
		default : ''
	},	
	status : {
		type: Boolean,
		default : '1'
	},
	is_default : {
		type: Boolean,
		default : '0'
	},
	address_type : {
		type: Boolean,
		default : '0'
	},
	sequence : {
		type: Number,
		default : 0
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
}, {collection : 'smm_shipping_address'})

var Smm_shipping_address = mongoose.model('Smm_shipping_address', Smm_shipping_addressSchema)
module.exports = Smm_shipping_addressSchema;
