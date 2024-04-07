import React, { memo, Fragment } from 'react';
import { tempHsl } from '../common';
import styles from './CurrentWeather.module.scss';
import warningIcon from '../assets/warning.png';

export interface Weather {
  humidity: number;
  temp: number;
  feltTemp: number;
  icon: string;
  desc: string;
}

interface Props {
  weather: Weather | null;
  city: string;
  fetchTimeStatus: string;
}

export const CurrentWeather = memo((props: Props) => {
  const { weather, city, fetchTimeStatus } = props;

  const humidityHsl = (humidity = 60): string => {
    const drySat = 10;
    const wetSat = 100;
    const dryHumidity = 35;
    const wetHumidity = 75;
    const saturation =
      humidity < dryHumidity
        ? drySat
        : humidity >= wetHumidity
        ? wetSat
        : drySat +
          Math.round(
            ((humidity - dryHumidity) / (wetHumidity - dryHumidity)) *
              (wetSat - drySat)
          );
    return `hsl(200, ${saturation}%, 70%)`;
  };

  return (
    <Fragment>
      <div className={styles.weatherInfo}>
        {weather ? (
          <img
            className={styles.weatherIcon}
            alt={weather?.desc}
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            crossOrigin="anonymous"
          />
        ) : (
          <div className={`${styles.weatherIcon} ${styles.skeleton}`}></div>
        )}

        <p className={styles.weather}>
          {weather?.desc || ' '}
          {city && <span className={styles.location}> @ {city}</span>}
        </p>
      </div>
      <div className={styles.weatherDetails}>
        <p className={styles.temp} style={{ color: tempHsl(weather?.temp) }}>
          {weather?.temp ?? '--'}°C
        </p>
        <p className={styles.feltTemp}>
          體感
          <span style={{ color: tempHsl(weather?.feltTemp) }}>
            {' '}
            {weather?.feltTemp ?? '--'}°C
            {weather && weather.feltTemp >= 36 && (
              <img className={styles.warningIcon} src={warningIcon} />
            )}
          </span>
        </p>
        <p className={styles.humidity}>
          濕度
          <span style={{ color: humidityHsl(weather?.humidity) }}>
            {' '}
            {weather?.humidity ?? '--'}%
          </span>
        </p>
        <p>
          <small>於 {fetchTimeStatus}更新</small>
        </p>
      </div>
    </Fragment>
  );
});
