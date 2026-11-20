const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = require('./src/app');
const sequelize = require('./src/config/db');

const runMigration = require('./src/config/migrate');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Authenticate and test the database connection
    await sequelize.authenticate();
    console.log(`[Database] ${sequelize.getDialect().toUpperCase()} connection established successfully.`);

    // Create database tables if they do not exist
    await sequelize.sync();
    console.log('[Database] All models synchronized successfully.');

    // Ensure database columns exist for existing tables
    await runMigration();

    // Start Express HTTP server (listen on PORT if not managed by Vercel serverless)
    const server = app.listen(PORT, () => {
      console.log(`[Server] Server listening on port ${PORT} (http://localhost:${PORT})`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    });

    server.on('error', (err) => {
      console.error('[Server] HTTP server error:', err.message);
      if (!process.env.VERCEL) {
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('[Database] Unable to connect or synchronize database:');
    console.error(error.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}

startServer();

module.exports = app;
