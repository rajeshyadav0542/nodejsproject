var model  = require('../../../../models/index.model');
var config = require('../../../../config/index');
const mysqldb 	= require('../../../../config/mysqldb');
var async = require("async");

module.exports = {		
	bargain : (req, res) => {
		let result = {};
		let status = 200;
		var productdata = {};
		async.waterfall([
			function(callback){
				let query = "select * from smm_product_bargains where user_id= "+parseInt(req.body.user_id)+" and product_id = "+parseInt(req.body.product_id)+"";
				mysqldb.query(query, (error, product_data) => {
					if(!error && product_data && product_data.length > 0){
						result.status = status;
						result.msg = "This product already added in bargain";
						res.status(status).send(result);
					}else{						
						let product_query = "select * from smm_product where id = "+parseInt(req.body.product_id)+"";
						mysqldb.query(product_query, (err, pr_data) => {
							if(!err && pr_data && pr_data.length >0){
								let shop_id = pr_data[0].shop_id;
								model.shop.find({ _id : parseInt(shop_id)}, (err, shop_data) => {
									if(shop_data && shop_data[0].shop_status == 'close'){
										result.status = status;
										result.msg = req.__("shop_has_been_closed");
										res.status(status).send(result);
									}else{
										productdata.product = pr_data[0];
										productdata.shop = shop_data;
										callback(null, productdata);
									}
								});
							}else{
								result.status = 404;
								result.msg = res.__('something_wrong');
								res.status(status).send(result);
							}
						});
					}
				});
			},
			function(product_data, callback){
				if(req.body.type == 'cart' && req.body.cartId){
					let query = "select * from smm_cart where id = "+parseInt(req.body.cartId)+"";
					mysqldb.query(query, (error, cart_data) => {
						if(!error && cart_data && cart_data.length >0){
							let order_id = cart_data[0].order_id;
							config.helpers.cart.getquantity(req, order_id, (remove) => {
								callback(null, productdata);
							});
						}else{
							calback(null, productdata);
						}
					});
				}else{
					callback(null, productdata);
				}
			}
		], function(error, result_data){
			config.helpers.product.save_bargain_data(req, result_data, (update) => {
				result.status = status;
				result.msg = req.__('bargain_value_send_to_seller');
				//result.data = result_data;
				res.status(status).send(result);
			});
		});
	},
	
	check_product_bargain : (req, res) => {
		
		let result = {};
		let status = 200;
		let query = "select * from smm_product_bargains where user_id= "+parseInt(req.body.user_id)+" and product_id = "+parseInt(req.body.product_id)+"";
		mysqldb.query(query, (error, product_data) => {
			if(!error && product_data && product_data.length > 0){
				result.status = status;
				result.msg = req.__('already_in_bargain');
				res.status(status).send(result);
			}else{						
				result.status = status;
				result.msg = "";
				res.status(status).send(result);
			}			
		});
	},
	
	check_shop_status : (req, res) => {
		let result = {};
		let status = 200;
		model.shop.find({ _id : parseInt(req.query.shop_id)}, (error, shop_data) => {				
			if(!error && shop_data && shop_data.length >0){
				var shop = shop_data[0];
				if(shop.shop_status == 'close'){
					result.status = 500;
					result.msg = req.__("shop_has_been_closed");
					res.status(status).send(result);
				}else{
					result.status = status;
					result.msg = "";
					res.status(status).send(result);
				}
			}else{
				result.status = 404;
				result.msg = res.__('something_wrong');
				res.status(status).send(result);
			}
		});
	},
	
	bargain_product_list : (req, res) => {
		let result = {};
		let status = 200;
		var query = "select `smm_pb`.`id` as `bargain_id`, `smm_pb`.`qty`, `smm_p`.`id`, `smm_sd`.`shop_name`, `smm_s`.`shop_url`, `smm_sd`.`shop_id`, `smm_cd`.`category_name`, `smm_c`.`url` as `caturl`, `smm_b`.`icon`, `smm_p`.`show_price`, `smm_p`.`unit_price`, `smm_p`.`sku`, `smm_p`.`stock`, `smm_p`.`quantity`, `smm_ud`.`unit_name`, `smm_p`.`thumbnail_image`, `smm_p`.`status`, `smm_p`.`created_at`, `smm_p`.`updated_at`, `smm_p`.`created_from`, `curr_unit_price`, `curr_total_price`, `smm_p`.`cat_id`, `smm_p`.`weight_per_unit`, `smm_s`.`logo`, `smm_pb`.`product_id`, `smm_p`.`package_id` from `smm_product_bargains` as `smm_pb` inner join `smm_shop` as `smm_s` on `smm_pb`.`shop_id` = `smm_s`.`id` inner join `smm_product` as `smm_p` on `smm_pb`.`product_id` = `smm_p`.`id` inner join `smm_category_desc` as `smm_cd` on (`smm_p`.`cat_id` = `smm_cd`.`cat_id` and `smm_cd`.`lang_id` = 0) inner join `smm_unit_desc` as `smm_ud` on (`smm_p`.`base_unit_id` = `smm_ud`.`unit_id` and `smm_ud`.`lang_id` = 0) inner join `smm_shop_desc` as `smm_sd` on (`smm_sd`.`shop_id` = `smm_pb`.`shop_id` and `smm_sd`.`lang_id` = 0) inner join `smm_standard_badge` as `smm_b` on `smm_p`.`badge_id` = `smm_b`.`id` inner join `smm_category` as `smm_c` on `smm_p`.`cat_id` = `smm_c`.`id` where `smm_p`.`status` = '1' and `smm_pb`.`user_id` = "+parseInt(req.query.user_id)+""
		if(req.body.sortby == 'bystore'){
			query += " order by `smm_sd`.`shop_name` asc"
		}
		else if(req.body.sortby == 'byproduct'){
			query += " order by `smm_cd`.`category_name` asc"
		}else{
			query += " order by `smm_pb`.`id` desc";
		}
		mysqldb.query(query, (error, data) => {
			if(!error && data && data.length > 0){
				config.helpers.product.bargain_description_data(data, (f_data) =>{
					result.status = status;
					result.data = f_data;
					res.status(status).send(result);
				})
			}else{
				result.status = 500;
				result.data = res.__('something_wrong');
				res.status(status).send(result);
			}			
		})
	},
	
	bargain_from_buyer : (req, res) => {
		console.log(req.body);
		let result = {};
		let status = 200;
		let data = {};
		async.waterfall([
			function(callback){
				let query = "select * from smm_product_bargains where id = "+parseInt(req.body.id)+" and user_id = "+parseInt(req.body.user_id)+"";
				console.log(query);
				mysqldb.query(query, (error, product) =>{
					console.log(product);
					if(!error && product && product.length > 0){
						let product_data = product[0];
						callback(null, product_data);
					}else{
						result.status = 500;
						result.msg = res.__('something_wrong');
						res.status(status).send(result);
					}
				});
			},
			function(data, callback){
				let query = "update smm_product_bargain_details set bar_status = '3' where bargain_id = "+parseInt(req.body.id)+" and bar_status = '1'";
				mysqldb.query(query, (error, update) => {
					if(!error){
						callback(null, data);
					}else{
						result.status = 500;
						result.msg = res.__('something_wrong');
						res.status(status).send(result);
					}
				});
			}
		], function(error, result_data){		
			let base_unit = parseFloat(req.body.base_unit_price);
			let base_unit_price = parseFloat(req.body.base_unit_price);
			let unit_price = parseFloat(req.body.unit_price);
			let total_price = parseInt(result_data.qty)*(parseFloat(req.body.unit_price));
			let insert_data = {
				bargain_id :  result_data.id,
				base_unit : base_unit.toFixed(2),
				base_unit_price : base_unit_price.toFixed(2),
				unit_price : unit_price.toFixed(2),
				total_price : total_price.toFixed(2),
				bar_status : '1',
				created_by : req.body.created_by,
				created_at : new Date(),
				updated_at : new Date()
			}
			mysqldb.query('insert into smm_product_bargain_details SET ?', insert_data, (error, insertdata) =>{
				console.log(error);
				if(!error){
					result.status = status;
					result.msg = req.__("product_bargain_accepted_successfully");
					res.status(status).send(result);
				}else{
					result.status = 500;
					result.msg = res.__('something_wrong');
					res.status(status).send(result);
				}
			});
		});
	},
	
	removebargain : (req, res) => {
		let status = 200;
		let result = {};
		let query = ''
		if(req.body.type == 'single'){
			query = "delete from smm_product_bargains where id ="+parseInt(req.body.id)+" and user_id ="+parseInt(req.body.user_id)+"";
		}else{
			query = "delete from smm_product_bargains where  id IN ("+req.body.id+") and user_id ="+parseInt(req.body.user_id)+"";
		}
		mysqldb.query(query, (error, delete_data) =>{
			if(!error){
				result.status = status;
				result.msg = req.__("bargain_delete_successfully");
				res.status(status).send(result);
			}else{
				result.status = 500;
				result.msg = res.__('something_wrong');
				res.status(status).send(result);
			}
		});
	}
	
}
