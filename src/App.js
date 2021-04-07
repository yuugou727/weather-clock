import React from 'react';
import { ToastContainer } from 'react-toastify';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

import Clock from './Components/Clock.js';
import Weather from './Components/Weather.js';

function App() {
  const version = '210407';
  return (
    <div className="App">
      <Clock />
      <Weather />
      <footer>
        <p><span className="version">v{version}</span> Hosted by <a href="https://github.com/yuugou727" target="_blank" rel="noopener noreferrer">Ronnie Chang</a>. API by <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer">OpenWeather</a></p>
      </footer>
      <ToastContainer position="bottom-center" hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnHover />
    </div>
  );
}

export default App;
