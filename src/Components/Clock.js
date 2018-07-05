import React, { Component } from 'react';
import format from 'date-fns/format';

class Clock extends Component {
  constructor(props){
    super(props);
    this.state = {
      date: new Date()
    }
  }
  componentDidMount () {
    this.tick = setInterval(() => {
      this.setState({
        date: new Date()
      });
    }, 1000);
  }
  componentWillUnmount () {
    clearInterval(this.tick);
  }
  render () {
    return (
      <div className="clockDiv">
        <div className="clockLeft">
          <span id="hrmm">{ format(this.state.date, 'hh:mm') }</span>
        </div>
        <div className="clockRight">
          <span id="ampm">{ format(this.state.date, 'A') }</span>
          <span id="seconds">{ format(this.state.date, 'ss') }</span>
        </div>
      </div>
    )
  }
}

export default Clock;