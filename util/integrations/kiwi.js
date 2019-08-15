const request = require('request-promise-native');

const db = require('../db.js');
const { transaction } = require('../util.js');
const { createProduct, productFromFlight } = require('./marti.js');

module.exports = {
  scanForFlights: async () => {
    const codes = await db.query(`SELECT id FROM countries`);

    await transaction(async (db) => {
      for (let code of codes.rows) {
        try {
          var res = await request(`https://api.skypicker.com/flights?fly_from=${encodeURIComponent(code.id)}&max_stopovers=0&partner=picky`, {
            json: true,
          });
        } catch (err) {
          // if (err.message[0].param === 'fly from') continue;

          console.log(err);
        }

        const generalData = res.data;

        for (let data of generalData) {
          const flight = data.route[0];
          const dTime = new Date(flight.dTime * 1000);
          const aTime = new Date(flight.aTime * 1000);

          await db.query(`
            INSERT INTO airports
            VALUES($iata, $lat, $lng, $city, $country_code)
            ON CONFLICT DO NOTHING`, {
            iata: flight.flyFrom,
            lat: flight.latFrom,
            lng: flight.lngFrom,
            city: flight.cityFrom,
            country_code: data.countryFrom.code,
          });

          await db.query(`
            INSERT INTO airports
            VALUES($iata, $lat, $lng, $city, $country_code)
            ON CONFLICT DO NOTHING`, {
            iata: flight.flyTo,
            lat: flight.latTo,
            lng: flight.lngTo,
            city: flight.cityTo,
            country_code: data.countryTo.code,
          });

          await db.query(`
            INSERT INTO Flights 
            VALUES($id, $number, $airportFrom, $airportTo, $dTime, $aTime, $duration, 
              $class, $distance, $price, $airlineId) ON CONFLICT DO NOTHING`, {
            id: flight.id,
            number: flight.flight_no,
            airportFrom: flight.flyFrom,
            airportTo: flight.flyTo,
            dTime: dTime,
            aTime: aTime,
            duration: data.duration.total,
            class: flight.fare_classes,
            distance: data.distance,
            price: data.price,
            airlineId: flight.airline,
          });

          const product = productFromFlight({
            id: flight.id,
            price: data.price,
            airport_from: flight.flyFrom,
            airport_to: flight.flyTo,
            number: flight.flight_no,
            d_time: dTime,
            a_time: aTime,
          });
          createProduct(product);
        }
      }
    });
  },

  scanForAirlines: async () => {
    await transaction(async (db) => {
      const res = await request('https://api.skypicker.com/airlines', {
        json: true,
      });

      for (let i = 0; i < res.length; i++) {
        await db.query(`
          INSERT INTO Airlines(id, lcc, name) 
          VALUES ($id, $lcc, $name) ON CONFLICT DO NOTHING`, {
          id: res[i].id,
          lcc: res[i].lcc,
          name: res[i].name,
        });
      }
    });
  },

  airlineLogos: async () => {
    await transaction(async (db) => {
      const ids = (await db.query(`SELECT id FROM airlines;`)).rows;

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i].id;
        const res = await request(`https://images.kiwi.com/airlines/64x64/${encodeURIComponent(id)}.png`);
        // eslint-disable-next-line new-cap
        let buf = new Buffer.from(res, 'utf-8');

        await db.query(`
          UPDATE airlines SET logo = $logoBytes
          WHERE id = $id`, {
          logoBytes: '\\x' + buf.toString('hex'),
          id: id,
        });
      }
    });
  },
};
