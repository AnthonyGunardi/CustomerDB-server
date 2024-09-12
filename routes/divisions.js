const route = require('express').Router();
const { DivisionController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/register', authentication, adminAuthorization, DivisionController.addDivision);
route.put('/toggle/:id', authentication, adminAuthorization, DivisionController.toggleDivision);
route.get('/', authentication, adminAuthorization, DivisionController.findAllDivisions);
route.get('/:id', authentication, DivisionController.getDivision);
route.put('/:id', authentication, adminAuthorization, DivisionController.updateDivision);

module.exports = route;
