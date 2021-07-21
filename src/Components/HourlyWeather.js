import React, { useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

function tempHSL(temp = 24) {
  const hue = temp < 0 ? 220 :
    temp > 38 ? 0 :
      220 - parseInt((temp / 38) * 220, 10);
  return `hsl(${hue},70%,60%)`;
}
const HourlyWeather = (props) => {
  useEffect(() => {
    const overlay = document.querySelector('#hourlyWeatherOverlay');
    const clickListener = () => {
      props.closeHourlyWeather();
    };
    overlay.addEventListener('click', clickListener);
    return () => {
      overlay.removeEventListener('click', clickListener);
    }
  }, [props.show]);


  const createCtxGradient = useCallback(
    (context) => {
      const chart = context.chart;
      const { ctx, chartArea } = chart;
      if (!chartArea) {
        // This case happens on initial chart load
        return null;
      }
      const temps = props.weatherInfo.map(hr => hr.feels_like.toFixed(1));
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

  const weatherData = props.weatherInfo.map(hr => ({
    time: format((hr.dt * 1000), 'E haaa'),
    temp: hr.temp.toFixed(1),
    feltTemp: hr.feels_like.toFixed(1),
    icon: hr.weather[0].icon
  }));

  const data = useMemo(() => ({
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
  }),
    [props.weatherInfo]
  );

  const iconLabelPlugin = useMemo(
    () => ({
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
          const icon = rawData[i].icon;
          const prevIcon = i === 0 ? '' : rawData[i - 1].icon;
          if (icon !== prevIcon) {
            const color = '#91a9b8';
            const image = new Image(iconSize, iconSize);
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
    }),
    []
  );

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

  return (
    <div>
      <div id="hourlyWeatherOverlay" className="overlay" hidden={!props.show}></div>
      <div id="hourlyWeatherModal" className={props.show ? 'show' : null}>
        {props.show && <Line data={data} options={options} plugins={[iconLabelPlugin]}></Line>}
      </div>
    </div>
  );
};

HourlyWeather.propTypes = {
  show: PropTypes.bool,
  closeHourlyWeather: PropTypes.func,
  weatherInfo: PropTypes.array
};

export default React.memo(HourlyWeather, (prevProps, nextProps) => {
  return (prevProps.show === nextProps.show)
    && (prevProps.weatherInfo === nextProps.weatherInfo);
});
