const assert = require('assert');

const bcrypt = require('bcrypt');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { loginware, isLogged } = require('../middleware/users.js');
const { validateEmail, sendMail } = require('../util/emailUtils.js');
const { generateKey } = require('../util/util.js');
const DBMethods = require('../util/dbMethods.js');
const dbm = new DBMethods();
const db = require('../util/db.js');

const registerTemplate = require('../views/users/register.marko');
const loginTemplate = require('../views/users/login.marko');
const accountTemplate = require('../views/users/account.marko');
const confirmedTemplate = require('../views/users/confirmed.marko');

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

      await dbm.addUser(username, email, phone, password)
        .catch(err => console.log(err));

      const userId = (await db.query(`
        SELECT id FROM users
        WHERE email = $email`, {
        email: email,
      })).rows[0].id;

      const token = generateKey();
      await db.query(`
        INSERT INTO confirmation_tokens (user_id, token)
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
      const token = (await db.query(`
        SELECT * FROM confirmation_tokens
        WHERE token = $token`, {
        token: req.query.token,
      })).rows[0];

      if (new Date() - token.created_at > 1000000) {
        return res.marko(confirmedTemplate, {
          error: 'Confirmation link expired.',
        });
      }

      await db.query(`
        UPDATE users SET is_confirmed = True
        WHERE id = $userId`, {
        userId: token.user_id,
      });

      stripe.customers.create({
        description: `Customer for user`,
        source: 'tok_mastercard',
      }, async (err, customer) => {
        if (err) {
          console.log(err);
          return;
        }

        await db.query(`
          UPDATE users SET stripe_customer_id = $customerId
          WHERE id = $id`, {
          customerId: customer.id,
          id: token.user_id,
        });
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
      const user = await dbm.findUser(email);
      assert(user, 'Email not found.');

      const match = await bcrypt.compare(password, user.password);
      assert(match, 'Invalid password');

      do {
        var key = generateKey();
        var logged = await dbm.login(user.id, key);
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
      dbm.logout(req.cookies.sessionKey);
    }

    res.redirect('/');
  });

  app.get('/account', isLogged, async (req, res) => {
    renderAccountPage(req, res);
  });

  app.post('/subscribe', isLogged, async (req, res) => {
    let date = new Date();
    const user = await dbm.getActiveUser(req);

    if (!user.is_confirmed) {
      return renderAccountPage(req, res, `You haven't confirmed your email address`);
    }

    const isSubscribed = await db.query(`
      SELECT * FROM subscriptions
      WHERE user_id = $userId AND NOW() < ends_at AND NOW() > started_at`, {
      userId: req.userId,
    });

    if (isSubscribed) {
      return renderAccountPage(req, res, 'You already have an active subscription!');
    }

    await db.query(`
      INSERT INTO subscriptions(user_id, plan_id, started_at, ends_at)
      VALUES ($userId, $planId, $startedAt, $endsAt)`, {
      userId: req.userId,
      planId: req.body.planId,
      startedAt: date,
      endsAt: new Date(date.setMonth(date.getMonth() + 1)),
    });
    res.redirect('/');
  });

  async function renderAccountPage (req, res, err = null) {
    const user = await dbm.getActiveUser(req);
    const plans = (await db.query(`
      SELECT * FROM plans`)).rows;

    return res.marko(accountTemplate, {
      user: user,
      plans: plans,
      err: err,
    });
  }
};
