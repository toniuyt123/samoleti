const { findRoute, filterFlights } = require('../util/flights.js');
const resultTemplate = require('../views/flights/search.marko');
const { sortArrayBy } = require('../util/util.js');
let cachedFlights = [];

module.exports = function (app) {
  app.post('/search', async (req, res) => {
    if (req.body.sortBy) {
      const sortBy = JSON.parse(req.body.sortBy);
      const filtered = filterFlights(cachedFlights, req.body);

      filtered.sort(sortArrayBy(sortBy.field, sortBy.desc, (a) => {
        if (sortBy.field === 'route') {
          return a.length;
        }
        return a;
      }));
      return res.marko(resultTemplate, {
        result: filtered,
        filters: req.body,
      });
    }

    let departureRange = req.body.departureRange.split(' - ');
    departureRange[1] += ' 23:59:59';

    const params = {
      from: req.body.from,
      to: req.body.to,
      departureStart: departureRange[0],
      departureEnd: departureRange[1],
    };

    const defaultFilters = {
      minPrice: 0,
      maxPrice: '',
      maxStopovers: '',
    };

    try {
      const result = await findRoute(params);
      cachedFlights = result;
      res.marko(resultTemplate, {
        result: result,
        filters: defaultFilters,
      });
    } catch (err) {
      console.log(err);
      res.marko(resultTemplate, {
        result: [],
        filters: defaultFilters,
      });
    }
  });
};
