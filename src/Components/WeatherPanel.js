import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';

import { toast } from 'react-toastify';
import { formatDistanceStrict, differenceInMinutes } from 'date-fns';
import { zhTW } from 'date-fns/locale'

import ColorPicker from './ColorPicker.js';
import ActionButtons from './ActionButtons';
import CurrentWeather from './CurrentWeather.js';
const HourlyWeather = lazy(() => import('./HourlyWeather.js'))

// Envs: GCP Weather API and Key
const {
  REACT_APP_GEOLOCATION_API,
  REACT_APP_GCP_KEY,
  REACT_APP_WEATHER_API,
  REACT_APP_GEOCODING_API,
} = process.env;

const WeatherPanel = () => {
  const fromGeolocationAPI = async () => {
    const res = await fetch(
      REACT_APP_GEOLOCATION_API + '?key=' + REACT_APP_GCP_KEY,
      { method: 'POST' }
    );
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    const geolocation = await res.json();
    if (geolocation.error) {
      throw new Error(geolocation.message);
    }
    const { lat, lng } = geolocation.location;
    return ({ lat, lng });
  };

  const getGeoLocation = () => {
    if ('geolocation' in navigator) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (err) => {
            //fallback to use Google Geolocation API
            resolve(fromGeolocationAPI());
          }, {
          timeout: 10000,
        })
      });
    } else {
      //fallback to use Google Geolocation API
      return fromGeolocationAPI();
    }
  };

  const [isOnline, setIsOnline] = useState(true);
  const [fetchTime, setFetchTime] = useState(new Date());
  const [fetchTimeStatus, setFetchTimeStatus] = useState('尚未');

  const [city, setCity] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [currentWeather, setCurrentWeather] = useState({});
  const [hourlyWeather, setHourlyWeather] = useState([]);

  const getWeather = useCallback(async () => {
    if (!isOnline) {
      toast.error('沒有網路連線，請連上網路後再試');
      return;
    }
    setIsQuerying(true);

    let location;
    try {
      location = await getGeoLocation();
    } catch (err) {
      toast.error('[定位錯誤] ' + err.message)
    }

    /** weather api */
    const { lat, lng } = location;
    const url = new URL(REACT_APP_WEATHER_API);
    url.search = new URLSearchParams({ lat, lng });
    const weatherResp = await fetch(url);
    if (!weatherResp.ok) {
      setIsQuerying(false);
      toast.error('[天氣錯誤] ' + weatherResp.statusText);
      throw new Error(weatherResp.statusText);
    }
    const result = await weatherResp.json();
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

    /** reverse-geocoding api */
    const revGeoUrl = new URL(REACT_APP_GEOCODING_API);
    revGeoUrl.search = new URLSearchParams({ lat, lng });
    const geocodingResp = await fetch(revGeoUrl);
    if (!geocodingResp.ok) {
      throw new Error(geocodingResp.statusText);
    }
    const geocoding = await geocodingResp.json();
    setCity(geocoding[0].local_names.ascii);
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
      setIsOnline(true);
      // toast.success('已連上網路');
    };

    window.addEventListener('offline', offlineListener);
    window.addEventListener('online', onlineListener);
    return () => {
      window.removeEventListener('offline', offlineListener);
      window.removeEventListener('online', onlineListener)
    }
  }, [])

  useEffect(() => {
    if (isOnline && differenceInMinutes(new Date(), fetchTime) >= 60) {
      getWeather();
    }
  }, [isOnline, fetchTime]);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHourlyWeather, setShowHourlyWeather] = useState(false);

  return (
    <div className="weatherDiv">
      <ColorPicker
        show={showColorPicker}
        closeColorPicker={() => setShowColorPicker(false)}
      />
      <Suspense fallback={<p>Loading...</p>}>
        <HourlyWeather
          show={showHourlyWeather}
          closeHourlyWeather={() => setShowHourlyWeather(false)}
          weatherInfo={hourlyWeather}
        />
      </Suspense>
      <ActionButtons
        isQuerying={isQuerying}
        onRefresh={() => getWeather()}
        onColorPickerOpen={() => setShowColorPicker(!showColorPicker)}
        onHourlyWeatherOpen={() => setShowHourlyWeather(!showColorPicker)}
      />
      <CurrentWeather
        weather={currentWeather}
        city={city}
        fetchTimeStatus={fetchTimeStatus}
      />
    </div>
  );
}

export default WeatherPanel