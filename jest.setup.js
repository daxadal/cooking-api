module.exports = async () => {
  process.env.DB_NAME = "jest_" + new Date().toISOString().replace(/\W/g, "_");
};
