import React, { Component } from 'react';
import RefreshIcon from './refresh.svg'
import { toast } from 'react-toastify';

class Weather extends Component {
  constructor(){
    super();
    this.state = {
      dist: '',
      city: '',
      weatherInfo: {},
      querying: false,
      allJson: null
    };
    this.getWeather = this.getWeather.bind(this);
    this.geocode = this.geocode.bind(this);
    this.findLocationId = this.findLocationId.bind(this);
    this.getLocationWeather = this.getLocationWeather.bind(this);
  }
  componentDidMount () {
    this.getWeather();
    this.timerId = setInterval(() => {
      this.getWeather();
    }, 1000 * 60 * 60);
  }
  componentWillUnmount () {
    clearInterval(this.timerId);
  }

  getWeather () {
    this.setState({ querying: true });
    if (!('geolocation' in navigator)) {
      toast('瀏覽器不支援定位，將使用預設位置');
      this.setState({
        city : '台北市',
        dist: '信義區',
      }, () => this.findLocationId());
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => { 
          this.geocode(position);
        },
        (err) => {
          this.setState({ querying: false });
          toast.error('無法獲得位置資訊: ' + err);
        }
      );
    }
  }

  geocode (position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const geocoder = new window.google.maps.Geocoder();
    const latLng = {lat, lng};
    geocoder.geocode({location: latLng}, (results, status) => {
      if(status === 'OK'){
        let dist = results[0].address_components[3].long_name;
        let city = results[0].address_components[4].long_name;
        this.setState({ dist: dist, city: city }, () =>{ this.findLocationId() });
      } else {
        this.setState({ querying: false });
        toast.error('Geocoder解析失敗: ' + status);
      }
    })
  }

  findLocationId () {
    new Promise((resolve, reject) => {
      if( !this.state.allJson ){
        fetch('https://works.ioa.tw/weather/api/all.json')
          .then((res) => {
            if(!res.ok){
              throw res.status;
            }
            return res.json();
          })
          .then((res) => {
            this.setState({ allJson: res });
            resolve(res);
          }).catch((err) => {
            reject(err);
          });
      } else {
        resolve(this.state.allJson);
      }
    })
      .then((list) => {
        const distId = list
          .find((city) => city.name === this.state.city.slice(0,-1)).towns
          .find((town) => town.name === this.state.dist).id;
        if (distId) {
          return distId;
        } else {
          throw Error('location not found')
        }
      })
      .then((distId) => {
        this.getLocationWeather(distId);
      })
      .catch((err) => {
        this.setState({ querying: false });
        toast.error('無法取得地點: ' + err);
      });
  }

  getLocationWeather (id) {
    fetch(`https://works.ioa.tw/weather/api/weathers/${id}.json`)
      .then((res) => {
        if(!res.ok){
          throw res.status
        }
        return res.json();
      })
      .then((data) => {
        this.setState({
          querying: false,
          weatherInfo: data
        })
      })
      .catch((err) => {
        this.setState({ querying: false });
        toast.error('無法獲得天氣資訊: ' + err);
      });
  }
  
  render () {
    return (
      <div className="weatherDiv">
        <span></span>
        <button className={ this.state.querying ? 'refreshBtn spin': 'refreshBtn'} onClick={this.getWeather} disabled={ this.state.querying}>
          <img src={RefreshIcon} className="refreshIcon" alt="refresh"/>
        </button>
        <div>
          <p>{ this.state.dist }</p>
          <h4>{ this.state.weatherInfo.desc }</h4>
        </div>
        <div>
          <h3>氣溫 { this.state.weatherInfo.temperature } °C</h3>
          <p>體感 { this.state.weatherInfo.felt_air_temp } °C</p>
          <p>濕度 { this.state.weatherInfo.humidity } %</p>
        </div>
      </div>
    )
  }
}

export default Weather;