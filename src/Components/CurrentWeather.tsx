import React, { memo, Fragment } from 'react';

const computeTempHue = (temp: number = 23): number => {
  return temp < 0 ? 220 :
    temp > 38 ? 0 :
      220 - Math.round((temp / 38) * 220);
}

export interface ICurrentWeather {
  humidity: number;
  temp: number;
  feltTemp: number;
  icon: string;
  desc: string;
}

interface IProps {
  weather: ICurrentWeather | null;
  city: string;
  fetchTimeStatus: string;
}

export const CurrentWeather = memo((props: IProps) => {
  const { weather, city, fetchTimeStatus } = props;
  const tempColor = `hsl(${computeTempHue(weather?.temp)},70%,60%)`;
  const feltTempColor = `hsl(${computeTempHue(weather?.feltTemp)},70%,60%)`;
  const humidityColor = `hsl(200, 100%, ${100 - (weather?.humidity || 60) / 2}%)`;
  return (
    <Fragment>
      <div className="weatherInfo">
        <img
          className="weatherIcon"
          alt={weather?.desc}
          src={weather?.icon ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png` : ''}
          crossOrigin="anonymous"
        />
        <p className="location">{city}</p>
        <p className="weather">{weather?.desc}</p>
      </div>
      <div className="weatherDetails">
        <p className="temp"
          style={{ color: tempColor }}
        >{weather?.temp}°C</p>
        <p className="feltTemp">體感
          <span
            style={{ color: feltTempColor }}
          > {weather?.feltTemp}°C</span>
        </p>
        <p className="humidity">濕度
          <span
            style={{ color: humidityColor }}
          > {weather?.humidity}%</span>
        </p>
        <p><small>於 {fetchTimeStatus}更新</small></p>
      </div>
    </Fragment>
  )
})