const {admin}  = require('../../../models/index.model');
const config = require('../../../config/index');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt-nodejs");
const async = require("async");

module.exports = {
	index : (req,res)=>{
		var detail = {message:req.flash('msg')};			
		res.render('login', { title: 'Admin Login', authenticated : false, detail:detail });
	},
	
	dashboard : async (req, res) => {
		console.log(req.body);
		var users = await admin.find({ username : req.body.username });
		console.log(users);
		if(users && users.length >0){
			var user = users[0]			
			var hash = user.password;
            if(bcrypt.compareSync(req.body.password, hash)){
                req.session.username = (user && user.username) ? user.username : '';
                req.session.email = (user && user.email) ? user.email : '';
                if(req.body.remember_me == '1'){
					res.cookie('username_co',req.body.username, { maxAge : new Date(Date.now() + 12096000)});
					res.cookie('pass_c',req.body.password, { maxAge : new Date(Date.now() + 12096000)});							
				 }else{
					res.clearCookie('username_co');
					res.clearCookie('pass_c');
				 }
				 console.log("===========session and cookie===========");
				 console.log(req.session);
				 console.log(req.cookie);
				 console.log("===========session and cookie===========");
					res.render('admin/dashboard/index', { title: 'Dashboard', authenticated : true });
			  }else{
				  req.flash('msg', { msg : 'Please Enter valid password', authenticated : false});	
				  res.redirect('/admin');
              }
		}else{
			req.flash('msg', { msg : 'Please Enter valid user', authenticated : false });
			res.redirect('/admin');
		}
	},
	/*dashboard : (req, res) => {
        admin.findOne({ username : req.body.username }, (err, user) => {
          if (!err && user) {	
            var hash = user.password;
            if(bcrypt.compareSync(req.body.password, hash)){
                req.session.username = (user && user.username) ? user.username : '';
                req.session.email = (user && user.email) ? user.email : '';
                if(req.body.remember_me == '1'){
					res.cookie('username_co',req.body.username, { maxAge : new Date(Date.now() + 12096000)});
					res.cookie('pass_c',req.body.password, { maxAge : new Date(Date.now() + 12096000)});							
				 }else{
					res.clearCookie('username_co');
					res.clearCookie('pass_c');
				 }
				res.render('admin/dashboard/index', { title: 'Dashboard', authenticated : true });
              } else {
					//~ req.flash('msg', { msg : 'Please Enter valid password', authenticated : false});	
					res.redirect('/admin');
              }
			  } else {
					req.flash('msg', {msg:'Please Enter valid user',authenticated:false});
					res.redirect('/admin');
			  }
	  });
	},	*/
	logout : (req, res) => {
		console.log(req.session);
		req.session.destroy();
		console.log(req.session);
		res.redirect('/admin')
	},
	
	add : (req, res) => {
		var hash = bcrypt.hashSync(req.body.password);
		 var admin_data = {
			name : req.body.name,
			email : req.body.email,
			username : req.body.username,
			password : hash,
			deleted_at : 0,
			createdAt : new  Date(),
			updatedAt : new  Date()
		}
       admin.create(admin_data, (err, user_data) => {
			res.send('/admin');
	   });
	}
}
