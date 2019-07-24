const request = require('request-promise-native');
const headersOpt = {
  'content-type': 'application/json',
};

module.exports = function (app) {
  app.post('/explore', async (req, res) => {
    console.log(req.body)
    let departureRange = req.body.departureRange.split(' - ');
    departureRange[1] += ' 23:59:59';

    const result = await request({
      method: 'post',
      url: '/api',
      body: `{
        "jsonrpc": "2.0", 
        "method": "findRoute",
        "params": { "from": "SOF", "to": "CGN", "departureStart": "23/07/2019", "departureEnd": "24/07/2019 12:59:59" }, "id": 1 }`,
      headers: headersOpt,
    });
  });
};
