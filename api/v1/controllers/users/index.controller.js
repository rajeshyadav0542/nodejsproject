var model  = require('../../../../models/index.model');
var config = require('../../../../config/index');
var constant = require('../../../../config/constant');
const jwt = require('jsonwebtoken');
var bcrypt = require("bcryptjs");
var async = require('async');
var mysqldb 	= require('../../../../config/mysqldb');
var moment = require('moment');
module.exports = {
	all:(req,res) => {
		let result = {};
		let status = 200;
		var err = '';
        model.user.find({}, (err, users) => {
            if (!err) {
              result.status = status;
              result.result = users;
            } else {
              status = 401;
              result.status = status;
            }
            res.status(status).send(result);
       });
	},	
	
	generate_token : (req, res) =>{
		var locale = 'th';
		req.setLocale(locale);
		var result = {};
		const payload = { user : "ssm_project", user_id : 70, exp : Math.floor(Date.now() / 1000) + (60 * 60 * 24)};               
		const secret = constant.JWT_SECRET;
		const token = jwt.sign(payload, secret);
		let status = 200;
		result.token = token;
		result.status = status;
		result.msg = res.__('Hello');
		res.status(status).send(result);
	},
	
	login : (req, res)=> {
		let result = {};
		let status = 200;
		var query = "Select * from "+constant.USERS+" where (email = '"+ req.query.email + "' AND status ='1') OR (ph_number = '" + req.query.email + "' AND status ='1')";
		console.log(query);
		mysqldb.query(query, function(err, user_data){
	          if (!err && user_data.length > 0 && user_data[0].verified == '1') {
		          	var user = user_data[0];
		          	bcrypt.compare(req.query.password, user.password, function(err, match) {
					  if (match) {
						user.image_path = constant.SHOWUPLOADUSER;
		                const payload = { user: user.name, user_id:user.id ,exp: Math.floor(Date.now() / 1000) + (60 * 60)};               
		                const secret = constant.JWT_SECRET;
		                const token = jwt.sign(payload, secret);
		                result.token = token;
		                result.status = status;
		                result.msg = res.__('User login successfully');;
		                result.result = user;
		              } else {
		                status = 500;
		                result.status = status;
		                result.msg = res.__('please_enter_correct_password');
		              }
		              res.status(status).send(result);
				  });
	          }else if(!err && user_data.length > 0 && user_data[0].verified == '0') {
					status = 500;
					result.status = status;
					result.msg = res.__('user_verification_still_pending');
					res.status(status).send(result);
			  } 
	          else {
	            status = 500;
	            result.status = status;
	            result.msg = res.__('something_wrong');
	            res.status(status).send(result);
	          }
	  	});
	},	
	
	registration : (req, res) => {
		let result = {};
		let status = 200;
		req.body.createdAt = new Date();
		req.body.updatedAt = new Date();
		req.body.deletedAt = 0;	
		//console.log(req.body);
		async.waterfall([
			function(callback){
				var query = "Select * from "+constant.USERS+" where (email = '"+ req.body.email + "' AND status ='1') OR (ph_number = '" + req.body.ph_number + "' AND status ='1')";
				console.log(query);
				mysqldb.query(query, function(err, result){
					 bcrypt.genSalt(10, function (err, salt) {
						bcrypt.hash(req.body.password, salt, function(err, hash) {
							req.body.confpassword = hash;
							callback(null, result);
						});
					});
				});
			}
		], function(error, result_data){
			if(result_data && result_data.length > 0){
				status = 500;
				let msg = req.__('email_exist');
				if(req.body.ph_number){
					msg = req.__('phone_exist');
				}
	            result.status = status;
	            result.type = '';
	            result.error = msg;
				res.status(status).send(result);
			}else{
				var login_use = "email";
				if(req.body.ph_number){
					login_use = "ph_no";
				}
				var ipaddress = req.connection.remoteAddress;
				var ip = ipaddress.split(':').pop();
				var last_name = req.body.last_name ? req.body.last_name : '';
				var display_name = req.body.first_name + (last_name ? (" " + last_name) : '');				
				var insert_data = {
					user_type 		: req.body.user_type,
					first_name 		: req.body.first_name,
					salutation 		: req.body.salutation ? req.body.salutation : '',
					middle_name 	: req.body.middle_name ? req.body.middle_name : '',
					last_name 		: req.body.last_name ? req.body.last_name : '',
					display_name	: display_name,
					password		: req.body.confpassword,
					//email	 		: req.body.email ? req.body.email : '',
					//ph_number	 	: req.body.ph_number ? req.body.ph_number : '',
					dob				: req.body.dob ? req.body.dob : '',
					country			: 0,
					login_use 		: login_use,
					isd_code		: 0,
					remember_token 	: req.body.remember_token ? req.body.remember_token : '',	
					email_token 	: req.body.email_token ? req.body.email_token : '',	
					phone_otp 		: req.body.phone_otp ? req.body.phone_otp : '',	
					phone_otp_token	: req.body.phone_otp_token ? req.body.phone_otp_token : '',	
					image 			: '',
					group_id		: '1',
					status 			: '1',
					verified		: '0',
					register_step 	: '0',					
					login_use 		: login_use,
					created_at		: new Date(),
					updated_at		: new Date(),
					register_from	: 'mobile',
					register_ip		: ip,
					facebook_id		: req.body.facebook_id ? req.body.facebook_id : '',
					time_zone		: req.body.time_zone ? req.body.time_zone : '',
					
				}
				if(req.body.ph_number){
					insert_data.ph_number = req.body.ph_number;
				}
				if(req.body.email){
					insert_data.email = req.body.email;
				}
				//console.log(insert_data);
				mysqldb.query('INSERT INTO '+constant.USERS+' SET ?', insert_data, function(err, save_result, fields) {
					//console.log(err);
					 if (!err) {
						 if(req.body.email){
							config.helpers.user.send_otp_email(req, save_result.insertId, function(maildata){					
								status = 200;
								result.status = status;
								result.result = save_result.insertId;
								res.status(status).send(result);
							});
						}else{
							config.helpers.user.send_otp_mobile(req, function(otpdata){
								if(otpdata != 2){
									var dateTime = moment(now).format("YYYY-MM-DD HH:mm:ss");
									var query = "UPDATE "+constant.USERS+" SET phone_otp = '"+otpdata+"', otp_generated_at = '"+ dateTime +"' WHERE id = "+parseInt(save_result.insertId)+"";
									mysqldb.query(query, (err, otps ) => {	
										status = 200;
										result.status = status;
										result.msg = req.__("otp_send_successfully");
										result.result = save_result.insertId;
										res.status(status).send(result);
									});
								}else{
									var query = "DELETE FROM "+constant.USERS+" WHERE id = "+parseInt(save_result.insertId)+"";
									mysqldb.query(query, (err, otps ) => {	
										status = 500;
										result.status = status;
										result.msg = req.__("please_enter_correct_mobile_number");
										res.status(status).send(result);
									});
								}
							});
						}
					  } else {						
						var msg = '';
						var type = '';						
						status = 500;
						result.status = status;
						result.type = type;
						result.error = err.sqlMessage;
						res.status(status).send(result);
					}		          
		        });
			}
		})
	},	
	
	send_sms : (req, res) => {
		console.log(req.body);
		var result = {};
		config.helpers.user.send_otp_email(req, req.body.user_id, function(maildata){
			console.log(maildata);					
			status = 200;
			result.status = status;
			result.result = req.body.user_id;
			res.status(status).send(result);
		});
	},
	
		
	verify_otp : (req, res) => {
		//console.log(req.query);
		let result = {};
		let status = 200;
		var err = '';
		var ANDCONDITION = " AND phone_otp = '"+ req.query.otp +"'";
		if(req.query.type == 'email'){
			ANDCONDITION = " AND email_token = '"+ req.query.otp +"'";
		}
		
		async.waterfall([
			function(callback){
				var condition = "id = "+parseInt(req.query.user_id)+" "+ANDCONDITION+"";
				config.helpers.query.select_data(constant.USERS, condition, function(select_data){
					console.log(select_data);
					if(select_data && select_data.length > 0){
						callback(null, select_data);
					}else{
						result.status = 500;
						result.msg = req.__("Please check otp or user id");
						res.status(status).send(result);
					}
				});
			}
		], function(error, result_data){
			var update_data = "register_step = '1',verified = '1'";
			var new_data = '';
			if(req.query.type == 'email'){
				new_data = " ,email_token = ''";
				update_data = update_data.concat(new_data);
			}
			if(req.query.type != 'email'){
				new_data = " ,phone_otp = ''";
				update_data = update_data.concat(new_data);
			}
			var query = "UPDATE "+constant.USERS+" SET "+update_data+"  WHERE id = "+parseInt(req.query.user_id)+" "+ANDCONDITION+"";
			mysqldb.query(query, function(err, otps){
				console.log(err);
				console.log(otps);
				if (!err && otps.affectedRows == 1 && otps.changedRows == 1) {
				  result.status = status;
				  result.msg = req.__("otp_verify");
				  result.result = req.body;
				}
				else if (!err && otps.affectedRows == 1 && otps.changedRows == 0) {
					result.status = 404;
					result.msg = req.__("user_already_verify");
					result.result = req.body;
				 } 
				else {
				  status = 500;
				  result.status = status;
				  result.msg = res.__('something_wrong');
				}
				res.status(status).send(result);
			});
		});		
	},
	
	resend_otp : (req, res) => {
		let result = {};
		let status = 200;
		let query = "select * from "+constant.USERS+" where id = "+parseInt(req.body.id)+" and status = '1' and verified = '1'";
		mysqldb.query(query, (error, result_data) => {
			console.log(result_data);
			if(result_data && result_data.length > 0){
				let data = result_data[0];
				if(data.email){
					config.helpers.user.send_otp_email(req, req.body.id, function(senddata){	
						result.status = status;
						result.msg = 'Otp send successfully';
						res.status(status).send(result);
					});
				}else{
					config.helpers.user.send_otp_mobile(req, function(senddata){
						var dateTime = moment(now).format("YYYY-MM-DD HH:mm:ss");
						var query = "UPDATE "+constant.USERS+" SET phone_otp = '"+senddata+"', otp_generated_at = '"+ dateTime +"' WHERE id = "+parseInt(req.body.id)+"";
						mysqldb.query(query, (err, otps ) => {		
							result.status = status;
							result.msg = req.__('otp_send_successfully');
							res.status(status).send(result);
						});
					});

				}
			}else{
				result.status = 500;
				result.msg = res.__('something_wrong');
				res.status(status).send(result);
			}
		});
	},
	
	sendOtp_old : (req, res) => {
		let result = {};
		let status = 200;		
		let value = Math.floor(1000 + Math.random() * 9000);
		let msg = '';
		var now = new Date();
		async.waterfall([
			function(callback){
				config.helpers.user.send_otp(req,function(senddata){
					callback(null, senddata)
				});
			}
		], function(error, result){
			if(result != 2){
				var dateTime = moment(now).format("YYYY-MM-DD HH:mm:ss");
				var query = "UPDATE "+constant.USERS+" SET phone_otp = '"+value+"', otp_generated_at = '"+ dateTime +"' WHERE id = "+parseInt(req.body.user_id)+"";
				mysqldb.query(query, (err, otps ) => {		   
					if (!err && otps.affectedRows == 1 && otps.changedRows == 1) {
						req.body.otp = value;
						config.helpers.user.send_otp(req,function(maildata){							
						  result.status = status;
						  result.msg = "Otp send successfully";
						  result.result = req.body;
						  res.status(status).send(result);
						});
					}
					else {
					  status = 500;
					  result.status = status;
					  result.msg = "Somethen went wrong";
					  res.status(status).send(result);
					}            
				});  
			}else{
				status = 500;
				result.status = status;
				result.msg = "Somethen went wrong";
				res.status(status).send(result);
			}
		});		  
	},
	
	update_password : (req, res) => {
		let status = 200;
		let result = {};
		async.waterfall([
			function(callback){
				var condition = 'status = "1" AND verified = "1" AND id ="'+req.body.user_id+'"'; 
				config.helpers.query.select_data(constant.USERS, condition, function(data){
					if(data && data.length >0){
						var query = "UPDATE smm_users SET password = '"+bcrypt.hashSync(req.body.password)+"' WHERE login_use = 'email' AND id = '"+req.body.user_id+"'";
						mysqldb.query(query, (err, otps ) => {
							if(!err){
								callback(null, otps);
							}else{
								status = 500;
								result.status = status;
								result.msg = res.__('something_wrong');
								res.status(status).send(result);
							}
						})
					}else{
						status = 500;
						result.status = status;
						result.msg = res.__('something_wrong');
						res.status(status).send(result);
					}
				});
			}
		], function(error, result_data){
			result.status = status;
			result.msg = req.__("user_password_change_successfully");
			res.status(status).send(result);
		});
	},
	
	forgot_password : (req, res) => {
		let status = 200;
		let result = {};
		var condition = 'status = "1" AND verified = "1" AND email ="'+req.body.email+'"'; 
		async.waterfall([
			function(callback){
				console.log(condition);
				config.helpers.query.select_data(constant.USERS, condition, function(select_data){
					console.log(select_data);
					if(select_data && select_data.length > 0){
						var user = select_data[0];
						config.helpers.user.send_forgotpassword_email(req, user.id, function(data){
							console.log(data)
							if(data != 2){
								callback(null, data);
							}else{
								status = 500;
								result.status = status;
								result.msg = res.__('something_wrong');
								res.status(status).send(result);
							}
						});
					}else{
						status = 500;
						result.status = status;
						result.msg = res.__('something_wrong');
						res.status(status).send(result);
					}
				});
			}
		], function(error, result_data){
			result.status = 200;
			result.msg = req.__("verification_code_send_successfully");
			res.status(status).send(result);
		})
	},

	forgot_password_old : function(req,res){		
		let status = 200;
		let result = {};
		var condition = 'status = "1" AND verified = "1" AND email ="'+req.body.email+'"'; 
		console.log(condition);
		config.helpers.query.select_data(constant.USERS, condition, function(select_data){
			if(select_data && select_data.length > 0){
				var user = select_data[0];
				var password = parseInt(Math.random()*100000000);
				let mailOptions = {
		          from: config.constant.mailconfig.from, // sender address
		          to: user.email, // list of receivers
		          subject: "Forgot password", // Subject line
		          text: "test", // plain text body
		          html: 'Hi '+user.first_name+' '+(user.last_name?user.last_name:'')+'<br/><br/>Please find below, your new login deatils: <br/></br>EmailId : '+user.email+ '<br/><br/>Password: '+password
		      };		       
		      config.helpers.user.send_email(mailOptions,function(maildata){
				  if(maildata != 2){
						var query = "UPDATE "+constant.USERS+" SET password = '"+bcrypt.hashSync(password)+"' WHERE login_use = 'email' AND email = '"+req.body.email+"'";
						console.log(query);
						mysqldb.query(query, (err, otps ) => {
							result.status = status;
							result.msg = "New login password has been sent to Your Email id";
							res.status(status).send(result);
							//res.json({"status": true,"message":req.__("password has been sent to Your Email id")})
						})
					}else{
						status = 500;
						result.status = status;
						result.msg = res.__('something_wrong');
						res.status(status).send(result);
					}
		      })
			}
			else{	
			 	status = 500;
          		result.status = status;
          		result.msg = "This email is not verified/register. Please choose another.";
        		res.status(status).send(result);
        	}
		})
	},
	
	
	send_email_otp : function(req,res){		
		let status = 200;
		let result = {};
		console.log(req.body);
		async.waterfall([
			function(callback){
				var condition = 'status = "1" AND id ='+parseInt(req.body.user_id)+''; 
				config.helpers.query.select_data(constant.USERS, condition, function(select_data){
					callback(null, select_data)
				});
			}
		], function(error, user_data){
			if(user_data.length > 0){
				let user = user_data[0];
				let value = Math.floor(1000 + Math.random() * 9000);
				let mailOptions = {
		          from: config.constant.mailconfig.from, // sender address
		          to: user.email, // list of receivers
		          subject: req.__("registration_otp"), // Subject line
		          text: "test", // plain text body
		          html: 'Hi '+ user.first_name +' '+(user.last_name ? user.last_name : '' )+'<br/><br/>Please use below otp for email verification.<br/> Otp : ' +value
				};
				var now = new Date();
				var dateTime = moment(now).format("YYYY-MM-DD HH:mm:ss");
				console.log(value);
				console.log(mailOptions);
				var query = "UPDATE "+constant.USERS+" SET email_token = '"+value+"', otp_generated_at = '"+ dateTime +"' WHERE login_use = 'email' AND id = "+parseInt(req.body.user_id)+"";
				console.log(query);
				config.helpers.user.send_email(mailOptions,function(maildata){
					if(maildata != 2){	
						mysqldb.query(query, (err, otps ) => {
							console.log(otps);					
							result.status = status;
							result.msg = req.__("otp_send_register_email");
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
				status = 500;
          		result.status = status;
          		result.msg = req.__("user_does_not_exits");
          		res.status(status).send(result);
			}			
		});		
	},	
	
}
