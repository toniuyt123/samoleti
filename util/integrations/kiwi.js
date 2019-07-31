const request = require('request-promise-native');

const db = require('../db.js');
const { transaction } = require('../util.js');

module.exports = {
  scanForFlights: async () => {
    const codes = await db.query(`SELECT id FROM countries`);

    await transaction(async (db) => {
      codes.rows.forEach(async (code) => {
        const res = await request(`https://api.skypicker.com/flights?fly_from=${encodeURIComponent(code.id)}&max_stopovers=0`, {
          json: true,
        });

        const generalData = res.data;

        for (let j = 0; j < generalData.length; j++) {
          const flight = generalData[j].route[0];
          const dTime = new Date(flight.d_time * 1000);
          const aTime = new Date(flight.a_time * 1000);

          await db.query(`
            INSERT INTO airports
            VALUES($iata, $lat, $lng, $city, $country_code)
            ON CONFLICT DO NOTHING`, {
            iata: flight.flyFrom,
            lat: flight.latFrom,
            lng: flight.lngFrom,
            city: flight.cityFrom,
            country_code: generalData[j].countryFrom.code,
          });

          await db.query(`
            INSERT INTO airports
            VALUES($iata, $lat, $lng, $city, $country_code)
            ON CONFLICT DO NOTHING`, {
            iata: flight.flyTo,
            lat: flight.latTo,
            lng: flight.lngTo,
            city: flight.cityTo,
            country_code: generalData[j].countryTo.code,
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
            duration: generalData[j].duration.total,
            class: flight.fare_classes,
            distance: generalData[j].distance,
            price: generalData[j].price,
            airlineId: flight.airline,
          });
        }
      });
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
