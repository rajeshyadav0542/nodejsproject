let mysql = require('mysql')
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sm_market'
})

//const con = mysql.createPool(connection);
var mysqldb = connection.connect(function(err, result) {
	  if (err) throw err;
	  console.log("Connected!");
});
exports = module.exports = connection;

