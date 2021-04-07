const functions = require('firebase-functions');
const origins = [
  'http://localhost:3000',
  'https://ronnie-weather-clock.web.app',
  'https://ronnie-weather-clock.firebaseapp.com',
];
const cors = require('cors')({ origin: origins });
const fetch = require('node-fetch')
const qs = require('qs');

const openWeatherMapAPI = 'https://api.openweathermap.org/data/2.5/';
const OWMkey = '1c56e5d44390d340fda11cb956125832';

exports.weather = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method === 'GET') {
      const { lat, lng } = req.query;
      const url = openWeatherMapAPI + 'onecall';
      const queryString = qs.stringify({
        lat: lat,
        lon: lng,
        appid: OWMkey,
        exclude: 'minutely,daily,alerts',
        units: 'metric', lang: 'zh_tw'
      });
      fetch(url + '?' + queryString)
        .then(response => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .then(data => {
          res.status(200).send(data);
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        })
    } else {
      return res.sendStatus(500);
    }
  });
});

