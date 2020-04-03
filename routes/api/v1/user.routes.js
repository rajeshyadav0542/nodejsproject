let indexController = require('../../../api/v1/controllers/users/index.controller');
let updateprofileController = require('../../../api/v1/controllers/users/updateprofile.controller');
let validateToken = require('../../../middleware/utils').validateToken;
let cors = require('cors');
module.exports = function(router) {		
	router.get('/api/v1/user/all', validateToken, indexController.all);
	router.get('/api/v1/user/generate_token', indexController.generate_token);
	router.post('/api/v1/user/send_sms', indexController.send_sms);
	router.post('/api/v1/user/registration', validateToken, indexController.registration);
	//router.post('/api/v1/user/login', cors(), indexController.login);	
	router.get('/api/v1/user/login', validateToken, indexController.login);	
	router.get('/api/v1/user/verify_otp', validateToken, indexController.verify_otp);	
	router.post('/api/v1/user/resend_otp', validateToken, indexController.resend_otp);
	router.post('/api/v1/user/forgot_password', validateToken, indexController.forgot_password);		
	router.post('/api/v1/user/update_password', validateToken, indexController.update_password);		
	router.post('/api/v1/user/send_email_otp', validateToken, indexController.send_email_otp);
	
	// update buyer and seller profile	
	
	router.get('/api/v1/user/confirm_password', validateToken, updateprofileController.confirm_password);
	router.post('/api/v1/user/check_user_name', validateToken, updateprofileController.check_user_name);
	router.post('/api/v1/user/update_user_name', validateToken, updateprofileController.update_user_name);
	router.post('/api/v1/user/update_profile_image',validateToken, updateprofileController.update_profile_image);
	router.post('/api/v1/user/change_password', validateToken, updateprofileController.change_password);
	
	// update buyer and seller profile
}
