var indexController = require('../../../api/v1/controllers/wishlist/index.controller');
var validateToken = require('../../../middleware/utils').validateToken;
module.exports = function(router) {	
	router.get('/api/v1/wishlist/all', validateToken, indexController.all);
	router.get('/api/v1/wishlist/add', validateToken, indexController.add);
	router.delete('/api/v1/wishlist/remove', validateToken, indexController.remove);
}
