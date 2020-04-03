'use stric'
let model  = require('../../../../models/index.model');
let config = require('../../../../config/index');
const mysqldb 	= require('../../../../config/mysqldb');
let HttpStatus = require('http-status-codes');
let async = require("async");

module.exports = {
	payProduct : (req, res) => {
		let status = HttpStatus.OK;
		let result = {};
		let data = req.body.data;
		let msg = '';
		async.waterfall([
			function(callback){
				let query = "select * from smm_orders_temp where user_id = "+parseInt(req.body.user_id)+"";
				mysqldb.query(query, (error, temp_data) => {
					if(!error && temp_data && temp_data.length >0 && data.length > 0){
						async.forEach(data, (record, callback) => {
							let jsondata = JSON.parse(record);
							config.helpers.order.getcartdata(req, jsondata, (cart_data) => {								
								if(cart_data.status  && cart_data.status == HttpStatus.INTERNAL_SERVER_ERROR){
									msg = cart_data.msg ? cart_data.msg : '';
									callback('error', cart_data);									
								}else{
									config.helpers.order.get_shop_product(req, jsondata, (shop_product) => {										
										if(shop_product.status  && shop_product.status == HttpStatus.INTERNAL_SERVER_ERROR){
											msg = shop_product.msg ? shop_product.msg : '';
											callback('error', shop_product);									
										}else{
											config.helpers.order.update_order_status(req, jsondata, (update) => {
												callback();
											});
										}
									});									
								}
							});
						}, function(error){
							console.log(error);							
							if(error){
								result.status = HttpStatus.INTERNAL_SERVER_ERROR;
								result.msg = msg;
								res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(result);
							}else{
								callback(null, result);
							}
						});
					}else{
						result.status = HttpStatus.INTERNAL_SERVER_ERROR;
						result.msg = "No order available";
						res.status(status).send(result);
					}
				});
			}
		], function(error, result_data){
			result.status = status;
			result.msg = 'Product pay successfully';
			res.status(status).send(result)
		});
	},
	
	checkout : (req, res) => {
		let status = HttpStatus.OK;
		let result = {};
		let data = {};
		async.waterfall([
			function(callback){
				let query = "select * from smm_orders_temp where formatted_order_id = "+req.body.order_id+" and user_id = "+parseInt(req.body.user_id)+" and order_status = '0'";
				mysqldb.query(query, (error, order_info) => {
					if(!error && order_info && order_info.length > 0){
						let id = order_info[0].id;
						data.order_info = order_info[0];
						let statusArr = [1];
						config.helpers.order.get_cart_data(req, id, statusArr, (cart_data)=> {
							data.cartInfo = cart_data;
							callback(null, data);
						});
					}else{
						result.status = HttpStatus.INTERNAL_SERVER_ERROR;
						result.msg = 'Invalid order';
						res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(result);
					}
				});				
			},
			function(data, callback){
				if(req.body.payment_method){
					config.helpers.common.check_payment_mathod(req, (pay_data) => {
						if(pay_data.length == 0){
							result.status = HttpStatus.INTERNAL_SERVER_ERROR;
							result.msg = 'Invalid payment method';
							res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(result);
						}else{
							callback(null, data);
						}
					});
				}else{
					callback(null, data);
				}
			},
			function(data, callback){
				if(req.body.checkout_type == 'end-shopping'){
					config.helpers.order.end_shopping(req, data, (end_data) => {
						if(end_data && end_data.length > 0){
							result.status = HttpStatus.INTERNAL_SERVER_ERROR;
							result.msg = 'Invalid order';
							res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(result);
						}else{
							config.helpers.order.noend_shopping(req, data, (noend_data) => {
								if(noend_data.status == HttpStatus.INTERNAL_SERVER_ERROR){
									res.status(noend_data.status).send(noend_data);
								}else{
									callback(null, data);
								}
							});							
						}
					});
				}else{
					config.helpers.order.noend_shopping(req, data, (noend_data) => {
						if(noend_data.status == HttpStatus.INTERNAL_SERVER_ERROR){
							res.status(noend_data.status).send(noend_data);
						}else{
							callback(null, data);
						}
					});
				}
			}
		], function(error, result_data){
			result.status = status;
			result.data = result_data;
			res.status(status).send(result);
		});
	},
	
	paymentmethod : (req, res) => {
		let status = HttpStatus.OK;
		let result = {};
		let query = "SELECT payment.id, payment.slug, payment.currency_id, payment.image_name, paymentdesc.payment_option_name FROM `smm_payment_option` as payment join `smm_payment_option_desc` as paymentdesc on payment.id = paymentdesc.payment_option_id WHERE paymentdesc.lang_id = "+parseInt(req.body.lang_id)+" and payment.status = '1' and payment.payment_type = '1' and payment.slug != 'credit'";
		mysqldb.query(query, (error, payment_method) => {
			if(!error && payment_method && payment_method.length > 0){
				result.status = status;
				result.data = payment_method;
				res.status(status).send(result);
			}else{
				result.status = HttpStatus.INTERNAL_SERVER_ERROR;
				result.data = [];
				res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(result);
			}
		});
	}
	
	
}
