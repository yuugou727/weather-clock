import React from 'react';
import { ToastContainer } from 'react-toastify';
import './App.scss';
import 'react-toastify/dist/ReactToastify.css';

import Clock from './Components/Clock.js';
import Weather from './Components/Weather.js';

function App() {
  const version = '210721';
  return (
    <div className="App">
      <Clock />
      <Weather />
      <footer>
        <p><span className="version">v{version}</span> Hosted by <a href="https://yuugou727.github.io" target="_blank" rel="noopener noreferrer">Ronnie Chang</a>. Weather info by <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer">OpenWeather</a></p>
      </footer>
      <ToastContainer position="bottom-center" hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnHover />
    </div>
  );
}

export default App;
