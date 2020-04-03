	
/* GET users authentication. */
module.exports = function(req, res, next) {
  //get the token from the header if present
  if(req.session.username){
	  console.log("=========test====================");
	  console.log(req.session.username);
	  console.log("=========test====================");
  	next();
  }else{
  	res.redirect('/admin');
  }
};
