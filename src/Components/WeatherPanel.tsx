import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';

import { toast } from 'react-toastify';
import { formatDistanceStrict, differenceInMinutes } from 'date-fns';
import { zhTW } from 'date-fns/locale';

import ColorPicker from './ColorPicker';
import ActionButtons from './ActionButtons';
import { CurrentWeather, ICurrentWeather } from './CurrentWeather';
const HourlyWeather = lazy(() => import('./HourlyWeather'));
import {
  ILocation,
  IGeocoding,
  IWeatherResp,
  geolocationAPI,
  weatherAPI,
  reverseGeocodingAPI,
} from '../API';
import styles from './WeatherPanel.module.scss';

const getGeoLocation = (): Promise<ILocation> => {
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
          resolve(geolocationAPI());
        },
        {
          timeout: 10000,
        }
      )
    });
  } else {
    //fallback to use Google Geolocation API
    return geolocationAPI();
  }
};

const WeatherPanel = () => {
  const [isVisible, setIsVisible] = useState<boolean>(document.visibilityState === 'visible');
  const [fetchTime, setFetchTime] = useState<Date>(new Date());
  const [fetchTimeStatus, setFetchTimeStatus] = useState<string>('尚未');

  const [city, setCity] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [currentWeather, setCurrentWeather] = useState<ICurrentWeather | null>(null);
  const [hourlyWeather, setHourlyWeather] = useState<IWeatherResp['hourly']>([]);

  const getWeather = useCallback(async () => {
    if (!navigator.onLine) {
      toast.error('沒有網路連線，請連上網路後再試');
      return;
    }
    if (isQuerying) {
      return;
    }
    setIsQuerying(true);

    let location: ILocation;
    try {
      location = await getGeoLocation();
    } catch (err) {
      setIsQuerying(false);
      toast.error('[定位錯誤] ' + err)
      throw err;
    }

    /** weather api */
    let weatherResult: IWeatherResp;
    try {
      const { lat, lng } = location;
      weatherResult = await weatherAPI(lat, lng);
    } catch (err) {
      setIsQuerying(false);
      toast.error('[天氣錯誤] ' + err);
      throw err;
    }

    const { temp, feels_like, humidity, weather } = weatherResult.current;
    setIsQuerying(false);
    setFetchTime(new Date());
    setFetchTimeStatus('剛才');
    setCurrentWeather({
      humidity,
      temp: Math.round(temp * 10) / 10,
      feltTemp: Math.round(feels_like * 10) / 10,
      icon: weather[0].icon,
      desc: weather[0].description
    });
    setHourlyWeather(weatherResult.hourly.slice(0, 24));

    /** reverse-geocoding api */
    let geocoding: IGeocoding[];
    try {
      const { lat, lng } = location;
      geocoding = await reverseGeocodingAPI(lat, lng);
    } catch (err) {
      throw err;
    }

    const stateName = geocoding[0].state;
    const cityName = geocoding[0].local_names.zh ?? geocoding[0].name;
    setCity(`${cityName}${stateName ? ', ' + stateName : ''}`);
  }, [isQuerying]);

  useEffect(() => {
    getWeather();

    // init window listener
    const visibilitychangeListener = () => {
      if (document.visibilityState === "visible") {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('visibilitychange', visibilitychangeListener);
    return () => {
      window.removeEventListener('visibilitychange', visibilitychangeListener);
    };
  }, []);

  // check update status every 15 seconds
  useEffect(() => {
    let intervalId: NodeJS.Timer | undefined;
    const updateStatus = () => {
      const status = formatDistanceStrict(new Date(), fetchTime, { locale: zhTW }).concat('前');
      setFetchTimeStatus(status);
      if (navigator.onLine && (differenceInMinutes(new Date(), fetchTime) >= 60)) {
        // update weather older than 1 hour
        getWeather();
      }
    };

    if (isVisible) {
      updateStatus();
      intervalId = setInterval(updateStatus, 1000 * 15);
    }
    return () => {
      console.debug('clearInterval update');
      intervalId && clearInterval(intervalId);
      intervalId = undefined;
    };
  }, [isVisible, fetchTime]);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHourlyWeather, setShowHourlyWeather] = useState(false);
  return (
    <div className={styles.root}>
      <ColorPicker
        show={showColorPicker}
        closeColorPicker={() => setShowColorPicker(false)}
      />
      <Suspense fallback={<p>Loading...</p>}>
        <HourlyWeather
          show={showHourlyWeather}
          closeHourlyWeather={() => setShowHourlyWeather(false)}
          weatherInfo={hourlyWeather}
          city={city}
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