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
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastVisibleTime, setLastVisibleTime] = useState<Date>(new Date());
  const [fetchTime, setFetchTime] = useState<Date>(new Date());
  const [fetchTimeStatus, setFetchTimeStatus] = useState<string>('尚未');

  const [city, setCity] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [currentWeather, setCurrentWeather] = useState<ICurrentWeather | null>(null);
  const [hourlyWeather, setHourlyWeather] = useState<IWeatherResp['hourly']>([]);

  const getWeather = useCallback(async () => {
    if (!isOnline) {
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
    setCity(`${cityName}${ stateName ? ', ' + stateName : '' }`);
  }, [isOnline, isQuerying]);

  useEffect(() => {
    getWeather();
  }, []);

  // check update status every 15 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      let status = formatDistanceStrict(new Date(), fetchTime, { locale: zhTW }).concat('前');
      setFetchTimeStatus(status);
      if (isOnline && (differenceInMinutes(new Date(), fetchTime) >= 60)) {
        // update weather older than 1 hour
        getWeather();
      }
    }, 1000 * 15);
    return () => {
      clearInterval(intervalId);
    };
  }, [isOnline, fetchTime]);

  // get weather when visible
  useEffect(() => {
    // update weather when last open time is more than 1 hour ago
    const visibilityListener = () => {
      if (document.visibilityState === 'visible') {
        if (differenceInMinutes(new Date(), lastVisibleTime) >= 60) {
          getWeather();
        }
        setLastVisibleTime(new Date());
      }
    };
    window.addEventListener('visibilitychange', visibilityListener);
    return () => {
      window.removeEventListener('visibilitychange', visibilityListener);
    };
  }, [lastVisibleTime]);

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
      window.removeEventListener('online', onlineListener);
    };
  }, []);

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