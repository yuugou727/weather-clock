import React, { Component } from 'react';
import RefreshIcon from '../refresh.svg';
import ColorPicker from './ColorPicker.js';
import { toast } from 'react-toastify';
import distanceInWordsStrict from 'date-fns/distance_in_words_strict'
import differenceInMinutes from 'date-fns/difference_in_minutes'
import localeTW from 'date-fns/locale/zh_tw';

const geolocationAPI = 'https://www.googleapis.com/geolocation/v1/geolocate'
const GCPkey = 'AIzaSyDNRfiwt-_A8_lrlzvqzjPeUNPFoyMwx5Y';

const myApi = 'https://us-central1-ronnie-weather-clock.cloudfunctions.net/';
class Weather extends Component {
  constructor (props) {
    super(props);
    this.state = {
      showColorPicker: false,
      isOnline: true,
      city: '',
      weatherInfo: {},
      tempHue: 100,
      feltTempHue: 100,
      isQuerying: false,
      allJson: null,
      fetchTime: new Date(),
      fetchTimeStatus: '尚未',
    };
    this.getPosition = this.getPosition.bind(this);
    this.getWeather = this.getWeather.bind(this);
    this.computeTempHue = this.computeTempHue.bind(this);
    this.toggleColorPicker = this.toggleColorPicker.bind(this);
    this.closeColorPicker = this.closeColorPicker.bind(this);
  }

  componentDidMount () {
    this.getWeather();

    this.updateTimer = setInterval(() => {
      let status = distanceInWordsStrict(new Date(), this.state.fetchTime, {locale: localeTW}).concat('前');
      this.setState({
        fetchTimeStatus: status
      });

      if ((differenceInMinutes(new Date(), this.state.fetchTime) >= 60 )&& this.state.isOnline) { // update weather older than 1 hour
        this.getWeather();
      }
    }, 1000 * 60);

    window.addEventListener('offline', () => {
      this.setState({ isOnline: false });
      toast.warn('沒有網路連線');
    })

    window.addEventListener('online', () => {
      this.setState({ isOnline: true }, () => {
        if (differenceInMinutes(new Date(), this.state.fetchTime) >= 60) {
          this.getWeather();
        }
      });
      toast.success('已連上網路');
    })
  }
  
  componentWillUnmount () {
    clearInterval(this.updateTimer);
  }

  toggleColorPicker() {
    this.setState({
      showColorPicker: !this.state.showColorPicker
    });
  }

  closeColorPicker() {
    this.setState({
      showColorPicker: false
    });
  }

  getPosition () {
    return new Promise((resolve, reject) => {
      const geolocate = fetch(geolocationAPI + '?key=' + GCPkey, { method: 'POST' })
        .then(res => {
          if(!res.ok){
            throw new Error(res.statusText);
          }
          return res.json();
        })
        .then(data => {
          if (data.error) {
            throw new Error(data.message);
          }
          resolve({
            lat: data.location.lat,
            lng: data.location.lng
          });
        })
        .catch(err => {
          reject(new Error('[定位錯誤] ' + err.message));
        });

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          position => { 
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          err => { //fallback to use Google Geolocation API
            return geolocate;
          }, {
            timeout: 10000,
          });
      } else { //fallback to use Google Geolocation API
        return geolocate;
      }
    });
  }
  async getWeather () {
    if (this.state.isOnline) {
      this.setState({ isQuerying: true });
      const {lat, lng} = await this.getPosition();
      const url = new URL(myApi + 'weather');
      url.search = new URLSearchParams({ lat, lng });

      fetch(url)
        .then(res => {
          if(!res.ok){
            throw new Error(res.statusText);
          }
          return res.json();
        })
        .then(result => {
          const T = result.main.temp;
          const H = result.main.humidity;
          const V = result.wind.speed;
          const e = (H / 100) * 6.105 * Math.exp((17.27 * T)/(237.7 + T));
          const AT = (1.07 * T) + (0.2 * e) - (0.65 * V) - 2.7;
          this.setState({
            isQuerying: false,
            city: result.name,
            fetchTime: new Date(),
            fetchTimeStatus: '剛才',
            weatherInfo: {
              humidity: H,
              temp: T.toFixed(1),
              feltTemp: AT.toFixed(1),
              windSpeed: V,
              desc: result.weather[0].description
            },
            tempHue: this.computeTempHue(T),
            feltTempHue: this.computeTempHue(AT)
          });
          toast.info('天氣資訊已更新');
        })
        .catch((err) => {
          this.setState({ isQuerying: false });
          toast.error('[天氣錯誤] ' + err.message);
        });
    } else {
      toast.error('沒有網路連線，請開啟並連上網路後再試');
    }
  }

  computeTempHue (temp) {
    return temp < 0 ? 220 :
      temp > 38 ? 0 :
      220 - parseInt((temp / 38) * 220, 10);
  }
  
  render () {
    let refreshClass = this.state.isQuerying ? 'refreshBtn spin': 'refreshBtn';
    let tempColor = `hsl(${this.state.tempHue},70%,60%)`;
    let feltTempColor = `hsl(${this.state.feltTempHue},70%,60%)`;
    let humidityColor = `hsl(200, 100%, ${ 100 - this.state.weatherInfo.humidity / 2 }%)`;
    return (
      <div className="weatherDiv">
        <div className="buttonGroup">
          <button className={refreshClass} onClick={this.getWeather} disabled={this.state.isQuerying}>
            <img src={RefreshIcon} id="refreshIcon" alt="refresh"/>
          </button>
          <button id="colorPickerBtn" onClick={this.toggleColorPicker}></button>
        </div>
        <ColorPicker show={this.state.showColorPicker} closeColorPicker={this.closeColorPicker}></ColorPicker>
        <div>
          <p id="position">{ this.state.city }</p>
          <p id="weather">{ this.state.weatherInfo.desc }</p>
        </div>
        <div>
          <p id="wind">風速 { this.state.weatherInfo.windSpeed } m/s</p>
          <p id="temp" style={{color: tempColor}}>{ this.state.weatherInfo.temp }°C</p>
          <p id="feltTemp">體感
            <span style={{color: feltTempColor}}> { this.state.weatherInfo.feltTemp }°C</span>
          </p>
          <p id="humidity">濕度
            <span style={{color: humidityColor}}> { this.state.weatherInfo.humidity }%</span>
          </p>
          <p><small>於 { this.state.fetchTimeStatus }更新</small></p>
        </div>
      </div>
    )
  }
}

export default Weather