const rawBody = require('../middleware/miscwares.js').rawBody;
const cors = require('../middleware/miscwares.js').cors;
const findRoute = require('../util/flights.js').findRoute;

const methods = {
  findRoute: (params) => {
    return new Promise(async (resolve) => {
      resolve(await findRoute(params));
    });
  },
};

module.exports = function (app) {
  app.post('/api', rawBody, cors, async (req, res) => {
    let jsonResult = [];
    try {
      var json = JSON.parse(req.rawBody);
    } catch (err) {
      jsonResult.push(rpcError(-32700, 'Parse error', null));
      return res.send(jsonResult);
    }

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
        result = rpcError(-32600, 'Method not found', data.id);
      }
      jsonResult.push(result);
    }

    if (jsonResult.length === 1) jsonResult = jsonResult[0];

    res.send(jsonResult);
  });
};

function rpcError (code, message, id) {
  return {
    'jsonrpc': '2.0',
    'error': {
      'code': code,
      'message': message,
    },
    'id': id,
  };
}
