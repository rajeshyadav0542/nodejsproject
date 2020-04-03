var indexController = require('../../../api/v1/controllers/category/index.controller');
var validateToken = require('../../../middleware/utils').validateToken;
var cors = require('cors');
module.exports = function(router) {	
	router.get('/api/v1/category/all', validateToken, indexController.all);
}
