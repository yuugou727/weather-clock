import React from 'react';
import { ToastContainer } from 'react-toastify';
import './App.scss';
import 'react-toastify/dist/ReactToastify.css';

import Clock from './Components/Clock';
import WeatherPanel from './Components/WeatherPanel';

const { VITE_VAR_VERSION } = import.meta.env;
const App = () => {
  return (
    <div className="App">
      <Clock />
      <WeatherPanel />
      <footer>
        <p>
          <span className="version">v{VITE_VAR_VERSION}</span> Ronnie Chang ©
          2023 (
          <a
            href="https://github.com/yuugou727/weather-clock"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github
          </a>
          ). Weather info by{' '}
          <a
            href="https://openweathermap.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenWeather
          </a>
        </p>
      </footer>
      <ToastContainer
        position="bottom-center"
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnHover
      />
    </div>
  );
};

export default App;
