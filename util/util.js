const crypto = require('crypto');
const pool = require('./db.js');
const named = require('node-postgres-named');
const mailer = require('nodemailer');

module.exports = {
  validateEmail: (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },

  generateKey: () => {
    let sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
  },

  transactionWrapper: async (fn) => {
    var client = await pool.connect();
    named.patch(client);

    try {
      await client.query('BEGIN');
      await fn(client);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      await client.release();
    }
  },

  sendEmail (recipent, subject, text) {
    let transport = mailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const message = {
      from: 'antonio.milev@hackerschool-bg.com',
      to: recipent,
      subject: subject,
      text: text,
    };

    transport.sendMail(message, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });
  }
};
