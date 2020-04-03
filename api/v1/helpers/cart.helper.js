let model  = require('../../../models/index.model');
let config = require('../../../config/index');
let mysqldb 	= require('../../../config/mysqldb');
let async = require('async');
let moment = require('moment');
module.exports = {	
	check_product : (req, cb) => {
		let result = {};
		if(req.body.action && req.body.action == 'addtocartfrombargin' || req.body.action == 'buynowfrombargin'){
			if(req.body.bar_id){
				let query = "select * from smm_product_bargains where user_id = "+parseInt(req.body.user_id)+" and id = "+parseInt(req.body.bar_id)+"";
				mysqldb.query(query, (err, bargain_data) =>{
					if(!err && bargain_data && bargain_data.length>0){
						let query = "select * from smm_product where id = "+parseInt(bargain_data[0].product_id)+" and status = '1'";
						mysqldb.query(query, (error, productdata) =>{
							if(!error && productdata && productdata.length > 0){
								req.body.product_from = 'bargain';
								result.status = 200;
								result.msg = '';
								result.product = productdata;
								result.bar_data = bargain_data;
								cb(result);
								//callback(null, productdata);
							}else{
								result.status = 500;
								result.msg = "Invalid product";
								cb(result)
								//res.status(status).send(result);
							}
						});
					}else{
						result.status = 500;
						result.msg = "Invalid product";
						cb(result);
						//res.status(status).send(result);
					}
				});
			}else{
				result.status = 500;
				result.msg = "Invalid product";
				cb(result);
				//res.status(status).send(result);
			}
		}else{
			let query = "select * from smm_product where id = "+parseInt(req.body.product_id)+" and status = '1'";
			mysqldb.query(query, (error, productdata) =>{
				if(!error && productdata && productdata.length > 0){
					result.status = 200;
					result.msg = '';
					result.product = productdata;
					result.bar_data = [];
					cb(result);
				}else{
					result.status = 500;
					result.msg = "Invalid product";
					cb(result);
					//res.status(status).send(result);
				}
			});
		}
	},	
		
	check_shop_status : (productdata, cb) => {
		let shop_id = productdata.product[0].shop_id;
		let status = 200;
		let result = {};
		let query = "select * from smm_shop where id = "+shop_id+"";
		mysqldb.query(query, (error, shop_data) => {
			if(!error && shop_data && shop_data.length > 0){
				if(shop_data[0].shop_status == 'close'){
					result.status = 500;
					result.msg = 'This shop is close';
					cb(result);
				}else{
					result.status = status;
					result.msg = '';
					result.shop_data = shop_data;
					cb(result);
				}
			}else{
				result.status = 500;
				result.msg = 'Invalid shop';
				cb(result);
			}
		});
	},
	
	check_product_shop : (req, data, cb) => {
		let shop_id = (data.shop_data && (data.shop_data).length > 0) ? data.shop_data[0].id : 0;
		let result = {};
		let status = 200;
		async.waterfall([
			function(callback){
				let query = "select * from smm_shop where user_id = "+parseInt(req.body.user_id)+"";
				mysqldb.query(query, (error, shop) => {					
					if(shop && shop.length > 0){
						if(shop_id == shop[0].id){
							result.status = 500;
							result.msg = 'You can not add your own product';
							cb(result);
						}else{
							callback(null, shop);
						}
					}else{
						callback(null, shop)
					}
				});
			}
		], function(error, resultdata){
			result.status = status;
			result.msg = '';
			cb(result)
		});
	},
	
	check_product_quantity : (req, data, cb) => {
		let result = {};
		let status = 200;
		let productInfo = data.product[0];
		let bardata = (data.bar_data.length > 0) ? data.bar_data[0] : data.bar_data;
		
		let quantityresultdata = {};
		quantityresultdata.quantity = 0;
		quantityresultdata.product_price = 0;
		quantityresultdata.prdQuantity = 0;
		quantityresultdata.qty = 0;
		async.waterfall([
			function(callback){
				let query = "select * from smm_orders_temp where user_id = "+parseInt(req.body.user_id)+" and order_status = '0'";
				mysqldb.query(query, (error, order_temp) => {
					console.log(order_temp);
					if(order_temp && order_temp.length < 1){
						config.helpers.cart.save_data_order(req, (orderdata) => {
							quantityresultdata.order_temp = order_temp;
							quantityresultdata.order_id = orderdata;
							callback(null, quantityresultdata);
						});
					}else{
						quantityresultdata.order_temp = order_temp;
						quantityresultdata.order_id = order_temp[0].id;
						callback(null, quantityresultdata);
					}
				});
			},
			function(order_temp, callback){
				 if(req.body.product_from == 'bargain'){
					quantityresultdata.quantity = bardata.qty;
					quantityresultdata.product_price = bardata.curr_unit_price;
					quantityresultdata.prdQuantity = productInfo.quantity;
					quantityresultdata.qty = 0;
					callback(null, quantityresultdata);
				}else{
					quantityresultdata.quantity = parseInt(req.body.quantity);
					quantityresultdata.product_price = productInfo.unit_price;
					quantityresultdata.prdQuantity = productInfo.quantity;
					quantityresultdata.qty = 0;
					let query = "select quantity from smm_cart where user_id = "+parseInt(req.body.user_id)+" and product_id = "+parseInt(req.body.product_id)+"";
					mysqldb.query(query, (error, cartdata) => {
						if(!error){
							quantityresultdata.qty = (cartdata.length > 0) ? cartdata[0].quantity : 0;
						}
						callback(null, quantityresultdata);
					});
				}
			},
			function(quantityresultdata, callback){
				let chkquantity = quantityresultdata.quantity;				
				if(quantityresultdata.qty > 0){
				  chkquantity = chkquantity + quantityresultdata.qty;
				}
				let order_temp = quantityresultdata.order_temp;
				// calculate maximum order amount
				let totprdprice = quantityresultdata.product_price * chkquantity;        
				let prev_price =(order_temp.length > 0)?order_temp[0].total_final_price:0;
				let total_price = totprdprice + prev_price;
				
				if(chkquantity > quantityresultdata.prdQuantity){
					result.status = 500;
					result.msg = "Quantity not available";
					cb(result);
				}
				else if(productInfo.order_qty_limit == '0' && productInfo.min_order_qty > 0 && chkquantity < productInfo.min_order_qty){
					result.status = 500;
					result.msg = "Product minimum quantity should be "+parseInt(productInfo.min_order_qty)+"";
					cb(result);
				}
				else if(parseInt(total_price) > config.constant.ORDER_VALID_PRICE){
					result.status = 500;
					result.msg = "Order amount exceeded";
					cb(result);
				}
				else{
					callback(null, quantityresultdata);
				}
			},
			// function for check order exit or generate new order id
			//~ function(quantityresultdata, callback){
				//~ let tempdata = quantityresultdata.order_temp;
				//~ if(tempdata){
					//~ quantityresultdata.order_id = tempdata.formatted_order_id;
					//~ callback(null, quantityresultdata);
				//~ }else{					
					//~ config.helpers.common.generate_orderid(req, (orderid) => {
						//~ quantityresultdata.order_id = orderid;
						//~ callback(null, quantityresultdata);
					//~ });
				//~ }
			//~ }
		], function(error, result_data){
			quantityresultdata.original_price = productInfo.unit_price;
			let cart_status = (( req.body.action && req.body.action == 'buynow') || (req.body.action && req.body.action == 'buynowfrombargin'))?1:0;
			quantityresultdata.cart_status = cart_status;
			if(req.body.product_from == 'normal'){
				// get product tiers price
				config.helpers.cart.getProductPriceById(productInfo.id, quantityresultdata.quantity, productInfo, (productPrice) =>{
					quantityresultdata.original_price = productPrice;
					cb(quantityresultdata);
				});
			}else{
				cb(quantityresultdata);
			}
		});
	},
	
	// get price from tears price
	getProductPriceById : (product_id, quantity, productInfo, cb) => {
		cb(productInfo.unit_price);
	},
	
	addProductInShoppingList : (productInfo, cb) => {
		cb(1);
	},
	
	save_data_order : (req, cb) => {
		let order = {};
		order.user_id = parseInt(req.body.user_id);
		order.session_id = req.body.device_id ? req.body.device_id : "";
		order.payment_type = '';
		order.payment_slug = '';
		order.shipping_address_id = 0;
		order.billing_address_id = 0;
		order.shipping_method = 0;
		order.total_core_cost = 0;
		order.total_discount = 0;
		order.vat = 0;
		order.vat_amount = 0;
		order.total_shipping_cost = 0;
		order.total_final_price = 0;
		order.order_status = '0';
		order.checkout_type = '';
		order.kbank_qrcode_id = '';
		order.order_json = '';
		order.created_at = new Date();
		order.updated_at = new Date();
		
		async.waterfall([
			function(callback){
				config.helpers.common.generate_orderid(req, (orderid) => {
					order.formatted_order_id = orderid;
					callback(null, order);
				});
			}
		], function(error, result){
			mysqldb.query("INSERT INTO smm_orders_temp SET ?", result, function(err, orderdata, fields) {
				let id = orderdata ? orderdata.insertId : null;
				cb(id);
			});
		});
	},
	
	updateOrderPrice : (orderid, cb) => {		
		async.waterfall([
			function(callback){
				let query = "select sum(total_price) AS cartPrice from smm_cart where order_id = "+parseInt(orderid)+"";
				mysqldb.query(query, (error, orderprice) => {
					callback(null, orderprice);
				});
			},
			function(orderprice, callback){
				let price = orderprice[0].cartPrice;
				let query = "update smm_orders_temp SET total_core_cost = "+parseFloat(price)+", total_final_price = "+parseInt(price)+" where id="+parseInt(orderid)+"";
				mysqldb.query(query, (error, update) => {
					callback(null, price);
				});
			}
		], function(error, result){
			cb(result);
		});
	},
	
	getCartprice : (req, cb) => {
		let cartprice = 0;
		let query = "select sum(total_price) as total_price from smm_cart where user_id = "+parseInt(req.body.user_id)+" and cart_status = '0'";
		mysqldb.query(query, (error, cartdata) => {
			if(!error && cartdata){
				cartprice = cartdata[0].total_price;
				cb(cartprice);
			}else{
				cb(cartprice);
			}
		});
	},
	
	getCartProduct : (req, cb) => {
		let result_data = {};
		result_data.totPaidPrd = 0;
		result_data.totCartPrd = 0;
		result_data.totBargainPrd = 0;
		
		async.waterfall([
			function(callback){
				config.helpers.query.cart_product(req, (count) => {
					result_data.totCartPrd = count;
					callback(null, result_data);
				});
			},
			function(result_data, callback){
				let query = 'select id from smm_order where user_id = '+parseInt(req.body.user_id)+' and end_shopping_date IS NULL';
				console.log(query);
				mysqldb.query(query, (error, order_data) => {
					if(!error && order_data && order_data.length > 0){
						let order_id = order_data[0].id;
						let query = "select count(*) as  total from smm_order where user_id = "+parseInt(req.body.user_id)+" and payment_status = '1' and order_id = "+parseInt(order_id)+"";
						mysqldb.query(query, (error, order) => {
							result_data.totPaidPrd = order[0].total;
						});
					}else{
						callback(null, result_data);
					}
				});
			},
			function(result_data, callback){
				let query = "select count(*) as aggregate from `smm_product_bargains` as `smm_pb` inner join `smm_product` as `smm_p` on `smm_p`.`id` = `smm_pb`.`product_id` where (`smm_p`.`status` = '1' and `smm_pb`.`user_id` = "+parseInt(req.body.user_id)+")";
				mysqldb.query(query, (error, productcount) => {
					if(!error){
						result_data.totBargainPrd = productcount[0].aggregate;
						callback(null, result_data);
					}else{
						callback(null, result_data);
					}
				});
			}
		], function(error, result){
			 let tot = result.totCartPrd + result.totPaidPrd + result.totBargainPrd;
			 let final = {'tot' : tot, 'cart_prd' : result.totCartPrd, 'paid_prd' : result.totPaidPrd, 'bargain_prd' : result.totBargainPrd }
			 cb(final);
		});
	},
	
	getquantity : (req, order_id, cb) => {
		async.waterfall([
			function(callback){
				let query = "delete from smm_cart where id = "+parseInt(req.body.cartId)+"";
				console.log(query);
				mysqldb.query(query, (error, deldata) => {
					callback(null, order_id);
				});
			},
			function(data, callback){
				config.helpers.cart.get_product_unit_quantity(order_id, (total_quantity) => {
					callback(null, total_quantity);
				});
			}
		], function(error, result){
			if(result > 0){
				config.helpers.cart.updateOrderPrice(order_id, (update) => {
					cb(update);
				});
			}else{
				cb(result);
			}		
		});
	},
	
	get_product_unit_quantity : (order_id, cb) => {
		let query = "select sum(quantity) as total_quantity from smm_cart where order_id = "+parseInt(order_id)+"";
		mysqldb.query(query, (error, cartdata) => {
			if(!error && cartdata){
				cb(cartdata[0].total_quantity);
			}else{
				cb(0)
			}
		});
	},
	
	get_cart_data : (req, cb) => {
		let query = "SELECT cart.id,cart.quantity, cart.product_from, cart.shop_id, cart.product_id, cart.original_price, cart.cart_price, cart.total_price, cart.product_from, shop.shop_url, shop_desc.shop_name, shop_desc.description, product.sku, product.thumbnail_image, cat_desc.category_name FROM `smm_cart` as cart join `smm_shop` as shop on cart.shop_id = shop.id join `smm_shop_desc` as shop_desc on shop.id = shop_desc.shop_id join `smm_product` as product on cart.product_id = product.id join `smm_category_desc` cat_desc on product.cat_id = cat_desc.cat_id where cart.user_id = "+parseInt(req.query.user_id)+" and shop_desc.lang_id = "+parseInt(req.query.lang_id)+" and cat_desc.lang_id = "+parseInt(req.query.lang_id)+" ORDER BY cart.`id` ASC";
		mysqldb.query(query, (error, data) => {
			cb(data);
		});
	}
}
