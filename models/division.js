'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Division extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Division.hasMany(models.Customer, {foreignKey: 'division_id', sourceKey: 'id'})
      Division.hasMany(models.Customer_History, {foreignKey: 'division_id', sourceKey: 'id'})
      Division.hasMany(models.User, {foreignKey: 'division_id', sourceKey: 'id'})
    }
  }
  Division.init({
    name: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Division',
  });
  return Division;
};