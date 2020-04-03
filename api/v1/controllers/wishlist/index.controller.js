var model  = require('../../../../models/index.model');
var async = require("async");
module.exports = {
	all : (req,res) => {
		let result = {};
		let status = 200;
		var err = '';
		var skip = 0;
		if(parseInt(req.query.pageno) > 1){
			skip = parseInt(req.query.pageno)*parseInt(req.query.limit) - parseInt(req.query.limit);
		}
		var limit = req.query.limit ? parseInt(req.query.limit) : 10;
		var search = { user_id : parseInt(req.query.user_id)}; 		
		async.parallel({
		  count : function(callback) {
			   model.wishlist.countDocuments(search).exec(function(err,data_count){				   
				  callback(null,data_count)
				})
			},
			data : function(callback) {
			  model.wishlist.aggregate([
				  { $match : search },
				  { $sort : { created_at : -1 }},
				  { $skip :skip },
				  { $limit : limit },
				  {
					  $lookup : 
					  {
						from : "product",
						localField : "product_id",
						foreignField : "_id",
						as : "product_data"
					  }
				  },
				  {
					 $unwind : "$product_data" 
				  },
				  { 
					  $replaceRoot: 
					  { 
						  newRoot: "$product_data" 
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
	
	add : (req, res) => {
		let result = {};
		let status = 200;
		let wish_data = {
			user_id : parseInt(req.query.user_id),
			product_id : parseInt(req.query.product_id),
			created_at : new Date(),
			updated_at : new Date()
		}
		async.waterfall([
			function(callback){
				model.wishlist.find({ user_id : parseInt(req.query.user_id), product_id : parseInt(req.query.product_id)}, (error, wishdata) => {
					if(wishdata && wishdata.length >0){
						result.status = status;
						result.msg = "You have already wishlist this product successfully";
						res.status(status).send(result);
					}else{
						callback(null, wishdata);
					}
				})
			}
		], function(error, result_data){
			model.wishlist.create(wish_data, (err, data) => {
				if(!err){
					model.wishlist.update({_id : data._id }, {$unset: {__v:1}}, (err, res_daa) => {
						result.status = status;
						result.msg = "Wishlist product successfully";
						res.status(status).send(result);
					});
				}else{
					result.status = 500;
					result.msg = "Something went wrong, Please check";
					res.status(status).send(result);
				}
			});
		});		
	},
	
	remove : (req, res) => {
		let result = {};
		let status = 200;
		let condition = {
			user_id : parseInt(req.body.user_id),
			product_id : parseInt(req.body.product_id)
		}
		model.wishlist.remove(condition, (err, data) => {
			console.log(err);
			if(!err){
				result.status = status;
				result.msg = "Product remove from wishlist successfully";
				res.status(status).send(result);
			}else{
				result.status = 500;
				result.msg = "Data not found";
				res.status(status).send(result);
			}
		});
	}
	
	
	
}
