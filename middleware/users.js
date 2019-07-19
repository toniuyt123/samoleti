const DBManager = require('../util/dbManager.js');
const db = new DBManager();

module.exports = {
  loginware: async function (req, res, next) {
    if (req.cookies.sessionKey) {
      const session = await db.getSession(req.cookies.sessionKey);
      if (session.rows.length) {
        req.authenticated = true;
        req.userId = session.rows[0].user_id;
      } else {
        req.authenticated = false;
      }
      // console.log(req.authenticated, req.userId);
      next();
    } else {
      next();
    }
  }
};
