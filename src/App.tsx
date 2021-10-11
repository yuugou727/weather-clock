import React from 'react';
import { ToastContainer } from 'react-toastify';
import './App.scss';
import 'react-toastify/dist/ReactToastify.css';

import Clock from './Components/Clock';
import WeatherPanel from './Components/WeatherPanel';

const { REACT_APP_VERSION } = process.env;
const App = () => {
  return (
    <div className="App">
      <Clock />
      <WeatherPanel />
      <footer>
        <p>
          <span className="version">
            v{REACT_APP_VERSION}
          </span> Hosted by <a
            href="https://yuugou727.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >Ronnie Chang</a>. Weather info by <a
            href="https://openweathermap.org/"
            target="_blank"
            rel="noopener noreferrer"
          >OpenWeather</a>
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
}

export default App;
