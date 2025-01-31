const {
  Customer,
  Customer_History,
  Division,
  User,
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

class CustomerController {
  static async create(req, res, next) {
    try {
      const username = req.user.username;
      const {
        fullname,
        company,
        address,
        phone,
        email,
        birthday,
        product,
        note,
        is_active,
        division_id,
      } = req.body;

      //get user_id
      const user = await User.findOne({
        where: { username },
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //check if customer already exist
      const customer = await Customer.findOne({
        where: {
          [Op.or]: [{ phone }, { email }],
        },
      });
      if (Boolean(customer))
        return sendResponse(400, "Customer already exist", res);

      const newCustomer = await Customer.create({
        fullname,
        company,
        address,
        phone,
        email,
        birthday,
        product,
        note,
        is_active,
        user_id: user.id,
        division_id,
      });
      sendData(
        201,
        {
          fullname: newCustomer.fullname,
          company: newCustomer.company,
          product: newCustomer.product,
        },
        "Success create customer",
        res
      );
    } catch (err) {
      next(err);
    }
  }

  static async toggleCustomer(req, res, next) {
    const currentID = req.params.id;
    let customerData = {
      is_active: false,
    };
    try {
      const customer = await Customer.findOne({
        where: { id: currentID },
      });
      if (!customer) return sendResponse(404, "Customer is not found", res);
      if (customer.is_active == false) {
        customerData.is_active = true;
      }
      const updated = await Customer.update(customerData, {
        where: { id: customer.id },
        returning: true,
      });
      sendResponse(200, "Success update customer", res);
    } catch (err) {
      next(err);
    }
  }

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
            exclude: ["user_id"],
          },
          include: [
            {
              model: Division,
              attributes: {
                exclude: ["id", "createdAt", "updatedAt"],
              },
            },
            {
              model: User,
              attributes: {
                exclude: ["id", "password", "createdAt", "updatedAt"],
              },
            },
          ],
          limit: limit,
          order: [["id", "DESC"]],
        });
        result = results;
      } else {
        // get customers where its ID is less than lastID, and its fullname or company is like keyword
        const results = await Customer.findAll({
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
            exclude: ["user_id"],
          },
          include: [
            {
              model: Division,
              attributes: {
                exclude: ["id", "createdAt", "updatedAt"],
              },
            },
            {
              model: User,
              attributes: {
                exclude: ["id", "password", "createdAt", "updatedAt"],
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
      sendData(200, payload, "Success get customers data", res);
    } catch (err) {
      next(err);
    }
  }

  static async getCustomer(req, res, next) {
    const id = req.params.id;
    try {
      const customer = await Customer.findOne({
        where: { id },
        attributes: {
          exclude: ["user_id"],
        },
        include: [
          {
            model: Division,
            attributes: {
              exclude: ["id", "createdAt", "updatedAt"],
            },
          },
          {
            model: User,
            attributes: {
              exclude: ["id", "password", "createdAt", "updatedAt"],
            },
          },
        ],
      });
      if (!customer) return sendResponse(404, "Customer is not found", res);
      sendData(200, customer, "Success get customer data", res);
    } catch (err) {
      next(err);
    }
  }

  static async getCompanies(req, res, next) {
    try {
      const companies = await Customer.findAll({
        attributes: ["company"],
        raw: true,
      });

      res.status(200).json({
        success: true,
        message: "Successfully retrieved companies",
        data: companies,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerFromCompany(req, res, next) {
    const company = req.params.company;
    try {
      const customers = await Customer.findAll({
        where: { company },
        include: [
          {
            model: Division,
            attributes: {
              exclude: ["id", "createdAt", "updatedAt"],
            },
          },
          {
            model: User,
            attributes: {
              exclude: ["id", "password", "createdAt", "updatedAt"],
            },
          },
        ],
      });
      if (customers.length === 0) return sendResponse(404, "Customer is not found", res);
      sendData(200, customers, "Success get customer data", res);
    } catch (err) {
      next(err);
    }
  }

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
              ],
            },
            {
              [Op.and]: [
                sequelize.literal(
                  `MONTH(birthday) = ${futureDate.getMonth() + 1}`
                ),
                Sequelize.literal(`DAY(birthday) <= ${futureDate.getDate()}`),
              ],
            },
          ],
        },
        attributes: {
          exclude: ["user_id"],
        },
        order: [["birthday", "ASC"]],
      });
      const customers = await Customer.findAll();
      const divisions = await Division.findAll({
        where: { is_active: true, id: { [Op.ne]: 1 } },
      });
      const companies = await Customer.count({
        distinct: true,
        col: "company",
      });
      const data = {
        upcoming_birthday: birthdayCustomers,
        total_customer: customers.length,
        total_division: divisions.length,
        total_company: companies,
      };
      sendData(200, data, "Success get all birthday customers", res);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    const id = req.params.id;
    const username = req.user.username;
    const {
      fullname,
      company,
      address,
      phone,
      email,
      birthday,
      product,
      note,
      division_id,
    } = req.body;
    try {
      //check if customer is exist
      const customer = await Customer.findOne({
        where: { id },
      });
      if (!customer) return sendResponse(404, "Customer is not found", res);

      //get user_id
      const user = await User.findOne({
        where: { username },
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //check if updated phone or email is already used
      const customerWithSameData = await Customer.findOne({
        where: {
          [Op.and]: [
            {
              id: {
                [Op.ne]: customer.id,
              },
            },
            {
              [Op.or]: [{ phone }, { email }],
            },
          ],
        },
      });
      if (customerWithSameData)
        return sendResponse(403, "Phone or email already used", res);

      const updatedCustomer = await Customer.update(
        {
          fullname,
          company,
          address,
          phone,
          email,
          birthday,
          product,
          note,
          division_id,
          user_id: user.id,
        },
        { where: { id: customer.id }, returning: true }
      );
      const customerHistory = await Customer_History.create({
        fullname: customer.fullname,
        company: customer.company,
        address: customer.address,
        phone: customer.phone,
        email: customer.email,
        birthday: customer.birthday,
        product: customer.product,
        note: customer.note,
        division_id: customer.division_id,
        customer_id: customer.id,
        user_id: user.id,
      });
      sendResponse(200, "Success update customer", res);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CustomerController;
