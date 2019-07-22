const request = require('request-promise-native');
const client = require('../db.js');

module.exports = {
  scanForFlights: async () => {
    const codes = await client.query(`SELECT id FROM countries`);

    await client.query('BEGIN');
    codes.rows.forEach(async (code) => {
      try {
        const res = await request(`https://api.skypicker.com/flights?fly_from=${code.id}&max_stopovers=0`, {
          json: true,
        });

        const generalData = res.data;

        for (let j = 0; j < generalData.length; j++) {
          const flight = generalData[j].route[0];
          const dTime = new Date(flight.dTime * 1000);
          const aTime = new Date(flight.aTime * 1000);

          await client.query(`
                INSERT INTO airports
                VALUES($iata, $lat, $lng, $city, $country_code)
                ON CONFLICT DO NOTHING`, {
            iata: flight.flyFrom,
            lat: flight.latFrom,
            lng: flight.lngFrom,
            city: flight.cityFrom,
            country_code: generalData[j].countryFrom.code,
          });

          await client.query(`
                INSERT INTO airports
                VALUES($iata, $lat, $lng, $city, $country_code)
                ON CONFLICT DO NOTHING`, {
            iata: flight.flyTo,
            lat: flight.latTo,
            lng: flight.lngTo,
            city: flight.cityTo,
            country_code: generalData[j].countryTo.code,
          });

          await client.query(`
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
        await client.query('CHECKPOINT');
      } catch (err) {
        await client.query('ROLLBACK');
        console.log(err);
        throw err;
      }
    });
    console.log('DONE');
    await client.query('COMMIT');
  },

  scanForAirlines: async () => {
    try {
      const res = await request('https://api.skypicker.com/airlines', {
        json: true,
      });
      await client.query('BEGIN');
      for (let i = 0; i < res.length; i++) {
        await client.query(`
          INSERT INTO Airlines(id, lcc, name) 
          VALUES ($id, $lcc, $name) ON CONFLICT DO NOTHING`, {
          id: res[i].id,
          lcc: res[i].lcc,
          name: res[i].name,
        });
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      await client.end();
    }
  },
};
