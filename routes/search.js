const findRoute = require('../util/flights.js').findRoute;
const resultTemplate = require('../views/flights/search.marko');

module.exports = function (app) {
  app.post('/search', async (req, res) => {
    let departureRange = req.body.departureRange.split(' - ');
    departureRange[1] += ' 23:59:59';

    const params = {
      from: req.body.from,
      to: req.body.to,
      departureStart: departureRange[0],
      departureEnd: departureRange[1],
    };

    try {
      const result = await findRoute(params);
      res.marko(resultTemplate, {
        result: result,
      });
    } catch (err) {
      console.log(err)
      res.marko(resultTemplate, {
        result: [],
      });
    }
  });
};
