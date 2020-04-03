var mongoose = require('mongoose');
//const parseSchema = require('mongodb-schema');
var Favourite_shopSchema = new mongoose.Schema({
	user_id : {
		type : Number,
		required : true
	},
	shop_id : {
		type: Number,
		required: true
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
}, {collection : 'favourite_shop'})

var Favourite_shop = mongoose.model('Favourite_shop', Favourite_shopSchema)
module.exports = Favourite_shop;
