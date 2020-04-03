var indexController = require('../../../api/v1/controllers/address/index.controller');
var addressController = require('../../../api/v1/controllers/address/useraddress.controller');
var validateToken = require('../../../middleware/utils').validateToken;
module.exports = function(router) {		
	// get country, state, district and city
	router.get('/api/v1/address/country', validateToken, indexController.country);
	router.get('/api/v1/address/state', validateToken, indexController.state);
	router.post('/api/v1/address/district', validateToken, indexController.district);
	router.get('/api/v1/address/city', validateToken, indexController.city);	
	
	// get and update user address	
	router.post('/api/v1/address/add_address', validateToken, indexController.add_address);
	router.get('/api/v1/address/all', validateToken, addressController.all);	
	router.post('/api/v1/address/update', validateToken, addressController.update);	
	router.post('/api/v1/address/shipping_status', validateToken, addressController.shipping_status);	
	router.delete('/api/v1/address/delete_address', validateToken, addressController.delete_address);	
}
