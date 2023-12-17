import React, { memo } from 'react';
import RefreshIcon from '../assets/refresh.svg';
import ChartIcon from '../assets/chart.svg';
import styles from './ActionButtons.module.scss';

interface Props {
  isQuerying: boolean;
  onRefresh: () => void;
  onColorPickerOpen: () => void;
  onHourlyWeatherOpen: () => void;
}

const ActionButtons = (props: Props) => {
  const { isQuerying, onRefresh, onColorPickerOpen, onHourlyWeatherOpen } =
    props;
  return (
    <div className={styles.root}>
      <button
        className={styles.refreshBtn}
        onClick={onRefresh}
        disabled={isQuerying}
      >
        <img
          src={RefreshIcon}
          className={styles.refreshIcon + `${isQuerying ? ' spin' : ''}`}
          alt="refresh"
        />
      </button>
      <button
        className={styles.colorPickerBtn}
        onClick={onColorPickerOpen}
        title="color-picker"
      ></button>
      <button
        className={styles.hourlyWeatherBtn}
        onClick={onHourlyWeatherOpen}
        title="hourly-weather"
      >
        <img
          src={ChartIcon}
          className={styles.hourlyWeatherIcon}
          alt="hourly weather"
        />
      </button>
    </div>
  );
};

export default memo(
  ActionButtons,
  (prevProps, nextProps) =>
    prevProps.isQuerying === nextProps.isQuerying &&
    prevProps.onRefresh === nextProps.onRefresh
);
