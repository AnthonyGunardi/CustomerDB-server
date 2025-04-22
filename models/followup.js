'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FollowUp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      FollowUp.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id'})
      FollowUp.belongsTo(models.Customer, {foreignKey: 'customer_id', targetKey: 'id'})
    }
  }
  FollowUp.init({
    user_id: DataTypes.INTEGER,
    customer_id: DataTypes.INTEGER,
    note: DataTypes.TEXT,
    nextFollowUpDate: DataTypes.DATE,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'FollowUp',
  });
  return FollowUp;
};