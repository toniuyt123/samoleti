const apiKey = process.env.WEATHER_API_KEY;
const request = require('request-promise-native');

module.exports = {
  weather: async (lat, lng, date = new Date()) => {
    const unixDate = parseInt(date.getTime() / 1000).toFixed(0);
    const url = `https://api.darksky.net/forecast/${apiKey}/${lat},${lng},${unixDate}?exclude=currently,hourly,flags`;
    const res = await request(url);

    return res;
  },
};
