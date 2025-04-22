const route = require('express').Router();
const { FollowUpController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.get('/scroll', authentication, FollowUpController.getFollowUpsByScroll);

module.exports = route;