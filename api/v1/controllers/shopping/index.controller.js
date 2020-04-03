let config = require('../../../../config/index');
let mysqldb 	= require('../../../../config/mysqldb');
let async = require("async");

module.exports = {
	create_shopping : (req, res) => {
		let status = 200;
		let result = {};
		async.waterfall([
			function(callback){
				let insert_data = {
					user_id : parseInt(req.body.user_id),
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
								name : req.body.shopping_list_name
							}
							mysqldb.query('INSERT INTO '+constant.USER_SHIPPING_LIST_DESC+' SET ?', save_data, function(err, save_result, fields) {
								
							});							
						});
						callback(null, id);
					}
				});
			}
		], function(error, data){
			result.status = status;
			result.msg = "Shipping list add successfully";
			res.status(status).send(result);
		})
	},
	
	shopping_list : (req, res) => {
		let status = 200;
		let result = {};
		let query = "SELECT shopping.id, shopping.is_default, shoppinglist.name, shoppinglist.lang_id FROM "+constant.USER_SHIPPING_LIST+" as shopping JOIN "+constant.USER_SHIPPING_LIST_DESC+" as shoppinglist on shopping.id = shoppinglist.shopping_list_id where shopping.user_id = "+parseInt(req.body.user_id)+" and shoppinglist.lang_id = "+req.body.lang_id+" order by is_default DESC";
		mysqldb.query(query, (error, shoppinglist) => {
			if(!error){
				result.status = status;
				result.data = shoppinglist;
				res.status(status).send(result);
			}else{
				result.status = 500;
				result.data = [];
				result.msg = "Something went wrong."
				res.status(status).send(result);
			}
		});
	},
	
	edit : (req, res) => {
		let status = 200;
		let result = {};
		async.waterfall([
			function(callback){
			config.helpers.common.get_language_data(req, function(lang_data){					
					if(lang_data && lang_data.length >0){
						lang_data.forEach(element => {
							mysqldb.query('UPDATE '+constant.USER_SHIPPING_LIST_DESC+' SET name = "'+req.body.shopping_list_name+'" where shopping_list_id = '+parseInt(req.body.id)+' and lang_id = '+parseInt(element.id)+'', (err, updatedata) => {
								
							});							
						});
						callback(null, status);
					}
				});
			}
		], function(error, data){
			result.status = status;
			result.msg = "Shipping list edit successfully";
			res.status(status).send(result);
		})
	},
	
	delete_shopping : (req, res) => {
		let status = 200;
		let result = {};
		let query = "delete from "+constant.USER_SHIPPING_LIST+" where id = "+req.body.id+"";
		mysqldb.query(query, (error, shoppinglist) => {
			if(!error){
				result.status = status;
				result.msg = "Shopping list deleted successfully";
				res.status(status).send(result);
			}else{
				result.status = 500;
				result.msg = "Something went wrong."
				res.status(status).send(result);
			}
		});
	},
	
	// before add to cart add shopping list in smm_user_shopping_list_items table
	add_to_shopping_list : (req, res) => {
		let status = 500;
		let result = {};
		async.waterfall([
			function(callback){
				let query = "select * from "+constant.USER_SHIPPING_LIST+" where user_id ="+parseInt(req.body.user_id)+" and is_default = '1'";
				mysqldb.query(query, (error, shoppingdata) => {
					if(!error && shoppingdata && shoppingdata.length == 0){
						if(req.body.shopping_list_name){
							config.helpers.shopping.create_default_shopping_list(req, (data) => {
								config.helpers.shopping.addProdInShoppingList(req, (datas) => {
									callback(null, datas);
								});
							});
						}else{
							result.status = 500;
							result.msg = "No shopping list found";
							res.status(status).send(result);
						}
					}else{
						req.body.def_shop_id = shoppingdata[0].id;
						config.helpers.shopping.addProdInShoppingList(req, (data) => {
							callback(null, data);
						});
					}
				})
			}
		], function(error, resultdata){
			if(resultdata == 1){
				result.status = 500;
				result.msg = "product_already_added_into_shoplist";
				res.status(status).send(result);
			}else{
				result.status = status;
				result.msg = "product_added_into_shoplist_successfully";
				res.status(status).send(result);
			}
		});
	},
	
	shipping_list_product : (req, res) => {
		let status = 200;
		let result = {};
		let data = [];
		async.waterfall([
			function(callback){
				let query = "select * from "+constant.USER_SHIPPING_LIST+" where user_id = "+parseInt(req.body.user_id)+" order by is_default desc";
				//console.log(query);
				mysqldb.query(query, (error, shopping_list) => {
					if(!error && shopping_list && shopping_list.length > 0){
						req.body.shopping_id = shopping_list[0].id;
						callback(null, shopping_list);
					}else{
						result.status = 500;
						result.msg = "Something went wrong";
						res.status(status).send(result);
					}
				});
			},			
			function(data, callback){
				config.helpers.shopping.shopping_product(req, (product_data) => {
					if(product_data == 1){
						result.status = 500;
						result.msg = "Something went wrong";
						res.status(status).send(result);
					}else{
						if(product_data.length > 0){
							async.forEach(product_data, (record, callback) => {
								config.helpers.shopping.get_all_shopping_product(req, record, (record_data) =>{
									record.product_data = record_data;
									callback();
								});
							}, function(error){
								callback(null, product_data);
							});
						}else{
							callback(null, product_data);
						}
					}
				});
			}
		], function(error, result_data){
			result.status = status;
			result.data = result_data;
			res.status(status).send(result);
		});
	},
	
	update_shopping_product : (req, res) => {
		let status = 200;
		let result = {};
		async.waterfall([
			function(callback){
				config.helpers.shopping.update_shopping_product(req, (update_data) => {
					callback(null, update_data);
				});
			}
		], function(error, result_data){
			result.status = status;
			result.msg = "Shopping list updated successfully";
			res.status(status).send(result);
		});		
	},
	
	delete_shopping_product : (req, res) => {
		let status = 200;
		let result = {};
		let query = "delete from "+constant.USER_SHIPPING_LIST_ITEMS+" where id = "+parseInt(req.body.id)+"";
		console.log(query);
		mysqldb.query(query, (error, del) => {
			if(!error){
				result.status = status;
				result.msg = "Shopping list product deleted successfull";
				res.status(status).send(result);
			}else{
				result.status = 500;
				result.msg = "Something went wrong";
				res.status(status).send(result);
			}
		});
	}
}
