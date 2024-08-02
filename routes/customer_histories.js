const route = require('express').Router();
const { CustomerHistoryController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/scroll', authentication, CustomerHistoryController.getCustomerHistoriesByScroll); //with query params, example: ?lastID=36&limit=5&key=lorem
route.get('/customer/:customer_id', authentication, CustomerHistoryController.getCustomerHistoryByCustomer); //with query params, example: ?lastID=36&limit=5
route.get('/:id', authentication, CustomerHistoryController.getCustomerHistory);

module.exports = route;