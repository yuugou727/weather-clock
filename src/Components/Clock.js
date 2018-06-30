import React, { Component } from 'react';
import { format } from 'date-fns';

class Clock extends Component {
  constructor(props){
    super(props);
    this.state = {
      date: new Date()
    }
  }
  componentDidMount () {
    this.timerId = setInterval(() => {
      this.setState({
        date: new Date()
      });
    }, 1000);
  }
  componentWillUnmount () {
    clearInterval(this.timerId);
  }
  render () {
    return (
      <div className="clockDiv">
        <div className="clockLeft">
          <span className="hrmm">{ format(this.state.date, 'hh:mm') }</span>
        </div>
        <div className="clockRight">
          <span className="ampm">{ format(this.state.date, 'A') }</span>
          <span className="seconds">{ format(this.state.date, 'ss') }</span>
        </div>
      </div>
    )
  }
}

export default Clock;