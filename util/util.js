const crypto = require('crypto');
const pool = require('./db.js');
const named = require('node-postgres-named');
const mailer = require('nodemailer');
const cron = require('node-cron');
const assert = require('assert');
const emailJobs = {};

module.exports = {
  validateEmail: (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },

  generateKey: () => {
    let sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
  },

  transactionWrapper: async (fn) => {
    const client = await pool.connect();
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
      from: process.env.GMAIL_USER,
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
  },

  async scheduleEmails () {
    const jobs = (await pool.query(`SELECT * FROM scheduled_emails`)).rows;

    for (let i = 0; i < jobs.length; i++) {
      const cronExpression = jobs[i].cron_expression;

      if (!cron.validate(cronExpression)) {
        await pool.query(`DELETE FROM scheduled_email WHERE id = $id`, {
          id: jobs[i].id,
        });

        continue;
      }

      emailJobs[jobs[i].recipient.toString()] = this.scheduleEmail({
        cronExpression: cronExpression,
        recipient: jobs[i].recipient,
      });
    }
  },

  async scheduleEmail (params) {
    const email = (await pool.query(`
      SELECT email FROM users WHERE id = $id`, {
      id: params.recipient,
    })).rows[0].email;

    return cron.schedule(params.frequency, () => {
      this.sendEmail(email, 'Flight Deals from Planes.com',
        'this is a deal');
    });
  },

  async createEmailSchedule (params) {
    assert(params.recipient, 'No recipient specified');

    if (!params.frequency) params.frequency = '0 0 1 * *';
    if (!params.maxPrice) params.maxPrice = 100;

    await pool.query(`
      INSERT INTO scheduled_emails(recipient, cron_expression, max_price)
      VALUES ($recipient, $cronExpression, $maxPrice) ON CONFLICT (recipient)
      DO UPDATE SET cron_expression = $cronExpression, max_price = $maxPrice`, {
      recipient: params.recipient,
      cronExpression: params.frequency,
      maxPrice: params.maxPrice,
    });

    let emailJob = emailJobs[params.recipient.toString()];
    if (emailJob) emailJob.destroy();

    emailJob = this.scheduleEmail(params);
  },
};
