var model  = require('../../../../models/index.model');
var config = require('../../../../config/index');
const jwt = require('jsonwebtoken');
var bcrypt = require("bcrypt-nodejs");

module.exports = {
	banner : (req,res)=>{
		let result = {};
		let status = 200;
		var err = '';
		model.banner.find({deleted_at : 0}, (err, banner) => {
			if (!err) {
			  result.status = status;
			  result.error = err;
			  result.result = banner;
			} else {
			  status = 500;
			  result.status = status;
			  result.error = err;
			}
			res.status(status).send(result);
	   });
	},

  static_page : (req, res) =>{
    let result = {};
    let status = 200;
    var err = '';
    model.static_block.find({ deleted_at : 0 }, (err, static)=>{
      if(!err){
        result.status = status;
        result.error = err;
        result.result = static
      }else{
        status = 500;
        result.status = status;
        result.error = err;
      }
      res.status(status).send(result);
    });
  }
}
