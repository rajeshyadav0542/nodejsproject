var model  = require('../../../../models/index.model');
const jwt = require('jsonwebtoken');
var bcrypt = require("bcrypt-nodejs");
var async = require("async");
module.exports = {
	all : (req,res) => {
		let result = {};
		let status = 200;
		var err = '';
		var skip = req.body.skip ? parseInt(req.body.skip) : 0;
		var limit = req.body.limit ? parseInt(req.body.limit) : 10;
		var search = { status : "1", parent_id : 0 };   
		async.parallel({		 
			data : function(callback) {
				model.category.aggregate([
					{ $match : search },
					{ 
						$sort : { _id : 1 }
					},	
					{ $graphLookup: 
						{
							from: "category",
							startWith: "$_id",
							connectFromField: "_id",
							connectToField: "parent_id",
							as: "subCategory"
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
			  result.result = result_data.data;
			} else {
			  status = 500;
			  result.status = status;
			  result.error = err;
			}
			res.status(status).send(result);
		})   
	}
}
