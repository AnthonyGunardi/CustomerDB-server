'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Customer.belongsTo(models.User, {foreignKey: 'user_id', targetKey: 'id'})
      Customer.belongsTo(models.Division, {foreignKey: 'division_id', targetKey: 'id'})
      Customer.hasMany(models.Customer_History, {foreignKey: 'customer_id', sourceKey: 'id'})
      Customer.hasMany(models.FollowUp, {foreignKey: 'customer_id', sourceKey: 'id'})
    }
  }
  Customer.init({
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
    is_active: DataTypes.BOOLEAN,
    user_id: DataTypes.INTEGER,
    division_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Customer',
  });
  return Customer;
};