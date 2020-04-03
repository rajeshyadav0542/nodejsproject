var indexController = require('../../admin/controllers/admin/index.controller');
var auth = require('../../middleware/auth')
module.exports = function(router) {		
	router.get('/admin', indexController.index);
	router.all('/admin/dashboard', indexController.dashboard);
	router.post('/admin/add', indexController.add);
	router.all('/admin/logout', indexController.logout);
}
