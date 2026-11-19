const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const FormField = sequelize.define(
  "FormField",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Label is required" },
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Type is required" },
      },
    },
    placeholder: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    formId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "forms",
        key: "id",
      },
    },
  },
  {
    tableName: "form_fields",
    timestamps: true,
  },
);

FormField.associate = (models) => {
  FormField.belongsTo(models.Form, { foreignKey: "formId", as: "form" });
};

module.exports = FormField;
