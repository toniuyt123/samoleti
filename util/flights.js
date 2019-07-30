const named = require('node-postgres-named');
const pool = require('../util/db.js');
const assert = require('assert');
const weather = require('./integrations/darkSky.js').weather;
named.patch(pool);

module.exports = {
  findRoute: async (params) => {
    console.log(params);
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
        data['route'] = [];
        data['totalPrice'] = 0;
        data['totalDistance'] = 0;

        let prevArrive = new Date('01-01-0001');
        let canConnect = true;
        for (let j = 1; j < paths[i].length; j++) {
          let flight = (await pool.query(`
            SELECT *, a1.lat AS lat_from, a2.lat AS lat_to, a1.lng AS lng_from, a2.lng AS lng_to FROM Flights f
            LEFT JOIN airports a1 ON a1.iata = f.airport_from
            LEFT JOIN airports a2 ON a2.iata = f.airport_to
            WHERE f.id = $id`, {
            id: paths[i][j][1],
          })).rows[0];
          let flightData = module.exports.dataFromFlight(flight);
          if (flightData.dTime < prevArrive) {
            canConnect = false;
            prevArrive = flightData.aTime;
            break;
          }
          prevArrive = flightData.aTime;

          if (j === 1) {
            data['dTime'] = flightData.dTime;
            data['dWeather'] = await module.exports.getForecastForAirport(
              airportsWeathers, flightData.from, flightData.dTime);
          }
          if (j === paths[i].length - 1) {
            data['aTime'] = flightData.aTime;
            data['aWeather'] = await module.exports.getForecastForAirport(
              airportsWeathers, flightData.to, flightData.aTime);
          }

          data['totalPrice'] += parseFloat(flightData.price);
          data['totalDistance'] += parseFloat(flightData.distance);
          data['route'].push(flightData);
        }

        if (!canConnect) continue;

        data['totalDistance'] = Math.round(data['totalDistance'] * 100) / 100;
        data['duration'] = (data['aTime'].getTime() - data['dTime'].getTime()) / 3600000;
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
      shopId: flight.shop_platform_id,
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

  getForecastForAirport: async (airportsWeathers, iata, date = new Date()) => {
    if (!Object.keys(airportsWeathers).includes(iata + date.toDateString())) {
      const airport = (await pool.query(`
        SELECT * FROM airports
        WHERE iata = $iata`, {
        iata: iata,
      })).rows[0];
      const forecast = JSON.parse(await weather(airport.lat, airport.lng, date));
      const data = {
        summary: forecast.daily.data[0].summary,
        icon: forecast.daily.data[0].icon,
        temperature: forecast.daily.data[0].temperatureHigh,
      };
      airportsWeathers[iata + date.toDateString()] = data;
    }
    return airportsWeathers[iata + date.toDateString()];
  },
};
