const db = require('../db.js');
const sendRPC = require('../util.js').sendRPC;

const endpoint = 'http://10.20.1.158:3000/rpc';

module.exports = {
  createClassified: async (product) => {
    const res = await sendRPC(endpoint, 'createClassified', product);
    console.log(res);
  },

  promote: async () => {
    const res = await sendRPC(endpoint, 'promoteClassified', {
      api_key: process.env.VLADI_API_KEY,
      classifieds: ['2b9a4b60643c056d9162', '13aacde8e218a6295e19'],
      date: '08/02/2019',
    });
    console.log(res);
  },

  dumpFlightData: async () => {
    const flights = (await db.query(`SELECT * FROM flights`)).rows;

    for (let i = 0; i < flights.length; i++) {
      const product = {
        quantity: Math.round((Math.random() * 20)),
        price: +(flights[i].price),
        title: flights[i].airport_from + ' to ' + flights[i].airport_to + ' ticket',
        description: 'This is a flight ticket boi. Flight number is ' + flights[i].number +
          '. Departure at ' + flights[i].d_time + ' and arriving at ' + flights[i].a_time,
        api_key: process.env.VLADI_API_KEY,
        type: 'transport',
      };

      await module.exports.createClassified(product);
    }
  },
};
