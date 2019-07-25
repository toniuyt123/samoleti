const registerTemplate = require('../views/users/register.marko');
const loginTemplate = require('../views/users/login.marko');
const DBManager = require('../util/dbManager.js');
const bcrypt = require('bcrypt');
const db = new DBManager();
const loginware = require('../middleware/users.js').loginware;
const validateEmail = require('../util/util.js').validateEmail;
const generateKey = require('../util/util.js').generateKey;
const assert = require('assert');

module.exports = function (app) {
  app.get('/register', loginware, (req, res) => {
    res.marko(registerTemplate);
  });

  app.post('/register', loginware, (req, res) => {
    try {
      const username = req.body.username;
      const email = req.body.email;
      const phone = req.body.phone;
      const password = req.body.password;
      const confirm = req.body.confirmPassword;

      assert(password === confirm, "Passwords don't match.");
      assert(password.length >= 6, 'Passwords must be at least 6 characters long');
      assert(validateEmail(email), 'Invalid email');
      assert(username.length !== 0, 'Username blank');

      db.addUser(username, email, phone, password)
        .catch(err => console.log(err));

      res.redirect('/');
    } catch (err) {
      res.marko(registerTemplate, {
        error: err.message,
      });
    }
  });

  app.get('/login', loginware, (req, res) => {
    res.marko(loginTemplate);
  });

  app.post('/login', loginware, async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const user = await db.findUser(email);
      assert(user, 'Email not found.');

      const match = await bcrypt.compare(password, user.password);
      assert(match, 'Invalid password');

      do {
        var key = generateKey();
        var logged = await db.login(user.id, key);
      } while (!logged);

      res.cookie('sessionKey', key).redirect('/');
    } catch (err) {
      res.marko(loginTemplate, {
        error: err.message,
      });
    }
  });

  app.all('/logout', async (req, res) => {
    if (req.cookies.sessionKey) {
      db.logout(req.cookies.sessionKey);
    }

    res.redirect('/');
  });
};
