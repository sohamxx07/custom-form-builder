const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Form = sequelize.define('Form', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title is required' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'draft',
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  theme: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    get() {
      const rawValue = this.getDataValue('theme');
      if (!rawValue) return null;
      if (typeof rawValue === 'object') return rawValue;
      try {
        return JSON.parse(rawValue);
      } catch (e) {
        return rawValue;
      }
    },
  },
}, {
  tableName: 'forms',
  timestamps: true,
});

Form.prototype.toJSON = function () {
  const values = { ...this.get() };
  if (typeof values.theme === 'string') {
    try {
      values.theme = JSON.parse(values.theme);
    } catch (e) {}
  }
  return values;
};

Form.associate = (models) => {
  Form.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Form.hasMany(models.FormField, { foreignKey: 'formId', as: 'fields', onDelete: 'CASCADE' });
  Form.hasMany(models.FormResponse, { foreignKey: 'formId', as: 'responses', onDelete: 'CASCADE' });
};

module.exports = Form;
