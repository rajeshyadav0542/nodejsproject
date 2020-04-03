var indexController = require('../../../api/v1/controllers/order/index.controller');
var cartController = require('../../../api/v1/controllers/order/cart.controller');
var validateToken = require('../../../middleware/utils').validateToken;

module.exports = function(router) {
	// cart router	
	router.post('/api/v1/order/add_to_cart', validateToken, cartController.add_to_cart);	
	router.post('/api/v1/order/product_add_to_cart', validateToken, cartController.add_to_cart);	
	router.post('/api/v1/order/cart_product', validateToken, cartController.cart_product);	
	router.delete('/api/v1/order/removeCart', validateToken, cartController.removeCart);	
	router.get('/api/v1/order/shoppingCart', validateToken, cartController.shoppingCart);	
	
	// order router
	router.post('/api/v1/order/payProduct', indexController.payProduct);
	router.post('/api/v1/order/paymentmethod', indexController.paymentmethod);
	router.post('/api/v1/order/checkout', indexController.checkout);
}
