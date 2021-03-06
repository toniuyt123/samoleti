const assert = require('assert');

const db = require('./db.js');
const { weather } = require('./integrations/darkSky.js');

const findRoute = async (params) => {
  console.log(params);
  assert(params.from);
  assert(params.to);

  if (typeof params.from === 'object') {
    params.from = await findNearestAirport(params.from.lat, params.from.lng);
  }
  if (!(typeof params.to === 'object')) {
    params.to = [params.to];
  }

  const finalFlights = [];
  const rawFlights = (await db.query(`
    
    SELECT airport_from, airport_to, id 
    FROM Flights
    WHERE d_time >= $departureStart 
      AND d_time <= $departureEnd
      
      `, {
    departureStart: params.departureStart,
    departureEnd: params.departureEnd,
  })).rows;
  let graph = {};

  for (let flight of rawFlights) {
    const from = flight.airport_from;
    const to = flight.airport_to;

    if (!graph[from]) graph[from] = [];
    if (!graph[from].includes(to)) graph[from].push(to);
  }
  let flightPaths = [];
  let airportsWeathers = {};

  for (let to of params.to) {
    if (to.lat && to.lng) {
      to = await findNearestAirport(to.lat, to.lng);
    }
    const paths = findAllPaths(graph, params.from, to);

    for (let path of paths) {
      let newPaths = [[]];
      for (let i = 0; i < path.length - 1; i++) {
        const dbFlights = (await db.query(`

          SELECT *, a1.lat AS lat_from, a2.lat AS lat_to, a1.lng AS lng_from, a2.lng AS lng_to 
          FROM Flights f
          LEFT JOIN airports a1 ON a1.iata = f.airport_from
          LEFT JOIN airports a2 ON a2.iata = f.airport_to
          WHERE airport_from = $from AND airport_to = $to
            AND d_time >= $dTime AND a_time <= $aTime
          
            `, {
          from: path[i],
          to: path[i + 1],
          dTime: params.departureStart,
          aTime: params.departureEnd,
        })).rows;
        let paths = [];
        while (newPaths.length !== 0) {
          let path = newPaths.pop();
          for (let dbFlight of dbFlights) {
            let extended = [...path];
            extended.push(dbFlight);
            paths.push(extended);
          }
        }
        newPaths.push(...paths);
      }
      flightPaths.push(...newPaths);
    }

    for (let flightPath of flightPaths) {
      let data = {
        from: params.from,
        to,
      };
      data['route'] = [];
      data['totalPrice'] = 0;
      data['totalDistance'] = 0;
      data['id'] = '';

      let prevArrive = new Date('01-01-0001');
      let canConnect = true;

      for (let i = 0; i < flightPath.length; i++) {
        const flightData = dataFromFlight(flightPath[i]);

        if (flightData.dTime < prevArrive) {
          canConnect = false;
          prevArrive = flightData.aTime;
          break;
        }
        prevArrive = flightData.aTime;

        if (i === 0) {
          data['dTime'] = flightData.dTime;
          data['dWeather'] = await getForecastForAirport(
            airportsWeathers, flightData.from, flightData.dTime);
        }
        if (i === flightPath.length - 1) {
          data['aTime'] = flightData.aTime;
          data['aWeather'] = await getForecastForAirport(
            airportsWeathers, flightData.to, flightData.aTime);
        }

        data['totalPrice'] += +(flightData.price);
        data['totalDistance'] += +(flightData.distance);
        data['route'].push(flightData);
        data['id'] += flightData.shopId + (i !== flightPath.length - 1 ? '|' : '');
      }

      if (!canConnect) continue;

      data['totalDistance'] = Math.round(data['totalDistance'] * 100) / 100;
      data['duration'] = (data['aTime'].getTime() - data['dTime'].getTime()) / (3600 * 1000);
      finalFlights.push(data);
    }
  }

  if (params.filter === 'shortest') {
    let shortest = finalFlights[0];

    for (const flight of finalFlights) {
      if (flight.route.length < shortest.route.len) {
        shortest = flight;
      }
    }

    return shortest;
  }

  return finalFlights;
};

const findAllPaths = (graph, from, to, maxStopovers = 3) => {
  let queue = [];
  queue.push([from]);
  let paths = [];

  while (queue.length) {
    let path = queue.pop();
    let lastNode = path[path.length - 1];

    if (lastNode === to) {
      paths.push(path);
    }

    if (!graph[lastNode]) {
      continue;
    }

    if (path.length <= maxStopovers) {
      for (const node of graph[lastNode]) {
        if (!path.includes(node)) {
          let newPath = [...path];
          newPath.push(node);
          queue.unshift(newPath);
        }
      }
    }
  }

  return paths;
};

const dataFromFlight = (flight) => {
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
};

const findNearestAirport = async (lat, lng) => {
  let airports = (await db.query(`SELECT iata, lat, lng FROM airports`)).rows;
  let minLength = Number.MAX_SAFE_INTEGER;
  let nearest = '';

  for (const airport of airports) {
    let distance = Math.sqrt(Math.pow(airport.lat - lat, 2) + Math.pow(airport.lng - lng, 2));

    if (distance < minLength) {
      minLength = distance;
      nearest = airport.iata;
    }
  }

  return nearest;
};

const getForecastForAirport = async (airportsWeathers, iata, date = new Date()) => {
  if (!Object.keys(airportsWeathers).includes(iata + date.toDateString())) {
    const airport = (await db.query(`
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
};

const filterFlights = (flights, params) => {
  let filtered = [];

  if (!params.minPrice) params.minPrice = 0;
  if (!params.maxPrice) params.maxPrice = Number.MAX_SAFE_INTEGER;
  if (!params.maxStopovers) params.maxStopovers = Number.MAX_SAFE_INTEGER;

  for (let flight of flights) {
    if (flight.totalPrice >= params.minPrice && flight.totalPrice <= params.maxPrice) {
      if (flight.route.length <= params.maxStopovers) {
        filtered.push(flight);
      }
    }
  }

  return filtered;
};

module.exports = {
  findRoute,
  findAllPaths,
  findNearestAirport,
  getForecastForAirport,
  dataFromFlight,
  filterFlights,
};
