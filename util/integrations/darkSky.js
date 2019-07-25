const apiKey = process.env.WEATHER_API_KEY;
const request = require('request-promise-native');

module.exports = {
  weather: async (lat, lng) => {
    const date = parseInt((new Date('2019.07.27').getTime() / 1000).toFixed(0))
    const url = `https://api.darksky.net/forecast/${apiKey}/${lat},${lng},${date}?exclude=currently,hourly,flags`;
    const res = await request(url);

    return res;
  },
};
