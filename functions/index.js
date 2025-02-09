const { setGlobalOptions } = require('firebase-functions/v2');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { debug, warn, error } = require('firebase-functions/logger');

const PROJECT_ID = process.env.GCLOUD_PROJECT;
const origins =
  process.env.NODE_ENV !== 'production'
    ? ['http://localhost:3000'] // Vite local dev server
    : [
        `https://${PROJECT_ID}.web.app`,
        `https://${PROJECT_ID}.firebaseapp.com`,
      ];
const cors = require('cors')({ origin: origins });
const qs = require('qs');

// Open Weather
const weatherAPI = 'https://api.openweathermap.org/data/3.0/onecall';
const reverseGeocodingAPI = 'http://api.openweathermap.org/geo/1.0/reverse';
const OwmKey = defineSecret('OPENWEATHER_KEY');

setGlobalOptions({
  cpu: 'gcf_gen1', // 1st gen default fractional CPU
  region: 'asia-east1', // locate all functions closest to users
});

exports.weather = onRequest(
  { secrets: [OwmKey], maxInstances: 2 },
  (req, res) => {
    cors(req, res, () => {
      if (req.method === 'GET') {
        const { lat, lng } = req.query;
        const queryString = qs.stringify({
          lat: lat,
          lon: lng,
          appid: OwmKey.value(),
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
            debug('[weather] API success');
            res.status(200).send(data);
          })
          .catch((err) => {
            error('[weather]', {err}, );
            debug('[weather] key', OwmKey.value())
            res.status(500).send({ message: err.message });
          });
      } else {
        warn('[weather] invalid req:', req);
        return res.sendStatus(500);
      }
    });
  }
);

exports.reverseGeocoding = onRequest(
  { secrets: [OwmKey], maxInstances: 2 },
  (req, res) => {
    cors(req, res, () => {
      if (req.method === 'GET') {
        const { lat, lng } = req.query;
        const queryString = qs.stringify({
          lat: lat,
          lon: lng,
          appid: OwmKey.value(),
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
            debug('[reverseGeocoding] API success');
            res.status(200).send(data);
          })
          .catch((err) => {
            error('[reverseGeocoding]', err);
            res.status(500).send({ message: err.message });
          });
      } else {
        warn('[reverseGeocoding] invalid req:', req);
        return res.sendStatus(500);
      }
    });
  }
);
