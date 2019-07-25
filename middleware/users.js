const DBManager = require('../util/dbManager.js');
const db = new DBManager();

module.exports = {
  loginware: async (req, res, next) => {
    if (req.cookies.sessionKey) {
      const session = await db.getSession(req.cookies.sessionKey);
      if (session && session.logged) {
        req.userId = session.rows[0].user_id;
        return res.redirect('/');
      }
      next();
    } else {
      next();
    }
  },
};
