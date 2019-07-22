const registerTemplate = require('../views/users/register.marko');
const loginTemplate = require('../views/users/login.marko');
const DBManager = require('../util/dbManager.js');
const bcrypt = require('bcrypt');
const db = new DBManager();
const loginware = require('../middleware/users.js').loginware;
const validateEmail = require('../util/util.js').validateEmail;
const generateKey = require('../util/util.js').generateKey;

module.exports = function (app) {
  app.get('/register', loginware, (req, res) => {
    res.marko(registerTemplate);
  });

  app.post('/register', loginware, (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const confirm = req.body.confirmPassword;

    if (password !== confirm) {
      var error = "Passwords don't match.";
    } else if (password.length < 6) {
      error = 'Passwords must be at least 6 characters long';
    } else if (!validateEmail(email)) {
      error = 'Invalid email';
    } else if (username.length === 0) {
      error = 'Username blank';
    }

    if (error) {
      res.marko(registerTemplate, {
        error: error,
      });
      return;
    }

    db.addUser(username, email, phone, password)
      .catch(err => console.log(err));

    res.redirect('/');
  });

  app.get('/login', loginware, (req, res) => {
    if (req.authenticated) return res.redirect('/');
    res.marko(loginTemplate);
  });

  app.post('/login', loginware, async (req, res) => {
    if (req.authenticated) return res.redirect('/');
    const email = req.body.email;
    const password = req.body.password;
    const user = await db.findUser(email);

    if (!user) {
      return res.marko(loginTemplate, {
        error: 'Email not found.',
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      do {
        var key = generateKey();
        var logged = await db.login(user.id, key);
      } while (!logged);
      res.cookie('sessionKey', key).redirect('/');
    } else {
      res.marko(loginTemplate, {
        error: 'Invalid password.',
      });
    }
  });
};
