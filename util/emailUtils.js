const pool = require('./db.js');
const mailer = require('nodemailer');
const cron = require('node-cron');
const assert = require('assert');
const emailJobs = {};

module.exports = {
  validateEmail: (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
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
      html: text,
    };

    transport.sendMail(message, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });
  },

  async scheduleEmail (params) {
    const email = (await pool.query(`
      SELECT email FROM users WHERE id = $id`, {
      id: params.recipient,
    })).rows[0].email;

    return cron.schedule(params.cronExpression, async () => {
      const flightDeals = (await pool.query(`
        SELECT * FROM flights
        WHERE price < $maxPrice`, {
        maxPrice: params.maxPrice,
      })).rows;

      let mailText = '<h1>We have some deals for you!</h1>\n';
      for (let i = 0; i < flightDeals.length; i++) {
        mailText = mailText.concat(`
          <p>Flight from ${flightDeals[i].airport_from} to ${flightDeals[i].airport_to}
            at the great price of ${flightDeals[i].price}. Buy it right now from 
          <a href='https://10.20.1.149/products/${flightDeals[i].shop_platform_id}/show'>here</a>!</p>`);
      }

      this.sendEmail(email, 'Flight Deals from Planes.com',
        mailText);
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

      emailJobs[jobs[i].recipient.toString()] = module.exports.scheduleEmail({
        cronExpression: cronExpression,
        recipient: jobs[i].recipient,
        maxPrice: jobs[i].max_price,
      });
    }
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

    emailJob = module.exports.scheduleEmail(params);
  },
};
