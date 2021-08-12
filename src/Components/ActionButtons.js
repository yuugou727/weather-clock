import React, { memo } from 'react';
import PropTypes from 'prop-types';
import RefreshIcon from '../assets/refresh.svg';
import ChartIcon from '../assets/chart.svg';

const ActionButtons = (props) => {
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

ActionButtons.propTypes = {
  isQuerying: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onColorPickerOpen: PropTypes.func.isRequired,
  onHourlyWeatherOpen: PropTypes.func.isRequired
}

export default memo(ActionButtons, (prevProps, nextProps) => 
  prevProps.isQuerying === nextProps.isQuerying 
  && prevProps.onRefresh === nextProps.onRefresh
);