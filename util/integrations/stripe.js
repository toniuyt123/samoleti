const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../db.js');

const createCustomer = async (userId, token = 'tok_mastercard') => {
  const email = (await db.query(`
    SELECT email
    FROM users
    WHERE id = $id`, {
    id: userId,
  })).rows[0].email;

  stripe.customers.create({
    description: `Customer for ${email}`,
    source: token,
  }, async (err, customer) => {
    if (err) {
      console.log(err);
      return;
    }

    await db.query(`
      UPDATE users SET stripe_customer_id = $customerId
      WHERE id = $id`, {
      customerId: customer.id,
      id: userId,
    });
  });
};

const createPlansFromDb = async () => {
  const plans = (await db.query(`SELECT * FROM plans`)).rows;

  for (const plan of plans) {
    stripe.plans.create({
      amount: plan.price_monthly * 100,
      interval: 'month',
      product: {
        id: plan.name,
        name: plan.name,
      },
      currency: 'usd',
    }, (err, plan) => {
      if (err) console.log(err);
    });
  }
};

const createSubscription = async (userId, planId, stripeToken, date = new Date()) => {
  const customerId = (await db.query(`
    SELECT stripe_customer_id 
    FROM users
    WHERE id = $id`, {
    id: userId,
  })).rows[0].stripe_customer_id;

  const plan = (await db.query(`
    SELECT name 
    FROM plans
    WHERE id = $id`, {
    id: planId,
  })).rows[0].name;

  stripe.customers.update(customerId, {
    default_source: stripeToken,
  });

  stripe.subscriptions.create({
    customer: customerId,
    items: [
      {
        plan,
      }
    ],
    expand: ['latest_invoice.payment_intent'],
  }, async (err, subscription) => {
    if (err) {
      console.log(err);
      return;
    }

    let endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    await db.query(`
      INSERT INTO subscriptions(user_id, plan_id, started_at, ends_at, stripe_id)
      VALUES ($userId, $planId, $startedAt, $endsAt, $stripeId)`, {
      userId: userId,
      planId: planId,
      startedAt: date,
      endsAt: endDate,
      stripeId: subscription.id,
    });
  });
};

module.exports = {
  createCustomer,
  createPlansFromDb,
  createSubscription,
  stripe,
};
