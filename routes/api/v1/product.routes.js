var indexController = require('../../../api/v1/controllers/product/index.controller');
var bargainController = require('../../../api/v1/controllers/product/bargain.controller');
var validateToken = require('../../../middleware/utils').validateToken;
var cors = require('cors');
module.exports = function(router) {	
	router.get('/api/v1/product/list', validateToken, indexController.list);
	router.get('/api/v1/product/auto_search', validateToken, indexController.auto_search);
	router.get('/api/v1/product/details', validateToken, indexController.details);	
	router.get('/api/v1/product/package_unit_list', validateToken, indexController.package_unit_list);
	router.post('/api/v1/product/create_seller_product', validateToken, indexController.create_seller_product);
	router.post('/api/v1/product/update_seller_product', validateToken, indexController.update_seller_product);
	router.get('/api/v1/product/seller_product', validateToken, indexController.seller_product);
	router.delete('/api/v1/product/delete_product', validateToken, indexController.delete_product);
	router.get('/api/v1/product/related_product', validateToken, indexController.related_product);
	router.delete('/api/v1/product/delete_product_image', validateToken, indexController.delete_product_image);
	
	// shop related routes
	router.post('/api/v1/product/bargain', validateToken, bargainController.bargain);
	router.get('/api/v1/product/check_shop_status', validateToken, bargainController.check_shop_status);
	router.post('/api/v1/product/check_product_bargain', validateToken, bargainController.check_product_bargain);
	router.get('/api/v1/product/bargain_product_list', validateToken, bargainController.bargain_product_list);
	router.post('/api/v1/product/bargain_from_buyer', validateToken, bargainController.bargain_from_buyer);
	router.delete('/api/v1/product/removebargain', validateToken, bargainController.removebargain);
	// shop related routes
}
