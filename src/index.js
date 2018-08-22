import React, { Component } from "react";
import ReactDOM from "react-dom";

import "./styles.css";

class Icon extends React.Component {
  drawIcon(icon) {
    var skycons = new Skycons({ color: "#e85230" });
    skycons.set("icon1", icon);
    skycons.play();
  }
  componentDidUpdate(prevProps) {
    if (this.props.icon !== prevProps.icon) {
      this.drawIcon(this.props.icon);
    }
  }
  render() {
    return <canvas id="icon1" />;
  }
}

const Main = props => {
  return (
    <div>
      <h1> {props.city}</h1>
      <h2> {props.summary}</h2>
      <h2> {props.date}</h2>
      <h2> {props.time}</h2>
    </div>
  );
};
class App extends Component {
  state = {
    city: "",
    country: "",
    daily: [],
    us: false,
    tempClass: "green"
  };
  getCity = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      // first fetch
      fetch(
        `https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?app_id=W3DEwpZb1dpnTXr7fOfl&app_code=73brCdXp56hg5zWDBTmTfg&mode=retrieveAreas&prox=${
          pos.coords.latitude
        },${pos.coords.longitude}`
      )
        .then(res => res.json())
        .then(json => {
          console.log(json);
          this.setState({
            city: json.Response.View[0].Result[0].Location.Address.Label
          });
        });
      //second fetch
      fetch(
        `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/11b2362641382d3c3688c3f57973c620/${
          pos.coords.latitude
        },${pos.coords.longitude}?exclude=hourly,minutely,alerts,flags&units=si`
      )
        .then(res => res.json())
        .then(json => {
          this.setState({
            us: false,
            daily: json.daily.data,
            temp: Math.round(`${json.currently.temperature}`),
            usTemp: Math.round((9 / 5) * json.currently.temperature + 32),
            icon: json.currently.icon,
            summary: json.currently.summary,
            date: new Date(Number(`${json.currently.time}000`))
              .toDateString()
              .replace(/\d{4}/, "")
          });
        });
      // second fetch ends
    });
  };
  tick = () => {
    this.setState({
      time: new Date().toLocaleTimeString().replace(/:\d+ /, " ")
    });
  };
  usTemp = () => {
    this.setState({
      us: true
    });
  };
  celTemp = () => {
    this.setState({
      us: false
    });
  };
  componentDidMount() {
    this.getCity();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }
  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    let days = this.state.daily;
    return (
      <div className="App">
        {/* current section */}
        <div className="current">
          <div className="icon">
            <Icon icon={this.state.icon} />
            <h2>{this.state.summary}</h2>
            <h2>
              <span class="tempVal">
                {!this.state.us ? this.state.temp : this.state.usTemp}{" "}
              </span>
              <span
                onClick={this.celTemp}
                className={!this.state.us ? "green" : null}
              >
                &#176;C{" "}
              </span>{" "}
              |
              <span
                onClick={this.usTemp}
                className={this.state.us ? "green" : null}
              >
                &#176;F
              </span>
            </h2>
          </div>
          <div className="main">
            <Main
              city={this.state.city}
              date={this.state.date}
              time={this.state.time}
            />
          </div>
        </div>
        {/* daily section */}
        <div className="daily">
          {days.map((day, i) => {
            let date = Number(`${day.time}000`);
            return (
              <div className="day" key={i}>
                <h4>{new Date(date).toDateString().replace(/\d{4}/, "")}</h4>
                <h4>{day.summary}</h4>
                <h3>{day.temperatureMin}</h3>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
