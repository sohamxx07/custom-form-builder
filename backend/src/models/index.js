const sequelize = require('../config/db');
const User = require('./User');
const Form = require('./Form');
const FormField = require('./FormField');
const FormResponse = require('./FormResponse');

const db = {
  sequelize,
  User,
  Form,
  FormField,
  FormResponse,
};

// Run model associations if defined
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
