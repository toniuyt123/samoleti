const assert = require('assert');

const mailer = require('nodemailer');
const cron = require('node-cron');

const db = require('./db.js');
const emailJobs = {};

const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const sendEmail = (recipent, subject, text) => {
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
    subject,
    html: text,
  };

  transport.sendMail(message, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

const scheduleEmail = async (params) => {
  const email = (await db.query(`
    SELECT email FROM users WHERE id = $id`, {
    id: params.recipient,
  })).rows[0].email;

  return cron.schedule(params.cronExpression, async () => {
    const flightDeals = (await db.query(`
      SELECT * FROM flights
      WHERE price < $maxPrice`, {
      maxPrice: params.maxPrice,
    })).rows;

    let mailText = '<h1>We have some deals for you!</h1>\n';
    for (let deal of flightDeals) {
      mailText = mailText.concat(`
        <p>Flight from ${deal.airport_from} to ${deal.airport_to}
          at the great price of ${deal.price}. Buy it right now from 
        <a href='https://10.20.1.149/products/${deal.shop_platform_id}/show'>here</a>!</p>`);
    }

    sendEmail(email, 'Flight Deals from Planes.com',
      mailText);
  });
};

const scheduleEmails = async () => {
  const jobs = (await db.query(`SELECT * FROM scheduled_emails`)).rows;

  for (let job of jobs) {
    const cronExpression = job.cron_expression;

    if (!cron.validate(cronExpression)) {
      await db.query(`DELETE FROM scheduled_email WHERE id = $id`, {
        id: job.id,
      });

      continue;
    }

    emailJobs[job.recipient.toString()] = scheduleEmail({
      cronExpression: cronExpression,
      recipient: job.recipient,
      maxPrice: job.max_price,
    });
  }
};

const createEmailSchedule = async (params) => {
  assert(params.recipient, 'No recipient specified');

  if (!params.frequency) params.frequency = '0 0 1 * *';
  if (!params.maxPrice) params.maxPrice = 100;

  await db.query(`
    INSERT INTO scheduled_emails(recipient, cron_expression, max_price)
    VALUES ($recipient, $cronExpression, $maxPrice) ON CONFLICT (recipient)
    DO UPDATE SET cron_expression = $cronExpression, max_price = $maxPrice`, {
    recipient: params.recipient,
    cronExpression: params.frequency,
    maxPrice: params.maxPrice,
  });

  let emailJob = emailJobs[params.recipient.toString()];
  if (emailJob) emailJob.destroy();

  emailJob = scheduleEmail(params);
};

module.exports = {
  validateEmail,
  sendEmail,
  scheduleEmails,
  scheduleEmail,
  createEmailSchedule,
};
