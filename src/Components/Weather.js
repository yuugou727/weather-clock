import React, { Component } from 'react';
import RefreshIcon from '../refresh.svg';
import { toast } from 'react-toastify';
import distanceInWordsStrict from 'date-fns/distance_in_words_strict'
import differenceInMinutes from 'date-fns/difference_in_minutes'
import localeTW from 'date-fns/locale/zh_tw';

const geocodingAPI = 'https://maps.googleapis.com/maps/api/geocode/json';
const geolocationAPI = 'https://www.googleapis.com/geolocation/v1/geolocate'
const GCPkey = 'AIzaSyDNRfiwt-_A8_lrlzvqzjPeUNPFoyMwx5Y';

class Weather extends Component {
  constructor (props) {
    super(props);
    this.state = {
      isOnline: true,
      dist: '',
      city: '',
      weatherInfo: {},
      tempHue: 100,
      feltTempHue: 100,
      querying: false,
      allJson: null,
      fetchTime: new Date(),
      fetchTimeStatus: '尚未',
    };
    this.getWeather = this.getWeather.bind(this);
    this.findLocationId = this.findLocationId.bind(this);
    this.getLocationWeather = this.getLocationWeather.bind(this);
    this.computeTempHue = this.computeTempHue.bind(this);
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

  getWeather () {
    const checkAllJson = new Promise((resolve, reject) => {
      if (!this.state.allJson) {
        fetch('https://works.ioa.tw/weather/api/all.json')
          .then((res) => {
            if(!res.ok){
              throw new Error(res.statusText);
            }
            return res.json();
          })
          .then((res) => {
            this.setState({ allJson: res });
            resolve(res);
          })
          .catch((err) => {
            reject(new Error('[all.json] ' + err.message));
          });
      } else {
        resolve(this.state.allJson);
      }
    });

    const getPosition = new Promise((resolve, reject) => {
      function geolocation () {
        const url = geolocationAPI + '?key=' + GCPkey;
        fetch(url, { method: 'POST' })
          .then((res) => {
            if(!res.ok){
              throw new Error(res.statusText);
            }
            return res.json();
          })
          .then((data) => {
            if (data.error) {
              throw new Error(data.message);
            }
            resolve({
              lat: data.location.lat,
              lng: data.location.lng
            });
          })
          .catch((err) => {
            reject(new Error('[定位錯誤] ' + err.message));
          });
      }
      
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => { 
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (err) => { //fallback to use Google Geolocation API
            geolocation();
          }, {
            timeout: 10000,
          });
      } else { //fallback to use Google Geolocation API
        geolocation();
      }
    });

    if (this.state.isOnline) {
      this.setState({ querying: true });
      Promise.all([checkAllJson, getPosition])
        .then((resolvedArray) => {
          const { lat, lng } = resolvedArray[1];
          let params = encodeURI(`latlng=${lat},${lng}`);
          const url = geocodingAPI + '?' + params + '&key=' + GCPkey;
          return fetch(url);
        })
        .then((res) => {
          if(!res.ok){
            throw new Error(res.statusText);
          }
          return res.json();
        })
        .then(( {status, results, error_message} ) => {
          if (status !== 'OK'){
            throw new Error(error_message); 
          }
  
          if(results && results.length > 0){
            let dist = results[0].address_components.find((c) => c.types[0] === 'administrative_area_level_3').long_name;
            let city = results[0].address_components.find((c) => ( c.types[0] === 'administrative_area_level_1' || c.types[0] === 'administrative_area_level_2')).long_name;
                
            this.setState({ dist: dist, city: city }, () => { 
              this.findLocationId();
            });
          } else {
            throw new Error('No results'); 
          }
        })
        .catch((err) => {
          this.setState({ querying: false });
          toast.error('[地理編碼] ' + err.message);
        });
    } else {
      toast.error('沒有網路連線，請開啟並連上網路後再試');
    }
  }

  findLocationId () {
    const list = this.state.allJson;
    let distMatch = (town) => town.name === this.state.dist;
    const distId = list
      .filter((city) => city.name === this.state.city.slice(0,-1))
      .find((city) => city.towns.find(distMatch)) // 嘉義、新竹縣市
      .towns.find(distMatch).id;
    if (distId) {
      this.getLocationWeather(distId);
    } else {
      this.setState({ querying: false });
      toast.error('[地區ID]找不到相符');
    }
  }

  getLocationWeather (id) {
    fetch(`https://works.ioa.tw/weather/api/weathers/${id}.json`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        this.setState({
          querying: false,
          weatherInfo: data,
          tempHue: this.computeTempHue(data.temperature),
          feltTempHue: this.computeTempHue(data.felt_air_temp),
          fetchTime: new Date(),
          fetchTimeStatus: '剛才'
        })
        toast.info('天氣資訊已更新');
      })
      .catch((err) => {
        this.setState({ querying: false });
        toast.error('[天氣錯誤] ' + err.message);
      });
  }

  computeTempHue (temp) {
    return temp < 0 ? 220 :
      temp > 38 ? 0 :
      220 - parseInt((temp / 38) * 220, 10);
  }
  
  render () {
    let refreshClass = this.state.querying ? 'refreshBtn spin': 'refreshBtn';
    let tempColor = `hsl(${this.state.tempHue},70%,60%)`;
    let feltTempColor = `hsl(${this.state.feltTempHue},70%,60%)`;
    let humidityColor = `hsl(200, 100%, ${ 100 - this.state.weatherInfo.humidity / 2 }%)`;
    return (
      <div className="weatherDiv">
        <span></span>
        <button className={refreshClass} onClick={this.getWeather} disabled={this.state.querying}>
          <img src={RefreshIcon} className="refreshIcon" alt="refresh"/>
        </button>
        <div>
          <p id="position">{ this.state.city } { this.state.dist }</p>
          <p id="weather">{ this.state.weatherInfo.desc }</p>
        </div>
        <div>
          <p id="temp" style={{color: tempColor}}>{ this.state.weatherInfo.temperature }°C</p>
          <p id="feltTemp">體感
            <span style={{color: feltTempColor}}> { this.state.weatherInfo.felt_air_temp }°C</span>
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