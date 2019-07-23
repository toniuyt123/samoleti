const rawBody = require('../middleware/rawBody.js').rawBody;
const named = require('node-postgres-named');
const pool = require('../util/db.js');

const methods = {
  findRoute: function findRoute (params, route = []) {
    return new Promise(async (resolve) => {
      var client = await pool.connect();
      named.patch(client);

      const res = (await client.query(`
        SELECT airport_from, airport_to, id FROM Flights
        WHERE dTime >= $departureStart AND dTime <= $departureEnd`, {
        departureStart: params.departureStart,
        departureEnd: params.departureEnd,
      })).rows;
      var graph = {};

      for (let i = 0; i < res.length; i++) {
        const from = res[i].airport_from;
        const to = res[i].airport_to;

        if (!graph[from]) graph[from] = [];
        if (!graph[from][to]) graph[from][to] = [];

        graph[from].push([to, res[i].id]);
      }

      findAllPaths(graph, 'SOF', 'CGN');
      resolve(graph);
    });
  },
};

function findAllPaths (graph, start, end) {
  let queue = [];
  queue.push([start]);
  while (queue.length) {
    let path = queue.pop();
    let lastNode = path[path.length - 1];

    if (lastNode === end) {
      console.log(path);
    }

    if (!graph[lastNode]) {
      continue;
    }

    for (let i = 0; i < graph[lastNode].length; i++) {
      if (!path.includes(graph[lastNode][i][0])) {
        let newPath = [...path];
        newPath.push(graph[lastNode][i][0]);
        queue.unshift(newPath);
      }
    }
  }
}

function dataFromFlight (flight) {
  return {
    id: flight.id,
    // number: flight.number,
    from: flight.airport_from,
    to: flight.airport_to,
    /* price: flight.price,
    dTime: flight.dTime,
    aTime: flight.aTime,
    duration: flight.duration,
    distance: flight.distance,
    class: flight.class,
    airline_id: flight.airline_id, */
  };
}

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
