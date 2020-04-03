var model  = require('../../../../models/index.model');
var config = require('../../../../config/index');
const mysqldb 	= require('../../../../config/mysqldb');
var async = require("async");

module.exports = {
	cart_product : (req,res) => {
		let result = {};
		let status = 200;
		var err = '';
		var skip = req.body.skip ? parseInt(req.body.skip) : 0;
		var limit = req.body.limit ? parseInt(req.body.limit) : 10;
		var search = { status : "1" }; 
		if(req.body.cat_id != 0){
			search.cat_id = parseInt(req.body.cat_id);
		}
		if(req.body.shop_id != 0){
			search.shop_id = parseInt(req.body.shop_id);
		}
		console.log(search);  
		async.parallel({
		  count : function(callback) {
			   model.product.countDocuments(search).exec(function(err,data_count){
				   
				  callback(null,data_count)
				})
			},
			data : function(callback) {
			  model.product.aggregate([
				  { $match : search },
				  { $sort : { created_at : -1 }},
				  { $skip :skip },
				  { $limit : limit },
				  {
					  $lookup : 
					  {
						from : "shop",
						localField : "shop_id",
						foreignField : "_id",
						as : "shop_data"
					  }
				  },
				  {
					$lookup : 
					{
						from : "category",
						localField : "cat_id",
						foreignField : '_id',
						as : "cat_data"
					}
				  },
				  {
						$lookup : 
						{
							from : 'standard_badge',
							localField : 'badge_id',
							foreignField : '_id',
							as : 'badge'
						}
				  }
				]).exec(function(err,data){
				  if(err){console.log(err)}
				callback(null,data)
			  });
			}
		},function(err,result_data){
		  //res.json(result);
		   if (!err) {
			  result.status = status;
			  result.error = err;
			  result.result = result_data;
			} else {
			  status = 500;
			  result.status = status;
			  result.error = err;
			}
			res.status(status).send(result);
		})   
	},
	
	add_to_cart : (req,res) => {
		console.log(req.body);
		let result = {};
		let status = 200;
		req.body.product_from = 'normal';
		async.waterfall([
			function(callback){
				config.helpers.cart.check_product(req, (product) => {
					if(product.msg){
						res.status(product.status).send(product);
					}else{
						callback(null, product);
					}
				});				
			},
			function(product_data, callback){
				if(req.body.product_from == 'normal'){
					let record = product_data.product[0];
					let query = "select * from smm_product_bargains where user_id = "+parseInt(req.body.user_id)+" and product_id = "+parseInt(record.id)+"";
					mysqldb.query(query, (err, bargain_data) =>{
						if(!err && bargain_data && bargain_data.length >0){
							status = 500;
							result.status = status;
							result.msg = "This product already added in bargain";
							res.status(status).send(result);
						}else{
							callback(null, product_data);
						}
					});
				}else{
					callback(null, product_data);
				}
			},
			function(product_data, callback){
				config.helpers.cart.check_shop_status(product_data, (shop_record) =>{
					if(shop_record.msg){
						status = 500;
						res.status(status).send(shop_record);
					}else{
						product_data.shop_data = shop_record.shop_data;
						callback(null, product_data);
					}
				});	
			},
			function(product_data, callback){
				config.helpers.cart.check_product_shop(req, product_data, (productshop) => {
					if(productshop.status == 200){
						callback(null, product_data);
					}else{
						status = 500;
						res.status(status).send(productshop);
					}
				});
			},
			function(product_data, callback){
				config.helpers.cart.check_product_quantity(req, product_data, (product_quantity) => {
					if(product_quantity.status){
						res.status(product_quantity.status).send(product_quantity);
					}else{
						product_data.product_quantity_data = product_quantity;
						callback(null, product_data);
					}
				});
			},
			function(product_data, callback){
				let productid = product_data.product;
				let query = "select * from smm_cart where user_id ="+parseInt(req.body.user_id)+" and product_id = "+parseInt(productid)+"";
				mysqldb.query(query, (error, oldcard_data) => {
					if(!error && oldcard_data && oldcard_data.length > 0){
						let cartId = oldcard_data[0].id;
						let newQuantity = parseInt(oldcart_data[0].quantity) + parseInt(product_data.product_quantity_data.quantity);
						let newProductPrice = parseFloat(product_data.product_quantity_data.product_price);
						let totalPrice = newProductPrice * newQuantity;						
						let query = "update smm_cart SET quantity = "+parseInt(newQuantity)+", original_price = "+parseFloat(newProductPrice)+", cart_price = "+parseFloat(newProductPrice)+", total_price = "+parseFloat(totalPrice)+", cart_status = "+parseInt(product_data.product_quantity_data.cart_status)+" where id = "+parseInt(cartId)+"";
						mysqldb.query(query, (error, cartdata) => {
							config.helpers.cart.addProductInShoppingList(product_data.product, (addProduct) => {
								callback(null, product_data);
							});
						});						
					}else{
						
						let newProductPrice = parseFloat(product_data.product_quantity_data.product_price);
						let totalPrice = newProductPrice * parseInt(product_data.product_quantity_data.quantity);
						/**insert in cart table***/
						let cart = {};
						cart.order_id = product_data.product_quantity_data.order_id;
						cart.user_id = parseInt(req.body.user_id);
						cart.shop_id = parseInt(product_data.product[0].shop_id);
						cart.product_id = parseInt(product_data.product[0].id);
						cart.cat_id = parseInt(product_data.product[0].cat_id);
						cart.quantity = parseInt(product_data.product_quantity_data.quantity);
						cart.original_price = parseFloat(product_data.product_quantity_data.original_price);
						cart.cart_price = parseFloat(product_data.product_quantity_data.product_price);
						cart.total_price = parseFloat(product_data.product_quantity_data.product_price) * parseInt(product_data.product_quantity_data.quantity);
						cart.cart_status = product_data.product_quantity_data.cart_status;
						cart.product_from = req.body.product_from;
						cart.created_at = new Date();
						cart.updated_at = new Date();
						mysqldb.query("INSERT INTO smm_cart SET ?", cart, (error, result_data) => {
							//console.log(error);			
							config.helpers.cart.addProductInShoppingList(product_data.product, (addProduct) => {
									callback(null, product_data);
							});
						});
					}
				});
			},
			function(product_data, callback){
				if(req.body.product_from == 'bargain'){
					let id = ((product_data.bar_data).length > 0 ) ? product_data.bar_data[0].id : '';
					let query = "delete from smm_product_bargains where id = "+parseInt(id)+"";
					mysqldb.query(query, (error, data) =>{
						callback(null, product_data);
					});
				}else{
					callback(null, product_data);
				}
			},
			function(product_data, callback){
				let order_id = product_data.product_quantity_data.order_id;
				config.helpers.cart.updateOrderPrice(order_id, (update) => {
					callback(null, product_data);
				});
			}
		], function(error, result_data){
			config.helpers.cart.getCartprice(req, (cartprice) => {
				config.helpers.cart.getCartProduct(req, (cartproduct) => {
					result.cart_quantity = cartproduct;
					result.cart_price = cartprice;
					result.status = status;
					//result.data = result_data;
					result.msg = "Product add in cart successfully";
					res.status(status).send(result);
				});
			});
		});
	},
	
	removeCart : (req, res) => {
		let status = 200;
		let result = {};
		async.waterfall([
			function(callback){
				let query = "select order_id from smm_cart where id="+parseInt(req.body.cartId)+" and user_id ="+parseInt(req.body.user_id)+"";
				mysqldb.query(query, (error, cartdata) => {
					if(!error && cartdata && cartdata.length > 0){
						let order_id = cartdata[0].order_id;
						config.helpers.cart.getquantity(req, order_id, (quantity) => {
							callback(null, quantity);
						});
					}else{
						result.status = 500;
						result.msg = "Data not found";
						res.status(status).send(result);
					}
				});
			}
		], function(error, result_data){
			result.status = status;
			result.msg = 'Product Deleted Successfully';
			res.status(status).send(result);
		});
	},
	
	shoppingCart : (req, res) => {
		console.log(req.query);
		let status = 200;
		let result = {};
		let record = {};
		async.waterfall([
			function(callback){
				let query = "select * from smm_orders_temp where user_id ="+parseInt(req.query.user_id)+"";
				mysqldb.query(query, (error, order_temp) => {
					if(!error && order_temp){
						let order_id = order_temp[0].id;
						config.helpers.cart.get_product_unit_quantity(order_id, (total_quantity) => {
							record.unit = total_quantity;
							record.order_temp = order_temp[0];
							callback(null, record);
						});
					}else{
						result.status = 500;
						result.msg = "Something went wrong";
						res.status(status).send(result);
					}
				});
			},
			function(record, callback){
				let query = "select count(*) as total from smm_cart where user_id = "+parseInt(req.query.user_id)+"";
				mysqldb.query(query, (error, allrecord) => {
					record.product_count = allrecord[0].total;
					callback(null, record);
				});
			},
			function(record, callback){
				config.helpers.cart.get_cart_data(req, (cart_data) => {
					record.cart_data = cart_data;
					callback(null, record);
				});				
			}
		], function(error, result_data){
			result.status = status;
			result.msg = '';
			result.data = result_data;
			result.product_image = config.constant.SHOWPRODUCTIMAGE;
			res.status(status).send(result);
		});
	}
}
