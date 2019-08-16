const bcrypt = require('bcrypt');

const { assertUser, UserAssertionError } = require('../util/assert.js');
const { loginware, isLogged } = require('../middleware/users.js');
const { validateEmail, sendEmail } = require('../util/emailUtils.js');
const { generateKey } = require('../util/util.js');
const { createCustomer, createSubscription } = require('../util/integrations/stripe.js');
const DBMethods = require('../util/dbMethods.js');
const db = require('../util/db.js');
const dbm = new DBMethods();

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

      assertUser(password === confirm, "Passwords don't match.");
      assertUser(password.length >= 6, 'Passwords must be at least 6 characters long');
      assertUser(validateEmail(email), 'Invalid email');
      assertUser(username.length !== 0, 'Username blank');
      assertUser(!(await dbm.findUser(email)), 'Email already registered');

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

      sendEmail(email, 'Please confirm your email address',
        `Follow this link https://localhost:3000/confirm?token=${token}`);

      res.redirect('/');
    } catch (err) {
      if (err instanceof UserAssertionError) {
        res.marko(registerTemplate, {
          error: err.message,
        });
      }
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
        UPDATE users 
        SET is_confirmed = True, api_key = $apiKey
        WHERE id = $userId`, {
        userId: token.user_id,
        apiKey: generateKey(),
      });

      await createCustomer(token.user_id);

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
      assertUser(user, 'Email not found.');

      const match = await bcrypt.compare(password, user.password);
      assertUser(match, 'Invalid password');

      do {
        var key = generateKey();
        var logged = await dbm.login(user.id, key);
      } while (!logged);

      res.cookie('sessionKey', key).redirect('/');
    } catch (err) {
      if (err instanceof UserAssertionError) {
        res.marko(loginTemplate, {
          error: err.message,
        });
      }
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
    const user = await dbm.getActiveUser(req);

    if (!user.is_confirmed) {
      return renderAccountPage(req, res, `You haven't confirmed your email address`);
    }

    const isSubscribed = (await db.query(`
      SELECT * FROM subscriptions
      WHERE user_id = $userId AND NOW() < ends_at AND NOW() > started_at`, {
      userId: user.id,
    })).rows;

    if (isSubscribed.length) {
      return renderAccountPage(req, res, 'You already have an active subscription!');
    }

    await createSubscription(user.id, req.body.planId, req.body.stripeToken);

    res.redirect('/');
  });

  async function renderAccountPage (req, res, err = null) {
    const user = await dbm.getActiveUser(req);
    const plans = (await db.query(`
      SELECT * FROM plans`)).rows;

    return res.marko(accountTemplate, {
      user: user,
      plans: plans,
      apiKey: user.is_confirmed ? user.api_key : 'Please confirm your email to get and api key',
      err: err,
    });
  }
};
