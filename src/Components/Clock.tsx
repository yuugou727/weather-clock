import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const Clock = () => {
  const [date, setDate] = useState<Date>(new Date());
  useEffect(() => {
    const tickTimer = setInterval(() => {
      setDate(new Date())
    }, 1000);
    return () => {
      clearInterval(tickTimer);
    }
  }, []);

  return (
    date &&
    <div className="clockDiv glowText">
      <div className="clockLeft">
        <span className="hrmm">
          {format(date, 'hh')}
          <span className="blinking">:</span>
          {format(date, 'mm')}
        </span>
      </div>
      <div className="clockRight">
        <span className="ampm">{format(date, 'a')}</span>
        <span className="seconds">{format(date, 'ss')}</span>
      </div>
    </div>
  )
}

export default Clock;