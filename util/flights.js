const named = require('node-postgres-named');
const pool = require('../util/db.js');
const assert = require('assert');
const weather = require('./integrations/darkSky.js').weather;
named.patch(pool);

module.exports = {
  findRoute: async (params) => {
    console.log(params)
    assert(params.from);
    assert(params.to);

    if (typeof params.from === 'object') {
      params.from = await module.exports.findNearestAirport(params.from.lat, params.from.lng);
    }
    if (!(typeof params.to === 'object')) {
      params.to = [params.to];
    }

    const res = (await pool.query(`
      SELECT airport_from, airport_to, id FROM Flights
      WHERE d_time >= $departureStart AND d_time <= $departureEnd`, {
      departureStart: params.departureStart,
      departureEnd: params.departureEnd,
    })).rows;
    let graph = {};

    for (let i = 0; i < res.length; i++) {
      const from = res[i].airport_from;
      const to = res[i].airport_to;

      if (!graph[from]) graph[from] = [];
      if (!graph[from][to]) graph[from][to] = [];

      graph[from].push([to, res[i].id]);
    }

    let flights = [];
    let airportsWeathers = {};
    for (let p = 0; p < params.to.length; p++) {
      if (params.to[p].lat && params.to[p].lng) {
        params.to[p] = await module.exports.findNearestAirport(params.to[p].lat, params.to[p].lng);
      }
      const paths = module.exports.findAllPaths(graph, params.from, params.to[p]);

      for (let i = 0; i < paths.length; i++) {
        let data = {
          from: params.from,
          to: params.to[p],
        };
        let route = [];
        let priceSum = 0;
        let distanceSum = 0;

        for (let j = 1; j < paths[i].length; j++) {
          let flight = (await pool.query(`
            SELECT *, a1.lat AS lat_from, a2.lat AS lat_to, a1.lng AS lng_from, a2.lng AS lng_to FROM Flights f
            LEFT JOIN airports a1 ON a1.iata = f.airport_from
            LEFT JOIN airports a2 ON a2.iata = f.airport_to
            WHERE f.id = $id`, {
            id: paths[i][j][1],
          })).rows[0];
          let flightData = module.exports.dataFromFlight(flight);

          if (j === 1) {
            data['dTime'] = flightData.dTime;

            if (!Object.keys(airportsWeathers).includes(flightData.from)) {
              const forecast = await module.exports.getForecastForAirport(flightData.from, flightData.dTime);
              airportsWeathers[flightData.from] = forecast;
              data['dWeather'] = forecast;
            } else {
              data['dWeather'] = airportsWeathers[flightData.from];
            }
          }
          if (j === paths[i].length - 1) {
            data['aTime'] = flightData.aTime;

            if (!Object.keys(airportsWeathers).includes(flightData.to)) {
              const forecast = await module.exports.getForecastForAirport(flightData.to, flightData.aTime);
              airportsWeathers[flightData.to] = forecast;
              data['aWeather'] = forecast;
            } else {
              data['aWeather'] = airportsWeathers[flightData.to];
            }
          }

          priceSum += parseFloat(flightData.price);
          distanceSum += parseFloat(flightData.distance);
          route.push(flightData);
        }

        data['totalPrice'] = priceSum;
        data['totalDistance'] = Math.round(distanceSum * 100) / 100;
        data['route'] = route;
        flights.push(data);
      }
    }

    if (params.filter === 'shortest') {
      let minRoute = flights[0].route.length;
      let flight = flights[0];

      for (let i = 1; i < flights.length; i++) {
        let len = flights[i].route.length;
        if (len < minRoute) {
          minRoute = len;
          flight = flights[i];
        }
      }

      return flight;
    }

    return flights;
  },

  findAllPaths: (graph, from, to, maxStopovers = 3) => {
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

      if (path.length <= maxStopovers) {
        for (let i = 0; i < graph[lastNode].length; i++) {
          if (!path.includes(graph[lastNode][i][0])) {
            let newPath = [...path];
            let node = graph[lastNode][i];
            newPath.push([node[0], node[1]]);
            queue.unshift(newPath);
          }
        }
      }
    }

    return paths;
  },

  dataFromFlight: (flight) => {
    return {
      id: flight.id,
      number: flight.number,
      from: flight.airport_from,
      to: flight.airport_to,
      price: flight.price,
      dTime: flight.d_time,
      aTime: flight.a_time,
      duration: flight.duration,
      distance: flight.distance,
      latFrom: flight.lat_from,
      latTo: flight.lat_to,
      lngFrom: flight.lng_from,
      lngTo: flight.lng_to,
      class: flight.class,
      airlineId: flight.airline_id,
    };
  },

  findNearestAirport: async (lat, lng) => {
    let airports = (await pool.query(`SELECT iata, lat, lng FROM airports`)).rows;

    let minLength = Number.MAX_SAFE_INTEGER;
    let airport = '';
    for (let i = 0; i < airports.length; i++) {
      let distance = Math.sqrt(Math.pow(airports[i].lat - lat, 2) + Math.pow(airports[i].lng - lng, 2));

      if (distance < minLength) {
        minLength = distance;
        airport = airports[i].iata;
      }
    }

    return airport;
  },

  getForecastForAirport: async (iata, date = new Date()) => {
    const airport = (await pool.query(`
            SELECT * FROM airports
            WHERE iata = $iata`, {
      iata: iata,
    })).rows[0];

    const forecast = JSON.parse(await weather(airport.lat, airport.lng, date));

    return {
      summary: forecast.daily.data[0].summary,
      icon: forecast.daily.data[0].icon,
      temperature: forecast.daily.data[0].temperatureHigh,
    };
  },
};
