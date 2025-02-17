const { User, Division } = require("../models");
const { Op } = require("sequelize");
const AccessToken = require("../helpers/accessToken");
const { sendResponse, sendData } = require("../helpers/response");
const bcrypt = require("bcryptjs");

class UserController {
  static async registerAdmin(req, res, next) {
    try {
      const { fullname, username, password, is_active } = req.body;

      //check if user is already exist
      const user = await User.findOne({ where: { username } });
      if (Boolean(user)) return sendResponse(400, "User already exist", res);

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        fullname,
        username,
        password: hashedPassword,
        password,
        is_admin: true,
        is_active,
      });
      sendData(
        201,
        {
          firstname: newUser.fullname,
          username: newUser.username,
          is_admin: newUser.is_admin,
        },
        "Admin User is created",
        res
      );
    } catch (err) {
      next(err);
    }
  }

  static async registerUser(req, res, next) {
    try {
      const { fullname, username, password, is_active, role, division_id } =
        req.body;

      let is_admin = true;
      if (role == "user") is_admin = false;

      //check if user is already exist
      const user = await User.findOne({ where: { username } });
      if (Boolean(user)) return sendResponse(400, "User already exist", res);

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        fullname,
        username,
        password: hashedPassword,
        is_admin,
        is_active,
        role,
        division_id,
      });
      sendData(
        201,
        {
          firstname: newUser.fullname,
          username: newUser.username,
          is_admin: newUser.is_admin,
          role: newUser.role,
          division_id: newUser.division_id,
        },
        "User is created",
        res
      );
    } catch (err) {
      next(err);
    }
  }

  static async userLogin(req, res, next) {
    const userData = {
      username: req.body.username,
      password: req.body.password,
    };
    try {
      //check if user is exist
      const user = await User.findOne({
        where: { username: userData.username, is_active: true },
      });
      if (!user) return sendResponse(401, "Wrong username or password", res);

      //check if password is correct
      const isMatch = await bcrypt.compare(userData.password, user.password);
      if (!isMatch) return sendResponse(401, "Wrong username or password", res);

      //generate Access Token
      const payload = {
        username: user.username,
        is_admin: user.is_admin,
        division_id: user.division_id,
        role: user.role,
      };
      const accessToken = AccessToken.generate(payload);
      const data = { accessToken };
      sendData(200, data, "Login successful", res);
    } catch (err) {
      next(err.message);
    }
  }

  static async findAllAdmins(req, res, next) {
    try {
      const users = await User.findAll({
        where: { is_admin: true },
        order: [["fullname", "asc"]],
      });
      sendData(200, users, "Success get all admins", res);
    } catch (err) {
      next(err);
    }
  }

  static async findAllUsers(req, res, next) {
    let users = [];
    try {
      if (req.user.role === "superadmin") {
        users = await User.findAll({
          where: { role: { [Op.ne]: "superadmin" } },
          attributes: {
            exclude: ["password"],
          },
          order: [["fullname", "asc"]],
        });
      } else {
        users = await User.findAll({
          where: { is_admin: false, division_id: req.user.division_id },
          attributes: {
            exclude: ["password"],
          },
          order: [["fullname", "asc"]],
        });
      }
      sendData(200, users, "Success get all users", res);
    } catch (err) {
      next(err);
    }
  }

  static async getUser(req, res, next) {
    const username = req.params.username;
    try {
      const user = await User.findOne({
        where: { username },
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: Division,
            attributes: {
              exclude: ["id", "is_active", "createdAt", "updatedAt"],
            },
          },
        ],
      });
      if (!user) return sendResponse(404, "User not found", res);
      sendData(200, user, "Success Get Detail User", res);
    } catch (error) {
      next(error);
    }
  }

  static async toggleUser(req, res, next) {
    const currentUsername = req.params.username;
    let userData = {
      is_active: false,
    };
    try {
      const user = await User.findOne({
        where: { username: currentUsername },
      });
      if (!user) return sendResponse(404, "User is not found", res);
      if (user.is_active == false) {
        userData.is_active = true;
      }
      const updated = await User.update(userData, {
        where: { id: user.id },
        returning: true,
      });
      sendResponse(200, "Success update user", res);
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req, res, next) {
    const username = req.params.username;
    try {
      //check if user is exist
      const user = await User.findOne({
        where: { username },
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //set default password with user's username
      const password = username;
      const updated = await User.update(
        { password },
        {
          where: { id: user.id },
          returning: true,
        }
      );
      sendResponse(200, "Success update password", res);
    } catch (err) {
      next(err);
    }
  }

  static async updatePassword(req, res, next) {
    const username = req.params.username;
    const { old_password, new_password } = req.body;
    try {
      //check if user is exist
      const user = await User.findOne({ where: { username } });
      if (!user) return sendResponse(404, "User not found", res);

      //check if old password is correct
      const isMatch = await bcrypt.compare(old_password, user.password);
      if (!isMatch) return sendResponse(400, "Wrong password", res);

      const newHashedPassword = await bcrypt.hash(new_password, 10);

      const updated = await User.update(
        { password: newHashedPassword },
        {
          where: { id: user.id },
          returning: true,
        }
      );
      sendResponse(200, "Success update password", res);
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req, res, next) {
    const currentUsername = req.params.username;
    let { fullname, username, password, role, division_id } = req.body;
    try {
      //check if user is exist
      const user = await User.findOne({
        where: { username: currentUsername },
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //check if new username is already used
      const newUsername = await User.findOne({
        where: {
          id: {
            [Op.ne]: user.id,
          },
          username,
        },
      });
      if (newUsername)
        return sendResponse(403, "Username is already used", res);

      let is_admin = true;
      if (role == "user") is_admin = false;

      let updateData = { fullname, username, is_admin, role, division_id };

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }

      const updatedUser = await User.update(updateData, {
        where: { id: user.id },
        returning: true,
      });
      sendResponse(200, "Success update user", res);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
