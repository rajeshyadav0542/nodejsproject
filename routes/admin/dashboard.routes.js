var indexController = require('../../admin/controllers/admin/index.controller');
var validateToken = require('../../middleware/utils').validateToken;
var auth = require('../../middleware/auth')
module.exports = function(router) {		
	router.get('/admin/dashboard/index', auth, indexController.index);
}
