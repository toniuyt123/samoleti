const DBManager = require('../util/dbManager.js');
const db = new DBManager();

module.exports = function (app) {
  app.post('/flight_path', async function (req, res) {
    console.log(req.body);
  });
};
