var indexController = require('../../../api/v1/controllers/shopping/index.controller');
var validateToken = require('../../../middleware/utils').validateToken;

module.exports = function(router) {	
	router.post('/api/v1/shopping/create_shopping', indexController.create_shopping);	
	router.post('/api/v1/shopping/shopping_list', indexController.shopping_list);	
	router.post('/api/v1/shopping/edit', indexController.edit);	
	router.post('/api/v1/shopping/delete_shopping', indexController.delete_shopping);	
	router.post('/api/v1/shopping/add_to_shopping_list', indexController.add_to_shopping_list);	
	router.post('/api/v1/shopping/shipping_list_product', indexController.shipping_list_product);	
	router.post('/api/v1/shopping/update_shopping_product', indexController.update_shopping_product);	
	router.post('/api/v1/shopping/delete_shopping_product', indexController.delete_shopping_product);	
}
