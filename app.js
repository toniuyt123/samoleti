require('marko/node-require'); // Allow Node.js to require and load `.marko` files

const express = require('express');
const path = require('path');
const markoExpress = require('marko/express');
const template = require('./views/index.marko');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

var app = express();

app.use(markoExpress());
// eslint-disable-next-line comma-dangle
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/styles', express.static(path.join(__dirname, '/public/css')));
app.use('/img', express.static(path.join(__dirname, '/public/img')));
app.use('/js', express.static(path.join(__dirname, '/public/js')));

app.get('/', (req, res) => {
  res.marko(template, { name: 'toni', });
});

require('./routes/users.js')(app);
require('./routes/api.js')(app);
require('./routes/search.js')(app);

app.listen(8080);

const request = require('request-promise-native');
var headersOpt = {
  'content-type': 'application/json',
};

async function test () {
  const res = await request(
    {
      method: 'post',
      url: 'http://localhost:8080/api',
      body: '{ "jsonrpc": "2.0", "method": "findRoute", "params": { "from": "SOF", "to": "CGN", "departureStart": "23/07/2019", "departureEnd": "24/07/2019 12:59:59" }, "id": 1 }',
      headers: headersOpt,
    });
  console.log(res);
}

// test();
