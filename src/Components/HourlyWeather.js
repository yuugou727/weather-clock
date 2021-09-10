import React, { memo, useCallback, useMemo, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import styles from './HourlyWeather.module.scss';

const iconLabelPlugin = {
  afterDatasetsDraw: (chart, args, options) => {
    const { ctx, chartArea, data } = chart;
    if (!chartArea) {
      return null;
    }
    const [xOffset, yOffset] = [0, 0];
    const [iconSize, iconPadding] = [36, -4];

    const meta = chart.getDatasetMeta(0); // render weather icon at datasets[0]
    const rawData = data.datasets[0].data;

    meta.data.forEach(({ x, y }, i) => {
      const { icon, desc } = rawData[i];
      const prevIcon = i === 0 ? '' : rawData[i - 1].icon;
      if (icon !== prevIcon) {
        const color = '#91a9b8';
        const image = new Image(iconSize, iconSize);
        image.alt = desc;
        image.crossOrigin = "anonymous";
        image.src = `https://openweathermap.org/img/wn/${icon}.png`;
        ctx.restore();
        ctx.strokeStyle = color;
        ctx.fillStyle = color
        ctx.beginPath();
        ctx.arc(x - xOffset, y - yOffset, (iconSize / 2) + iconPadding, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.drawImage(image, x - (iconSize / 2) - xOffset, y - (iconSize / 2) - yOffset, iconSize, iconSize);
      }
    })
  }
};

const tempHSL = (temp = 24) => {
  const hue = temp < 0 ? 220 :
    temp > 38 ? 0 :
      220 - Math.round((temp / 38) * 220);
  return `hsl(${hue},70%,60%)`;
};

const HourlyWeather = (props) => {
  const createCtxGradient = useCallback(
    (context) => {
      const chart = context.chart;
      const { ctx, chartArea } = chart;
      if (!chartArea) {
        // This case happens on initial chart load
        return null;
      }
      const temps = props.weatherInfo.map(hr => Math.round(hr.feels_like * 10) / 10);
      const maxTemp = temps.length > 0 ? Math.max.apply(null, temps) : 32;
      const minTemp = temps.length > 0 ? Math.min.apply(null, temps) : 16;
      const midTemp = (maxTemp + minTemp) / 2;

      let width, height, gradient;
      const chartWidth = chartArea.right - chartArea.left;
      const chartHeight = chartArea.bottom - chartArea.top;
      if (gradient === null || width !== chartWidth || height !== chartHeight) {
        // Create the gradient because this is either the first render
        // or the size of the chart has changed
        width = chartWidth;
        height = chartHeight;
        gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, tempHSL(minTemp));
        gradient.addColorStop(0.5, tempHSL(midTemp));
        gradient.addColorStop(1, tempHSL(maxTemp));
      }
      return gradient;
    },
    [props.weatherInfo],
  );

  const weatherData = useMemo(() => props.weatherInfo
    .map(hr => ({
      time: format((hr.dt * 1000), 'E haaa'),
      temp: Math.round(hr.temp * 10) / 10,
      feltTemp: Math.round(hr.feels_like * 10) / 10,
      icon: hr.weather[0].icon,
      desc: hr.weather[0].description
    })),
    [props.weatherInfo]
  );

  const data = {
    datasets: [
      {
        label: '溫度',
        data: weatherData,
        parsing: {
          xAxisKey: 'time',
          yAxisKey: 'temp'
        },
        backgroundColor: '#bbb',
        borderColor: '#bbb',
      },
      {
        label: '體感溫度',
        data: weatherData,
        parsing: {
          xAxisKey: 'time',
          yAxisKey: 'feltTemp'
        },
        backgroundColor: createCtxGradient,
        borderColor: createCtxGradient,
      }
    ],
  };

  const options = {
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      y: {
        ticks: {
          callback: (value, index, values) => (value + '°'),
          precision: 0,
        },
        grid: {
          color: 'rgba(255,255,255,0.2)',
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        }
      }
    },
    layout: {
      padding: 20
    },
    tension: 0.5,
    borderWidth: 6,
    plugins: {
      legend: {
        onClick: (event) => event.native.preventDefault(),
        labels: {
          usePointStyle: true
        }
      },
      tooltip: {
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + '°';
            }
            return label;
          }
        }
      },
    }
  };

  const overlayClickHandler = () => {
    props.closeHourlyWeather();
  };

  return (
    <Fragment>
      <div
        className="overlay"
        hidden={!props.show}
        onClick={overlayClickHandler}
      >
      </div>
      <div className={styles.hourlyWeatherModal + `${props.show ? ' show' : ''}`}>
        {
          props.show &&
          <Line
            data={data}
            options={options}
            plugins={[iconLabelPlugin]}
          />
        }
      </div>
    </Fragment>
  );
};

HourlyWeather.propTypes = {
  show: PropTypes.bool.isRequired,
  closeHourlyWeather: PropTypes.func.isRequired,
  weatherInfo: PropTypes.array.isRequired
};

export default memo(HourlyWeather, (prevProps, nextProps) => {
  return (prevProps.show === nextProps.show)
});
