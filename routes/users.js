const registerTemplate = require('../views/users/register.marko');
const loginTemplate = require('../views/users/login.marko');
const accountTemplate = require('../views/users/account.marko');
const confirmedTemplate = require('../views/users/confirmed.marko');
const DBManager = require('../util/dbMethods.js');
const bcrypt = require('bcrypt');
const db = new DBManager();
const loginware = require('../middleware/users.js').loginware;
const isLogged = require('../middleware/users.js').isLogged;
const validateEmail = require('../util/util.js').validateEmail;
const generateKey = require('../util/util.js').generateKey;
const assert = require('assert');
const pool = require('../util/db.js');
const sendMail = require('../util/util.js').sendEmail;

module.exports = function (app) {
  app.get('/register', loginware, (req, res) => {
    res.marko(registerTemplate);
  });

  app.post('/register', loginware, async (req, res) => {
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

      await db.addUser(username, email, phone, password)
        .catch(err => console.log(err));

      const userId = (await pool.query(`
        SELECT id FROM users
        WHERE email = $email`, {
        email: email,
      })).rows[0].id;

      const token = generateKey();
      await pool.query(`
        INSERT INTO confirmationTokens (user_id, token)
        VALUES ($userId, $token)`, {
        userId: userId,
        token: token,
      });

      sendMail(email, 'Please confirm your email address',
        `Follow this link https://localhost:8080/confirm?token=${token}`);

      res.redirect('/');
    } catch (err) {
      res.marko(registerTemplate, {
        error: err.message,
      });
    }
  });

  app.get('/confirm', async (req, res) => {
    try {
      const token = (await pool.query(`
        SELECT * FROM confirmation_tokens
        WHERE token = $token`, {
        token: req.query.token,
      })).rows[0];

      if (new Date() - token.created_at > 1000000) {
        return res.marko(confirmedTemplate, {
          error: 'Confirmation link expired.',
        });
      }

      await pool.query(`
        UPDATE users SET is_confirmed = True
        WHERE id = $userId`, {
        userId: token.user_id,
      });

      res.marko(confirmedTemplate);
    } catch (err) {
      res.marko(confirmedTemplate, {
        error: 'There was a problem',
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

  app.get('/account', isLogged, async (req, res) => {
    const user = await db.getActiveUser(req);
    const plans = (await pool.query(`
      SELECT * FROM plans`)).rows;

    return res.marko(accountTemplate, {
      user: user,
      plans: plans,
    });
  });

  app.post('/subscribe', isLogged, async (req, res) => {
    let date = new Date();

    const isSubscribed = await pool.query(`
      SELECT * FROM subscriptions
      WHERE user_id = $userId AND NOW() < ends_at AND NOW() > started_at`, {
      userId: req.userId,
    });

    if (isSubscribed) {
      return res.redirect('/account');
    }

    await pool.query(`
      INSERT INTO subscriptions(user_id, plan_id, started_at, ends_at)
      VALUES ($userId, $planId, $startedAt, $endsAt)`, {
      userId: req.userId,
      planId: req.body.planId,
      startedAt: date,
      endsAt: new Date(date.setMonth(date.getMonth() + 1)),
    });
    res.redirect('/');
  });
};
