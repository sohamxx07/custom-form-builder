const sequelize = require('../config/db');
const User = require('./User');
const Form = require('./Form');
const FormField = require('./FormField');

const db = {
  sequelize,
  User,
  Form,
  FormField,
};

// Run model associations if defined
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
