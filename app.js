const express = require('express')
const app = express()
app.set('views', __dirname + '/public/views');
app.set('view engine', 'pug');

app.get('/', function (req, res) {
    res.render('index', { title: 'Hey', message: 'Hello there!'});
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})