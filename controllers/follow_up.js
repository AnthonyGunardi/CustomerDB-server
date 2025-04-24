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
  static async createFollowUp(req, res, next) {
    try {
      const { user_id, customer_id, note, nextFollowUpDate } = req.body;

      const nextDate = new Date(nextFollowUpDate);
      const now = new Date();

      if (isNaN(nextDate.getTime())) {
        return sendResponse(400, "Invalid date format", res);
      }

      if (nextDate <= now) {
        return sendResponse(
          400,
          "Next follow up date must be greater than current date",
          res
        );
      }
      //disable all the other followups
      await FollowUp.update(
        {
          is_active: false,
        },
        {
          where: {
            customer_id,
            is_active: true,
          },
        }
      );

      const followUp = await FollowUp.create({
        user_id,
        customer_id,
        note,
        nextFollowUpDate,
        is_active: true,
      });

      return sendResponse(200, "Success create follow up", res);
    } catch (error) {
      next(error);
    }
  }

  static async getFollowUpByCustomer(req, res, next) {
    try {
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const customer_id = req.params.customer_id;
      let result = [];

      let dataCustomer = await Customer.findOne({
        where: {
          id: customer_id,
        },
        include: [
          {
            model: Division,
            attributes: {
              exclude: ["id", "createdAt", "updatedAt"],
            },
          },
        ],
      });

      if (lastID < 1) {
        const results = await FollowUp.findAll({
          where: {
            customer_id,
          },
          include: [
            {
              model: Customer,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: User,
              attributes: {
                exclude: ["password", "createdAt", "updatedAt"],
              },
            },
          ],
          limit: limit,
          order: [["id", "DESC"]],
        });
        result = results;
      } else {
        const results = await FollowUp.findAll({
          where: {
            customer_id,
            id: {
              [Op.lt]: lastID,
            },
          },
          include: [
            {
              model: Customer,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: User,
              attributes: {
                exclude: ["password", "createdAt", "updatedAt"],
              },
            },
          ],
          limit: limit,
          order: [["id", "DESC"]],
        });
        result = results;
      }

      const payload = {
        dataCustomer: dataCustomer,
        datas: result,
        lastID: result.length ? result[result.length - 1].id : 0,
        hasMore: result.length >= limit ? true : false,
      };

      sendData(200, payload, "Success get follow up by customer", res);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  static async getFollowUpsByScroll(req, res, next) {
    try {
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const status =
        req.query.status === "true"
          ? true
          : req.query.status === "false"
          ? false
          : undefined;
      const search = req.query.key || "";
      let result = [];

      const whereClause = req.user.is_admin
        ? {}
        : { division_id: req.user.division_id };

      const orderCriteria = status
        ? [[sequelize.col("FollowUp.nextFollowUpDate"), "DESC"]]
        : [[sequelize.col("FollowUp.createdAt"), "DESC"]];

      if (lastID < 1) {
        //get customers where its fullname or company is like keyword
        const results = await FollowUp.findAll({
          where: {
            [Op.or]: [
              sequelize.where(sequelize.col("Customer.fullname"), {
                [Op.like]: `%${search}%`,
              }),
              sequelize.where(sequelize.col("Customer.company"), {
                [Op.like]: `%${search}%`,
              }),
            ],
            is_active: status,
          },
          attributes: {
            exclude: ["customer_id", "user_id"],
          },
          include: [
            {
              model: Customer,
              attributes: {
                exclude: ["user_id"],
              },
              where: {
                ...whereClause,
              },
            },
            {
              model: User,
              attributes: {
                exclude: ["password", "createdAt", "updatedAt"],
              },
            },
          ],
          limit: limit,
          order: orderCriteria,
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
              sequelize.where(sequelize.col("Customer.fullname"), {
                [Op.like]: `%${search}%`,
              }),
              sequelize.where(sequelize.col("Customer.company"), {
                [Op.like]: `%${search}%`,
              }),
            ],
            is_active: status,
          },
          attributes: {
            exclude: ["customer_id", "user_id"],
          },
          include: [
            {
              model: Customer,
              attributes: {
                exclude: ["user_id"],
              },
              where: {
                ...whereClause,
              },
            },
            {
              model: User,
              attributes: {
                exclude: ["password", "createdAt", "updatedAt"],
              },
            },
          ],
          limit: limit,
          order: orderCriteria,
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
