var indexController = require('../../../api/v1/controllers/shop/index.controller');
var validateToken = require('../../../middleware/utils').validateToken;
module.exports = function(router) {
	router.get('/api/v1/shop/check_storename', validateToken, indexController.check_storename);	
	router.post('/api/v1/shop/insert_shop_info', validateToken, indexController.insert_shop_info);	
	router.post('/api/v1/shop/insert_bank_info', validateToken, indexController.insert_bank_info);	
	router.get('/api/v1/shop/updateShopStatus', validateToken, indexController.updateShopStatus);	
	router.post('/api/v1/shop/update_shop_info', validateToken, indexController.update_shop_info);	
	router.get('/api/v1/shop/user_shop_data', validateToken, indexController.user_shop_data);
	router.post('/api/v1/shop/get_shop_product', validateToken, indexController.get_shop_product);	
	router.get('/api/v1/shop/favourite_shop_list', validateToken, indexController.favourite_shop_list);	
	router.get('/api/v1/shop/favourite_shop', validateToken, indexController.favourite_shop);	
	router.delete('/api/v1/shop/remove_favourite_shop', validateToken, indexController.remove_favourite_shop);	
	router.post('/api/v1/shop/update_shop_image', validateToken, indexController.update_shop_image);	
}
