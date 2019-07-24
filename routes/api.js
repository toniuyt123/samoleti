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

      const paths = findAllPaths(graph, 'SOF', 'CGN');
      let flights = [];
      for (let i = 0; i < paths.length; i++) {
        let data = {
          from: params.from,
          to: params.to,
        };
        let route = [];
        let priceSum = 0;
        let distanceSum = 0;

        for (let j = 1; j < paths[i].length; j++) {
          let flight = (await client.query(`
            SELECT * FROM Flights
            WHERE id = $id`, {
            id: paths[i][j][1],
          })).rows[0];
          let flightData = dataFromFlight(flight);

          priceSum += parseFloat(flightData.price);
          distanceSum += parseFloat(flightData.distance);
          route.push(flightData);
        }
        data['totalPrice'] = priceSum;
        data['totalDistance'] = Math.round(distanceSum * 100) / 100;
        data['route'] = route;
        flights.push(data);
      }
      resolve(flights);
    });
  },
};

function findAllPaths (graph, from, to) {
  let queue = [];
  queue.push([[from, '']]);
  let paths = [];

  while (queue.length) {
    let path = queue.pop();
    let lastNode = path[path.length - 1][0];

    if (lastNode === to) {
      paths.push(path);
    }

    if (!graph[lastNode]) {
      continue;
    }

    for (let i = 0; i < graph[lastNode].length; i++) {
      if (!path.includes(graph[lastNode][i][0])) {
        let newPath = [...path];
        let node = graph[lastNode][i];
        newPath.push([node[0], node[1]]);
        queue.unshift(newPath);
      }
    }
  }

  return paths;
}

function dataFromFlight (flight) {
  return {
    id: flight.id,
    number: flight.number,
    from: flight.airport_from,
    to: flight.airport_to,
    price: flight.price,
    dTime: flight.dTime,
    aTime: flight.aTime,
    duration: flight.duration,
    distance: flight.distance,
    class: flight.class,
    airline_id: flight.airline_id,
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
