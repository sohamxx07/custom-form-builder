const sequelize = require('./db');

async function runMigration() {
  try {
    // 1. Check if the 'forms' table exists in SQLite
    const [tables] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='forms';"
    );

    // If 'forms' table doesn't exist yet, it will be created cleanly on sync
    if (!tables || tables.length === 0) {
      return true;
    }

    // 2. If 'forms' table exists, inspect existing columns and add any missing ones
    const [cols] = await sequelize.query("PRAGMA table_info('forms');");
    const names = (cols || []).map((c) => c.name);

    if (!names.includes('status')) {
      await sequelize.query("ALTER TABLE forms ADD COLUMN status VARCHAR(255) DEFAULT 'draft';");
      console.log('[Migration] Added "status" column to forms table.');
    }
    if (!names.includes('slug')) {
      await sequelize.query("ALTER TABLE forms ADD COLUMN slug VARCHAR(255);");
      console.log('[Migration] Added "slug" column to forms table.');
    }
    if (!names.includes('publishedAt')) {
      await sequelize.query("ALTER TABLE forms ADD COLUMN publishedAt DATETIME;");
      console.log('[Migration] Added "publishedAt" column to forms table.');
    }

    // 3. Ensure form_responses table exists
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS form_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        formId INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
        answers TEXT NOT NULL DEFAULT '{}',
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      );
    `);

    return true;
  } catch (error) {
    console.error('[Migration] Failed:', error.message || error);
    throw error;
  }
}

module.exports = runMigration;

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
