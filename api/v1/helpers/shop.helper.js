var model  = require('../../../models/index.model');
var config = require('../../../config/index');
var mysqldb 	= require('../../../config/mysqldb');
var async = require('async');
var moment = require('moment');
module.exports = {	
	save_seller_update_seller_temp : (req, cb) => {
		let bank_id = 1;
		async.waterfall([
			function(callback){
				let upload_name = '';
				if (req.files && Object.keys(req.files).length != 0){   
					let image_path = config.constant.SELLERIMAGE;
					let image_data = [];
					if(Array.isArray(req.files.image)){
						image_data = req.files.image;
					}else{
						image_data.push(req.files.image);
					}
					config.helpers.common.upload_image(image_path, image_data, (upload) =>{
						console.log(upload);
						upload_name = upload.join(',');
						//res.send(upload_name);
						callback(null, upload_name);
					});
				}else{
					callback(null, upload_name);
				}
			},
			function(upload_name, callback){
				let insert_data = "account_name = '"+req.body.account_name+"', account_no = '"+req.body.account_no+"', branch = '"+req.body.branch+"', step = '2', status = '1', bank_id = "+bank_id+"";
				if(upload_name){
					insert_data += ", account_image = '"+upload_name+"'";
				}
				let query = "UPDATE smm_seller_temp SET "+insert_data+" WHERE id = "+parseInt(req.body.id)+"";
				mysqldb.query(query, (err, result_data)=> {
					console.log(err);
					callback(null, result_data);
				});
			},
			function(data, callback){
				let query = "SELECT * FROM smm_seller_temp WHERE id = "+parseInt(req.body.id)+"";
				mysqldb.query(query, (err, seller_data) => {
					callback(null, seller_data);
				})
			}
		],function(error, result){
			cb(result);
		})
	},
	
	create_shop : (req, data, cb) => {
		async.waterfall([
			function(callback){
				let insert_data = {
					user_id : data.user_id,
					citizen_id : data.citizen_id,
					citizen_id_image : data.citizen_id_image,
					bank_id : data.bank_id,
					account_name : data.account_name,
					account_no : data.account_no,
					branch : data.branch,
					account_image : data.account_image,
					status : '1',
					created_at : new Date(),
					updated_at : new Date(),
				}
				mysqldb.query("INSERT INTO smm_seller SET ?", insert_data, (error, result_data) => {
					callback(null, result_data);
				})
			},
			function(result_data, callback){
				let shop_data = {
					user_id : data.user_id,
					shop_url : data.shop_url,
					ph_number : req.body.ph_number ? req.body.ph_number : '',
					panel_no : data.panel_no,
					citizen_id : data.citizen_id,
					logo : '',
					banner : '',
					status : '1',
					shop_status : 'close',
					register_from : 'mobile',
					bargaining : 'yes',
					product_pickup_time : 0,
					center_pickup_time : 0,
					open_time : '',
					close_time : '',
					map_image : '',
					shop_image : '',
					avg_rating : 0,
					created_at : new Date(),
					updated_at : new Date(),
				}
				mysqldb.query("INSERT INTO smm_shop SET ?", shop_data, function(err, shop, fields) {
					data.shop_id = shop.insertId;
					callback(null, result_data);
				});
			},
			function(result_data, callback){
				let shop_desc_data = {
					shop_id : data.shop_id,
					lang_id : 0,
					shop_name : data.shop_name,
					description : data.description ? data.description :''
				}
				let date = new Date();
				mysqldb.query("INSERT INTO smm_shop_desc SET ?", shop_desc_data, (error, shop_desc) => {
					mysqldb.query("UPDATE smm_users SET user_type = 'seller' WHERE id = "+parseInt(req.user_id)+"", (err, update) => {
						console.log(error);
						console.log(err);
						callback(null, result_data);
					});					
				});
			}
		], function(error, result){
			config.helpers.shop.mongocreate_shop(req, data, (error, final_data) => {
				cb(1);
			});
		});
	},
	
	mongocreate_shop : async (req, data, cb) => {
		var translate_data = [];
		async.waterfall([
			function(callback){
				config.helpers.common.get_language_data(req, function(lang_data){
					lang_data.forEach(element => {					
						if(req.body.lang_id == element.id && element.isSystem == '1'){
							var key = element.languageCode;
							console.log(key);
							var record = {
								[key] :(req.body.shop_name ? req.body.shop_name : '')
							}
							Object.assign(name_data, record);
							console.log(name_data);	
							var desc_key = 	element.languageCode;						
							var desc_record = {
								[desc_key] :  (req.body.description ? req.body.description : '')
							}
							Object.assign(desc_data, desc_record);
						}else{
							var key = element.languageCode;
							console.log(key);
							var record = {
								[key] :''
							}
							Object.assign(name_data, record);	
							console.log(name_data);
							var desc_key = 	element.languageCode;						
							var desc_record = {
								[desc_key] :  ''
							}
							Object.assign(desc_data, desc_record);
						}
					});
				});
				translate_data.name = name_data;
				translate_data.description = desc_data;
				callback(null, translate_data);
			}
		], function(error, trans_data){
			var shop_data = {
				_id : data.shop_id,
				user_id : data.user_id,
				shop_url : data.shop_url,
				shop_name : data.shop_name,
				name 	: trans_data.name,
				description : trans_data.description ? data.description : '',
				ph_number : req.body.ph_number ? req.body.ph_number : '',
				//translate_data : trans_data,
				panel_no : data.panel_no,
				citizen_id : data.citizen_id,
				market : null,
				logo : '',
				banner : '',
				status : '1',
				shop_status : 'open',
				register_from : 'mobile',
				bargaining : 'yes',
				product_pickup_time : 0,
				center_pickup_time : 0,
				open_time : '',
				close_time : '',
				map_image : '',
				shop_image : '',
				avg_rating : 0,
				shop_category : [],
				created_at : new Date(),
				updated_at : new Date(),
			}
			model.shop.create(shop_data, function (error, response) {
				model.shop.update({_id : response._id }, {$unset: {__v:1}}, function(err, res_daa){
					cb(1);
				});
			});
		});
		
	},
	
	update_shop : (req, cb) => {
		async.waterfall([
			function(callback){	
				var shop_data = "shop_url = '"+req.body.shop_url+"', ph_number = '"+req.body.ph_number+"', product_pickup_time = '"+req.body.product_pickup_time+"', center_pickup_time = '"+req.body.center_pickup_time+"', open_time = '"+req.body.open_time+"', close_time = '"+req.body.close_time+"'"			
				let query = "UPDATE smm_shop SET "+shop_data+" WHERE id = "+parseInt(req.body.shop_id)+"";
				mysqldb.query(query, (err, shop_update) => {
					callback(null, shop_update);
				});
			},
			function(result_data, callback){
				let shop_desc_data = "shop_name = '"+req.body.shop_name+"', description = '"+req.body.description+"'";
				let lang_id = req.body.lang_id ? req.body.lang_id : 0;
				var query = "UPDATE smm_shop_desc SET "+shop_desc_data+" WHERE lang_id = "+parseInt(lang_id)+" AND shop_id = "+parseInt(req.body.shop_id)+"";
				mysqldb.query(query, (error, shop_desc) => {				
					callback(null, shop_desc);
				});
			}
		], function(error, result){
			config.helpers.shop.mongoupdate_shop(req, (final_data) => {
				cb(1);
			});
		});
	},
	
	mongoupdate_shop : async (req, cb) => {
		var name_data = {};
		var desc_data = {};
		var translate_data = {};
		async.waterfall([
			function(callback){
				config.helpers.common.get_language_data(req, function(lang_data){					
					if(lang_data && lang_data.length >0){
						lang_data.forEach(element => {
							if(req.body.lang_id == element.id && element.isSystem == '1'){
								var key = element.languageCode;
								console.log(key);
								var record = {
									[key] :(req.body.shop_name ? req.body.shop_name : '')
								}
								Object.assign(name_data, record);
								console.log(name_data);	
								var desc_key = 	element.languageCode;						
								var desc_record = {
									[desc_key] :  (req.body.description ? req.body.description : '')
								}
								Object.assign(desc_data, desc_record);
							}else{
								var key = element.languageCode;
								console.log(key);
								var record = {
									[key] :''
								}
								Object.assign(name_data, record);	
								console.log(name_data);
								var desc_key = 	element.languageCode;						
								var desc_record = {
									[desc_key] :  ''
								}
								Object.assign(desc_data, desc_record);
							}
						});
						translate_data.name = name_data;
						translate_data.description = desc_data;
						callback(null, translate_data);
					}
				});
			}
		], async function(error, trans_data){
			//cb(trans_data);
			var shop_data = {
				shop_url : req.body.shop_url,
				shop_name : req.body.shop_name,
				name : translate_data.name,
				ph_number : req.body.ph_number ? req.body.ph_number : '',
				product_pickup_time : req.body.product_pickup_time ? req.body.product_pickup_time : 0,
				center_pickup_time : req.body.center_pickup_time ? req.body.center_pickup_time : 0,
				open_time : req.body.open_time ? req.body.open_time : '',
				close_time : req.body.close_time ? req.body.close_time :'',
				description : trans_data.description,
				avg_rating : 0,
				updated_at : new Date()
			}
			await model.shop.updateOne({ _id : req.body.shop_id }, { $set : shop_data });
			cb(1)
		});
	},
	
	check_shopurl_add : (req, cb) => {
		let query = "SELECT * from smm_seller_temp WHERE shop_url = '"+req.body.shop_url+"'";
		mysqldb.query(query, (err, shop_data) => {
			cb(shop_data);
		});
	},
	
	check_shop_url : (req, cb) => {
		let query = "SELECT * from smm_shop WHERE shop_url = '"+req.body.shop_url+"' AND id != "+parseInt(req.body.shop_id)+"";
		mysqldb.query(query, (err, shop_data) => {
			cb(shop_data);
		});
	},
	
	check_panel_no : (req, cb) => {
		let query = "SELECT * from smm_seller_temp WHERE panel_no = '"+req.body.panel_no+"'";
		mysqldb.query(query, (err, panel_data) => {
			cb(panel_data);
		});
	},
	
	check_citizen_id : (req, cb) => {
		let query = "SELECT * from smm_seller_temp WHERE citizen_id = '"+req.body.citizen_id+"'";
		mysqldb.query(query, (err, citizen_data) => {
			cb(citizen_data);
		});
	},
	
	update_shop_bargaining_status : async (req, cb) => {
		var bargaining = "yes";
		if(req.query.status == '0'){
			bargaining = 'no';
		}
		var update = await model.shop.updateOne({ _id : parseInt(req.query.shop_id) }, { $set : { 'bargaining' : bargaining }}, { upsert: true });
		var query = "UPDATE smm_shop SET bargaining = '"+bargaining+"' WHERE id = "+parseInt(req.query.shop_id)+"";
		mysqldb.query(query, (error, updat)=>{
			cb(1);
		});
	},
	
	update_shop_status : async (req, cb) => {
		let shop_status = "open";
		if(req.query.status == '0'){
			shop_status = 'close';
		}
		var update = await model.shop.updateOne({ _id : parseInt(req.query.shop_id) }, { $set : { 'shop_status' : shop_status }}, { upsert: true });
		let query = "UPDATE smm_shop SET shop_status = '"+shop_status+"' WHERE id = "+parseInt(req.query.shop_id)+"";
		mysqldb.query(query, (error, updat)=>{
			cb(1);
		});
	},
	
	update_image_data : async (req, upload_data, cb) => {
		let update_data = {};
		let mysql_update_data = '';
		if(req.body.type == 'logo'){
			update_data.logo = upload_data.name;
			mysql_update_data = "logo = '"+upload_data.name+"'";
		}
		if(req.body.type == 'banner'){
			update_data.banner = upload_data.name;
			mysql_update_data = "banner = '"+upload_data.name+"'";
		}
		if(req.body.type == 'map'){
			update_data.map_image = upload_data.image_data;
			mysql_update_data = "map_image = '"+upload_data.name+"'";
		}
		if(req.body.type == 'shop'){
			update_data.shop_image = upload_data.image_data;
			mysql_update_data = "shop_image = '"+upload_data.name+"'";
		}
		
		var update = await model.shop.updateOne({ _id : parseInt(req.body.id) }, { $set : update_data }, { upsert: true });
		let query = "UPDATE smm_shop SET "+mysql_update_data+" WHERE id = "+parseInt(req.body.id)+"";
		mysqldb.query(query, (error, updat)=>{
			cb(1);
		});
	},
	
	
	remove_favorite_shop_mongo : async (req, cb) => {
		await model.favourite_shop.remove({ user_id : parseInt(req.body.user_id), shop_id : parseInt(req.body.shop_id)});
		cb(1);
	},
	
	add_favorite_shop_mongo : async (req, cb) => {
		let shop_data = {
			user_id : parseInt(req.query.user_id),
			shop_id : parseInt(req.query.shop_id),
			created_at : new Date(),
			updated_at : new Date()
		}
		model.favourite_shop.create(shop_data, function (error, response) {
			model.favourite_shop.update({_id : response._id }, {$unset: {__v:1}}, function(err, res_daa){
				cb(1);
			});
		});
	}    
}
