var model  = require('../../../../models/index.model');
var config = require('../../../../config/index');
const mysqldb 	= require('../../../../config/mysqldb');
var async = require("async");

module.exports = {
	list : (req,res) => {
		let result = {};
		let status = 200;
		var err = '';
		var skip = 0;
		if(req.query.pageno > 1){
			skip = parseInt(req.query.limit)*parseInt(req.query.pageno) - parseInt(req.query.limit);
		}
		var limit = req.query.limit ? parseInt(req.query.limit) : 10;
		var search = { status : "1" }; 
		if(req.query.cat_id != 0){
			search.cat_id = parseInt(req.query.cat_id);
		}
		if(req.query.shop_id != 0){
			search.shop_id = parseInt(req.query.shop_id);
		}
		console.log(search);  
		console.log(skip);  
		console.log(limit);  
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
		   if (!err) {
			  result.status = status;
			  result.image_original = config.constant.SHOWPRODUCTIMAGE;
			  result.image_thumb = config.constant.SHOWPRODUCTIMAGETHUMB1;
			  result.result = result_data;
			} else {
			  status = 500;
			  result.status = status;
			}
			res.status(status).send(result);
		})   
	},
	
	details : (req,res) => {
		let result = {};
		let status = 200; 
		model.product.aggregate([
			{
				$match : 
				{
					status : "1",
					_id : parseInt(req.query.id)
				}
			},
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
			}
		]).exec(function(error, data){
			 if (!error) {
			  result.status = status;
			  result.result = data;
			  result.image_original = config.constant.SHOWPRODUCTIMAGE;
			  result.image_thumb = config.constant.SHOWPRODUCTIMAGETHUMB1;
			} else {
			  status = 500;
			  result.status = status;
			}
			res.status(status).send(result);
		}); 		 
	},
	
	auto_search : async (req, res) => {
		let result = {};
		let status = 200;
		let data = [];
		async.waterfall([
			function(callback){
				if(req.query.type == "product"){
					config.helpers.product.product_search(req, function(product){
						callback(null, product)
					});
				}
				else if(req.query.type == "shop"){
					config.helpers.product.shop_search(req, function(shop){
						callback(null, shop);
					});
				}else{
					callback(null, data);
				}
			}
		], function(error, search_data){
			 result.status = status;
			 result.data = search_data;
			 res.status(status).send(result);
		})
	},
	
	package_unit_list : (req, res) => {
		let status = 200;
		let result = {}
		async.parallel({
			package : function(callback){
				config.helpers.product.get_package_data(req, (package_data) =>{
					callback(null, package_data);
				});
			},
			unit : function(callback){
				config.helpers.product.get_unit_data(req, (unit_data) =>{
					callback(null, unit_data);
				});
			}
		}, function(error, result_data){
			result.status = status;
			result.data = result_data;
			res.status(status).send(result);
		});
	},
	
	create_seller_product : (req, res) => {
		let result = {};
		let status = 200;
		let data = [];
		async.waterfall([
			function(callback){
				let condition = "size = '"+req.body.size+"' AND grade = '"+req.body.grade+"'";
				config.helpers.query.select_data("smm_standard_badge", condition, function(badge_data){
					console.log(badge_data);
					if(badge_data && badge_data.length > 0){
						callback(null, badge_data[0]);
					}else{
						result.status = 500;
						result.msg = req.__("select_product_badge");
						res.status(status).send(result);
					}
				});
			},
			function(budget_data, callback){
				config.helpers.product.generate_sku(req, (sku) => {
					req.body.sku = sku;
					callback(null, budget_data);
				});
			},
			function(badge_data, callback){
				config.helpers.product.save_product(req, badge_data, function(product){
					callback(null, product);
				});				
			}
		], function(error, search_data){
			 result.status = status;
			 //result.data = search_data;
			 result.msg = req.__("product_added_successfully");
			 res.status(status).send(result);
		})
	},
	
	update_seller_product : (req, res) => {
		let result = {};
		let status = 200;
		let data = [];
		async.waterfall([
			function(callback){
				let condition = "size = '"+req.body.size+"' AND grade = '"+req.body.grade+"'";
				config.helpers.query.select_data("smm_standard_badge", condition, function(badge_data){
					console.log(badge_data);
					if(badge_data && badge_data.length > 0){
						callback(null, badge_data[0]);
					}else{
						result.status = 500;
						result.msg = req.__("select_product_badge");
						res.status(status).send(result);
					}
				});
			},
			function(badge_data, callback){
				config.helpers.product.update_product(req, badge_data, function(product){
					callback(null, product);
				});				
			}
		], function(error, search_data){
			 result.status = status;
			 result.data = search_data;
			 result.msg = req.__("product_added_successfully");
			 res.status(status).send(result);
		})
	},
	
	seller_product : (req,res) => {
		let result = {};
		let status = 200;
		var err = '';
		var skip = 0;
		if(parseInt(req.params.pageno) > 1){
			skip = parseInt(req.query.limit)*parseInt(req.query.pageno) - parseInt(req.query.limit);
		}
		var limit = req.query.limit ? parseInt(req.query.limit) : 10;
		var search = { status : "1", shop_id : parseInt(req.query.id)}; 
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
				  { $limit : limit }				  
				]).exec(function(err,data){
				  if(err){console.log(err)}
				callback(null,data)
			  });
			}
		},function(err,result_data){
		  //res.json(result);
		   if (!err) {
			  result.status = status;
			  result.result = result_data;
			} else {
			  status = 500;
			  result.status = status;
			}
			res.status(status).send(result);
		})   
	},
	
	delete_product_image : (req, res) => {
		let status = 200;
		let result = {};
		async.waterfall([
			function(callback){
				model.product.find({ _id : parseInt(req.body.id)}).exec(function(error, product){
					console.log(product);
					if(!error && product && product.length > 0){
						let product_image = product[0].image;
						let default_image = product[0].thumbnail_image;
						let product_new_image = product_image.remove(req.body.name);					
						if(product_new_image.indexOf(default_image) > -1){
							let image_data = {
								image : product_new_image,
							}
							model.product.updateOne({ _id : parseInt(req.body.id) }, { $set : image_data }, { upsert: true, multi: true }, (error, updatess) =>{
								let query = "delete from smm_product_image where product_id = "+parseInt(req.body.id)+" and image = '"+req.body.name+"'";
								mysqldb.query(query, (error, delete_data) => {
									callback(null, delete_data);
								});
							});
						}else{
							let imagedata = {
								thumbnail_image : (product_new_image && product_new_image.length > 0) ? product_new_image[0] : '',
								image : (product_new_image && product_new_image.length > 0) ? product_new_image : [],
							}
							let thumbnail_image = (product_new_image && product_new_image.length > 0) ? product_new_image[0] : '';
							model.product.updateOne({ _id : parseInt(req.body.id) }, { $set : imagedata }, { upsert: true, multi: true }, (error, updatess) =>{
								let query = "delete from smm_product_image where product_id = "+parseInt(req.body.id)+" and image = '"+req.body.name+"'";
								let query1 = "update smm_product set thumbnail_image = '"+thumbnail_image+"' where id = "+parseInt(req.body.id)+"";
								mysqldb.query(query, (error, delete_data) => {
									mysqldb.query(query1, (error, delete_data) => {
									callback(null, delete_data);
									});
								});
							});
						}
					}else{
						result.status = 500;
						result.msg = res.__('something_wrong');
						res.status(status).send(result);
					}
				});
			}
		], function(error, result_data){
			result.status = status;
			result.msg = req.__("delete_successfully");
			res.status(status).send(result);
		})
	},
		
	delete_product : async (req, res) => {
		let result = {};
		let status = 200;
		async.waterfall([
			function(callback){
				let query = "delete from smm_product where id = "+parseInt(req.body.id)+"";
				let deletequery = "delete from smm_product_image where product_id = "+parseInt(req.body.id)+"";
				mysqldb.query(query, (error, data) => {
					mysqldb.query(deletequery, (error, data) => {
						callback(null, data);
					});
				});
			},
			async function(data, callback){
				await model.product.remove({ _id : parseInt(req.body.id)});
				callback(null, data);
			}
		], function(error, result_data){
			result.status = status;
			result.msg = req.__('product_has_been_deleted_successfully');
			res.status(status).send(result);
		})
	},
	
	related_product : (req, res) => {
		console.log(req.query);
		let result = {};
		let status = 200;
		var result_data= {};
		async.waterfall([
			function(callback){
				let condition = { _id : parseInt(req.query.id )};
				model.product.aggregate([
					{
						$match : 
						{
							_id : parseInt(req.query.id)
						}
					},
					{
						$lookup :
						{
							from : 'category',
							localField : 'cat_id',
							foreignField : '_id',
							as : 'cat_data'
						}
					},
					{
						$unwind : '$cat_data'
					},
					{
						$project :
						{
							_id : 0,
							shop_id : 1,
							cat_id : 1,
							cat_data : 1
						}
					}
				]).exec(function(error, product_data){
					callback(null, product_data)
				});
			}			
		], function(error, result_data){
			let product_data = result_data[0];
			let cat_data = result_data[0].cat_data;
			req.body.shop_id = product_data.shop_id;
			req.body.cat_id = product_data.cat_data._id;
			config.helpers.product.check_get_product_review(req, (data) => {
				//console.log(data);
				if(data.length > 0){
					model.product.aggregate([
						{
							$match : 
							{ 
								_id : 
								{ 
									$in : data 
								} 
							}
						},
						{
							$lookup :
							{
								from : 'category',
								localField : 'cat_id',
								foreignField : '_id',
								as : 'cat_data'
							}
						},
						{
							$unwind : "$cat_data"
						},
						{
							$lookup :
							{
								from : 'shop',
								localField : 'shop_id',
								foreignField : '_id',
								as : 'shop_data'
							}
						},
						{
							$unwind : "$shop_data"
						},
						{
							$lookup : 
							{
								from : "standard_badge",
								localField : 'badge_id',
								foreignField : '_id',
								as : 'badge_data'
							}
						},
						{
							$unwind : "$badge_data"
						}
					]).exec(function(error, related_product){
						//console.log(related_product);
						result.status = status;
						result.cat_data = cat_data;
						result.data = related_product;
						res.status(status).send(result);
					});					
				}else{
					result.status = status;
					result.cat_data = cat_data;
					result.data = [];
					res.status(status).send(result);
				}
			})
		})
	}	
}
