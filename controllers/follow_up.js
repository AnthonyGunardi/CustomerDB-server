const {
  Customer,
  Customer_History,
  Division,
  User,
  FollowUp,
} = require("../models/index.js");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
let sequelize;
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}
const { sendResponse, sendData } = require("../helpers/response.js");

class FollowUpController {
  static async createFollowUp(req, res, next) {}

  static async getFollowUpsByScroll(req, res, next) {
    try {
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const search = req.query.key || "";
      let result = [];

      if (lastID < 1) {
        //get customers where its fullname or company is like keyword
        const results = await FollowUp.findAll({
          where: {
            [Op.or]: [
              {
                fullname: {
                  [Op.like]: "%" + search + "%",
                },
              },
              {
                company: {
                  [Op.like]: "%" + search + "%",
                },
              },
              {
                division_id: {
                  [Op.in]: sequelize.literal(
                    `(SELECT id FROM Divisions WHERE name LIKE '%${search}%')`
                  ),
                },
              },
            ],
          },
          attributes: {
            exclude: ["customer_id", "user_id"],
          },
          include: [
            {
              model: Customer,
              include: {
                model: Division,
                attributes: {
                  exclude: ["id", "createdAt", "updatedAt"],
                },
              },
              attributes: {
                exclude: ["user_id"],
              },
            },
          ],
          limit: limit,
          order: [["id", "DESC"]],
        });
        result = results;
      } else {
        // get customers where its ID is less than lastID, and its fullname or company is like keyword
        const results = await FollowUp.findAll({
          where: {
            id: {
              [Op.lt]: lastID,
            },
            [Op.or]: [
              {
                fullname: {
                  [Op.like]: "%" + search + "%",
                },
              },
              {
                company: {
                  [Op.like]: "%" + search + "%",
                },
              },
              {
                division_id: {
                  [Op.in]: sequelize.literal(
                    `(SELECT id FROM Divisions WHERE name LIKE '%${search}%')`
                  ),
                },
              },
            ],
          },
          attributes: {
            exclude: ["customer_id", "user_id"],
          },
          include: [
            {
              model: Customer,
              include: {
                model: Division,
                attributes: {
                  exclude: ["id", "createdAt", "updatedAt"],
                },
              },
              attributes: {
                exclude: ["user_id"],
              },
            },
          ],
          limit: limit,
          order: [["id", "DESC"]],
        });
        result = results;
      }

      const payload = {
        datas: result,
        lastID: result.length ? result[result.length - 1].id : 0,
        hasMore: result.length >= limit ? true : false,
      };
      sendData(200, payload, "Success get customer histories", res);
    } catch (err) {
      next(err);
    }
  }

  static async getFollowUps(res, next) {
    try {
      const followups = await FollowUp.findAll({
        include: [
          {
            model: Customer,
            include: [
              {
                model: Division,
                exclude: ["id", "createdAt", "updatedAt"],
              },
            ],
          },
        ],
        order: [["id", "DESC"]],
      });

      sendData(200, followups, "Success get all followups", res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FollowUpController;
