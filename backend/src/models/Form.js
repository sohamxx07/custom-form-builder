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
}, {
  tableName: 'forms',
  timestamps: true,
});

Form.associate = (models) => {
  Form.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Form.hasMany(models.FormField, { foreignKey: 'formId', as: 'fields', onDelete: 'CASCADE' });
  Form.hasMany(models.FormResponse, { foreignKey: 'formId', as: 'responses', onDelete: 'CASCADE' });
};

module.exports = Form;
