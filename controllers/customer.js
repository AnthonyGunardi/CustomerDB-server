const { Customer, Customer_History, User } = require('../models/index.js');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
let sequelize;
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
const { sendResponse, sendData } = require('../helpers/response.js');

class CustomerController {
  static async create(req, res, next) {
    try {
      const username = req.user.username
      const { fullname, company, address, phone, email, birthday, product, note } = req.body;

      //get user_id
      const user = await User.findOne({ 
        where: { username } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //check if customer already exist
      const customer = await Customer.findOne({ 
        where: { 
          [Op.or]: [{ phone }, { email }] 
        } 
      });
      if (Boolean(customer)) return sendResponse(400, 'Customer already exist', res);

      const newCustomer = await Customer.create(
        { fullname, company, address, phone, email, birthday, product, note, user_id: user.id }
      );
      sendData(201, { fullname: newCustomer.fullname, company: newCustomer.company, product: newCustomer.product }, "Success create customer", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getCustomersByScroll(req, res, next) {
    try {
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const search = req.query.key || "";
      let result = [];

      if (lastID < 1) {
        //get customers where its fullname or company is like keyword
        const results = await Customer.findAll({
          where: {
            [Op.or]: [
              {fullname: {
                [Op.like]: '%'+search+'%'
              }}, 
              {company:{
                [Op.like]: '%'+search+'%'
              }}
            ]
          },
          attributes: {
            exclude: ['user_id']
          },
          include: {
            model: User,
            attributes: {
              exclude: ['id', 'password', 'createdAt', 'updatedAt']
            }
          },
          limit: limit,
          order: [
            ['id', 'DESC']
          ]
        })
        result = results
      } else {
        // get customers where its ID is less than lastID, and its fullname or company is like keyword
        const results = await Customer.findAll({
          where: {
            id: {
              [Op.lt]: lastID
            },
            [Op.or]: [
              {fullname: {
                [Op.like]: '%'+search+'%'
              }}, 
              {company:{
              [Op.like]: '%'+search+'%'
              }}
            ]
          },
          attributes: {
            exclude: ['user_id']
          },
          include: {
            model: User,
            attributes: {
              exclude: ['id', 'password', 'createdAt', 'updatedAt']
            }
          },
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
      sendData(200, payload, "Success get customers data", res)
    } 
    catch (err) {
        next(err)
    };
  };

  static async getCustomer(req, res, next) {
    const id = req.params.id
    try {
      const customer = await Customer.findOne({
        where: { id },
        attributes: {
          exclude: ['user_id']
        },
        include: {
          model: User,
          attributes: {
            exclude: ['id', 'password', 'createdAt', 'updatedAt']
          }
        }
      })
      if (!customer) return sendResponse(404, "Customer is not found", res)
      sendData(200, customer, "Success get customer data", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async update(req, res, next) {
    const id = req.params.id
    const username = req.user.username
    const { fullname, company, address, phone, email, birthday, product, note } = req.body;
    try {
      //check if customer is exist
      const customer = await Customer.findOne({
        where: { id }
      })
      if (!customer) return sendResponse(404, "Customer is not found", res)

      //get user_id
      const user = await User.findOne({ 
        where: { username } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //check if updated phone or email is already used
      const customerWithSameData = await Customer.findOne({
        where: { 
          [Op.and]: [
            { 
              id: {
                [Op.ne]: customer.id, 
              } 
            },
            { 
              [Op.or]: [
                { phone },
                { email }
              ]
            }
          ]
        }
      })
      if (customerWithSameData) return sendResponse(403, "Phone or email already used", res)

      const updatedCustomer = await Customer.update(
        { fullname, company, address, phone, email, birthday, product, note, user_id: user.id }, 
        { where: { id: customer.id }, returning: true }
      )
      const customerHistory = await Customer_History.create(
        { fullname: customer.fullname, 
          company: customer.company, 
          address: customer.address, 
          phone: customer.phone, 
          email: customer.email, 
          birthday: customer.birthday, 
          product: customer.product, 
          note: customer.note,
          customer_id: customer.id,
          user_id: user.id 
        }
      );
      sendResponse(200, "Success update customer", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async findBirthdayCustomers(req, res, next) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    try {
      const birthdayCustomers = await Customer.findAll({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                sequelize.literal(`MONTH(birthday) = ${today.getMonth() + 1}`),
                sequelize.literal(`DAY(birthday) >= ${today.getDate()}`),
              ]
            },
            {
              [Op.and]: [
                sequelize.literal(`MONTH(birthday) = ${futureDate.getMonth() + 1}`),
                Sequelize.literal(`DAY(birthday) <= ${futureDate.getDate()}`),
              ]
            }
          ]
        },
        attributes: {
          exclude: ['user_id']
        },
        order: [['birthday', 'ASC']]
      });
      const customers = await Customer.findAll();
      const data = {upcoming_birthday: birthdayCustomers, total_customer: customers.length};
      sendData(200, data, "Success get all birthday customers", res)
    }
    catch (err) {
      next(err);
    }
  };
};

module.exports = CustomerController;