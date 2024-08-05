const { User } = require('../models');
const Sequelize = require('sequelize');
let sequelize;
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
const AccessToken = require('../helpers/accessToken');
const { sendResponse, sendData } = require('../helpers/response');

class UserController {
  static async registerAdmin(req, res, next) {
    try {
      const { fullname, username, password, is_active } = req.body

      //check if user is already exist
      const user = await User.findOne({ where: { username } });
      if (Boolean(user)) return sendResponse(400, 'User already exist', res)

      const newUser = await User.create({ fullname, username, password, is_admin: true, is_active });
      sendData(201, { firstname: newUser.fullname, username: newUser.username, is_admin: newUser.is_admin }, "Admin User is created", res);
    }
    catch (err) {
      next(err)
    };
  };

  static async registerUser(req, res, next) {    
    try {
      const { fullname, username, password, is_active } = req.body

      //check if user is already exist
      const user = await User.findOne({ where: { username } });
      if (Boolean(user)) return sendResponse(400, 'User already exist', res)

        const newUser = await User.create({ fullname, username, password, is_admin: false, is_active });
        sendData(201, { firstname: newUser.fullname, username: newUser.username, is_admin: newUser.is_admin }, "User is created", res);
    }
    catch (err) {
      next(err)
    };
  };

  static async userLogin(req, res, next) {
    const userData = {
      username: req.body.username,
      password: req.body.password,
    };
    try {
      //check if user is exist
      const user = await User.findOne({
        where: {
          username: userData.username,
          password: userData.password,
          is_active: true
        }
      });
      if (!user) return sendResponse(401, "Wrong Username or Password", res)

      //generate Access Token
      const payload = {
        username: user.username,
        is_admin: user.is_admin
      };
      const accessToken = AccessToken.generate(payload);
      const data = { accessToken }
      sendData(200, data, "Login successful", res)      
    }
    catch (err) {
      next(err);
    }
  };

  static async findAllAdmins(req, res, next) {
    try {
      const users = await User.findAll({
        where: { is_admin: true },
        order: [['fullname', 'asc']]
      });
      sendData(200, users, "Success get all admins", res)
    }
    catch (err) {
      next(err);
    }
  };

  static async findAllUsers(req, res, next) {
    try {
      const users = await User.findAll({
        where: { is_admin: false },
        order: [['fullname', 'asc']]
      });
      sendData(200, users, "Success get all users", res)
    }
    catch (err) {
      next(err);
    }
  };

  static async getUser(req, res, next) {
    const username = req.params.username
    try {
      const user = await User.findOne({
        where: { username }
      })
      if (!user) return sendResponse(404, "User not found", res)
      sendData(200, user, "Success Get Detail User", res)
    } 
    catch (error) {
      next(error)
    }
  }

  static async toggleUser(req, res, next) {
    const currentUsername = req.params.username
    let userData = {
      is_active: false
    };
    try {
      const user = await User.findOne({
        where: { username: currentUsername }
      })
      if (!user) return sendResponse(404, "User is not found", res)
      if (user.is_active == false) {
        userData.is_active = true
      }
      const updated = await User.update(userData, {
        where: { id: user.id },
        returning: true
      })
      sendResponse(200, "Success update user", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async resetPassword(req, res, next) {
    const username = req.params.username;
    try {
      //check if user is exist
      const user = await User.findOne({
        where: { username }
      })
      if (!user) return sendResponse(404, "User is not found", res)

      //set default password with user's birthday date in DDMMYYYY format
      const password = username;
      const updated = await User.update({ password }, {
        where: { id: user.id },
        returning: true
      })
      sendResponse(200, "Success update password", res)

    }
    catch (err) {
      next(err)
    }
  }

  static async updatePassword(req, res, next) {
    const username = req.params.username;
    const { old_password, new_password } = req.body;
    try {
      const user = await User.findOne({
        where: { username, password: old_password }
      })
      if (!user) return sendResponse(404, "Old Password does not match", res)

      const updated = await User.update({ password: new_password }, {
        where: { id: user.id },
        returning: true
      })
      sendResponse(200, "Success update password", res)
    }
    catch (err) {
      next(err)
    }
  }

  static async updateUser(req, res, next) {
    const currentUsername = req.params.username
    const { 
      fullname, username, password, is_admin
    } = req.body;
    try {
      //check if user is exist
      const user = await User.findOne({
        where: { username: currentUsername }
      })
      if (!user) return sendResponse(404, "User is not found", res)

      //check if new username is already used
      const newUsername = await User.findOne({
        where: { username }
      })
      if (newUsername) return sendResponse(403, "Username is already used", res)

      const updatedUser = await User.update(
        { 
          fullname, username, password, is_admin
        }, 
        {
          where: { id: user.id },
          returning: true
        }
      )
      sendResponse(200, "Success update user", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = UserController;