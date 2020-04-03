let model  = require('../../../../models/index.model');
let config = require('../../../../config/index');
let constant = require('../../../../config/constant');
let async = require('async');
let mysqldb 	= require('../../../../config/mysqldb');
let HttpStatus = require('http-status-codes');
let moment = require('moment');
module.exports = {
	check_storename : (req,res) => {
		let result = {};
		let status = HttpStatus.OK;
		var err = '';
		var query = "SELECT * FROM smm_seller_temp where shop_name = '"+req.query.shop_name+"'";
       mysqldb.query(query, (err, shop_data)=> {
            if (!err && shop_data && shop_data.length > 0) {
              status = HttpStatus.INTERNAL_SERVER_ERROR;
              result.status = status;
              result.msg = "Store name already exist";
              res.status(status).send(result);
            } else {
              result.status = status;
              result.msg = "";
              res.status(status).send(result);
            }            
       });
	},
	
	insert_shop_info : (req, res) => {
		let result = {};
		let status = HttpStatus.OK;
		async.waterfall([
			function(callback){
				config.helpers.shop.check_panel_no(req, (panel_data) => {
					if(panel_data && panel_data.length > 0){
						result.status = HttpStatus.INTERNAL_SERVER_ERROR;
						result.msg = "Panel no already register."
						res.status(status).send(result);
					}else{
						callback(null, panel_data);
					}
				});
			},
			function(panel_data, callback){
				config.helpers.shop.check_citizen_id(req, (citizen_data) => {
					if(citizen_data && citizen_data.length > 0){
						result.status = HttpStatus.INTERNAL_SERVER_ERROR;
						result.msg = "Citizen id already register."
						res.status(status).send(result);
					}else{
						callback(null, citizen_data);
					}
				});
			},
			function(panel_data, callback){
				config.helpers.shop.check_shopurl_add(req, (shop_data) => {
					if(shop_data && shop_data.length > 0){
						result.status = HttpStatus.INTERNAL_SERVER_ERROR;
						result.msg = "Shop url already exits."
						res.status(status).send(result);
					}else{
						callback(null, shop_data);
					}
				});
			},
			function(shop_data, callback){
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
						upload_name = upload.join(',');
						callback(null, upload_name);
					});					
				}else{
					callback(null, upload_name);
				}
			}
		], function(error, upload_name){
				let insert_data = {
				user_id : parseInt(req.body.user_id),
				panel_no : req.body.panel_no,
				shop_name : req.body.shop_name,
				shop_url : req.body.shop_url,
				citizen_id : req.body.citizen_id,
				citizen_id_image : upload_name,
				//register_from : "mobile",
				account_name : '',
				branch : '',
				account_no : '',
				account_image : '',
				status : "0",
				step : "1",
				bank_id : 0,
				created_at : new Date(),
				updated_at : new Date()
			}
			mysqldb.query('INSERT INTO smm_seller_temp SET ?', insert_data, function(err, save_result, fields) {
				console.log(err);
				if(!err){
					result.status = status;
					result.shop_id = save_result.insertId;
					result.msg = "Information save successfully";
					res.status(status).send(result);
				}else{
					result.status = HttpStatus.INTERNAL_SERVER_ERROR;
					result.msg = "Something wrong, Please check"
					res.status(status).send(result);
				}
			});
		});
	},
	
	update_shop_info : (req, res) => {
		let result = {};
		let status = HttpStatus.OK;
		async.waterfall([
			function(callback){
				config.helpers.shop.check_shop_url(req, (shop_url) => {
					if(shop_url && shop_url.length > 0){
						result.status = HttpStatus.INTERNAL_SERVER_ERROR;
						result.msg = "Shop url is already exist."
						res.status(status).send(result);
					}else{
						callback(null, result);
					}
				});
			}
		], function(error, result_data){
			config.helpers.shop.update_shop(req, (update_shop) => {	
				if(update_shop){
					result.status = status;
					result.msg = "Information update successfully";
					res.status(status).send(result);
				}else{
					result.status = HttpStatus.INTERNAL_SERVER_ERROR;
					result.msg = "Something wrong, Please check"
					res.status(status).send(result);
				}
			});
		});
	},
	
	insert_bank_info : (req, res) => {
		let result = {};
		let status = HttpStatus.OK;		
		async.waterfall([
			function(callback){
				config.helpers.shop.save_seller_update_seller_temp(req, (update) =>{
					console.log(update);
					callback(null, update);
				});
			},
			function(data, callback){
				if(data && data.length > 0){
					var seller_data = data[0];
					config.helpers.shop.create_shop(req, seller_data, (insertdata) => {
						callback(null, data);
					});
				}else{
					callback(null, data);
				}
			}
		
		], function(error, result_data){
			if(!error){
				result.status = status;
				result.msg = "Information save successfully";
				res.status(status).send(result);
			}else{
				result.status = HttpStatus.INTERNAL_SERVER_ERROR;
				result.msg = "Something wrong, Please check"
				res.status(status).send(result);
			}
		});
	},
	
	updateShopStatus : (req, res) => {
		let result = {};
		let status = HttpStatus.OK;
		var data = {};
		async.waterfall([
			function(callback){
				if(req.query.type == "bargaining"){
					config.helpers.shop.update_shop_bargaining_status(req,  (data) => {
						callback(null, data);
					});
				}
				else if(req.query.type == "shop_status"){
					config.helpers.shop.update_shop_status(req,  (data) => {
						callback(null, data);
					});
				}else{
					callback(null, data)
				}
			}
		], function(err, result_data){
			if(!err){
				result.status = status;
				result.msg = "Records Updated Successfully!";
				res.status(status).send(result);
			}else{
				result.status = HttpStatus.INTERNAL_SERVER_ERROR;
				result.msg = "Something wrong, Please check"
				res.status(status).send(result);
			}
		});
	},
	
	user_shop_data : async (req, res) => {
		let result = {};
		let status = HttpStatus.OK;
		let shop_data = await model.shop.find({ user_id : parseInt(req.query.user_id)});
		result.status = status;
		result.data = shop_data;
		res.status(status).send(result);
	},
	
	get_shop_product : (req,res) => {
		let result = {};
		let status = HttpStatus.OK;
		var err = '';
		var skip = req.body.skip ? parseInt(req.body.skip) : 0;
		var limit = req.body.limit ? parseInt(req.body.limit) : 10;
		var search = { status : "1", shop_id : parseInt(req.body.shop_id) }; 
		if(req.body.cat_id != 0){
			search.cat_id = parseInt(req.body.cat_id);
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
			  status = HttpStatus.INTERNAL_SERVER_ERROR;
			  result.status = status;
			  result.error = err;
			}
			res.status(status).send(result);
		})   
	},
	
	favourite_shop_list : (req,res) => {
		let result = {};
		let status = HttpStatus.OK;
		var err = '';
		var skip = req.query.skip ? parseInt(req.query.skip) : 0;
		if(parseInt(req.query.pageno) > 1){
			skip = parseInt(req.query.limit)*parseInt(req.query.pageno) - parseInt(req.query.limit);
		}
		var limit = req.query.limit ? parseInt(req.query.limit) : 10;
		var search = { user_id : parseInt(req.query.user_id)}; 		
		async.parallel({
		  count : function(callback) {
			   model.favourite_shop.countDocuments(search).exec(function(err,data_count){				   
				  callback(null,data_count)
				})
			},
			data : function(callback) {
			  model.favourite_shop.aggregate([
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
					 $unwind : "$shop_data" 
				  },
				  { 
					  $replaceRoot: 
					  { 
						  newRoot: "$shop_data" 
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
			  status = HttpStatus.INTERNAL_SERVER_ERROR;
			  result.status = status;
			  result.error = err;
			}
			res.status(status).send(result);
		})   
	},
	
	favourite_shop : (req, res) => {
		let result = {};
		let status = HttpStatus.OK;		
		async.waterfall([
			function(callback){
				let query = "select * from smm_favorite_shop where user_id = "+req.query.user_id+" and shop_id = "+req.query.shop_id+"";
				mysqldb.query(query, (error, wishdata) => {
					if(wishdata && wishdata.length >0){
						result.status = status;
						result.msg = "You have already favorite this shop";
						res.status(status).send(result);
					}else{
						callback(null, wishdata);
					}
				})
			}
		], function(error, result_data){
			let shop_data = {
				user_id : parseInt(req.query.user_id),
				shop_id : parseInt(req.query.shop_id)
			}
			mysqldb.query("INSERT INTO smm_favorite_shop SET ?", shop_data, function(err, shop, fields) {
				if(!err){
					config.helpers.shop.add_favorite_shop_mongo(req, (remove_data)=>{
						result.status = status;
						result.msg = "Favorite shop successfully";
						res.status(status).send(result);
					});
				}else{
					result.status = HttpStatus.INTERNAL_SERVER_ERROR;
					result.msg = "Something went wrong, Please check";
					res.status(status).send(result);
				}
			});
		});		
	},
	
	remove_favourite_shop : (req, res) => {
		console.log(req.body);
		console.log(req.query);
		let result = {};
		let status = HttpStatus.OK;
		let condition = {
			user_id : parseInt(req.body.user_id),
			shop_id : parseInt(req.body.shop_id)
		}
		let query = "delete from smm_favorite_shop where user_id = "+parseInt(req.body.user_id)+" and shop_id = "+parseInt(req.body.shop_id)+"";
		mysqldb.query(query, (err, data) => {
			if(!err){
				config.helpers.shop.remove_favorite_shop_mongo(req, (remove_data)=>{
					result.status = status;
					result.msg = "Shop remove from favourite shop list successfully";
					res.status(status).send(result);
				});
			}else{
				result.status = HttpStatus.INTERNAL_SERVER_ERROR;
				result.msg = "Something went wrong, Please check";
				res.status(status).send(result);
			}
		});
	},
	
	update_shop_image : (req, res) => {
		let status = HttpStatus.OK;
		let result = {};
		let upload_name = '';
		let image_data = [];
		let image_result = {};
		async.waterfall([
			function(callback){
				if (req.files && Object.keys(req.files).length != 0){   
					let image_path = config.constant.SHOPIMAGE;
					if(req.body.type == 'shop' || req.body.type == 'map'){
						image_path = config.constant.SHOPMAPIMAGES;
					}					
					if(Array.isArray(req.files.image)){
						image_data = req.files.image;
					}else{
						image_data.push(req.files.image);
					}
					console.log(image_data);
					console.log(image_path);
					config.helpers.common.upload_image(image_path, image_data, (upload) =>{
						console.log(upload);
						upload_name = upload.join(',');
						image_result.name = upload_name;
						image_result.image_data = upload;
						callback(null, image_result);
					});
				}else{
					image_result.name = upload_name;
					image_result.image_data = image_data;
					callback(null, image_result);
				}
			}
		], function(error, upload_data){
			if(upload_data){
				config.helpers.shop.update_image_data(req, upload_data, (upload) => {
					result.status = status;
					result.msg = "Image upload successfully";
					res.status(status).send(result);
				});
			}else{
				result.status = HttpStatus.INTERNAL_SERVER_ERROR;
				result.msg = "Something went wrong, Please check.";
				res.status(status).send(result);
			}
		});		
	}
}
