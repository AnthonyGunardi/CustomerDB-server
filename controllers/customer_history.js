const { sequelize, Customer, Customer_History, Division, User } = require('../models/index.js');
const { Op } = require('sequelize');
const { sendResponse, sendData } = require('../helpers/response.js');

class CustomerHistoryController {
  static async getCustomerHistoriesByScroll(req, res, next) {
    try {
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const search = req.query.key || "";
      const userRole = req.user.role;
      const userDivision = req.user.division_id;

      let baseWhere = {
        [Op.or]: [
          { fullname: { [Op.like]: "%" + search + "%" } },
          { company: { [Op.like]: "%" + search + "%" } }
        ]
      };

      if (userRole === "superadmin") {
        baseWhere[Op.or].push({
          division_id: {
            [Op.in]: sequelize.literal(
              `(SELECT id FROM Divisions WHERE name LIKE ${sequelize.escape('%' + search + '%')})`
            )
          }
        });
      } else {
        // non-superadmin: restrict by division_id only
        baseWhere.division_id = userDivision;
      }

      if (lastID > 0) {
        baseWhere.id = { [Op.lt]: lastID };
      }

      const result = await Customer_History.findAll({
        where: baseWhere,
        attributes: { exclude: ["customer_id", "user_id"] },
        include: [
          {
            model: Customer,
            attributes: { exclude: ["user_id"] },
            include: {
              model: User,
              attributes: { exclude: ["id", "password", "createdAt", "updatedAt"] }
            }
          },
          {
            model: Division,
            attributes: { exclude: ["id", "createdAt", "updatedAt"] }
          },
          {
            model: User,
            attributes: { exclude: ["id", "password", "createdAt", "updatedAt"] }
          }
        ],
        limit,
        order: [["id", "DESC"]]
      });

      const payload = {
        datas: result,
        lastID: result.length ? result[result.length - 1].id : 0,
        hasMore: result.length >= limit
      };

      sendData(200, payload, "Success get customer histories", res);
    } catch (err) {
      next(err);
    }
  }

  static async getCustomerHistoryByCustomer(req, res, next) {
    try {
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const customer_id = req.params.customer_id;
      let result = [];

      if (lastID < 1) {
        //get customer history by customer_id
        const results = await Customer_History.findAll({
          where: { customer_id },
          attributes: {
            exclude: ['user_id']
          },
          include: [
            {
              model: Division,
              attributes: {
                exclude: ['id', 'createdAt', 'updatedAt']
              }
            },
            {
              model: User,
              attributes: {
                exclude: ['id', 'password', 'createdAt', 'updatedAt']
              }
            }
          ],
          limit: limit,
          order: [
            ['id', 'DESC']
          ]
        })
        result = results
      } else {
        // get customer history by customer_id where its ID is less than lastID
        const results = await Customer_History.findAll({
          where: {
            id: {
              [Op.lt]: lastID
            },
            customer_id
          },
          attributes: {
            exclude: ['user_id']
          },
          include: [
            {
              model: Division,
              attributes: {
                exclude: ['id', 'createdAt', 'updatedAt']
              }
            },
            {
              model: User,
              attributes: {
                exclude: ['id', 'password', 'createdAt', 'updatedAt']
              }
            }
          ],
          limit: limit,
          order: [
            ['id', 'DESC']
          ]
        })
        result = results
      }
      
      const payload = {
        datas: result,
        lastID: result.length ? result[result.length - 1].id : 0,
        hasMore: result.length >= limit ? true : false
      };
      sendData(200, payload, "Success get customer histories", res)
    } 
    catch (err) {
      next(err)
    };
  };

  static async getCustomerHistory(req, res, next) {
    const id = req.params.id
    try {
      const customerHistory = await Customer_History.findOne({
        where: { id },
        attributes: {
          exclude: ['customer_id','user_id']
        },
        include: [
          {
            model: Customer,
            attributes: {
              exclude: ['user_id']
            },
            include: {
              model: User,
              attributes: {
                exclude: ['id', 'password', 'createdAt', 'updatedAt']
              }
            }
          },
          {
            model: Division,
            attributes: {
              exclude: ['id', 'createdAt', 'updatedAt']
            }
          },
          {
            model: User,
            attributes: {
              exclude: ['id', 'password', 'createdAt', 'updatedAt']
            }
          }
        ]
      })
      if (!customerHistory) return sendResponse(404, "Customer history is not found", res)
      sendData(200, customerHistory, "Success get customer history data", res)
    } 
    catch (err) {
      next(err)
    }
  }

};

module.exports = CustomerHistoryController;