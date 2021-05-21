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
export default function HourlyWeather(props) {
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


  const getGradient = useCallback(
    (ctx, chartArea) => {
      const temps = props.weatherInfo.map(hr => hr.temp.toFixed(1));
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

  const data = useMemo(
    () => ({
      datasets: [
        {
          data: props.weatherInfo.map(hr => ({
            time: format((hr.dt * 1000), 'E haaa'),
            temp: hr.temp.toFixed(1),
            icon: hr.weather[0].icon
          })),
          tension: 0.5,
          borderWidth: 5,
          borderColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) {
              // This case happens on initial chart load
              return null;
            }
            return getGradient(ctx, chartArea);
          },
        },
      ],
    }),
    [props.weatherInfo]
  );

  const iconLabelPlugin = useMemo(
    () => ({
      afterDraw: (chart, easingValue) => {
        const ctx = chart.ctx;
        chart.getDatasetMeta(0).data.forEach((data, i, arr) => {
          const icon = data.$context.raw.icon;
          const preIcon = i === 0 ? '' : arr[i - 1].$context.raw.icon;
          if (icon !== preIcon) {
            const color = tempHSL(data.$context.raw.temp);
            const { x, y } = data;
            const image = new Image(16, 16);
            image.src = `https://openweathermap.org/img/wn/${icon}.png`;
            ctx.restore();
            ctx.strokeStyle = color;
            ctx.fillStyle = color
            ctx.beginPath();
            ctx.arc(x, y, 16, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
            ctx.drawImage(image, x - 20, y - 20, 40, 40);
          }
        })
      }
    }),
    [props.weatherInfo]
  );

  const options = {
    animation: false,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          callback: (value, index, values) => (value + '°'),
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
    parsing: {
      xAxisKey: 'time',
      yAxisKey: 'temp'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
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
}

HourlyWeather.propTypes = {
  show: PropTypes.bool,
  closeHourlyWeather: PropTypes.func,
  weatherInfo: PropTypes.array
};
