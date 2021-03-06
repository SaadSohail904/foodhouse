var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const VerifyTokenMiddleware = require('./middleware/authToken');


var adminLogin = require('./routes/adminPanel/adminLogin');
var getUsers = require('./routes/adminPanel/getUsers');
var approveRestaurant = require('./routes/adminPanel/approveRestaurant');
var approvePayment = require('./routes/adminPanel/approvePayment');
var getOrdersAdmin = require('./routes/adminPanel/getOrdersAdmin');
var deleteUser = require('./routes/adminPanel/deleteUser');

var customerLogin = require('./routes/customerLogin');
var customerSignup = require('./routes/customerSignup');
var restaurantLogin = require('./routes/restaurantLogin');
var restaurantSignup = require('./routes/restaurantSignup');
var forgotPassword = require('./routes/forgotPassword');
var changePassword = require('./routes/changePassword');
var getFavourites = require('./routes/getFavourites');
var getRestaurantsAndCategories = require('./routes/getRestaurantsAndCategories');
var addFavouriteItem = require('./routes/addFavouriteItem');
var addOrder = require('./routes/addOrder');
var deleteFavouriteItem = require('./routes/deleteFavouriteItem');
var getRestaurantsByCategories = require('./routes/getRestaurantsByCategories');
var getRestaurantMenu = require('./routes/getRestaurantMenu');
var removeItemFromMenu = require('./routes/removeItemFromMenu');
var addItemToMenu = require('./routes/addItemToMenu');
var getRestaurantOrders = require('./routes/getRestaurantOrders');
var getOrders = require('./routes/getOrders');
var setOrderStatus = require('./routes/setOrderStatus');
var setRating = require('./routes/setRating');
var getFoodItemsByCategories = require('./routes/getFoodItemsByCategories');
var getUserData = require('./routes/getUserData');
var uploadImage = require('./routes/uploadImage');
var uploadImageItem = require('./routes/uploadImageItem');
var addToCart = require('./routes/addToCart');
var createCart = require('./routes/createCart');
var getCart = require('./routes/getCart');
var removeFromCart = require('./routes/removeFromCart');
var deleteCart = require('./routes/deleteCart');
var updateCart = require('./routes/updateCart');
var updateUser = require('./routes/updateUser');
var updateRestaurant = require('./routes/updateRestaurant');
var logout = require('./routes/logout');

var cors = require('cors')
var app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/adminLogin', adminLogin);
app.use('/getUsers', VerifyTokenMiddleware.validateAdmin, getUsers);
app.use('/approveRestaurant', VerifyTokenMiddleware.validateAdmin, approveRestaurant);
app.use('/approvePayment', VerifyTokenMiddleware.validateAdmin, approvePayment);
app.use('/getOrdersAdmin', VerifyTokenMiddleware.validateAdmin, getOrdersAdmin);
app.use('/deleteUser', VerifyTokenMiddleware.validateAdmin, deleteUser);
app.use('/updateUserAdmin', VerifyTokenMiddleware.validateAdmin, updateUser);
app.use('/updateRestaurantAdmin', VerifyTokenMiddleware.validateAdmin, updateRestaurant);


app.use('/customerSignup',  customerSignup);
app.use('/customerLogin', customerLogin);
app.use('/restaurantSignup',  restaurantSignup);
app.use('/restaurantLogin', restaurantLogin);
app.use('/forgotPassword', forgotPassword);
app.use('/changePassword', VerifyTokenMiddleware.validateUser, changePassword);
app.use('/changePassword', VerifyTokenMiddleware.validateUser, changePassword);
app.use('/getRestaurantsAndCategories', VerifyTokenMiddleware.validateUser, getRestaurantsAndCategories);
app.use('/getRestaurantsByCategories', VerifyTokenMiddleware.validateUser, getRestaurantsByCategories);
app.use('/getRestaurantMenu', VerifyTokenMiddleware.validateUser, getRestaurantMenu);
app.use('/removeItemFromMenu', VerifyTokenMiddleware.validateUser, removeItemFromMenu);
app.use('/addItemToMenu', VerifyTokenMiddleware.validateUser, addItemToMenu);
app.use('/setOrderStatus', VerifyTokenMiddleware.validateUser, setOrderStatus);
app.use('/setRating', VerifyTokenMiddleware.validateUser, setRating);
app.use('/getRestaurantOrders', VerifyTokenMiddleware.validateUser, getRestaurantOrders);
app.use('/getOrders', VerifyTokenMiddleware.validateUser, getOrders);
app.use('/getFavourites', VerifyTokenMiddleware.validateUser, getFavourites);
app.use('/addFavouriteItem', VerifyTokenMiddleware.validateUser, addFavouriteItem);
app.use('/addOrder', VerifyTokenMiddleware.validateUser, addOrder);
app.use('/deleteFavouriteItem', VerifyTokenMiddleware.validateUser, deleteFavouriteItem);
app.use('/getFoodItemsByCategories', VerifyTokenMiddleware.validateUser, getFoodItemsByCategories);
app.use('/getUserData', VerifyTokenMiddleware.validateUser, getUserData);
app.use('/uploadImage',  uploadImage);
app.use('/uploadImageItem',  uploadImageItem);
app.use('/addToCart', VerifyTokenMiddleware.validateUser, addToCart);
app.use('/createCart', VerifyTokenMiddleware.validateUser, createCart);
app.use('/deleteCart', VerifyTokenMiddleware.validateUser, deleteCart);
app.use('/getCart', VerifyTokenMiddleware.validateUser, getCart);
app.use('/removeFromCart', VerifyTokenMiddleware.validateUser, removeFromCart);
app.use('/updateCart', VerifyTokenMiddleware.validateUser, updateCart);
app.use('/updateUser', VerifyTokenMiddleware.validateUser, updateUser);
app.use('/updateRestaurant', VerifyTokenMiddleware.validateUser, updateRestaurant);
app.use('/logout', VerifyTokenMiddleware.validateUser, logout);

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
  res.status(err.status || 500).send({ message: err.message });;
});

module.exports = app;
