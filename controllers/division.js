const { Division } = require('../models');
const { Op } = require('sequelize');
const AccessToken = require('../helpers/accessToken');
const { sendResponse, sendData } = require('../helpers/response');

class DivisionController {
  static async addDivision(req, res, next) {    
    try {
      const { name, is_active } = req.body

      //check if division is already exist
      const division = await Division.findOne({ where: { name } });
      if (Boolean(division)) return sendResponse(400, 'Division already exist', res)

        const newDivision = await Division.create({ name, is_active });
        sendData(201, { name: newDivision.name }, "Division is created", res);
    }
    catch (err) {
      next(err)
    };
  };

  static async findAllDivisions(req, res, next) {
    try {
      const divisions = await Division.findAll({
        order: [['name', 'asc']]
      });
      sendData(200, divisions, "Success get all divisioms", res)
    }
    catch (err) {
      next(err);
    }
  };

  static async getDivision(req, res, next) {
    const id = req.params.id
    try {
      const division = await Division.findOne({
        where: { id },
      })
      if (!division) return sendResponse(404, "Division not found", res)
      sendData(200, division, "Success Get Division Detail", res)
    } 
    catch (error) {
      next(error)
    }
  }

  static async toggleDivision(req, res, next) {
    const id = req.params.id
    let divisionData = {
      is_active: false
    };
    try {
      const division = await Division.findOne({
        where: { id }
      })
      if (!division) return sendResponse(404, "Division is not found", res)
      if (division.is_active == false) {
        divisionData.is_active = true
      }
      const updated = await Division.update(divisionData, {
        where: { id: division.id },
        returning: true
      })
      sendResponse(200, "Success update division", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async updateDivision(req, res, next) {
    const id = req.params.id
    const { 
      name, is_active
    } = req.body;
    try {
      //check if division is exist
      const division = await Division.findOne({
        where: { id }
      })
      if (!division) return sendResponse(404, "Division is not found", res)

      //check if new name is already used
      const newName = await Division.findOne({
        where: { 
          id: {
            [Op.ne]: division.id, 
          } 
          , name 
        }
      })
      if (newName) return sendResponse(403, "Name is already used", res)
      
      const updatedDivision = await Division.update(
        { 
          name, is_active
        }, 
        {
          where: { id: division.id },
          returning: true
        }
      )
      sendResponse(200, "Success update division", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = DivisionController;