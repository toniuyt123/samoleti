const rawBody = require('../middleware/rawBody.js').rawBody;
const transaction = require('../util/util.js').transactionWrapper;
const named = require('node-postgres-named');
const pool = require('../util/db.js');

const methods = {
  findRoute: (params) => {
    return new Promise(async (resolve) => {
      var client = await pool.connect();
      named.patch(client);

      const res = await client.query(`
        SELECT * FROM Flights
        WHERE airport_from = $from AND airport_to = $to`, {
        from: params.from,
        to: params.to,
      });

      var data = [];
      for (var i = 0; i < res.rows.length; i++) {
        var route = {};
        route.form = params.from;
        route.to = params.to;
        route.route = [];
        data.push(route);
      }

      resolve(data);
    });
  },
};

module.exports = function (app) {
  app.post('/rpc', rawBody, async (req, res) => {
    let jsonResult = [];
    let json = JSON.parse(req.rawBody);

    // eslint-disable-next-line comma-dangle
    if (!json.length) json = [json];

    for (let i = 0; i < json.length; i++) {
      let data = json[i];
      const method = methods[data.method];

      if (method) {
        var result = {
          'jsonrpc': 2.0,
          'result': await method(data.params),
          'id': data.id,
        };
      } else {
        result = {
          'jsonrpc': 2.0,
          'error': {
            'code': -32600,
            'message': 'Method not found',
          },
          'id': data.id,
        };
      }
      jsonResult.push(result);
    }

    if (jsonResult.length === 1) jsonResult = jsonResult[0];

    res.send(jsonResult);
  });
};
