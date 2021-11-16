module.exports = {
  databaseOptions: {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "kitchen_" + new Date().toISOString(),
  },
  createDatabase: false,
  truncateDatabase: false,
};
