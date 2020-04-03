var indexController = require('../../admin/controllers/users/index.controller');
var auth = require('../../middleware/auth')
module.exports = function(router) {		
	router.get('/admin/users', auth, indexController.index);
	router.get('/admin/users/add', auth, indexController.add);
	router.post('/admin/users/add_user', auth, indexController.add_user);
}
