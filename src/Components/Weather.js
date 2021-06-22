import React, { useState, useEffect, useCallback } from 'react';
import RefreshIcon from '../refresh.svg';
import ChartIcon from '../chart.svg';
import ColorPicker from './ColorPicker.js';
import HourlyWeather from './HourlyWeather.js';
import { toast } from 'react-toastify';
import { formatDistanceStrict, differenceInMinutes } from 'date-fns';
import { zhTW } from 'date-fns/locale'

// Google Cloud Platform
const geolocationAPI = 'https://www.googleapis.com/geolocation/v1/geolocate';
const GCPkey = 'AIzaSyDNRfiwt-_A8_lrlzvqzjPeUNPFoyMwx5Y';

const myAPI = process.env.NODE_ENV !== 'production' ?
  'http://localhost:5000/ronnie-weather-clock/us-central1/' :
  'https://us-central1-ronnie-weather-clock.cloudfunctions.net/';
const weatherAPI = myAPI + 'weather';
const reverseGeocodingAPI = myAPI + 'reverseGeocoding';

function Weather() {
  const [isOnline, setIsOnline] = useState(true);
  const [fetchTime, setFetchTime] = useState(new Date());
  const [fetchTimeStatus, setFetchTimeStatus] = useState('尚未');

  const getGeoLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      const geolocate = fetch(geolocationAPI + '?key=' + GCPkey, { method: 'POST' })
        .then(res => {
          if (!res.ok) {
            throw new Error(res.statusText);
          }
          return res.json();
        })
        .then(data => {
          if (data.error) {
            throw new Error(data.message);
          }
          resolve({
            lat: data.location.lat,
            lng: data.location.lng
          });
        })
        .catch(err => {
          reject(new Error('[定位錯誤] ' + err.message));
        });

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          position => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          err => { //fallback to use Google Geolocation API
            return geolocate;
          }, {
          timeout: 10000,
        });
      } else { //fallback to use Google Geolocation API
        return geolocate;
      }
    });
  }, []);

  const [city, setCity] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [currentWeather, setCurrentWeather] = useState({});
  const [hourlyWeather, setHourlyWeather] = useState([]);

  const getWeather = useCallback(async () => {
    if (isOnline) {
      setIsQuerying(true);
      const { lat, lng } = await getGeoLocation();
      const url = new URL(weatherAPI);
      url.search = new URLSearchParams({ lat, lng });

      fetch(url)
        .then(res => {
          if (!res.ok) {
            throw new Error(res.statusText);
          }
          return res.json();
        })
        .then(result => {
          const { temp, feels_like, humidity, weather } = result.current;
          setIsQuerying(false);
          setFetchTime(new Date());
          setFetchTimeStatus('剛才');
          setCurrentWeather({
            humidity,
            temp: temp.toFixed(1),
            feltTemp: feels_like.toFixed(1),
            icon: weather[0].icon,
            desc: weather[0].description
          });

          setHourlyWeather(result.hourly.slice(0, 24));
          // toast.info('天氣資訊已更新');
        })
        .catch((err) => {
          setIsQuerying(false);
          toast.error('[天氣錯誤] ' + err.message);
        });

      const revGeoUrl = new URL(reverseGeocodingAPI);
      revGeoUrl.search = new URLSearchParams({ lat, lng });
      fetch(revGeoUrl)
        .then(res => {
          if (!res.ok) {
            throw new Error(res.statusText);
          }
          return res.json();
        })
        .then(result => {
          const { local_names } = result[0];
          setCity(local_names.ascii);
        })
        .catch((err) => {
          toast.error('[地理查詢錯誤] ' + err.message);
        });;

    } else {
      toast.error('沒有網路連線，請連上網路後再試');
    }
  }, [isOnline, getGeoLocation]);

  useEffect(() => {
    getWeather();
  }, []);

  useEffect(() => {
    const updateTimer = setInterval(() => {
      let status = formatDistanceStrict(new Date(), fetchTime, { locale: zhTW }).concat('前');
      setFetchTimeStatus(status);
      if ((differenceInMinutes(new Date(), fetchTime) >= 60) && isOnline) { // update weather older than 1 hour
        getWeather();
      }
    }, 1000 * 5);
    return () => {
      clearInterval(updateTimer);
    };
  }, [fetchTime]);

  useEffect(() => {
    const offlineListener = () => {
      setIsOnline(false);
      // toast.warn('沒有網路連線');
    };
    const onlineListener = () => {
      setIsOnline(true, () => {
        if (differenceInMinutes(new Date(), fetchTime) >= 60) {
          getWeather();
        }
      });
      // toast.success('已連上網路');
    };

    window.addEventListener('offline', offlineListener);
    window.addEventListener('online', onlineListener);
    return () => {
      window.removeEventListener('offline', offlineListener);
      window.removeEventListener('online', onlineListener)
    }
  }, [])

  function computeTempHue(temp) {
    return temp < 0 ? 220 :
      temp > 38 ? 0 :
        220 - parseInt((temp / 38) * 220, 10);
  }

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHourlyWeather, setShowHourlyWeather] = useState(false);
  const refreshClass = isQuerying ? 'spin' : '';
  const tempColor = `hsl(${computeTempHue(currentWeather.temp)},70%,60%)`;
  const feltTempColor = `hsl(${computeTempHue(currentWeather.feltTemp)},70%,60%)`;
  const humidityColor = `hsl(200, 100%, ${100 - currentWeather.humidity / 2}%)`;
  return (
    <div className="weatherDiv">
      <HourlyWeather show={showHourlyWeather} closeHourlyWeather={() => setShowHourlyWeather(false)} weatherInfo={hourlyWeather}></HourlyWeather>
      <div className="buttonGroup">
        <button id="refreshBtn" className={refreshClass} onClick={() => getWeather()} disabled={isQuerying}>
          <img src={RefreshIcon} className="refreshIcon" alt="refresh" />
        </button>
        <button id="colorPickerBtn" onClick={() => setShowColorPicker(!showColorPicker)} title="color-picker"></button>
        <button id="hourlyWeatherBtn" onClick={() => setShowHourlyWeather(!showColorPicker)} title="hourly-weather">
          <img src={ChartIcon} alt="hourly" />
        </button>
      </div>
      <ColorPicker show={showColorPicker} closeColorPicker={() => setShowColorPicker(false)}></ColorPicker>
      <div>
        <img className="weatherIcon" src={currentWeather.icon ? `https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png` : ''} title={currentWeather.desc} crossOrigin="anonymous" />
        <p className="location">{city}</p>
        <p className="weather">{currentWeather.desc}</p>
      </div>
      <div>
        <p className="temp" style={{ color: tempColor }}>{currentWeather.temp}°C</p>
        <p className="feltTemp">體感
          <span style={{ color: feltTempColor }}> {currentWeather.feltTemp}°C</span>
        </p>
        <p className="humidity">濕度
          <span style={{ color: humidityColor }}> {currentWeather.humidity}%</span>
        </p>
        <p><small>於 {fetchTimeStatus}更新</small></p>
      </div>
    </div>
  );
}

export default Weather