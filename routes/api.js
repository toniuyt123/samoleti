const { cors, rawBody } = require('../middleware/miscwares.js');
const { findRoute, getAllFlightPaths } = require('../util/flights.js');
const { createEmailSchedule } = require('../util/emailUtils.js');

const methods = {
  findRoute: (params) => {
    return new Promise(async (resolve) => {
      resolve(await findRoute(params));
    });
  },

  setDealNotifications: (params) => {
    return new Promise(async (resolve) => {
      await createEmailSchedule(params);
      resolve('Deal notification scheduled successfully');
    });
  },

  getAllFlightsPaths: (params) => {
    return new Promise(async (resolve) => {
      resolve(await getAllFlightPaths());
    });
  },
};

module.exports = function (app) {
  app.options('/api', cors, (req, res) => {
    res.status(200);
    res.send();
  });

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

    console.log(jsonResult)
    res.status(200);
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
