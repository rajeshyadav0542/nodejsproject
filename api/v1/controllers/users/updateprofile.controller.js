var model  = require('../../../../models/index.model');
var config = require('../../../../config/index');
var constant = require('../../../../config/constant');
var async = require('async');
var fs = require('fs');
var bodyParser = require('body-parser');
var mysqldb 	= require('../../../../config/mysqldb');
var constant = require('../../../../config/constant');
var bcrypt = require("bcryptjs");
module.exports = {
	
	confirm_password : (req,res) => {
		//console.log(req.query);
		let result = {};
		let status = 200;
		var condition = "id = "+parseInt(req.query.user_id)+"";
		config.helpers.query.select_data(constant.USERS, condition, function(user_data){
		 if (user_data && user_data.length > 0){
				var user = user_data[0];
				bcrypt.compare(req.query.password, user.password, function(err, match) {
					if (match) {
						status = 200;
						result.status = status;
						result.result = user;
					  } else {
						status = 500;
						result.status = status;
						result.msg = req.__("please_enter_correct_password");
					  }
					res.status(status).send(result);
			  });
		  }
		  else {
			status = 500;
			result.status = status;
			result.msg = res.__('something_wrong');
			res.status(status).send(result);
		  }
	  	});
	},
	
	check_user_name : (req, res) => {
		let result = {};
		let status = 200;
		async.waterfall([
			function(callback){
				var query = "Select * from "+constant.USERS+" where (email = '"+ req.body.email + "' AND status ='1' AND id != "+parseInt(req.body.user_id)+") OR (ph_number = '" + req.body.email + "' AND status ='1' AND id != "+parseInt(req.body.user_id)+") ";
				mysqldb.query(query, function(err, user_data){
					if(user_data && user_data.length > 0){
						status = 500;
						result.status = status;
						result.msg = req.__("user_already_exist");
						res.status(status).send(result);
					}else{
						 if(req.body.type == 'email'){
							config.helpers.user.send_otp_email(req, req.body.user_id, function(maildata){					
								if(maildata!= 2){
									var query = "UPDATE "+constant.USERS+" SET email = '"+req.body.email+"', verified = '0' WHERE id = "+parseInt(req.body.user_id)+"";
									console.log(query);
									mysqldb.query(query, (err, otps ) => {	
										status = 200;
										result.status = status;
										result.msg = req.__('otp_send_successfully');
										res.status(status).send(result);
									});
								}else{
									status = 500;
									result.status = status;
									result.msg = res.__('something_wrong');
									res.status(status).send(result);
								}
							});
						}else{
							config.helpers.user.send_otp_mobile(req, function(otpdata){
								if(otpdata != 2){
									var dateTime = moment(now).format("YYYY-MM-DD HH:mm:ss");
									var query = "UPDATE "+constant.USERS+" SET ph_number = "+req.body.email+", phone_otp = '"+otpdata+"', verified : '0', otp_generated_at = '"+ dateTime +"' WHERE id = "+parseInt(req.body.user_id)+"";
									mysqldb.query(query, (err, otps ) => {	
										status = 200;
										result.status = status;
										result.msg = req.__('otp_send_successfully');
										res.status(status).send(result);
									});
								}else{									
									status = 500;
									result.status = status;
									result.msg = res.__('something_wrong');
									res.status(status).send(result);
								}
							});
						}
					}
				});
			}
		], function(error, result_data){
			status = 200;
			result.status = status;
			result.msg = req.__("username_updated_successfully");
			res.status(status).send(result);
		});		
	},
	
	update_user_name : (req, res) => {
		var result = {};
		update = "ph_number = '"+req.body.email+"', login_use='ph_no', email =''";
		if(req.body.type=='email'){
			update = "email = '"+req.body.email+"', login_use='email', ph_number =''";
		}
		var query = "UPDATE "+constant.USERS+" SET "+update+" WHERE id = "+parseInt(req.body.user_id)+"";
		console.log(query);
		mysqldb.query(query, (err, otps ) => {
			status = 200;
			result.status = status;
			result.msg = req.__("username_updated_successfully");
			res.status(status).send(result);
		});
	},
	
	update_profile_image : (req, res) => {
		console.log(req.body);
		let status = 200;
		let result = {};
		async.waterfall([
			function(callback){
				if (req.files && Object.keys(req.files).length != 0){   
					var image_path = config.constant.UPLOADUSER;
					var imagethumb_path = config.constant.UPLOADUSERTHUMB;
					console.log(fs.existsSync(image_path));
					if (!fs.existsSync(image_path)) {
						fs.mkdirSync(image_path, 0777);
					}
					if (!fs.existsSync(imagethumb_path)) {
						fs.mkdirSync(imagethumb_path, 0777);
					}
					console.log(Array.isArray(req.files.image));
					var image_name = req.files.image ? req.files.image.name : '';
					var fileExtension = image_name.replace(/^.*\./, '');
					var upload_name = Date.now() + '.'+fileExtension;
					req.files.image.mv(image_path+upload_name, (err,data)=> {
						console.log(err)
						if(!err){
							crop_image = {
								image:upload_name?upload_name:'',
								original:config.constant.UPLOADUSER,
								resize:[{
									path:config.constant.UPLOADUSERTHUMB,
									size:config.constant.UPLOADUSERIMAGETHUMBSIZE,
								}]
							}
							config.helpers.common.resize_image(crop_image, (upload_success)=> {					
								callback(null, upload_name)
							});
						}else{
							result.status = 500;
							result.msg = req.__("image_upload_successfully");
							res.status(status).send(result);
						}
					})
				}else{
					result.status = 500;
					result.msg = req.__("image_upload_successfully");
					res.status(status).send(result);
				}
			}
		], function(error, result_data){
			let query = "update "+constant.USERS+" set image = '"+result_data+"' where id="+parseInt(req.body.user_id)+"";
			mysqldb.query(query, (error, update) => {
				result.status = status;
				result.msg = req.__("image_upload_successfully");
				res.status(status).send(result);
			})
		});	
	},
	
	change_password : (req, res) => {
		let result = {};
		let status = 200;
		async.waterfall([
			function(callback){
				var condition = "id = "+parseInt(req.body.user_id)+"";
				config.helpers.query.select_data('smm_users', condition, function(user_data){
					console.log(user_data);
				if (user_data && user_data.length > 0){
					var user = user_data[0];
					bcrypt.compare(req.body.old_password, user.password, function(err, match) {
						if (match) {
							callback(null, user)
						  } else {
							status = 500;
							result.status = status;
							result.msg = req.__("old_password_not_match");
							res.status(status).send(result);
						  }							
					});
				  }
				  else {
					status = 500;
					result.status = status;
					result.msg = res.__('something_wrong');
					res.status(status).send(result);
				  }
				});
			},
			function(data, callback){
				if(req.body.new_password == req.body.confirm_password){
					 bcrypt.genSalt(10, function (err, salt) {
						bcrypt.hash(req.body.new_password, salt, function(err, hash) {
							req.body.confpassword = hash;
							callback(null, data);
						});
					});
				}else{
					status = 500;
					result.status = status;
					result.msg = req.__('password_confirm_password_not_match');
					res.status(status).send(result);
				}
			}
		],function(error, result_data){
			var query = "UPDATE "+constant.USERS+" SET password = '"+req.body.confpassword+"'  WHERE id = "+parseInt(req.body.user_id)+"";
			mysqldb.query(query, (err, update) => {
				if(err){
					status = 500;
					result.status = status;
					result.msg = res.__('something_wrong');
					res.status(status).send(result);
				}else{
					status = 200;
					result.status = status;
					result.msg = req.__('user_password_update');
					res.status(status).send(result);
				}
			});
		});
	}	
}
