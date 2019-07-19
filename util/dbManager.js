const request = require('request-promise-native');
const bcrypt = require('bcrypt');

class DBManager {
  constructor () {
    this.client = require('./db.js');
    this.saltRounds = 10;
  }

  async findUser (email) {
    const res = await this.client.query('SELECT * FROM users WHERE email = $1', [email]);

    return res.rows[0];
  }

  async addUser (username, email, phone, password) {
    let hashedPassword = await bcrypt.hash(password, this.saltRounds);
    return this.client.query('INSERT INTO users(username, email, password, phone) VALUES($1, $2, $3, $4)',
      [username, email, hashedPassword, phone]);
  }

  async scanForFlights () {
    const csv = require('csv-parser');
    const fs = require('fs');

    var codes = [];
    fs.createReadStream('./public/countries.csv')
      .pipe(csv())
      .on('data', (row) => {
        codes.push(row['A2']);
      })
      .on('end', async () => {
        try {
          await this.client.query('BEGIN;');
          for (let i = 0; i < codes.length; i++) {
            const res = await request(`https://api.skypicker.com/flights?fly_from=${codes[i]}&max_stopovers=0`,
              { json: true }).catch(err => console.log(err));
            if (res) {
              const flights = res.data;
              for (let j = 0; j < flights.length; j++) {
                const f = flights[j].route[0];
                const dTime = new Date(f.dTime * 1000);
                const aTime = new Date(f.aTime * 1000);
                await this.client.query('INSERT INTO Flights VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING;',
                  [f.id, f.flight_no, f.flyFrom, f.flyTo, dTime, aTime, flights[j].duration.total,
                    f.fare_classes, flights[j].distance, flights[j].price, f.airline]);
              }
            }
          }
          await this.client.query('COMMIT;');
        } catch (err) {
          await this.client.query('ROLLBACK;');
          throw err;
        } finally {
          await this.client.end();
        }
      });
  }

  async scanForAirlines () {
    try {
      const res = await request('https://api.skypicker.com/airlines', { json: true });
      await this.client.query('BEGIN;');
      for (let i = 0; i < res.length; i++) {
        await this.client.query('INSERT INTO Airlines(id, lcc, name) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;',
          [res[i].id, res[i].lcc, res[i].name]);
      }
      await this.client.query('COMMIT;');
    } catch (err) {
      await this.client.query('ROLLBACK;');
      throw err;
    } finally {
      await this.client.end();
    }
  }

  async login (userId, key) {
    const isUnique = await this.client.query(`SELECT key FROM sessions WHERE key = $1;`, [key]);
    if (isUnique.rows.length) {
      return false;
    }
    return this.client.query(`INSERT INTO sessions(user_id, key, logged) VALUES ($1, $2, true) ON CONFLICT (user_id)
                              DO UPDATE SET logged = true, key = $2;`, [userId, key]);
  }

  logout (key) {
    return this.client.query(`UPDATE sessions SET logged = false WHERE key = $1 AND logged = true;`, [key]);
  }

  getSession (key) {
    return this.client.query(`SELECT * FROM sessions WHERE key = $1`, [key]);
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
    CREATE TABLE IF NOT EXISTS Flights (
      id TEXT PRIMARY KEY,
      number BIGINT NOT NULL,
      airport_from TEXT NOT NULL,
      airport_to TEXT NOT NULL,
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
