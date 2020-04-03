var mongoose = require('mongoose');
//const parseSchema = require('mongodb-schema');
var WishlistSchema = new mongoose.Schema({
	user_id : {
		type : Number,
		required : true
	},
	product_id : {
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
}, {collection : 'wishlist'})

var Wishlist = mongoose.model('Wishlist', WishlistSchema)
module.exports = Wishlist;
