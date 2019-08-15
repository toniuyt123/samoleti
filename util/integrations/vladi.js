const db = require('../db.js');
const { sendRPC } = require('../util.js');

const endpoint = 'http://10.20.1.158:3000/rpc';

const createClassified = async (product) => {
  await sendRPC(endpoint, 'createClassified', product);
};

const dumpFlightData = async () => {
  const flights = (await db.query(`SELECT * FROM flights`)).rows;

  for (let flight of flights) {
    const product = productFromFlight(flight);

    await createClassified(product);
  }
};

const promote = async () => {
  await sendRPC(endpoint, 'promoteClassified', {
    api_key: process.env.VLADI_API_KEY,
    classifieds: ['2b9a4b60643c056d9162', '13aacde8e218a6295e19'],
    date: '08/02/2019',
  });
};

const productFromFlight = async (flight) => {
  return {
    quantity: Math.round((Math.random() * 20)),
    price: +(flight.price),
    title: flight.airport_from + ' to ' + flight.airport_to + ' ticket',
    description: 'This is a flight ticket boi. Flight number is ' + flight.number +
      '. Departure at ' + flight.d_time + ' and arriving at ' + flight.a_time,
    api_key: process.env.VLADI_API_KEY,
    type: 'transport',
  };
};

module.exports = {
  createClassified,
  promote,
  dumpFlightData,
  productFromFlight,
};
