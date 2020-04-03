var model  = require('../../../../models/index.model');
var config = require('../../../../config/index');
var async = require('async');
var mysqldb 	= require('../../../../config/mysqldb');
module.exports = {
	all : (req,res) => {
		let result = {};
		let status = 200;
		var query = "SELECT * FROM smm_shipping_address where user_id = "+parseInt(req.query.user_id)+" ORDER BY is_default DESC, updated_at DESC";
		//console.log(query);
		mysqldb.query(query, function(err, shipping_data){
		  if (!err && shipping_data) {
			result.status = status;
			result.data = shipping_data;		            
			res.status(status).send(result);
		  }
		  else {
			status = 500;
			result.status = status;
			result.msg = `There is something wrong Please try again`;
			res.status(status).send(result);
		  }
	  	});
	},
	
	update : (req, res) => {
		let result = {};
		let status = 200;		
		async.waterfall([
			function(callback){
				var condition = 'province_state_name ="'+req.body.province_state+'"'; 
				config.helpers.query.select_data('smm_country_province_state_desc', condition, function(select_data){
					if(select_data && select_data.length >0){
						callback(null, select_data)
					}else{
						status = 500;
						result.status = status;
						result.msg = { 
							'province_state' : 'Province is not matched with database' 
						};
						res.status(status).send(result);
					}
				});
			},
			function(data, callback){
				var condition = 'city_district_name ="'+req.body.city_district+'"'; 
				config.helpers.query.select_data('smm_country_city_district_desc', condition, function(select_data){
					if(select_data && select_data.length >0){
						callback(null, select_data)
					}else{
						status = 500;
						result.status = status;
						result.msg = { 
							'city_district' : 'City is not matched with database' 
						};
						res.status(status).send(result);
					}
				});
			},
			function(data, callback){
				config.helpers.user.check_address(req, (record) => {
					callback(null, record);
				});
			}
		], function(error, result_data){
			var insert_data = "title = '"+req.body.title+"', first_name = '"+req.body.first_name+"', last_name = '"+req.body.last_name+"', address = '"+req.body.address+"', road = '"+req.body.road+"' ";
				insert_data += ",city_district = '"+req.body.city_district+"', province_state = '"+req.body.province_state+"', zip_code = '"+req.body.zip_code+"', ph_number = '"+req.body.ph_number+"'";
			if(req.body.tax_invoice == '1' ){
				insert_data += ", company_name = '"+req.body.company_name+"', branch = '"+req.body.branch+"', tax_id = '"+req.body.tax_id+"', company_address = '"+req.body.company_address+"', is_company_add = '1'";
			}
			if(req.body.branch){
				insert_data += ",branch = '"+req.body.brand+"'";
			}
			insert_data += ",is_default = '"+result_data.is_default+"'";
			insert_data += ",address_type = '"+result_data.address_type+"'";
			
			var query = "UPDATE smm_shipping_address SET "+insert_data+" WHERE id = "+parseInt(req.body.id)+"";
			mysqldb.query(query, (err, result_data) => {
				console.log(err);
				if(!err){
					result.status = status;
					result.msg = "Address updated successfully";		            
					res.status(status).send(result);
				}
				else {
					status = 500;
					result.status = status;
					result.msg = `There is something wrong Please try again`;
					res.status(status).send(result);
				}
			});
		});	
	},
	
	shipping_status : (req, res) => {
		let result = {};
		let status = 200;
		var insert_data = "is_default = '1', address_type ='"+req.body.address_type+"'";
		var query = "UPDATE smm_shipping_address SET "+insert_data+" WHERE id = "+parseInt(req.body.address_id)+"";
		mysqldb.query(query, (err, result_data) => {
			if(!err){
				config.helpers.user.update_address(req, function(select_data){
					result.status = status;
					result.msg = "Address updated successfully";		            
					res.status(status).send(result);
				});
			}
			else {
				status = 500;
				result.status = status;
				result.msg = `There is something wrong Please try again`;
				res.status(status).send(result);
			}
		});
	},
	
	delete_address : (req, res) => {
		console.log(req.query);
		console.log(req.body);
		let status = 200;
		let result = {};
		let query = "delete from smm_shipping_address where id = "+parseInt(req.body.id)+" and user_id = "+parseInt(req.body.user_id)+"";
		mysqldb.query(query, (error, deldata) => {
			if(!error){
				result.status = status;
				result.msg = "User address deleted successfully";
				res.status(status).send(result);
			}else{
				result.status = 500;
				result.msg = "Something went wrong";
				res.status(status).send(result);
			}
		});
	}
}
