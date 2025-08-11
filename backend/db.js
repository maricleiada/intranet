import knex from 'knex';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './data.sqlite3'  // arquivo do banco SQLite
  },
  useNullAsDefault: true,
});

export default db;
