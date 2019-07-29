const bcrypt = require('bcrypt');
const transaction = require('./util.js').transactionWrapper;
const named = require('node-postgres-named');

class DBMethods {
  constructor () {
    this.pool = require('./db.js');
    this.saltRounds = 10;
  }

  async getClient () {
    var client = await this.pool.connect();
    named.patch(client);

    return client;
  }

  async findUser (email) {
    const res = await this.pool.query('SELECT * FROM users WHERE email = $email', {
      email: email,
    });

    return res.rows[0];
  }

  async addUser (username, email, phone, password) {
    let hashedPassword = await bcrypt.hash(password, this.saltRounds);
    return this.pool.query(`
      INSERT INTO users(username, email, password, phone) 
      VALUES($username, $email, $password, $phone)`, {
      username: username,
      email: email,
      password: hashedPassword,
      phone: phone,
    });
  }

  async login (userId, key) {
    const isUnique = await this.pool.query(`SELECT key FROM sessions WHERE key = $key`, {
      key: key,
    });

    if (isUnique.rows.length) {
      return false;
    }
    return this.pool.query(`
      INSERT INTO sessions(user_id, key, logged) 
      VALUES ($userId, $key, true) ON CONFLICT (user_id)
      DO UPDATE SET logged = true, key = $key`, {
      userId: userId,
      key: key,
    });
  }

  logout (key) {
    return this.pool.query(`
      UPDATE sessions SET logged = false 
      WHERE key = $key AND logged = true`, {
      key: key,
    });
  }

  async getSession (key) {
    const session = (await this.pool.query(`SELECT * FROM sessions WHERE key = $key`, {
      key: key,
    })).rows;

    if (session) { return session[0]; }
    return undefined;
  }

  async getActiveUser (req) {
    const session = await this.getSession(req.cookies.sessionKey);

    const user = (await this.pool.query(`SELECT * FROM users WHERE id = $id`, {
      id: session.user_id,
    })).rows[0];

    return user;
  }

  async populateCountries () {
    const csv = require('csv-parser');
    const fs = require('fs');
    await transaction((client) => {
      fs.createReadStream('./public/countries.csv')
        .pipe(csv())
        .on('data', (row) => {
          client.query(`
            INSERT INTO countries(id, name, continent)
            VALUES ($id, $name, $continent) ON CONFLICT (id)
            DO UPDATE SET name = $name, continent = $continent`, {
            id: row['A2'],
            name: row['Name'],
            continent: row['Continent'],
          });
        });
    });
  }

  async createTables () {
    await transaction(async (client) => {
      await client.query(`
        CREATE TABLE IF NOT EXISTS Users (
          id BIGSERIAL PRIMARY KEY,
          username TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          phone TEXT NOT NULL,
          registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
          is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
        )`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS Plans (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          price_monthly NUMERIC(8,2) NOT NULL,
          price_yearly NUMERIC(8,2) NOT NULL
        )`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS Subscriptions (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES Users(id),
          plan_id BIGINT NOT NULL REFERENCES Plans(id),
          started_at TIMESTAMP NOT NULL DEFAULT NOW(),
          ends_at TIMESTAMP NOT NULL
        )`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS Airlines (
          id TEXT PRIMARY KEY,
          lcc TEXT,
          name TEXT NOT NULL
        )`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS Countries (
          id CHAR(2) PRIMARY KEY,
          name TEXT NOT NULL
        )`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS Airports (
          iata CHAR(3) PRIMARY KEY,
          lat FLOAT NOT NULL CHECK (lat >= -90 AND lat <= 90),
          lng FLOAT NOT NULL CHECK (lng >= -180 AND lng <= 180),
          city TEXT NOT NULL,
          country_code CHAR(2) NOT NULL REFERENCES Countries(id)
        )`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS Flights (
          id TEXT PRIMARY KEY,
          number BIGINT NOT NULL,
          airport_from CHAR(3) NOT NULL REFERENCES Airports(iata),
          airport_to CHAR(3) NOT NULL REFERENCES Airports(iata),
          d_time TIMESTAMP NOT NULL,
          a_time TIMESTAMP NOT NULL,
          duration INTERVAL NOT NULL,
          class CHAR NOT NULL,
          distance DECIMAL(8,2) NOT NULL CHECK (distance > 0.0),
          price DECIMAL(8,2) NOT NULL CHECK (price > 0.0),
          airline_id TEXT NOT NULL REFERENCES Airlines(id)
        )`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS Sessions (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES Users(id),
          key TEXT NOT NULL,
          logged BOOLEAN NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS confirmation_tokens (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES Users(id),
          token TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS scheduled_emails (
          id BIGSERIAL PRIMARY KEY,
          recipient BIGINT UNIQUE NOT NULL REFERENCES Users(id),
          cron_expression TEXT NOT NULL,
          max_price DECIMAL(8,2) NOT NULL CHECK (max_price > 0.0)
        )`);
    });
  }
}

module.exports = DBMethods;
