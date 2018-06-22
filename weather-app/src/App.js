import React, { Component } from 'react';
import logo from './logo.svg';
import Moment from 'moment'
import './App.css';

const API_KEY = '5ef9b4ebc5b2620187353ae24eec161a';
class App extends Component {
  state = {
    city: null,
    state: null,
    postcode: null,
    humidity: null,
    temperature: {
      celsius: null,
      fahrenheit: null
    },
    summary: null,
    currentTime: null,
    precipProbability: null,
    windSpeed: null,
    icon: null,
  }
  componentDidMount() {
    this.getBrowserLocation();
  }
  getBrowserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (location)=> {
        let { latitude, longitude } = location.coords;
        let googleApiCall = await fetch(`http://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=false`)
        .then((response) =>{
          if(response.ok) {
           return response;
          }
        })
        .catch(error => console.log(error));
        let data = await googleApiCall.json();
        console.log(data);
        this.setState({
          state: data.results[0].formatted_address
        })
        this.getWeather(latitude,longitude);
      });
    } else {
      console.error("geo location not supported");
    }
  }
  getWeather = async (lat,lon) => {
    let corsPrefix = 'https://cors-anywhere.herokuapp.com/'
    let darkSkyApiCall = await fetch(`${corsPrefix}https://api.darksky.net/forecast/${API_KEY}/${lat},${lon}`);
    let data = await darkSkyApiCall.json();
    console.log(data);
    this.setState({
      city: data.timezone.substring(data.timezone.indexOf("/") + 1),
      humidity: (data.currently.humidity*100).toFixed(1),
      temperature: {
        celsius: Math.round(((data.currently.temperature)-32)/1.8),
        fahrenheit: Math.round(data.currently.temperature)
      },
      summary: data.currently.summary,
      currentTime: Moment.unix(data.currently.time).format("dddd, hh:mm a"),
      precipProbability: data.currently.precipProbability*100,
      windSpeed: data.currently.windSpeed,
      icon: this.getWeatherIcon(data.currently.icon)
    })
  }
  getWeatherIcon = (weather) => {
    switch (weather.toLowerCase()) {
      case "partly-cloudy-day":
        return "wi wi-day-cloudy";
      case "rain":
        return "wi wi-rain";
      case "sun":
        return "wi wi-day-sunny";
      default:
        return "wi wi-day-sunny";
    }
  }
  render() {
    return (
      <div className="jumbotron text-muted m-20">
        <h1 className="display-4 font-weight-bold">{this.state.city} {this.state.state}</h1>
        <p className="lead location-line-height">{this.state.currentTime}</p>
        <p className="lead location-line-height">{this.state.summary}</p>
        <div className="mt-5 d-flex justify-content-between">
          <div className="ml-2 d-inline-flex">
            <i className={this.state.icon}></i>
            <span className="font-weight-bold text-dark text-center display-4 align-self-start">{this.state.temperature.celsius}</span>
            <span className="temp">&#8451; | <span className="text-info">{this.state.temperature.fahrenheit} &#8457;</span></span>
          </div>
          <div className="ml-10">
            <p>Precpiation: {this.state.precipProbability}%</p>
            <p>Humidity: {this.state.humidity}%</p>
            <p>Wind: {this.state.windSpeed}</p>
            <div className="btn-group" role="group" aria-label="Basic example">
              <button type="button">Temperature</button>
              <button type="button">Precpiation</button>
              <button type="button">Wind</button>
            </div>
          </div>
        </div>
    </div>
    );
  }
}

export default App;
