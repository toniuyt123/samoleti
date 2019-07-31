const path = require('path');
const fs = require('fs');

const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const markoExpress = require('marko/express');
require('marko/node-require'); // Allow Node.js to require and load `.marko` files

const indexTemplate = require('./views/index.marko');
const { scheduleEmails } = require('./util/emailUtils.js');

const app = express();

app.use(markoExpress());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/styles', express.static(path.join(__dirname, '/public/css')));
app.use('/img', express.static(path.join(__dirname, '/public/img')));
app.use('/js', express.static(path.join(__dirname, '/public/js')));

app.get('/', (req, res) => {
  res.marko(indexTemplate);
});

require('./routes/users.js')(app);
require('./routes/api.js')(app);
require('./routes/search.js')(app);

// Handle 404
app.use((req, res) => {
  const errorTemplate = require('./views/errorPages/404.marko');

  res.status(400);
  res.marko(errorTemplate, {
    title: '404: File Not Found',
  });
});

// Handle 500
app.use((error, req, res, next) => {
  const errorTemplate = require('./views/errorPages/500.marko');
  console.log(error);
  res.status(500);
  res.marko(errorTemplate, {
    title: '500: Internal Server Error',
    error: error,
  });
});

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert'),
}, app)
  .listen(3000, () => {
    console.log('App listening on port 3000! Go to https://localhost:3000/');
  });
scheduleEmails();

const request = require('request-promise-native');
const headersOpt = {
  'content-type': 'application/json',
};

async function test () {
  const res = await request(
    {
      method: 'post',
      url: 'http://localhost:8080/api',
      // body: '{ "jsonrpc": "2.0", "method": "findRoute", "params": { "from": { "lat": 42, "lng": 23 }, "to": ["CGN", "BGY"], "departureStart": "23/07/2019", "departureEnd": "24/07/2019 12:59:59", "filter": "shortest" }, "id": 1 }',
      body: '{ "jsonrpc": "2.0", "method": "setDealNotifications", "params": { "recipient": "22", "frequency": "7 18 * * *", "maxPrice": 100 }, "id": 1 }',
      headers: headersOpt,
    });
  console.log(res);
}

// test();
/*
const weatherAPI = require('./util/integrations/darkSky.js');
weatherAPI.weather(42.697365, 23.305037);
*/

// const marti = require('./util/integrations/marti.js');
// marti.dumpFlightData();

// const vladi = require('./util/integrations/vladi.js');
// vladi.promote();

/* const DB = require('./util/dbMethods.js');
const db = new DB();

db.createTables(); */

// const stripe = require('./util/integrations/stripe.js');
// stripe.createPlansFromDb();
