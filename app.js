require('marko/node-require'); // Allow Node.js to require and load `.marko` files

var express = require('express');
var markoExpress = require('marko/express');
var template = require('./views/index.marko');
const bodyParser = require('body-parser');

var app = express();

app.use(markoExpress()); // enable res.marko(template, data)
app.use(bodyParser.urlencoded());

app.get('/', function (req, res) {
  res.marko(template, { name: 'toni' });
});

require('./routes/routes.js')(app);

app.listen(8080);
