import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

import Clock from './Components/Clock.js';
import Weather from './Components/Weather.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Clock/>
        <Weather/>
        <footer>
          <p>Built & hosted: <a href="https://github.com/yuugou727" target="_blank" rel="noopener noreferrer">Ronnie Chang</a> Weather API: <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer">openweathermap.org</a></p>
        </footer>
        <ToastContainer position="bottom-center" hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnHover/>
      </div>
    );
  }
}

export default App;
