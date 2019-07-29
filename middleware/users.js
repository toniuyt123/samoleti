const DBManager = require('../util/dbMethods.js');
const db = new DBManager();

module.exports = {
  loginware: async (req, res, next) => {
    if (req.cookies.sessionKey) {
      const session = await db.getSession(req.cookies.sessionKey);
      if (session && session.logged) {
        return res.redirect('/');
      }
      next();
    } else {
      next();
    }
  },
  isLogged: async (req, res, next) => {
    if (req.cookies.sessionKey) {
      const session = await db.getSession(req.cookies.sessionKey);
      if (session && session.logged) {
        req.userId = session.user_id;
        return next();
      }
    }
    return res.redirect('/login');
  },
};
