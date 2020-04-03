var SITEURL = "http://192.168.1.250:4500";
var SMM_SITEURL = "http://192.168.1.250:8014";
var ABSOLUTEPATH = "/var/www/html/node/rnd/smm-project/public/";
var SMM_ABSOLUTEPATH = "/var/www/html/smm/public/";
module.exports = {	
	ADMINSITEURL:SITEURL+'admin/',
	UPLOADUSER : SMM_ABSOLUTEPATH + 'files/users/',
	UPLOADUSERTHUMB : SMM_ABSOLUTEPATH + 'files/users/thumb/',
	SHOWUPLOADUSER : SMM_SITEURL + '/files/users/',
	UPLOADUSERIMAGETHUMBSIZE : {
		width:100,
		height:100
	},
	// SHOP logo, banner, map and shop images
	SHOPIMAGE : SMM_ABSOLUTEPATH + 'files/shop/',
	SHOWSHOPIMAGE : SMM_SITEURL + '/files/shop/',
	
	SHOPMAPIMAGES : SMM_ABSOLUTEPATH + 'files/shop/original/',
	SHOWSHOPMAPIMAGES : SMM_SITEURL + '/files/shop/original/',
	// SHOP logo, banner, map and shop images
	
	// SELLER BANK AND CITIZEN IMAGE	
	SELLERIMAGE : SMM_ABSOLUTEPATH + 'files/seller/',
	SHOWSELLERIMAGE : SMM_SITEURL + '/files/seller/',	
	// SELLER BANK AND CITIZEN IMAGE
	
	// product image
	PRODUCTIMAGE : SMM_ABSOLUTEPATH + 'files/product/original/',
	PRODUCTIMAGETHUMB : SMM_ABSOLUTEPATH + 'files/product/thumb_51x51/',
	PRODUCTIMAGETHUMB1 : SMM_ABSOLUTEPATH + 'files/product/thumb_265x195/',
	PRODUCTIMAGETHUMBSIZE : {
		width : 50,
		height : 50
	},
	PRODUCTIMAGETHUMB1SIZE : {
		width : 265,
		height : 195
	},
	
	SHOWPRODUCTIMAGE : SMM_SITEURL + '/files/product/original/',
	SHOWPRODUCTIMAGETHUMB : SMM_SITEURL + '/files/product/thumb_50x50/',
	SHOWPRODUCTIMAGETHUMB1 : SMM_SITEURL + '/files/product/thumb_265x195/',
	// product image
	
		
	mailconfig: {
		from : '"SMM" <admin@gmail.com>',
		
	},
	FORMATETIME : 'DD-MM-YYYY hh:mm A',	
	JWT_SECRET : 'addjsonwebtokensecretherelikeQuiscustodietipsoscustodes',
	ORDER_VALID_PRICE : 9999999999,
	ORDERIDLENGTH : 12,
	
	// all db name
	USERS : 'smm_users',
	USER_SHOPPING_LIST : 'smm_user_shopping_list',
	ADMIN_USERS : 'smm_admin_users',
	NOTIFICATION_EVENT : 'smm_notification_event',
	NOTIFICATION_EVENT_TEMPLATE : 'smm_notification_event_template',
	NOTIFICATION_EVENT_TEMPLATE_DETAIL : 'smm_notification_event_template_detail',
	NOTIFICATION_QUEQE : 'smm_notification_queue',
	
	// CATEGORY
	CATEGORY : 'smm_category',
	CATEGORY_DESC : 'smm_category_desc',
	// CATEGORY
	
	// SHIPPING TABLES
	USER_SHIPPING_LIST : 'smm_user_shopping_list',	
	USER_SHIPPING_LIST_DESC : 'smm_user_shopping_list_desc',	
	USER_SHIPPING_LIST_ITEMS : 'smm_user_shopping_list_items',	
	STANDARD_BADGE : 'smm_standard_badge',	
	CART : 'smm_cart',	
	SHIPPING_ADDRESS : 'smm_shipping_address',	
	// SHIPPING TABLES
	
	// PRODCUT
	PRODUCT : 'smm_product',
	PRODUCT_BARGAINS : 'smm_product_bargains',
	// PRODUCT
	// ORDER 
	ORDER : 'smm_order_detail',
	ORDER_DETAIL : 'smm_order_detail',
	// ORDER 
	
	// all db name

}
