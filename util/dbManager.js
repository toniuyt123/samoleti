const request = require('request-promise-native');
const bcrypt = require('bcrypt');

class DBManager {
  constructor () {
    this.client = require('./db.js');
    this.saltRounds = 10;
  }

  async findUser (email) {
    const res = await this.client.query('SELECT * FROM users WHERE email = $email', {
      email: email,
    });

    return res.rows[0];
  }

  async addUser (username, email, phone, password) {
    let hashedPassword = await bcrypt.hash(password, this.saltRounds);

    return this.client.query(`
      INSERT INTO users(username, email, password, phone) 
      VALUES($username, $email, $password, $phone)`, {
      username: username,
      email: email,
      password: hashedPassword,
      phone: phone,
    });
  }

  async login (userId, key) {
    const isUnique = await this.client.query(`SELECT key FROM sessions WHERE key = $key;`, {
      key: key,
    });

    if (isUnique.rows.length) {
      return false;
    }
    return this.client.query(`
      INSERT INTO sessions(user_id, key, logged) 
      VALUES ($userId, $key, true) ON CONFLICT (user_id)
      DO UPDATE SET logged = true, key = $key;`, {
      userId: userId,
      key: key,
    });
  }

  logout (key) {
    return this.client.query(`
      UPDATE sessions SET logged = false 
      WHERE key = $key AND logged = true;`, {
      key: key,
    });
  }

  getSession (key) {
    return this.client.query(`SELECT * FROM sessions WHERE key = $1`, {
      key: key,
    });
  }

  async populateCountries () {
    const csv = require('csv-parser');
    const fs = require('fs');

    fs.createReadStream('./public/countries.csv')
      .pipe(csv())
      .on('data', (row) => {
        this.client.query(`
          INSERT INTO countries VALUES ($id, $name) ON CONFLICT DO NOTHING;`, {
          id: row['A2'],
          name: row['Name'],
        });
      });
  }

  async populateAirports () {

  }

  async scanForFlights () {
    const codes = await this.client.query(`SELECT id FROM countries;`);

    await this.client.query('BEGIN;');
    codes.rows.forEach(async code => {
      try {
        const res = await request(`https://api.skypicker.com/flights?fly_from=${code[0]}&max_stopovers=0`, {
          json: true,
        });

        const generalData = res.data;

        for (let j = 0; j < generalData.length; j++) {
          const flight = generalData[j].route[0];
          const dTime = new Date(flight.dTime * 1000);
          const aTime = new Date(flight.aTime * 1000);

          await this.client.query(`
            INSERT INTO Flights 
            VALUES($id, $number, $airportFrom, $airportTo, $dtime, $atime, $duration, 
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
      } catch (err) {
        await this.client.query('ROLLBACK;');
        throw err;
      } finally {
        await this.client.end();
      }
    });
    await this.client.query('COMMIT;');
  }

  async scanForAirlines () {
    try {
      const res = await request('https://api.skypicker.com/airlines', { 
        json: true,
      });
      await this.client.query('BEGIN;');
      for (let i = 0; i < res.length; i++) {
        await this.client.query(`
          INSERT INTO Airlines(id, lcc, name) 
          VALUES ($id, $lcc, $name) ON CONFLICT DO NOTHING;`, {
          id: res[i].id,
          lcc: res[i].lcc,
          name: res[i].name,
        });
      }
      await this.client.query('COMMIT;');
    } catch (err) {
      await this.client.query('ROLLBACK;');
      throw err;
    } finally {
      await this.client.end();
    }
  }

  createTables () {
    return this.client.query(`
    BEGIN;
    CREATE TABLE IF NOT EXISTS Users (
      id BIGSERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS Plans (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      priceMonthly NUMERIC(8,2) NOT NULL,
      priceYearly NUMERIC(8,2) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS Subscriptions (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES Users(id),
      plan_id BIGINT NOT NULL REFERENCES Plans(id),
      started_at TIMESTAMP NOT NULL DEFAULT NOW(),
      ends_at TIMESTAMP NOT NULL
    );
    CREATE TABLE IF NOT EXISTS Airlines (
      id TEXT PRIMARY KEY,
      lcc TEXT,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS Countries (
      id CHAR(2) PRIMARY KEY,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS Airports (
      id BIGINT PRIMARY KEY,
      iata CHAR(3) NOT NULL,
      lat FLOAT NOT NULL CHECK (lat >= -90 AND lat <= 90),
      lng FLOAT NOT NULL CHECK (lng >= -180 AND lng <= 180),
      city TEXT NOT NULL,
      countryCode CHAR(2) NOT NULL REFERENCES Countries(id)
    );
    CREATE TABLE IF NOT EXISTS Flights (
      id TEXT PRIMARY KEY,
      number BIGINT NOT NULL,
      airport_from BIGINT NOT NULL REFERENCES Airports(id),
      airport_to BIGINT NOT NULL REFERENCES Airports(id),
      dTime TIMESTAMP NOT NULL,
      aTtime TIMESTAMP NOT NULL,
      duration INTERVAL NOT NULL,
      class CHAR NOT NULL,
      distance DECIMAL(8,2) NOT NULL CHECK (distance > 0.0),
      price DECIMAL(8,2) NOT NULL CHECK (price > 0.0),
      airline_id TEXT NOT NULL REFERENCES Airlines(id)
    );
    COMMIT;
  `);
  }
}

module.exports = DBManager;
