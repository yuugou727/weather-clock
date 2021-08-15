import React, { memo } from 'react';
import RefreshIcon from '../assets/refresh.svg';
import ChartIcon from '../assets/chart.svg';

interface IProps {
  isQuerying: boolean;
  onRefresh: () => void;
  onColorPickerOpen: () => void;
  onHourlyWeatherOpen: () => void;
}

const ActionButtons = (props: IProps) => {
  const { isQuerying, onRefresh, onColorPickerOpen, onHourlyWeatherOpen } = props;
  return (
    <div className="actionButtons">
      <button
        id="refreshBtn"
        onClick={onRefresh}
        disabled={isQuerying}
      >
        <img
          src={RefreshIcon}
          className={`refreshIcon ${isQuerying ? 'spin' : ''}`}
          alt="refresh"
        />
      </button>
      <button
        id="colorPickerBtn"
        onClick={onColorPickerOpen}
        title="color-picker"
      ></button>
      <button
        id="hourlyWeatherBtn"
        onClick={onHourlyWeatherOpen}
        title="hourly-weather"
      >
        <img
          src={ChartIcon}
          alt="hourly"
        />
      </button>
    </div>
  )
}


export default memo(ActionButtons, (prevProps, nextProps) => 
  prevProps.isQuerying === nextProps.isQuerying 
  && prevProps.onRefresh === nextProps.onRefresh
);