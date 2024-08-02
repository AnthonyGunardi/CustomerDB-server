'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer_History extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Customer_History.belongsTo(models.Customer, {foreignKey: 'customer_id', targetKey: 'id'})
      Customer_History.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id'})
    }
  }
  Customer_History.init({
    fullname: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: 'Full name is Required'
        },
        notNull: {
          msg: 'Full name is Required'
        }
      }
    },
    company: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          msg: 'Email address is not valid'
        }
      }
    },
    birthday: DataTypes.DATEONLY,
    product: DataTypes.STRING,
    note: DataTypes.STRING,
    customer_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Customer_History',
  });
  return Customer_History;
};