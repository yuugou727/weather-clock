import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import styles from './Clock.module.scss';

const Clock = () => {
  const [date, setDate] = useState<Date>(new Date());
  useEffect(() => {
    const tickTimer = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => {
      clearInterval(tickTimer);
    };
  }, []);

  return (
    date && (
      <div className={styles.root}>
        <div className={styles.left}>
          <span className={styles.hrmm}>
            {format(date, 'hh')}
            <span className={styles.blinking}>:</span>
            {format(date, 'mm')}
          </span>
        </div>
        <div className={styles.right}>
          <span className={styles.ampm}>{format(date, 'a')}</span>
          <span className={styles.seconds} role="seconds">
            {format(date, 'ss')}
          </span>
        </div>
      </div>
    )
  );
};

export default Clock;
