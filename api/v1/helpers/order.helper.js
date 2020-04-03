let model  = require('../../../models/index.model');
let config = require('../../../config/index');
let mysqldb 	= require('../../../config/mysqldb');
let HttpStatus = require('http-status-codes');
let async = require('async');
let moment = require('moment');
module.exports = {	
	getcartdata : (req, record, cb) => {
		let status = HttpStatus.OK;
		let result = {};
		async.waterfall([
			function(callback){
				let query = "select * from smm_cart where id = "+parseInt(record.cartId)+"";
				mysqldb.query(query, (error, cart_data)=> {
					if(!error && cart_data && cart_data.length > 0){
						callback(null, cart_data);
					}else{
						result.status = HttpStatus.INTERNAL_SERVER_ERROR;
						result.msg = "This product has been deleted";
						cb(result);
					}
				});
			}		
		], function(error, result_data){
			cb(result_data);
		});
	},
	
	get_cart_data : (req, id, statusArr, cb) => {
		let query = "select cart.id, cart.cart_price, cart.shop_id, cart.product_id, cart.quantity, shop.shop_status, product.stock, product.quantity as product_quantity, product.updated_at, product.unit_price, product.created_at, cat_desc.category_name FROM `smm_cart` as cart join `smm_product` as product on cart.product_id = product.id join `smm_shop` as shop on cart.shop_id = shop.id join `smm_category_desc` as cat_desc on cart.cat_id = cat_desc.cat_id  WHERE cart.order_id = "+parseInt(id)+" and cart.user_id ="+parseInt(req.body.user_id)+" and cart.cart_status IN ("+statusArr+") and cat_desc.lang_id = "+parseInt(req.body.lang_id)+"";
		mysqldb.query(query, (error, data) => {
			if(!error && data && data.length >0){
				cb(data);
			}else{
				cb([])
			}
		});
	},
	
	get_shop_product : (req, record, cb) => {
		let result = {};
		let status = HttpStatus.OK;
		let query = "select cart.id, cart.cart_price, cart.shop_id, cart.product_id, cart.quantity, shop.shop_status, product.stock, product.quantity as product_quantity, product.updated_at, product.unit_price, product.created_at, cat_desc.category_name FROM `smm_cart` as cart join `smm_product` as product on cart.product_id = product.id join `smm_shop` as shop on cart.shop_id = shop.id join `smm_category_desc` as cat_desc on cart.cat_id = cat_desc.cat_id  WHERE cart.id = "+parseInt(record.cartId)+" and cart.user_id ="+parseInt(req.body.user_id)+" and cat_desc.lang_id = "+parseInt(req.body.lang_id)+"";
		mysqldb.query(query, (error, data) => {
			if(!error && data && data.length >0){
				let cart_res = data[0];
				req.body.prdavailqty = cart_res.product_quantity;
			    req.body.stock = cart_res.stock;
			    req.body.cartQty = cart_res.quantity;
			    
			   if(cart_res.shop_status == 'close'){
					let errors = "Product "+cart_res.category_name+", this shop is close";
					result.status = HttpStatus.INTERNAL_SERVER_ERROR;
					result.msg = errors;
					cb(result);
				}
				else if(cart_res.quantity == 0){
					let errors = "Product "+cart_res.category_name+", select quantity";
					result.status = HttpStatus.INTERNAL_SERVER_ERROR;
					result.msg = errors;
					cb(result);
				}
				
				else if(cart_res.stock == 0 && cart_res.quantity > cart_res.product_quantity){
					let errors = "Product "+cart_res.category_name+", quantity not available";
					result.status = HttpStatus.INTERNAL_SERVER_ERROR;
					result.msg = errors;
					cb(result);
				}
				else if(cart_res.updated_at > cart_res.created_at){
					if(cart_res.cart_price > cart_res.unit_price){
			    		let errors = "Product "+cart_res.category_name+", quantity not available";
						result.status = HttpStatus.INTERNAL_SERVER_ERROR;
						result.msg = errors;
						cb(result);
			    	}else{
						cb(cart_res)
					}
				}else{
					cb(cart_res)
				}			    
			}else{
				result.status = HttpStatus.INTERNAL_SERVER_ERROR;
				result.msg = "This product has been deleted";
				cb(result);
			}
		});
	},
	
	update_order_status : async (req, record, cb) => {
		if(req.body.type == 'buynow' || req.body.type == 'end_shopping'){
			async.waterfall([
				function(callback){
					let query = "update smm_cart set cart_status = '0' where user_id = "+parseInt(req.body.user_id)+" and cart_status = '1'";
					mysqldb.query(query, (error, update) => {
						callback(null, update);
					});
				},
				function(update, callback){
					let query = "select * from smm_cart where user_id = "+parseInt(req.body.user_id)+" and id = "+parseInt(record.cartId)+"";
					mysqldb.query(query, (error, cart_data) => {
						callback(null, cart_data);
					});
				}
			], function(error, result){
				if(result && result.length > 0){
					let data = result[0];
					let query = "update smm_cart set cart_status = '1' where id = "+parseInt(data.id)+"";
					mysqldb.query(query, (error, update_data) => {
						cb(1);
					});
				}else{
					cb(1);
				}
			});
		}
	},
	
	end_shopping : (req, data, cb) => {
		let temp_formatted_id = data.order_info.formatted_order_id
		async.waterfall([
			function(callback){
				let query = "select * from smm_order where temp_formatted_id = "+temp_formatted_id+"";
				mysqldb.query(query, (error, order_data) => {
					if(!errror && order_data && order_data.length >0){
						callback(null, order_data);
					}else{
						callback(null, []);
					}
				});
			}
		], function(error, result_data){
			cb(result_data)
		});
	},
	
	noend_shopping : (req, data, cb) => {
		let price_update = 'N';
		let status = HttpStatus.OK;
		let result = {};
		let cartInfo = data.cartInfo;
		let msg = '';
		result.status = status;
		result.msg = msg;
		async.forEach(cartInfo, (record, callback) => {
			let prdavailqty = record.product_quantity;
			let stock = record.stock;
			let cartQty = record.quantity;
			console.log(prdavailqty);
			console.log(stock);
			console.log(cartQty);
			if(cartQty == 0){
				msg = "Product "+record.category_name+", quantity not available";
				result.status = HttpStatus.INTERNAL_SERVER_ERROR;
				result.type = "quantity"
				result.msg = msg;
				callback('error', result);
			}
			else if(stock == 0 && cartQty > prdavailqty){
				msg = "Product "+record.category_name+", quantity not available";
				result.status = HttpStatus.INTERNAL_SERVER_ERROR;
				result.type = "quantity";
				result.msg = msg;
				callback('error', result);
			}
			else if(record.cart_price > record.unit_price){
				msg = "Product "+record.category_name+", quantity not available";
				result.status = HttpStatus.INTERNAL_SERVER_ERROR;
				result.type = "price";
				result.msg = msg;
				callback('error', result);
			}else{
				callback();
			}
		}, function(error){
			console.log(error);
			console.log(result);
			cb(result);
		});
	}
}
