const request = require('request-promise-native');
const endpoint = 'http://10.20.1.149:3001/api/v1';
const pool = require('../db.js');
const headersOpt = {
  'content-type': 'application/json',
};

module.exports = {
  createProduct: async (product, requestId = 1) => {
    const res = JSON.parse(
      await request({
        method: 'post',
        url: endpoint,
        body: `{
            "jsonrpc": "2.0",
            "method": "createProduct",
            "params": ${JSON.stringify(product)},
            "authInfo": {
                "organizationId": 2
            },
            "id": ${requestId}
          }`,
        headers: headersOpt,
      }));
    console.log(res);
    await pool.query(`
      UPDATE flights SET shop_platform_id = $shopId
      WHERE id = $id`, {
      shopId: parseInt(res.result),
      id: product.id,
    });
  },

  dumpFlightData: async () => {
    const flights = (await pool.query(`SELECT * FROM flights`)).rows;

    for (let i = 0; i < flights.length; i++) {
      const product = {
        id: flights[i].id,
        availableQuantity: Math.round((Math.random() * 20)) + 1,
        price: +(flights[i].price),
        name: flights[i].airport_from + ' to ' + flights[i].airport_to + ' ticket',
        description: 'This is a flight ticket boi. Flight number is ' + flights[i].number +
          '. Departure at ' + flights[i].d_time + ' and arriving at ' + flights[i].a_time,
      };

      await module.exports.createProduct(product);
    }
  },
};
