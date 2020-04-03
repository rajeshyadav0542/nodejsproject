var express = require('express');
var router = express.Router();
var Product = require('../models/product.model');
var mongoose = require('mongoose');
var mongoDB = 'mongodb://127.0.0.1/test_db';
var validateToken = require('../utils').validateToken;
var bcrypt = require("bcrypt-nodejs");
var request = require('request');
var rp = require('request-promise');
const jwt = require('jsonwebtoken');
var ObjectId = require('mongodb').ObjectID
mongoose.connect(mongoDB, { useNewUrlParser: true })
var db = mongoose.connection;

/* GET users listing. */
router.get('/', validateToken, function(req, res, next) {	
	db.collection('product').find({ deleted_at : 0 }).toArray(function(error, result){
  		var data = { status : 'success', message : '', data : result }
		res.send(result)
  	});
});

router.post('/add_product', function(req, res) {
	var user_data = {
		name : req.body.name ? req.body.name : '',
		quantity : req.body.quantity ? req.body.quantity : '',
		createdAt : new Date(),
		updatedAt : new Date(),
		deleted_at : 0		
	}
	db.collection('product').insert(user_data,(error, register)=>{
		console.log(error);
		if(error){
			var data = { status : 'error', message : 'Something wrong', data : '' }
			res.send(data)
		}else{
			var data = { status : 'success', message : 'Product add successfully', data : register.ops ? register.ops : {} }
			res.send(data)
		}
	});
});

// delete product

router.post('/delete', function(req, res, next) {
	console.log(req.body);	
	db.collection('product').update({ _id : new ObjectId(req.body.id)}, { $set : { 'deleted_at' : 1 }}, { upsert: true }, function(error, result){
  		var data = { status : 'success', message : '', data : result }
		res.send(result)
  	});
});


router.get('/data', function(req, res){
	var headers = {
		'token': 'abcdefghijklmnopqrstuvwxyz'
	};
	var options = { 
		headers : headers, 
		url : 'http://192.168.1.250:3000/product', 
		form : { id :'5df882bdde473314341d0331' }, 
		method : 'GET'
	};
	//request.get('http://192.168.1.250:3000/product/delete', function(error, response, body){
	//request.post({ url : 'http://192.168.1.250:3000/product/data', form: { id:'5df882bdde473314341d0331' } }, function(error, response, body){
	rp(options)
	.then(function (parsedBody){
		//) function(err,httpResponse,body){
		console.log(parsedBody);
		res.send('===========send successfully======');
	})
	.catch(function(error){
		res.send('=======find error===========');
	})
});



module.exports = router;
