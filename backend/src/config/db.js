const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const dbStorage = process.env.DB_STORAGE || "./database.sqlite";
const resolvedDbPath = path.resolve(__dirname, "../../", dbStorage);

// Ensure the directory for the database file exists if in a subdirectory
const dbDir = path.dirname(resolvedDbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: resolvedDbPath,
  logging: false,
});

module.exports = sequelize;
