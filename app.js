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

app.get('/', async (req, res) => {
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
  try {
    const res = await request(
      {
        method: 'post',
        url: 'https://localhost:3000/api',
        body: '{ "jsonrpc": "2.0", "method": "findRoute", "params": { "from": "SOF", "to": "BGY", "departureStart": "8/09/2019", "departureEnd": "9/09/2019 12:59:59" }, "id": 1 }',
        // body: '{ "jsonrpc": "2.0", "method": "setDealNotifications", "params": { "recipient": "22", "frequency": "7 18 * * *", "maxPrice": 100, "prefferedDestinations": [\'SOF\', \'CGN\'] }, "id": 1 }',
        headers: headersOpt,
        agentOptions: {
          ca: fs.readFileSync('server.cert'),
          rejectUnauthorized: false,
        },
      });
    console.log(res);
  } catch (err) {
    console.log(err);
  }
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

// const stripe = require('./util/integrations/stripe.js');
// stripe.createPlansFromDb();
// const { airlineLogos } = require('./util/integrations/kiwi.js');
//  airlineLogos();
