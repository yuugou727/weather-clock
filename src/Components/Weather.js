import React, { useState, useEffect, useCallback, memo } from 'react';
import RefreshIcon from '../refresh.svg';
import ColorPicker from './ColorPicker.js';
import { toast } from 'react-toastify';
import distanceInWordsStrict from 'date-fns/distance_in_words_strict'
import differenceInMinutes from 'date-fns/difference_in_minutes'
import localeTW from 'date-fns/locale/zh_tw';

const geolocationAPI = 'https://www.googleapis.com/geolocation/v1/geolocate'
const GCPkey = 'AIzaSyDNRfiwt-_A8_lrlzvqzjPeUNPFoyMwx5Y';
const myApi = 'https://us-central1-ronnie-weather-clock.cloudfunctions.net/';


function Weather() {
  const [isOnline, setIsOnline] = useState(true);
  const [fetchTime, setFetchTime] = useState(new Date());
  const [fetchTimeStatus, setFetchTimeStatus] = useState('尚未');

  const getPosition = useCallback(() => {
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

  const [isQuerying, setIsQuerying] = useState(false);
  const [city, setCity] = useState('');
  const [weatherInfo, setWeatherInfo] = useState({});
  const [tempHue, setTempHue] = useState(100);
  const [feltTempHue, setFeltTempHue] = useState(100);

  const getWeather = useCallback(async () => {
    if (isOnline) {
      setIsQuerying(true);
      const { lat, lng } = await getPosition();
      const url = new URL(myApi + 'weather');
      url.search = new URLSearchParams({ lat, lng });

      fetch(url)
        .then(res => {
          if (!res.ok) {
            throw new Error(res.statusText);
          }
          return res.json();
        })
        .then(result => {
          const T = result.main.temp;
          const H = result.main.humidity;
          const V = result.wind.speed;
          const e = (H / 100) * 6.105 * Math.exp((17.27 * T) / (237.7 + T));
          const AT = (1.07 * T) + (0.2 * e) - (0.65 * V) - 2.7;

          setIsQuerying(false);
          setFetchTime(new Date());
          setFetchTimeStatus('剛才');
          setCity(result.name);
          setWeatherInfo({
            humidity: H,
            temp: T.toFixed(1),
            feltTemp: AT.toFixed(1),
            windSpeed: V,
            desc: result.weather[0].description
          });
          setTempHue(computeTempHue(T));
          setFeltTempHue(computeTempHue(AT));
          toast.info('天氣資訊已更新');
        })
        .catch((err) => {
          setIsQuerying(false);
          toast.error('[天氣錯誤] ' + err.message);
        });
    } else {
      toast.error('沒有網路連線，請開啟並連上網路後再試');
    }
  }, [isOnline, getPosition]);

  useEffect(() => {
    getWeather();
  }, [getWeather]);

  useEffect(() => {
    const updateTimer = setInterval(() => {
      let status = distanceInWordsStrict(new Date(), fetchTime, { locale: localeTW }).concat('前');
      setFetchTimeStatus(status);
      if ((differenceInMinutes(new Date(), fetchTime) >= 60) && isOnline) { // update weather older than 1 hour
        getWeather();
      }
    }, 1000 * 60);
    return () => {
      clearInterval(updateTimer);
    };
  }, []);

  useEffect(() => {
    window.addEventListener('offline', () => {
      setIsOnline(false);
      toast.warn('沒有網路連線');
    })
    window.addEventListener('online', () => {
      setIsOnline(true, () => {
        if (differenceInMinutes(new Date(), fetchTime) >= 60) {
          getWeather();
        }
      });
      toast.success('已連上網路');
    })
  }, [])

  function computeTempHue(temp) {
    return temp < 0 ? 220 :
      temp > 38 ? 0 :
        220 - parseInt((temp / 38) * 220, 10);
  }

  const [showColorPicker, setShowColorPicker] = useState(false);

  const refreshClass = isQuerying ? 'refreshBtn spin' : 'refreshBtn';
  const tempColor = `hsl(${tempHue},70%,60%)`;
  const feltTempColor = `hsl(${feltTempHue},70%,60%)`;
  const humidityColor = `hsl(200, 100%, ${100 - weatherInfo.humidity / 2}%)`;
  const ColorPickerMemo = memo(ColorPicker);
  return (
    <div className="weatherDiv">
      <div className="buttonGroup">
        <button className={refreshClass} onClick={() => getWeather()} disabled={isQuerying}>
          <img src={RefreshIcon} id="refreshIcon" alt="refresh" />
        </button>
        <button id="colorPickerBtn" onClick={() => setShowColorPicker(!showColorPicker)}></button>
      </div>
      <ColorPickerMemo show={showColorPicker} closeColorPicker={() => setShowColorPicker(false)}></ColorPickerMemo>
      <div>
        <p id="position">{city}</p>
        <p id="weather">{weatherInfo.desc}</p>
      </div>
      <div>
        <p id="wind">風速 {weatherInfo.windSpeed} m/s</p>
        <p id="temp" style={{ color: tempColor }}>{weatherInfo.temp}°C</p>
        <p id="feltTemp">體感
            <span style={{ color: feltTempColor }}> {weatherInfo.feltTemp}°C</span>
        </p>
        <p id="humidity">濕度
            <span style={{ color: humidityColor }}> {weatherInfo.humidity}%</span>
        </p>
        <p><small>於 {fetchTimeStatus}更新</small></p>
      </div>
    </div>
  );
}

export default Weather