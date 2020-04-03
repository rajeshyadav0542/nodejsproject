var model  = require('../../../models/index.model');
var config = require('../../../config/index');
var mysqldb 	= require('../../../config/mysqldb');
module.exports = {	
	insert_data : (table, data, where_con, cb) =>{		
		cb(1)
	},	
	select_data : (table, where_con, cb) => {
		console.log(table);
		console.log(where_con);
		let query = "SELECT * from "+table+" where "+where_con+"";
		mysqldb.query(query, function(error, data){
			cb(data);
		});
	},
	
	cart_product : (req, cb) => {
		let query = 'select count(*) as total from smm_cart where user_id ='+parseInt(req.body.user_id)+'';
		mysqldb.query(query, (error, count) =>{
			cb(count[0].total);
		});
	}
}
