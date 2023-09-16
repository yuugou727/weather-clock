const functions = require('firebase-functions');
const PROJECT_ID = process.env.GCLOUD_PROJECT;
const origins =
  process.env.NODE_ENV !== 'production'
    ? ['http://localhost:3000'] // Vite local dev server
    : [
        `https://${PROJECT_ID}.web.app`,
        `https://${PROJECT_ID}.firebaseapp.com`,
      ];
const cors = require('cors')({ origin: origins });
const fetch = require('node-fetch');
const qs = require('qs');

// Open Weather
const weatherAPI = 'https://api.openweathermap.org/data/2.5/onecall';
const reverseGeocodingAPI = 'http://api.openweathermap.org/geo/1.0/reverse';
const OwmKey = functions.config().openweather.key;

exports.weather = functions.region('asia-east1').https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method === 'GET') {
      const { lat, lng } = req.query;
      const queryString = qs.stringify({
        lat: lat,
        lon: lng,
        appid: OwmKey,
        exclude: 'minutely,daily,alerts',
        units: 'metric',
        lang: 'zh_tw',
      });
      fetch(weatherAPI + '?' + queryString)
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .then((data) => {
          functions.logger.debug('[weather] API success');
          res.status(200).send(data);
        })
        .catch((err) => {
          functions.logger.error('[weather]', err);
          res.status(500).send({ message: err.message });
        });
    } else {
      functions.logger.warn('[weather] invalid req:', req);
      return res.sendStatus(500);
    }
  });
});

exports.reverseGeocoding = functions
  .region('asia-east1')
  .https.onRequest((req, res) => {
    cors(req, res, () => {
      if (req.method === 'GET') {
        const { lat, lng } = req.query;
        const queryString = qs.stringify({
          lat: lat,
          lon: lng,
          appid: OwmKey,
          limit: 1,
        });
        fetch(reverseGeocodingAPI + '?' + queryString)
          .then((response) => {
            if (!response.ok) {
              throw new Error(response.statusText);
            }
            return response.json();
          })
          .then((data) => {
            functions.logger.debug('[reverseGeocoding] API success');
            res.status(200).send(data);
          })
          .catch((err) => {
            functions.logger.error('[reverseGeocoding]', err);
            res.status(500).send({ message: err.message });
          });
      } else {
        functions.logger.warn('[reverseGeocoding] invalid req:', req);
        return res.sendStatus(500);
      }
    });
  });
