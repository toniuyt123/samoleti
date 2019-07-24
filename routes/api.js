const rawBody = require('../middleware/rawBody.js').rawBody;
const findRoute = require('../util/flights.js').findRoute;

const methods = {
  findRoute: (params) => {
    return new Promise(async (resolve) => {
      resolve(await findRoute(params));
    });
  },
};

module.exports = function (app) {
  app.post('/api', rawBody, async (req, res) => {
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
