const endpoint = 'http://10.20.1.158:3000/rpc';
const pool = require('../db.js');
const sendRPC = require('../util.js').sendRPC;

module.exports = {
  createClassified: async (product, requestId = 1) => {
    const res = await sendRPC(endpoint, 'createClassified', product);
    console.log(res);
  },

  dumpFlightData: async () => {
    const flights = (await pool.query(`SELECT * FROM flights`)).rows;

    for (let i = 0; i < flights.length; i++) {
      const product = {
        quantity: Math.round((Math.random() * 20)),
        price: +(flights[i].price),
        title: flights[i].airport_from + ' to ' + flights[i].airport_to + ' ticket',
        description: 'This is a flight ticket boi. Flight number is ' + flights[i].number +
          '. Departure at ' + flights[i].d_time + ' and arriving at ' + flights[i].a_time,
        api_key: process.env.VLADI_API_KEY,
      };

      await module.exports.createClassified(product);
    }
  },
};
