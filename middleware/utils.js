const jwt = require('jsonwebtoken');
const constant = require('../config/constant');
module.exports = {
  validateToken: (req, res, next) => {
    const authorizationHeaader = req.headers.authorization;
    let result;
    if (authorizationHeaader) {		
      const token = authorizationHeaader;
      try {
			result = jwt.verify(token, constant.JWT_SECRET);
			next();
      } catch (err) {
        //throw new Error(err);
        result = { 
			error: `Authentication error. Invalid token.`,
			status: 401 
		  };
		  res.status(401).send(result);
      }
    } else {
      result = { 
        error: `Authentication error. Token required.`,
        status: 401 
      };
      res.status(401).send(result);
    }
  }
};
