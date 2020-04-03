var indexController = require('../../../api/v1/controllers/cms/index.controller');
var validateToken = require('../../../middleware/utils').validateToken;
var cors = require('cors');
module.exports = function(router) {	
	router.get('/api/v1/cms/banner', validateToken, indexController.banner);
	router.get('/api/v1/cms/static_page', validateToken, indexController.static_page);
}
