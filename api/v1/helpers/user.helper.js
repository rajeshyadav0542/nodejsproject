var model  = require('../../../models/index.model');
var config = require('../../../config/index');
var constant = require('../../../config/constant');
var mysqldb 	= require('../../../config/mysqldb');
var nodeMailer = require('nodemailer');
var request = require("request");
var async = require('async');
var moment = require('moment');
module.exports = {
	
	send_email : (mailOptions, cb) => {
		let transporter = nodeMailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
              user: 'chalat.smoothgraph@gmail.com',
              pass: '@SuperRich2018!'
          }
      	});
		transporter.sendMail(mailOptions, function(error, info){
			console.log(error);
		  	if(error){
				cb(2);
			}else{
				cb(1)
			}
	   });
	},
	
	send_otp_mobile : (req, cb) => {		
		// Enter your Comapi API Space Id here e.g. 11164198-3f3f-4993-ab8f-70680c1113b1
		var SMS_SECRET_KEY = "0967446bfd82c9c31cd86485de301de7";
		// Enter your Comapi access token here
		var SMS_KEY = "1634835775623730";
		var MOBILE_API_URL = "https://otp.thaibulksms.com/v1/otp/";
		var otp = Math.floor(1000 + Math.random() * 9000);
		var myRequest = {
			key : SMS_KEY,
			secret : SMS_SECRET_KEY,
			msisdn : req.body.ph_number,
			body: 'Otp for your mobile is '+otp+', please do not share it with anybody'
		};

		// Call Comapi "One" API
		var options = {
			method: 'POST',
			url: MOBILE_API_URL,
			headers:
			{
				'cache-control': 'no-cache',
				'content-type': 'application/json',
				'accept': 'application/json'
			},
			body: myRequest,
			json: true
		};
		console.log(options);
		request(options, function (error, response, body) {
			if (error) throw new Error(error);
			console.log("HTTP status code returned: " + response.statusCode);
			// Check status
			if (response.statusCode == 201){
				cb(otp);
			}
			else{
				// Something went wrong
				console.log('Something went wrong!');
				cb(2);
			}
		});
	},
	
	send_otp : (req, cb) => {
		async.waterfall([
			function(callback){
				var condition = 'status = "1" AND id ='+parseInt(req.body.user_id)+''; 
				config.helpers.query.select_data(constant.USERS, condition, function(select_data){
					callback(null, select_data);
				})
			}
		],function(error, user_data){
			// Enter your Comapi API Space Id here e.g. 11164198-3f3f-4993-ab8f-70680c1113b1
			var SMS_SECRET_KEY = "0967446bfd82c9c31cd86485de301de7";
			// Enter your Comapi access token here
			var SMS_KEY = "1634835775623730";
			var MOBILE_API_URL = "https://otp.thaibulksms.com/v1/otp/";
			var otp = Math.floor(1000 + Math.random() * 9000);
			var myRequest = {
				key : SMS_KEY,
				secret : SMS_SECRET_KEY,
				msisdn : user_data[0].ph_number,
				body: 'Otp for your mobile is '+otp+', please do not share it with anybody'
			};

			// Call Comapi "One" API
			var options = {
				method: 'POST',
				url: MOBILE_API_URL,
				headers:
				{
					'cache-control': 'no-cache',
					'content-type': 'application/json',
					'accept': 'application/json'
				},
				body: myRequest,
				json: true
			};
			console.log(options);
			request(options, function (error, response, body) {
				if (error) throw new Error(error);
				console.log("HTTP status code returned: " + response.statusCode);
				// Check status
				if (response.statusCode == 201){
					cb(otp);
				}
				else{
					// Something went wrong
					console.log('Something went wrong!');
					cb(2);
				}
			});
		});			
	},
	
	cc_bcc_data : (data, cb) => {
		var result = {};
		result.cc = "";
		result.bcc = "";
		async.waterfall([
			function(callback){
				if(data.cc != 'NULL'){
					var cc_id = (data.cc).split('-');
					var ids = cc_id.join(',');
					var final_ids = ids.slice(1, ids.length-1);
					var query = 'SELECT email from '+constant.ADMIN_USERS+' where role_id IN('+final_ids+')';
					mysqldb.query(query, (err, cc_email, content ) => {
						var email = cc_email.map(function(item) { return item['email'];}); 
						result.cc = (email && email.length > 0) ? email.join() : '';
						callback(null, result);
					});					
				}				
				else{
					callback(null, result)
				}
			},
			function(result, callback){
				if(data.bcc != 'NULL'){
					var bcc_id = (data.bcc).split('-');
					var ids = bcc_id.join(',');
					var final_ids = ids.slice(1, ids.length-1);
					var query = 'SELECT email from '+constant.ADMIN_USERS+' where role_id IN('+final_ids+')';
					mysqldb.query(query, (err, bcc_email, content ) => {
						var email = bcc_email.map(function(item) { return item['email'];}); 
						result.bcc = (email && email.length > 0) ? email.join() : '';
						callback(null, result);
					});					
				}
				else{
					callback(null, result)
				}
			}
		], function(error, result_data){
			cb(result_data)
		});		
	},
	
	send_otp_email : (req, id, cb) => {
		console.log(id);
		var data = {};
		async.waterfall([
			function(callback){
				var condition = 'status = "1" AND id ='+parseInt(id)+''; 
				config.helpers.query.select_data(constant.USERS, condition, function(select_data){
					data.user_data = select_data;
					callback(null, data)
				});
			},
			function(data, callback){
				var condition = "slug = 'buyer_register_mail'";
				config.helpers.query.select_data(constant.NOTIFICATION_EVENT, condition, function(event_data){
					var event_id = '';
					if(event_data && event_data.length > 0){
						event_id = event_data[0].id;
						data.event_id = event_id;
							callback(null, data);
					}else{
						data.event_id = event_id;
						callback(null, data);
					}
					
				});
			},
			function(data, callback){
				var id = data.event_id;
				var noti_type_id = 1
				var condition = "noti_event_id = "+id+" AND to_buyer = '1' AND noti_type_id = "+noti_type_id+"";
				config.helpers.query.select_data(constant.NOTIFICATION_EVENT_TEMPLATE, condition, function(event_data){
					var from_email = '';
					data.from_email = from_email;
					data.cc = '';
					data.bcc = '';
					if(event_data && event_data.length > 0){
						config.helpers.user.cc_bcc_data(event_data[0], function(cc_bcc_data){
							from_email = event_data[0].sender;
							data.cc = cc_bcc_data.cc;
							data.bcc = cc_bcc_data.bcc;
							data.from_email = from_email;
							callback(null, data);
						});
					}else{						
						callback(null, data);
					}
				});
			},
			function(data, callback){
				var id = data.event_id;
				var lang_id = req.body.lang_id ? parseInt(req.body.lang_id) : 0;
				var condition = "noti_event_id = "+id+" AND lang_id = "+lang_id+"";
				config.helpers.query.select_data(constant.NOTIFICATION_EVENT_TEMPLATE_DETAIL, condition, function(temp_data){
						data.mail_subject = "";
						data.mail_subject = "";
					if(temp_data && temp_data.length >0){
						data.mail_subject = temp_data[0].mail_subject;
						data.mail_content = temp_data[0].mail_containt;						
					}
					callback(null, data);
				});
			}
		], function(error, result){
			var user_data = result.user_data;
			var notification_data = result.not_event;
			if(user_data && user_data.length > 0){
				let user = user_data[0];
				var subject = result.mail_subject;
				var email_content = result.mail_content;
				var username = user.first_name +' '+(user.last_name ? user.last_name : '' );				
				let value = Math.floor(1000 + Math.random() * 9000);
				subject = subject.replace('[USER_NAME]', username);	
				email_content =	email_content.replace('[USER_NAME]', username);
				email_content =	email_content.replace('[EMAIL]', user.email);
				email_content =	email_content.replace('[PASSWORD]', req.body.password);
				email_content =	email_content.replace('[VERIFY_CODE]', value);
				let mailOptions = {
		          //from: '"SMM" <"'+result.from_email+'">',
		          from : '"SMM" <chalat.smoothgraph@gmail.com>',
		          to: user.email,
		          subject: subject,
		          html : email_content,
		          cc : result.cc,
		          bcc : result.bcc
		        };
				console.log(mailOptions);
				var now = new Date();
				var dateTime = moment(now).format("YYYY-MM-DD HH:mm:ss");
				var query = "UPDATE "+constant.USERS+" SET email_token = '"+value+"', otp_generated_at = '"+ dateTime +"' WHERE login_use = 'email' AND id = "+parseInt(id)+"";
				console.log(query);
				config.helpers.user.send_email(mailOptions,function(maildata){
					console.log(maildata);
					if(maildata != 2){	
						mysqldb.query(query, (err, otps ) => {
							var not_queue = {
								subject : subject,
								mail_content : email_content,
								to_email : user.email,
								cc : result.from_email,
								bcc : result.from_email,
								reply : result.from_email,
								is_cron : 2,
								is_send : 1,
								notification_type : 'email',
								to_user : 'user',
								attachment : '',
								created_at : moment(now).format("YYYY-MM-DD HH:mm:ss"),
								updated_at : moment(now).format("YYYY-MM-DD HH:mm:ss"),
							}
							mysqldb.query('INSERT INTO '+constant.NOTIFICATION_QUEQE+' SET ?', not_queue, function(err, save_result, fields) {
								console.log(err);
								//console.log(save_result);
								cb(1);
							});
						});	
					}else{
						cb(2);
					}
				});
			}else{
				cb(2);
			}			
		});
	},
	
	send_forgotpassword_email : (req, id, cb) => {
		console.log(id);
		var data = {};
		async.waterfall([
			function(callback){
				var condition = 'status = "1" AND id ='+parseInt(id)+''; 
				config.helpers.query.select_data(constant.USERS, condition, function(select_data){
					data.user_data = select_data;
					callback(null, data)
				});
			},
			function(data, callback){
				var condition = "slug = 'buyer_register_mail'";
				config.helpers.query.select_data(constant.NOTIFICATION_EVENT, condition, function(event_data){
					var event_id = '';
					if(event_data && event_data.length > 0){
						event_id = event_data[0].id;
						data.event_id = event_id;
							callback(null, data);
					}else{
						data.event_id = event_id;
						callback(null, data);
					}
					
				});
			},
			function(data, callback){
				var id = data.event_id;
				var noti_type_id = 1
				var condition = "noti_event_id = "+id+" AND to_buyer = '1' AND noti_type_id = "+noti_type_id+"";
				config.helpers.query.select_data(constant.NOTIFICATION_EVENT_TEMPLATE, condition, function(event_data){
					var from_email = '';
					data.from_email = from_email;
					data.cc = '';
					data.bcc = '';
					if(event_data && event_data.length > 0){
						config.helpers.user.cc_bcc_data(event_data[0], function(cc_bcc_data){
							from_email = event_data[0].sender;
							data.cc = cc_bcc_data.cc;
							data.bcc = cc_bcc_data.bcc;
							data.from_email = from_email;
							callback(null, data);
						});
					}else{						
						callback(null, data);
					}
				});
			},
			function(data, callback){
				var id = data.event_id;
				var lang_id = 0;
				var condition = "noti_event_id = "+id+" AND lang_id = "+lang_id+"";
				config.helpers.query.select_data(constant.NOTIFICATION_EVENT_TEMPLATE_DETAIL, condition, function(temp_data){
						data.mail_subject = "";
						data.mail_subject = "";
					if(temp_data && temp_data.length >0){
						data.mail_subject = temp_data[0].mail_subject;
						data.mail_content = temp_data[0].mail_containt;						
					}
					callback(null, data);
				});
			}
		], function(error, result){
			var user_data = result.user_data;
			var notification_data = result.not_event;
			if(user_data && user_data.length > 0){
				let user = user_data[0];
				var subject = result.mail_subject;
				var email_content = result.mail_content;
				var username = user.first_name +' '+(user.last_name ? user.last_name : '' );
				subject = subject.replace('[USER_NAME]', username);	
				email_content =	email_content.replace('[USER_NAME]', username);
				email_content =	email_content.replace('[EMAIL]', user.email);
				email_content =	email_content.replace('[VERIFY_CODE]', user.email_token);
				let value = Math.floor(1000 + Math.random() * 9000);
				let mailOptions = {
		          from: '"SMM" <"'+result.from_email+'">',
		          to: user.email,
		          subject: subject,
		          html : email_content,
		          cc : result.cc,
		          bcc : result.bcc
		        };
				console.log(mailOptions);
				var now = new Date();
				var dateTime = moment(now).format("YYYY-MM-DD HH:mm:ss");
				var query = "UPDATE "+constant.USERS+" SET email_token = '"+value+"', otp_generated_at = '"+ dateTime +"' WHERE login_use = 'email' AND id = "+parseInt(id)+"";
				console.log(query);
				config.helpers.user.send_email(mailOptions,function(maildata){
					console.log(maildata);
					if(maildata != 2){	
						mysqldb.query(query, (err, otps ) => {							
							cb(1);
						});	
					}else{
						cb(2);
					}
				});
			}else{
				cb(2);
			}			
		});
	},
	
	update_address : (req, cb) => {		
		var insert_data = "is_default = '0', address_type ='0'";
		var query = "UPDATE "+constant.SHIPPING_ADDRESS+" SET "+insert_data+" WHERE user_id = "+parseInt(req.body.user_id)+" AND address_type = '"+req.body.address_type+"' AND id !="+req.body.address_id+"";
		mysqldb.query(query, (err, result_data) => {
		   	if(err){
				cb(2);
			}else{
				cb(1)
			}
	   });
	},
	
	check_address : (req, cb) => {
		let data = {};
		data.is_default = '0';
		data.address_type = '0';
		data.update_default = false;		
		async.waterfall([
			function(callback){
				if(req.body.shipping_address == '1' && req.body.billing_address == '1'){
					data.is_default = '1';
					data.address_type = '3';
					data.update_default = true;
					let query = "update "+constant.SHIPPING_ADDRESS+" SET address_type = '0', is_default = '0' where user_id = "+parseInt(req.body.user_id)+"";
					mysqldb.query(query, (error, update) => {
						callback(null, update);
					});
				}
				else if(req.body.shipping_address == '1'){
					data.is_default = '1';
					data.address_type = '1';
					data.update_default = true;
					let query = "select address_type from "+constant.SHIPPING_ADDRESS+" where user_id = "+parseInt(req.body.user_id)+" and is_default = '1' and address_type IN ('1', '3')";
					mysqldb.query(query, (error, ship_data)=> {
						if(ship_data && ship_data.length > 0){
							let ship = ship_data[0];
							console.log(ship)
							if(ship.address_type == '1'){
								let query = "update "+constant.SHIPPING_ADDRESS+" SET address_type = '0', is_default = '0' where address_type = '1' and user_id = "+parseInt(req.body.user_id)+"";
								mysqldb.query(query, (error, ship_data)=> {
									callback(null, ship_data);
								});
							}
							else if(ship.address_type == '3'){
								let query = "update "+constant.SHIPPING_ADDRESS+" SET address_type = '2' where address_type = '3' and user_id = "+parseInt(req.body.user_id)+"";
								mysqldb.query(query, (error, ship_data) => {
									callback(null, ship_data);
								});
							}else{
								callback(null, ship_data);
							}						
						}else{
							callback(null, ship_data);
						}
					});
				}
				else if(req.body.billing_address == '1'){	
					data.is_default = '1';
					data.address_type = '2';
					data.update_default = true;
					let query = "select address_type from "+constant.SHIPPING_ADDRESS+" where user_id = "+parseInt(req.body.user_id)+" and is_default = '1' and address_type IN ('2', '3')";
					mysqldb.query(query, (error, ship_data)=> {
						if(ship_data && ship_data.length > 0){
							let ship = ship_data[0];
							if(ship.address_type == '2'){
								let query = "update "+constant.SHIPPING_ADDRESS+" SET address_type = '0', is_default = '0' where address_type = '2' and user_id = "+parseInt(req.body.user_id)+"";
								mysqldb.query(query, (error, ship_data)=> {
									callback(null, ship_data);
								});
							}
							else if(ship.address_type == '3'){
								let query = "update "+constant.SHIPPING_ADDRESS+" SET address_type = '1' where address_type = '3' and user_id = "+parseInt(req.body.user_id)+"";
								mysqldb.query(query, (error, ship_data)=> {
									callback(null, ship_data);
								});
							}else{
								callback(null, ship_data);
							}						
						}else{
							callback(null, ship_data);
						}
					});
				}else{
					callback(null, data)
				}
			}
		], function(error, result_data){
			cb(data);
		});
		
	}
}
