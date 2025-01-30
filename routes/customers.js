const route = require('express').Router();
const { CustomerController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');



route.get('/scroll', authentication, CustomerController.getCustomersByScroll); //with query params, example: ?lastID=36&limit=5&key=lorem
route.get('/birthday', authentication, CustomerController.findBirthdayCustomers);
route.post('/', authentication, CustomerController.create);
route.get('/:id', authentication, CustomerController.getCustomer);
route.put('/:id', authentication, CustomerController.update);
route.put('/toggle/:id', authentication, adminAuthorization, CustomerController.toggleCustomer);

module.exports = route;