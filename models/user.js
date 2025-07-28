'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Customer, {foreignKey: 'user_id', sourceKey: 'id'})
      User.hasMany(models.Customer_History, {foreignKey: 'user_id', sourceKey: 'id'})
      User.hasMany(models.FollowUp, {foreignKey: 'user_id', sourceKey: 'id'})
      User.belongsTo(models.Division, {foreignKey: 'division_id', targetKey: 'id'})
    }
  }
  User.init({
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
    username: {
      type: DataTypes.STRING,
      allowNull:false,
      unique:true,
      validate: {
        notEmpty: {
          msg: 'Username is Required'
        },
        notNull: {
          msg: 'Username is Required'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '123456',
      validate: {
        notEmpty: {
          msg: `Password is Required`
        },
        notNull: {
          msg: `Password is Required`
        }
      }
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    division_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'User'
  });
  return User;
};