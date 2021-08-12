import React, { memo, Fragment } from 'react';
import PropTypes from 'prop-types';

const computeTempHue = (temp) => {
  return temp < 0 ? 220 :
    temp > 38 ? 0 :
      220 - parseInt((temp / 38) * 220, 10);
}

const CurrentWeather = (props) => {
  const { weather, city, fetchTimeStatus } = props;
  const tempColor = `hsl(${computeTempHue(weather.temp)},70%,60%)`;
  const feltTempColor = `hsl(${computeTempHue(weather.feltTemp)},70%,60%)`;
  const humidityColor = `hsl(200, 100%, ${100 - weather.humidity / 2}%)`;
  return (
    <Fragment>
      <div className="weatherInfo">
        <img
          className="weatherIcon"
          alt={weather.desc}
          src={weather.icon ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png` : ''}
          crossOrigin="anonymous"
        />
        <p className="location">{city}</p>
        <p className="weather">{weather.desc}</p>
      </div>
      <div className="weatherDetails">
        <p className="temp"
          style={{ color: tempColor }}
        >{weather.temp}°C</p>
        <p className="feltTemp">體感
          <span
            style={{ color: feltTempColor }}
          > {weather.feltTemp}°C</span>
        </p>
        <p className="humidity">濕度
          <span
            style={{ color: humidityColor }}
          > {weather.humidity}%</span>
        </p>
        <p><small>於 {fetchTimeStatus}更新</small></p>
      </div>
    </Fragment>
  )
}

CurrentWeather.propTypes = {
  weather: PropTypes.object.isRequired,
  city: PropTypes.string,
  fetchTimeStatus: PropTypes.string,
}

export default memo(CurrentWeather);