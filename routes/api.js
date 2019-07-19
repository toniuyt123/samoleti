const DBManager = require('../util/dbManager.js');
const db = new DBManager();

module.exports = function (app) {
  app.get('/flight_path', async function (req, res) {
    res.end();
  });
};
