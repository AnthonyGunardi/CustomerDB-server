const route = require('express').Router();
const { FollowUpController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.get('/scroll', authentication, adminAuthorization, FollowUpController.getFollowUpsByScroll);
route.get('/follow_ups', authentication, adminAuthorization, FollowUpController.getFollowUps);

module.exports = route;