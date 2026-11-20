const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

let sequelize;

// Priority 1: Full Database Connection String (e.g. Railway, PlanetScale, Aiven, RDS)
if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
  const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  const isSslDisabled = process.env.DB_SSL === 'false';

  sequelize = new Sequelize(connectionUrl, {
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: isSslDisabled
      ? {}
      : {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}
// Priority 2: Individual MySQL Environment Variables (DB_HOST, DB_USER, etc.)
else if (process.env.DB_HOST) {
  const isSslEnabled = process.env.DB_SSL === 'true';

  sequelize = new Sequelize(
    process.env.DB_NAME || 'custom_form_builder',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: isSslEnabled
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}
// Priority 3: SQLite fallback for local development or file-based environments
else {
  const dbStorage = process.env.DB_STORAGE || "./database.sqlite";
  // On Vercel serverless functions without external DB, write to ephemeral /tmp
  const resolvedDbPath = process.env.VERCEL
    ? path.join('/tmp', 'database.sqlite')
    : path.resolve(__dirname, "../../", dbStorage);

  const dbDir = path.dirname(resolvedDbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: resolvedDbPath,
    logging: false,
    pool: {
      max: 1,
      min: 1,
      acquire: 30000,
      idle: 10000,
    },
  });
}

module.exports = sequelize;
