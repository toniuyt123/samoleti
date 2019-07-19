require('marko/node-require'); // Allow Node.js to require and load `.marko` files

const express = require('express');
const markoExpress = require('marko/express');
const template = require('./views/index.marko');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const DBManager = require('./util/dbManager.js');
const db = new DBManager();

var app = express();

app.use(markoExpress()); // enable res.marko(template, data)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  db.populateCountries();
  res.marko(template, { name: 'toni' });
});

require('./routes/users.js')(app);
require('./routes/api.js')(app);

app.listen(8080);
