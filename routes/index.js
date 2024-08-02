const route = require('express').Router();
const userRoute = require('./users');
const customerRoute = require('./customers');
const customerHistoryRoute = require('./customer_histories');

route.use('/v1/users', userRoute);
route.use('/v1/customers', customerRoute);
route.use('/v1/customer_histories', customerHistoryRoute);

module.exports = route;