const model  = require('../../../models/index.model');
const config = require('../../../config/index');
const mysqldb 	= require('../../../config/mysqldb');
var async = require('async');
module.exports = {	
	product_search : (req, cb) => {
		let search = req.query.term;
		model.product.aggregate([
			{
				$match : { sku : { $regex : search, $options : 'i'} }
			},
			{
				$project : 
				{
					_id : 1,
					sku : 1,
					name : 1,
					image : 1
				}
			}
		], function(error, result){
			cb(result);
		});
	},
	
	shop_search : (req, cb) => {
		let search = req.query.term;
		model.shop.aggregate([
			{
				$match : 
				{
					shop_name : { $regex: search, $options:'i'}
				}
			},
			{
				$project : {
					_id : 1,
					shop_name : 1
				}
			}
		], function(error, shop_data){
			cb(shop_data);
		})
	},
	
	generate_sku : (req, cb) => {
		var text = "";
		var length = 15;
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";   
		for (var i = 0; i < length; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));   
		cb(text);
	},
	
	save_product : (req, badge_data, cb) => {
		var unit_price = 0;
		var desc_data = {};
		var translate_data = {};
		if(req.body.show_price == '1'){
			unit_price = parseInt(req.body.unit_price)
		}
		var min_order_qty = 0;
		var order_qty_limit = "1";
		if(req.body.order_qty_limit){
			min_order_qty = parseInt(req.body.min_order_qty);
			order_qty_limit = "0";
		}
		var save_data = {
				//avg_star : 0,
				avg_rating : 0,
				shop_id : parseInt(req.body.shop_id),
				url : '',
				sku : req.body.sku,
				cat_id : parseInt(req.body.product_cat),
				badge_id : parseInt(badge_data.id),
				show_price : req.body.show_price,
				unit_price : parseInt(unit_price),
				stock : "0",
				quantity : req.body.quantity ? parseInt(req.body.quantity) : 0,
				order_qty_limit : order_qty_limit,
				min_order_qty : min_order_qty,
				thumbnail_image : '',
				is_tier_price : "0",
				package_id : parseInt(req.body.unit),
				base_unit_id : parseInt(req.body.baseunit),
				weight_per_unit : req.body.weight_per_unit ? req.body.weight_per_unit : '0',
				status : req.body.status,
				created_at : new Date(),
				updated_at : new Date(),
				deleted_at : null,
				created_by : parseInt(req.body.user_id),
				updated_by : parseInt(req.body.user_id),
				deleted_by : 0,
				created_from : 'seller',
				updated_from : 'seller'
			}
		async.waterfall([
			function(callback){
				config.helpers.common.get_language_data(req, function(lang_data){					
					if(lang_data && lang_data.length >0){
						lang_data.forEach(element => {
							if(req.body.lang_id == element.id){
								var desc_key = 	element.languageCode;						
								var desc_record = {
									[desc_key] :  (req.body.description ? req.body.description : '')
								}
								Object.assign(desc_data, desc_record);
							}else{
								var key = element.languageCode;								
								var desc_key = 	element.languageCode;						
								var desc_record = {
									[desc_key] :  ''
								}
								Object.assign(desc_data, desc_record);
							}
						});
						//translate_data.description = desc_data;
						callback(null, desc_data);
					}
				});
			},
			
			function(trans_data, callback){
				config.helpers.product.create_sql_product(req, save_data, (product_save) => {
					console.log(product_save);
					save_data._id = product_save;
					callback(null, trans_data);				
				});
			},
			function(trans_data, callback){
				save_data.image = [];
				save_data.description = trans_data;
				config.helpers.product.create_mongo_product(req, save_data, (product_save) => {
					callback(null, save_data);				
				});
			}
		], function(error, save_data){
			let upload_name = '';
			if (req.files && Object.keys(req.files).length != 0){   
				let image_path = config.constant.PRODUCTIMAGE;
				let image_data = [];
				if(Array.isArray(req.files.image)){
					image_data = req.files.image;
				}else{
					image_data.push(req.files.image);
				}
				config.helpers.common.product_upload_image(image_path, image_data, (upload) =>{
					config.helpers.product.update_image(save_data, upload, (imageupdata) => {
						cb(save_data)
					});
				});
			}else{
				cb(save_data)
			}			
		});		
	},
	
	update_image : (data, upload, cb) => {
		async.waterfall([
			function(callback){
				let image_data = {
					thumbnail_image : upload[0],
					image : upload,
				}
				model.product.updateOne({ _id : parseInt(data._id) }, { $set : image_data });
				let query = "UPDATE smm_product SET thumbnail_image = '"+upload[0]+"' WHERE id = "+parseInt(data._id)+"";
				mysqldb.query(query, (err, product_update) => {
					callback(null, upload);
				});
			},
			function(upload, callback){
				async.forEach(upload, function(image_data, image_callback) {
					let insert_data = {
						product_id : parseInt(data._id),
						image : image_data
					}
					mysqldb.query("INSERT INTO smm_product_image SET ?", insert_data, (error, update)=> {
						image_callback();
					});
				}, function(err){
					callback(null, upload);
				});
			}
		], function(error, result){
			cb(1)
		})
	},
	
	create_sql_product : (req, save_data, cb) => {
		async.waterfall([
			function(callback){
				mysqldb.query("INSERT INTO smm_product SET ?", save_data, function(err, product, fields) {
					callback(null, product.insertId)
				});
			}
		], function(error, product_id){
			let product_desc_data = {
				product_id : product_id,
				lang_id : req.body.lang_id,
				description : req.body.description ? req.body.description :''
			}
			let date = new Date();
			mysqldb.query("INSERT INTO smm_product_desc SET ?", product_desc_data, (error, product_desc) => {
				cb(product_id)
			});
		})		
	},
	
	create_mongo_product : (req, save_data, cb) => {
		model.product.create(save_data, function (error, response) {
			console.log(error);
			console.log(response);
			model.product.update({_id : response._id }, {$unset: {__v:1}}, function(err, res_daa){
				cb(1);
			});
		});
	},	
	
	update_product : (req, badge_data, cb) => {
		var unit_price = 0;
		var desc_data = {};
		var translate_data = {};
		if(req.body.show_price == '1'){
			unit_price = parseInt(req.body.unit_price)
		}
		var min_order_qty = 0;
		var order_qty_limit = "1";
		if(req.body.order_qty_limit){
			min_order_qty = parseInt(req.body.min_order_qty);
			order_qty_limit = "0";
		}
		var save_data = {				
				cat_id : parseInt(req.body.product_cat),
				badge_id : parseInt(badge_data.id),
				show_price : req.body.show_price,
				unit_price : parseInt(unit_price),
				order_qty_limit : order_qty_limit,
				min_order_qty : min_order_qty,
				package_id : parseInt(req.body.unit),
				base_unit_id : parseInt(req.body.baseunit),
				weight_per_unit : req.body.weight_per_unit ? req.body.weight_per_unit : '0',
				status : req.body.status,
				updated_at : new Date(),
				updated_by : parseInt(req.body.user_id),
			}
		async.waterfall([
			function(callback){
				config.helpers.common.get_language_data(req, function(lang_data){					
					if(lang_data && lang_data.length >0){
						lang_data.forEach(element => {
							if(req.body.lang_id == element.id){
								var desc_key = 	element.languageCode;						
								var desc_record = {
									[desc_key] :  (req.body.description ? req.body.description : '')
								}
								Object.assign(desc_data, desc_record);
							}else{
								var key = element.languageCode;								
								var desc_key = 	element.languageCode;						
								var desc_record = {
									[desc_key] :  ''
								}
								Object.assign(desc_data, desc_record);
							}
						});
						//translate_data.description = desc_data;
						callback(null, desc_data);
					}
				});
			},
			
			function(trans_data, callback){
				config.helpers.product.update_sql_product(req, save_data, (product_save) => {
					callback(null, trans_data);				
				});
			},
			function(trans_data, callback){				
				save_data.description = trans_data;
				config.helpers.product.update_mongo_product(req, save_data, (product_save) => {
					callback(null, trans_data);				
				});
			}
		], function(error, trans_data){	
			if (req.files && Object.keys(req.files).length != 0){   
				let image_path = config.constant.PRODUCTIMAGE;
				let image_data = [];
				if(Array.isArray(req.files.image)){
					image_data = req.files.image;
				}else{
					image_data.push(req.files.image);
				}
				config.helpers.common.product_upload_image(image_path, image_data, (upload) =>{
					config.helpers.product.productupdate_image(req, save_data, upload, (imageupdata) => {
						cb(save_data)
					});
				});
			}else{
				cb(save_data)
			}	
		});		
	},
	
	productupdate_image : async (req, data, upload, cb) => {
		async.waterfall([
			function(callback){
				model.product.find({ _id : parseInt(req.body.product_id)}).exec(function(error, product){
					callback(null, product);
				});
			},
			function(product, callback){
				let pre_image = product[0].image;
				let new_image = pre_image.concat(upload);
				let image_data = {
					thumbnail_image : new_image[0],
					image : new_image,
				}
				model.product.updateOne({ _id : parseInt(req.body.product_id) }, { $set : image_data }, { upsert: true, multi: true }, (error, updatess) =>{
					let query = "UPDATE smm_product SET thumbnail_image = '"+new_image[0]+"' WHERE id = "+parseInt(req.body.product_id)+"";
					mysqldb.query(query, (err, product_update) => {
						callback(null, upload);
					});
				});
			},
			function(upload, callback){
				async.forEach(upload, function(image_data, image_callback) {
					let insert_data = {
						product_id : parseInt(req.body.product_id),
						image : image_data
					}
					mysqldb.query("INSERT INTO smm_product_image SET ?", insert_data, (error, update)=> {
						image_callback();
					});
				}, function(err){
					callback(null, upload);
				});
			}
		], function(error, result){
			cb(1)
		})
	},
	
	update_mongo_product : async (req, save_data, cb) => {
		await model.product.updateOne({ _id : req.body.product_id }, { $set : save_data });
		cb(1);
	},	
	
	update_sql_product : (req, save_data, cb) => {
		async.waterfall([
			function(callback){	
				var product_data = "cat_id = '"+parseInt(save_data.cat_id)+"', badge_id = '"+parseInt(save_data.badge_id)+"', show_price = '"+save_data.show_price+"', unit_price = '"+parseInt(save_data.unit_price)+"', order_qty_limit = '"+save_data.order_qty_limit+"', min_order_qty = '"+save_data.min_order_qty+"', package_id = '"+parseInt(save_data.package_id)+"', base_unit_id = '"+parseInt(save_data.base_unit_id)+"', weight_per_unit = '"+save_data.weight_per_unit+"', status ='"+save_data.status+"', updated_by = '"+parseInt(req.body.user_id)+"'"			
				let query = "UPDATE smm_product SET "+product_data+" WHERE id = "+parseInt(req.body.product_id)+"";
				mysqldb.query(query, (err, product_update) => {
					console.log(err);
					callback(null, product_update);
				});
			},
			function(result_data, callback){
				let shop_desc_data = "description = '"+req.body.description+"'";
				let lang_id = req.body.lang_id ? req.body.lang_id : 0;
				var query = "UPDATE smm_product_desc SET "+shop_desc_data+" WHERE lang_id = "+parseInt(lang_id)+" AND product_id = "+parseInt(req.body.product_id)+"";
				mysqldb.query(query, (error, shop_desc) => {				
					callback(null, shop_desc);
				});
			}
		], function(error, result){
			cb(1);
		});
	},
	
	get_package_data : (req, cb) => {
		let query = "select id, title from smm_package where status = '1'";
		mysqldb.query(query, (error, data) => {
			cb(data);
		});
	},
	get_unit_data : (req, cb) => {
		let query = "select id, title from smm_unit where status = '1'";
		mysqldb.query(query, (error, data) => {
			cb(data);
		});
	},
	
	save_bargain_data : (req, data, cb) => {
		let product_data = data.product;
		let curr_unit_price = parseFloat(product_data.unit_price);
		let curr_total_price = curr_unit_price*parseInt(req.body.qty);
		let base_unit = parseFloat(product_data.weight_per_unit);
		let base_unit_price = parseFloat(req.body.base_unit_price);
		let bargain_data = {
			product_id : parseInt(req.body.product_id),
			shop_id : parseInt(product_data.shop_id),
			user_id : parseInt(req.body.user_id),
			qty : parseInt(req.body.qty),
			unit_id : parseInt(req.body.unit_id),
			base_unit : 0,
			base_unit_price : 0.00,
			curr_unit_price : curr_unit_price.toFixed(2),
			curr_total_price : curr_total_price.toFixed(2),
			bar_status : '1',
			created_at : new Date(),
			updated_at : new Date()			
		}
		var bargain_desc_data = {
			base_unit : base_unit.toFixed(2) ,
			base_unit_price : base_unit_price.toFixed(2),
			unit_price : curr_unit_price.toFixed(2),
			total_price : curr_total_price.toFixed(2),
			bar_status : '1',
			created_at : new Date(),
			updated_at : new Date()
		}
		console.log(bargain_data);
		async.waterfall([
			function(callback){
				let query = "select user_type from smm_users where id = "+parseInt(req.body.user_id)+"";
				mysqldb.query(query, (err, userdata) => {
					callback(null, userdata[0]);
				});
			},
			function(user_data, callback){
				mysqldb.query("INSERT INTO smm_product_bargains SET ?", bargain_data, function(err, bargain, fields) {
					user_data.bargain = bargain.insertId;
					callback(null, user_data);
				});
			},
			function(user_data, callback){
				bargain_desc_data.created_by = 'buyer';//user_data.user_type;
				bargain_desc_data.bargain_id = parseInt(user_data.bargain);
				mysqldb.query("INSERT INTO smm_product_bargain_details SET ?", bargain_desc_data, function(err, bar_desc, fields) {
					callback(null, user_data);
				});
			}
		], function(error, result){
			cb(1);
		})
	},
	
	check_get_product_review : (req, cb) => {
		let no_of_product = 20;
		var p_id_arr = [];
		var fids = [];
		async.waterfall([
		// function for getting product id review given by user
			function(callback){
				let query = "select DISTINCT(smm_pr.product_id) as pid from `smm_product_review` as `smm_pr` inner join `smm_product` as `smm_p` on `smm_pr`.`product_id` = `smm_p`.`id` inner join `smm_shop` as `smm_shop` on `smm_p`.`shop_id` = `smm_shop`.`id` where (`smm_p`.`cat_id` = "+parseInt(req.body.cat_id)+" and `smm_p`.`status` = '1') and `smm_p`.`shop_id` != "+parseInt(req.body.shop_id)+" and `smm_shop`.`shop_status` = 'open' limit "+no_of_product+"";
				mysqldb.query(query, (error, product_id)=>{
					if(product_id && product_id.length > 0){
						p_id_arr = product_id;
						let ids = JSON.parse(JSON.stringify(product_id));	
						for(var i=0; i<ids.length; i++){
							fids.push(ids[i].pid);
						}
					}
					callback(null, fids);
				})
			},
			
			// function for getting product id with reference to order details
			function(p_id_arr, callback){
				if(p_id_arr.length >0 && p_id_arr.length < no_of_product){ 
					let limit = no_of_product - (p_id_arr.length);					
					let finalids = p_id_arr.join(',');
					let query = "select count(smm_od.product_id) as tot, `smm_od`.`product_id` from `smm_order_detail` as `smm_od` inner join `smm_product` as `smm_p` on `smm_od`.`product_id` = `smm_p`.`id` inner join `smm_shop` as `smm_shop` on `smm_p`.`shop_id` = `smm_shop`.`id` where (`smm_p`.`cat_id` = "+req.body.cat_id+" and `smm_p`.`status` = '1') and `smm_p`.`id` not in ("+finalids+") and `smm_p`.`shop_id` != "+req.body.shop_id+" and `smm_shop`.`shop_status` = 'open' group by `smm_od`.`product_id` order by `tot` desc limit "+limit+""
					mysqldb.query(query, (error, productid)=>{
						if(productid && productid.length >0){
							for(var i=0; i<productid.length; i++){
								p_id_arr.push(productid[i].product_id);
							}
						}
						if(p_id_arr.length < no_of_product ){
							let limits = no_of_product -  (p_id_arr.length);
							let finalidss = p_id_arr.join(',');
							// finally getting product id in product id table
							let query = "select `smm_p`.`id` from `smm_product` as `smm_p` inner join `smm_shop` as `smm_shop` on `smm_p`.`shop_id` = `smm_shop`.`id` where (`smm_p`.`cat_id` = "+parseInt(req.body.cat_id)+" and `smm_p`.`status` = '1' and `smm_shop`.`shop_status` = 'open') and `smm_p`.`id` not in ("+finalidss+") and `smm_p`.`shop_id` != "+req.body.shop_id+" order by `smm_p`.`id` desc limit "+limits+""
							mysqldb.query(query, (error, product_idss) =>{
								for(var i=0; i<product_idss.length; i++){
									p_id_arr.push(product_idss[i].id);
								}
								callback(null, p_id_arr);
							});
						}else{
							callback(null, p_id_arr);
						}
					});
				}else{
					callback(null, fids);
				}
			}
		], function(error, result){
			cb(result)
		})
	},
	
	bargain_description_data : (data, cb) => {
		var f_data = [];
		
		async.forEach(data, function(items, callback){
			console.log(items.id);
			let query = "select * from smm_product_bargain_details where bargain_id = "+parseInt(items.id)+"";
			mysqldb.query(query, (error, bargain_data) => {
				items.bargain_data = bargain_data;
				callback();				
			});	
			
		}, function(err){
			cb(data)
		});
		
	}		
	
}
