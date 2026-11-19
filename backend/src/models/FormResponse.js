const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FormResponse = sequelize.define(
  'FormResponse',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    formId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'forms',
        key: 'id',
      },
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: 'form_responses',
    timestamps: true,
  }
);

FormResponse.associate = (models) => {
  FormResponse.belongsTo(models.Form, { foreignKey: 'formId', as: 'form' });
};

module.exports = FormResponse;
