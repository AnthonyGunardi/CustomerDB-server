const route = require('express').Router();
const { UserController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/admin/register', UserController.registerAdmin);
route.post('/admin/login', UserController.adminLogin);
route.get('/admin', authentication, UserController.findAllAdmins);
route.post('/register', authentication, adminAuthorization, UserController.registerUser);
route.post('/login', UserController.userLogin);
route.put('/password/:username', authentication, UserController.updatePassword);
route.put('/reset/:username', authentication, adminAuthorization, UserController.resetPassword);
route.put('/toggle/:username', authentication, adminAuthorization, UserController.toggleUser);
route.get('/', authentication, adminAuthorization, UserController.findAllUsers);
route.get('/:username', authentication, UserController.getUser);
route.put('/:username', authentication, adminAuthorization, UserController.updateUser);

module.exports = route;
