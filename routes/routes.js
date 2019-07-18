const registerTemplate = require('../views/users/register.marko');
const DBManager = require('../util/dbManager.js');
const db = new DBManager();

module.exports = function (app) {
  app.get('/register', function (req, res) {
    res.marko(registerTemplate);
  });

  app.post('/register', function (req, res) {
    const username = req.body.username;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const confirm = req.body.confirmPassword;

    db.addUser(username, email, phone, password).catch(err => console.log(err));

    res.redirect('/');
  });

  app.get('/login', function (req, res) {
    res.marko(loginTemplate);
  });

  app.post('/login', function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

  });
};
