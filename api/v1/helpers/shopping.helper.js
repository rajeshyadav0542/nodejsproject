let model  = require('../../../models/index.model');
let config = require('../../../config/index');
let mysqldb 	= require('../../../config/mysqldb');
let async = require('async');
let moment = require('moment');
module.exports = {	
	addProdInShoppingList : (req, cb) => {
		let record = {};
		let show = 0;
		async.waterfall([
			function(callback){
				let query = "select size, grade from "+constant.STANDARD_BADGE+" where id = "+parseInt(req.body.badge_id)+"";
				mysqldb.query(query, (error, budgedata)=> {
					callback(null, budgedata);
				});
			},
			function(budgedata, callback){
				let size = (budgedata && budgedata.length >0) ? budgedata[0].size : '';
				let grade = (budgedata && budgedata.length >0) ? budgedata[0].grade : '';				
				let query = "select * from "+constant.USER_SHIPPING_LIST_ITEMS+" where shopping_list_id = "+parseInt(req.body.def_shop_id)+" and cat_id = "+parseInt(req.body.cat_id)+" and size = '"+ size +"' and grade = '"+ grade +"'";
				mysqldb.query(query, (error, shoppinglist) => {
					record.budge = budgedata;
					record.shoppinglist = shoppinglist;
					if(shoppinglist && shoppinglist.length == 0){
						let save_data = {
							shopping_list_id : parseInt(req.body.def_shop_id),
							cat_id : parseInt(req.body.cat_id),
							size : size,
							grade : grade
						}
						mysqldb.query("INSERT into "+constant.USER_SHIPPING_LIST_ITEMS+" SET ?", save_data, function(error, save_result, fields){
							console.log(error);
							callback(null, show);
						});	
					}else{
						show = 1;
						callback(null, show);					
					}
				});
			}
		], function(error, result){
			cb(result);
		});
	},
	
	create_default_shopping_list : (req, cb) => {
		async.waterfall([
			function(callback){
				let insert_data = {
					user_id : parseInt(req.body.user_id),
					is_default : '1',
					updated_at : new Date()
				}
				mysqldb.query('INSERT INTO '+constant.USER_SHIPPING_LIST+' SET ?', insert_data, function(err, save_result, fields) {
					let id = save_result.insertId;
					callback(null, id);
				});
			},
			function(id, callback){
				config.helpers.common.get_language_data(req, function(lang_data){					
					if(lang_data && lang_data.length >0){
						lang_data.forEach(element => {
							let save_data = {
								shopping_list_id : parseInt(id),
								lang_id : parseInt(element.id),
								name : req.body.shopping_list_name ? req.body.shopping_list_name : 'Recent list of purchased'
							}
							mysqldb.query('INSERT INTO '+constant.USER_SHIPPING_LIST_DESC+' SET ?', save_data, function(err, save_result, fields) {
								
							});							
						});
						callback(null, id);
					}
				});
			}
		], function(error, result){
			req.body.def_shop_id = result;
			//config.helpers.addProdInShoppingList(req, (data) => {
				cb(1);
			//});
		})
	},
	
	shopping_product : (req, cb) => {
		let lang_id = req.body.lang_id ? parseInt(req.body.lang_id) : 0;
		let query = "SELECT items.id, items.size, items.grade, items.note, items.price, items.is_completed, cat.id as category_id, cat.url, cat.img, cat_desc.category_name FROM "+constant.USER_SHIPPING_LIST_ITEMS+" as items join "+constant.CATEGORY+" as cat on items.cat_id = cat.id join "+constant.CATEGORY_DESC+" as cat_desc on items.cat_id = cat_desc.cat_id where items.shopping_list_id = "+parseInt(req.body.shopping_id)+" and cat_desc.lang_id = "+parseInt(lang_id)+" ORDER BY items.`id`  DESC"
		console.log(query);
		let items = [];
		mysqldb.query(query, (error, items) => {
			if(!error && items){
				cb(items);
			}else{
				cb(1);
			}
		});
	},
	
	get_all_shopping_product : (req, data, cb) => {
		
		async.parallel({			
			bargain_items : function(callback){
				let query = "select `smm_pbar`.* from "+constant.PRODUCT_BARGAINS+" as `smm_pbar` left join "+constant.PRODUCT+" as `smm_prd` on `smm_pbar`.`product_id` = `smm_prd`.`id` left join "+constant.STANDARD_BADGE+" as `smm_bdg` on `smm_prd`.`badge_id` = `smm_bdg`.`id` where `smm_pbar`.`user_id` = "+parseInt(req.body.user_id)+" and `smm_prd`.`cat_id` = "+parseInt(data.category_id)+" and (`smm_bdg`.`size` = '"+data.size+"') and (`smm_bdg`.`grade` = '"+data.grade+"')";
				mysqldb.query(query, (error, bargain) => {
					let bar = 0;
					if(bargain && bargain.length >0){
						bar = bargain.length;
					}
					callback(null, bar);
				});
			},
			cartwaiting_payment : function(callback){
				let query = "select `smm_cart`.* from "+constant.CART+" as `smm_cart` left join "+constant.PRODUCT+" as `smm_prd` on `smm_cart`.`product_id` = `smm_prd`.`id` left join "+constant.STANDARD_BADGE+" as `smm_bdg` on `smm_prd`.`badge_id` = `smm_bdg`.`id` where `smm_cart`.`user_id` = "+parseInt(req.body.user_id)+" and `smm_prd`.`cat_id` = "+parseInt(data.category_id)+" and (`smm_bdg`.`size` = '"+data.size+"') and (`smm_bdg`.`grade` = '"+data.grade+"')";
				mysqldb.query(query, (error, bargain) => {
					let bar = 0;
					if(bargain && bargain.length >0){
						bar = bargain.length;
					}
					callback(null, bar);
				});
			},
			cartpay : function(callback){
				let query = "select `smm_ordd`.* from "+constant.ORDER_DETAIL+" as `smm_ordd` inner join "+constant.ORDER+" as `smm_ord` on `smm_ord`.`id` = `smm_ordd`.`order_id` left join "+constant.PRODUCT+" as `smm_prd` on `smm_ordd`.`product_id` = `smm_prd`.`id` left join "+constant.STANDARD_BADGE+" as `smm_bdg` on `smm_prd`.`badge_id` = `smm_bdg`.`id` where `smm_ordd`.`user_id` = "+parseInt(req.body.user_id)+" and `smm_prd`.`cat_id` = "+parseInt(data.category_id)+" and (`smm_bdg`.`size` = '"+data.size+"') and (`smm_bdg`.`grade` = '"+data.grade+"') and `smm_ord`.`end_shopping_date` is null";
				mysqldb.query(query, (error, bargain) => {
					let bar = 0;
					if(bargain && bargain.length >0){
						bar = bargain.length;
					}
					callback(null, bar);
				});
			}
		}, function(error, result){
			cb(result);
		});
	},
	
	update_shopping_product : (req, cb) => {
		let update_data = "";
		if(req.body.price){
			update_data += "price = "+parseInt(req.body.price)+"";
		}
		if(req.body.grade){
			update_data += " , grade = '"+req.body.grade+"', size ='"+req.body.size+"'";
		}
		if(req.body.completed != '0'){
			update_data += ", is_completed='1'";
		}
		if(req.body.note){
			update_data += ", note='"+req.body.note+"'";
		}
		update_data = update_data.replace(/^,|,$/g, '');		
		let query = "update "+constant.USER_SHIPPING_LIST_ITEMS+" set "+update_data+" where id= "+parseInt(req.body.id)+"";
		mysqldb.query(query, (error, update) => {
			console.log(error);
			cb(1);
		});
	}
}
