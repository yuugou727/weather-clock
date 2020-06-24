import React, { useState, useEffect } from 'react';
import format from 'date-fns/format';

function Clock() {
  const [date, setDate] = useState(null);
  useEffect(() => {
    const tickTimer = setInterval(() => {
      setDate(new Date())
    }, 1000);
    return () => {
      clearInterval(tickTimer);
    }
  }, []);

  return (
    <div className="clockDiv glowText">
      <div className="clockLeft">
        <span id="hrmm">{format(date, 'hh:mm')}</span>
      </div>
      <div className="clockRight">
        <span id="ampm">{format(date, 'A')}</span>
        <span id="seconds">{format(date, 'ss')}</span>
      </div>
    </div>
  )
}

export default Clock;