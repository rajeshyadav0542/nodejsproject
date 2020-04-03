var config = require('../../../config/index');
var mysqldb 	= require('../../../config/mysqldb');
var async = require('async');
var fs = require('fs');
var im = require('imagemagick');
module.exports = {
	get_language_data : (req, cb) => {
		let query = "SELECT id, languageName, languageCode, languageFlag, isSystem from smm_languages WHERE status = '1' order by isSystem desc";
		mysqldb.query(query, (err, lang_data) => {
			cb(lang_data);
		});
	},
	
	resize_image : (resize_data, cb) => {
		var arrresize = resize_data?resize_data.resize:[];
		async.forEach(arrresize, function(item, callback) {
			var original = resize_data.original+resize_data.image;
			var desti = item.path+resize_data.image;
			if (!fs.existsSync(item.path)) {
				fs.mkdirSync(item.path, 0777);
			}
			var width = item.size.width;
			var height = item.size.height;
			var rsize = width+'x'+height;
			console.log("=========================")
			console.log("rsize=="+rsize)
			console.log("original=="+original)
			console.log("desti=="+desti)
			console.log("=========================")	    
			im.convert([original, '-resize', rsize+'!', desti]);
			callback();
		},function(err){
			cb(1)
		});
	},
	
	upload_image : (image_path, image_data, cb) => {
		let final_imagedata = [];
		async.forEach(image_data, function(item, callback) {
			console.log(fs.existsSync(image_path));
			if (!fs.existsSync(image_path)) {
				fs.mkdirSync(image_path, 0777);
			}
			var image_name = item.name ? item.name : '';
			var fileExtension = image_name.replace(/^.*\./, '');
			upload_name = Date.now() + '.'+fileExtension;
			item.mv(image_path + upload_name, (err,data)=> {
				console.log(err);
				if(!err){
					final_imagedata.push(upload_name);					
					callback();
				}else{
					callback();
				}
			});			
		},function(err){
			cb(final_imagedata);
		})
	},
	
	product_upload_image : (image_path, image_data, cb) => {
		let final_imagedata = [];
		async.forEach(image_data, function(item, callback) {
			console.log(fs.existsSync(image_path));
			if (!fs.existsSync(image_path)) {
				fs.mkdirSync(image_path, 0777);
			}
			var image_name = item.name ? item.name : '';
			var fileExtension = image_name.replace(/^.*\./, '');
			upload_name = Date.now() + '.'+fileExtension;
			item.mv(image_path + upload_name, (err,data)=> {
				if(!err){
					crop_image = {
						image : upload_name?upload_name:'',
						original : config.constant.PRODUCTIMAGE,
						resize : [
							{
								path : config.constant.PRODUCTIMAGETHUMB,
								size : config.constant.PRODUCTIMAGETHUMBSIZE,
							},
							{
								path : config.constant.PRODUCTIMAGETHUMB1,
								size : config.constant.PRODUCTIMAGETHUMB1SIZE,
							}
						]
					}
					config.helpers.common.resize_image(crop_image, (upload_success)=> {
						final_imagedata.push(upload_name);					
						callback();
					});
				}else{
					callback();
				}
			});			
		},function(err){
			cb(final_imagedata);
		})
	},
	
	generate_orderid : (req, cb) => {
		let length = config.constant.ORDERIDLENGTH;
		let id = (Math.pow(10,length).toString().slice(length-1) + Math.floor((Math.random()*Math.pow(10,length))+1).toString()).slice(-length);
		cb(id);
	},
	
	check_payment_mathod : (req, cb) => {
		let query = "SELECT payment.id, payment.slug, payment.currency_id, payment.payment_type, payment.image_name, payment.mode, payment.live_detail, payment_desc.payment_option_name FROM `smm_payment_option` as payment join `smm_payment_option_desc` as payment_desc on payment.id = payment_desc.payment_option_id where payment.status = '1' and payment.id = "+parseInt(req.body.payment_method)+" and payment_desc.lang_id = "+parseInt(req.body.lang_id)+"";
		mysqldb.query(query, (error, paymentmethod) => {
			if(!error && paymentmethod && paymentmethod.length > 0){
				cb(paymentmethod);
			}else{
				cb([]);
			}
		});
	}
	
	
}
