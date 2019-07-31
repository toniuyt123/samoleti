const request = require('request-promise-native');

const apiKey = process.env.WEATHER_API_KEY;

module.exports = {
  weather: async (lat, lng, date = new Date()) => {
    const unixDate = parseInt(date.getTime() / 1000).toFixed(0);
    let url = `https://api.darksky.net/forecast/
      ${encodeURIComponent(apiKey)}/${encodeURIComponent(lat)},
      ${encodeURIComponent(lng)},${encodeURIComponent(unixDate)}?exclude=currently,hourly,flags`;

    url = url.replace(/\s/g, '');
    const res = await request(url);

    return res;
  },
};
