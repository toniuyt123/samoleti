const db = require('../db.js');
const { sendRPC } = require('../util.js');

const endpoint = 'http://10.20.1.149:3000/api/v1';

const createProduct = async (id, product, requestId = 1) => {
  try {
    const params = {
      methodParams: product,
      authInfo: {
        organizationId: '2',
        organizationSecret: process.env.MARTI_API_KEY,
      },
    };
    const res = JSON.parse(await sendRPC(endpoint, 'createProduct', params));
    console.log(res);

    if (res.result) {
      await db.query(`
        UPDATE flights SET shop_platform_id = $shopId
        WHERE id = $id`, {
        shopId: parseInt(res.result.id),
        id,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const dumpFlightData = async () => {
  const flights = (await db.query(`SELECT * FROM flights`)).rows;

  for (let flight of flights) {
    const product = productFromFlight(flight);

    await createProduct(flight.id, product);
  }
};

const productFromFlight = (flight) => {
  return {
    availableQuantity: Math.round((Math.random() * 20)) + 1,
    price: +(flight.price),
    name: flight.airport_from + ' to ' + flight.airport_to + ' ticket',
    description: 'This is a flight ticket boi. Flight number is ' + flight.number +
      '. Departure at ' + flight.d_time + ' and arriving at ' + flight.a_time,
    image: 'http://www.traveller.com.au/content/dam/images/h/1/9/m/g/3/image.related.articleLeadwide.620x349.h1aa81.png/1548048327915.jpg',
    specs: {
      from: flight.airport_from,
      to: flight.airport_to,
    },
  };
};

module.exports = {
  createProduct,
  dumpFlightData,
  productFromFlight,
};
