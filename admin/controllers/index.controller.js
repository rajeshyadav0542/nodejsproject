var {user}  = require('../../../models/index.model');
var config = require('../../../config/index');
const jwt = require('jsonwebtoken');
var bcrypt = require("bcrypt-nodejs");

module.exports = {
	login : (req,res)=>{
		let result = {};
		let status = 200;
		var err = '';
        user.find({}, (err, users) => {
            if (!err) {
              result.status = status;
              result.error = err;
              result.result = users;
            } else {
              status = 500;
              result.status = status;
              result.error = err;
            }
            res.status(status).send(result);
       });
	}
}
