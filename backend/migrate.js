import db from './db.js';

async function migrate() {
  const exists = await db.schema.hasTable('sites');
  if (!exists) {
    await db.schema.createTable('sites', table => {
      table.increments('id').primary(); // auto-incremento
      table.string('url').notNullable();
      table.string('status').notNullable();
      table.timestamp('lastChecked').notNullable();
    });
    console.log('Tabela sites criada.');
  } else {
    console.log('Tabela sites já existe.');
  }
  process.exit(0);
}

migrate();
