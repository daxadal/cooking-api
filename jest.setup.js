module.exports = async () => {
  process.env.WINSTON_CONSOLE_LEVEL = "none";

  process.env.WINSTON_FILE_LEVEL = "info";
  process.env.WINSTON_FILE_PREFIX = "__jest__";

  process.env.WINSTON_SLACK_LEVEL = "none";
  process.env.WINSTON_SLACK_PRIORITY_WEBHOOK = undefined;
  process.env.WINSTON_SLACK_NON_PRIORITY_WEBHOOK = undefined;

  if (process.env.CI) {
    process.env.ENV = "CI_JEST";

    process.env.DB_HOST = "mysql-docker";
    process.env.DB_NAME =
      "jest_" + new Date().toISOString().replace(/\W/g, "_");
    process.env.DB_AUTO_CREATE = "true";
  } else {
    process.env.ENV = "JEST";

    process.env.DB_HOST = "localhost";
    process.env.DB_NAME = "jest_kitchen_js";
  }
};
