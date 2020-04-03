const jwt = require('jsonwebtoken');
const constant = require('../config/constant');
var HttpStatus = require('http-status-codes');
module.exports = {
  sendOtp: (req, res, next) => {
	   let result;
    if (authorizationHeaader) {
		  result = { 
			   error: `Authentication error. Invalid token.`,
			   status: HttpStatus.NETWORK_AUTHENTICATION_REQUIRED 
		  };
		    res.status(HttpStatus.NETWORK_AUTHENTICATION_REQUIRED).send(result);
    }
    else {
      result = { 
        error: `Authentication error. Token required.`,
        status: HttpStatus.NETWORK_AUTHENTICATION_REQUIRED 
      };
      res.status(HttpStatus.NETWORK_AUTHENTICATION_REQUIRED).send(result);
    }
  }
};
