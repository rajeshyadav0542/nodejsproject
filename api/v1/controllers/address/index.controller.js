var model  = require('../../../../models/index.model');
var config = require('../../../../config/index');
var constant = require('../../../../config/constant');
var async = require('async');
var mysqldb 	= require('../../../../config/mysqldb');
var moment = require('moment');
module.exports = {		
	country : (req, res)=> {	
		let result = {};
		let status = 200;
		var query = "SELECT t1.id, t1.country_code, t1.short_code, t1.country_flag, t2.country_name,t2.province_state_header, t2.city_district_header, t2.sub_district_header FROM smm_country t1 INNER JOIN smm_country_desc t2 ON t1.id = t2.country_id AND t1.status = '1' AND t2.lang_id = "+1+" AND t1.is_default = '1'";
		mysqldb.query(query, function(err, country_data){
		  if (!err && country_data) {
			result.status = status;
			result.result = country_data;		            
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
	
	state : (req, res) => {
		let result = {};
		let status = 200;
		var query = "SELECT t1.id, t2.province_state_name from smm_country_province_state t1 INNER JOIN smm_country_province_state_desc t2 ON t1.id = t2.province_state_id AND t2.lang_id ="+parseInt(req.query.lang_id)+" AND t1.status = '1' AND t1.country_id ="+parseInt(req.query.country_id)+" ORDER BY t1.id";
		//console.log(query);
		mysqldb.query(query, function(err, state_data){
			if(!err && state_data){
				result.status = status;
				result.result = state_data;		            
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
	
	city : (req, res) => {
		let result = {};
		let status = 200;
		var query = "SELECT t1.id, t1.zip, t1.province_state_id, t2.city_district_name from smm_country_city_district t1 INNER JOIN smm_country_city_district_desc t2 ON t1.id = t2.city_district_id AND t2.lang_id ="+parseInt(req.query.lang_id)+" AND t1.status = '1' AND t1.province_state_id = "+parseInt(req.query.state_id)+" AND t1.country_id ="+parseInt(req.query.country_id)+" ORDER BY t1.id";
		//console.log(query);
		mysqldb.query(query, function(err, state_data){
			if(!err && state_data){
				result.status = status;
				result.result = state_data;		            
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
	
	district : (req, res) => {
		let result = {};
		let status = 200;
		var query = "SELECT t1.id, t1.district_id, t2.sub_district_name from smm_country_sub_district t1 INNER JOIN smm_country_sub_district_desc t2 ON t1.id = t2.sub_district_id AND t2.lang_id ="+parseInt(req.body.lang_id)+" AND t1.status = '1' AND t1.district_id ="+parseInt(req.body.district_id)+" ORDER BY t1.id";
		//console.log(query);
		mysqldb.query(query, function(err, state_data){
			if(!err && state_data){
				result.status = status;
				result.result = state_data;		            
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
	
	add_address : (req, res) => {
		//console.log(req.body);
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
				var insert_data = {
				user_id			: req.body.user_id,
				title 			: req.body.title,
				salutation 		: req.body.salutation ? req.body.salutation : '',
				first_name 		: req.body.first_name,
				last_name 		: req.body.last_name ? req.body.last_name : '',			
				email 			: req.body.email ? req.body.email : '',			
				address 		: req.body.address ? req.body.address : '',			
				road 			: req.body.road ? req.body.road : '',			
				country_id			: 0,
				province_state_id	: 0,
				city_district_id	: 0,
				sub_district_id		: 0,
				sequence		: 0,
				city_district 	: req.body.city_district ? req.body.city_district : '',
				sub_district 	: req.body.sub_district ? req.body.sub_district : '',
				province_state 	: req.body.province_state ? req.body.province_state : '',
				zip_code 		: req.body.zip_code ? req.body.zip_code : '',
				ph_number 		: req.body.ph_number ? req.body.ph_number : '',
				company_name 	: req.body.company_name ? req.body.company_name : '',
				branch 			: req.body.branch ? req.body.branch : '',
				tax_id 			: req.body.tax_id ? req.body.tax_id : '',
				company_address : req.body.company_address ? req.body.company_address : '',
				status 			: '1',	
				is_company_add	: '0',
				created_at		: new Date(),
				updated_at		: new Date()
			}
			if(req.body.tax_invoice == '1' ){
				insert_data.is_company_add = '1';
			}
			if(result_data.update_default == true){
				insert_data.is_default = result_data.is_default;
				insert_data.address_type = result_data.address_type; 
			}
			//~ if(req.body.shipping_address == '1'){
				//~ insert_data.address_type = '1';
			//~ }	
			//~ if(req.body.billing_address == '1'){
				//~ insert_data.address_type = '2';
			//~ }	
			//~ if(req.body.shipping_address == '1' && req.body.billing_address == '1'){
				//~ insert_data.is_default = '1';
				//~ insert_data.address_type = '3';
			//~ }
			mysqldb.query('INSERT INTO smm_shipping_address SET ?', insert_data, function(err, save_result, fields) {				
				if(!err){
					result.status = status;
					result.msg = "Address save successfully";		            
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
	}	
	
}
