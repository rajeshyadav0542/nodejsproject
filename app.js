var createError = require('http-errors');
var express = require('express');
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var flash=require("connect-flash");
var db 	= require('./config/db');
var fileUpload =require('express-fileupload');

// api routes
var userRoutes = require('./routes/api/v1/user.routes');
var productRoutes = require('./routes/api/v1/product.routes');
var categoryRoutes = require('./routes/api/v1/category.routes');
var addressRoutes = require('./routes/api/v1/address.routes');
var cmsRoutes = require('./routes/api/v1/cms.routes');
var shopRoutes = require('./routes/api/v1/shop.routes');
var orderRoutes = require('./routes/api/v1/order.routes');
var shoppingRoutes = require('./routes/api/v1/shopping.routes');
var wishlistRoutes = require('./routes/api/v1/wishlist.routes');
// api routes

// admin routes
var adminRoutes = require('./routes/admin/admin.routes');
var usersRoutes = require('./routes/admin/users.routes');
// admin routes

var app = express();
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
var sessionMiddleware = session({
    name: 'test_session',
    secret: 'P@ssP0rtJs',
    resave: true,
    saveUninitialized: true
});
app.use(sessionMiddleware);
//app.use(fileUpload);
//var adminRoutes = require('./routes/admin');
var router = express.Router();

app.use('',router);
userRoutes(router);
productRoutes(router);
cmsRoutes(router);
adminRoutes(router);
usersRoutes(router);
categoryRoutes(router);
addressRoutes(router);
shopRoutes(router);
orderRoutes(router);
shoppingRoutes(router);
wishlistRoutes(router);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.use(cors());



//app.listen(app.get('port'));
module.exports = app;
