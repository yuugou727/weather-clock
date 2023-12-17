import React, { useCallback, useMemo, Fragment } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  ChartData,
  ScatterDataPoint,
  LineOptions,
  ChartOptions,
} from 'chart.js'; // chart.js types
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { WeatherResponse } from '../api/models';
import { coldTemp, hotTemp, tempHsl } from '../common';
import styles from './HourlyWeather.module.scss';
import CustomOWMIconLabelPlugin from './CustomOWMIconLabelPlugin';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);
ChartJS.register(annotationPlugin);

interface Props {
  show: boolean;
  closeHourlyWeather: () => void;
  weatherInfo: WeatherResponse['hourly'];
  city: String;
}

const HourlyWeather = (props: Props) => {
  const weatherData: any[] = useMemo(
    () =>
      props.weatherInfo.map((hr) => ({
        time: format(hr.dt * 1000, 'EEE haaa'),
        temp: Math.round(hr.temp * 10) / 10,
        feltTemp: Math.round(hr.feels_like * 10) / 10,
        humidity: hr.humidity,
        icon: hr.weather[0].icon,
        desc: hr.weather[0].description,
      })),
    [props.weatherInfo]
  );

  const maxFeltTemp = useMemo(
    () =>
      Math.max.apply(
        null,
        weatherData.map((hr) => hr.feltTemp)
      ),
    [weatherData]
  );
  const minFeltTemp = useMemo(
    () =>
      Math.min.apply(
        null,
        weatherData.map((hr) => hr.feltTemp)
      ),
    [weatherData]
  );

  const createCtxGradient = useCallback(
    (context: any) => {
      const chart = context.chart;
      const { ctx, chartArea } = chart;
      if (!chartArea) {
        // This case happens on initial chart load
        return null;
      }
      const tempDiff = maxFeltTemp - minFeltTemp;

      let width, height, gradient;
      const chartWidth = chartArea.right - chartArea.left;
      const chartHeight = chartArea.bottom - chartArea.top;
      if (gradient === null || width !== chartWidth || height !== chartHeight) {
        // Create the gradient because this is either the first render
        // or the size of the chart has changed
        width = chartWidth;
        height = chartHeight;
        gradient = ctx.createLinearGradient(
          0,
          chartArea.bottom,
          0,
          chartArea.top
        );
        gradient.addColorStop(0, tempHsl(minFeltTemp));
        gradient.addColorStop(0.5, tempHsl(minFeltTemp + tempDiff * 0.5));
        gradient.addColorStop(1, tempHsl(maxFeltTemp));
      }
      return gradient;
    },
    [maxFeltTemp, minFeltTemp]
  );

  const data: ChartData<'line', (number | ScatterDataPoint | null)[], unknown> =
    useMemo(
      () => ({
        datasets: [
          {
            label: '氣溫',
            data: weatherData,
            parsing: {
              xAxisKey: 'time',
              yAxisKey: 'temp',
            },
            backgroundColor: '#bbb',
            borderColor: '#bbb',
          },
          {
            label: '體感',
            data: weatherData,
            parsing: {
              xAxisKey: 'time',
              yAxisKey: 'feltTemp',
            },
            backgroundColor: tempHsl(minFeltTemp),
            borderColor: createCtxGradient,
          },
        ],
      }),
      [weatherData, createCtxGradient]
    );

  const ceilToEven = (num: number) => {
    return num % 2 === 0 ? num : num + 1;
  };

  const floorToEven = (num: number) => {
    return num % 2 === 0 ? num : num - 1;
  };

  const options: ChartOptions<'line'> & Partial<LineOptions> = {
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        ticks: {
          callback: (value: string | number, index: number, values: any) =>
            value + '°',
          precision: 0,
        },
        grid: {
          color: 'rgba(255,255,255,0.2)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    layout: {
      padding: 20,
    },
    tension: 0.5,
    borderWidth: 6,
    plugins: {
      title: {
        display: true,
        text: props.city + ' 未來24小時天氣預測',
      },
      legend: {
        onClick: (event: any) => event.native.preventDefault(),
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        usePointStyle: true,
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + '°';
            }
            return label;
          },
        },
      },
      annotation: {
        annotations: {
          highTempWarn: {
            display: maxFeltTemp >= hotTemp,
            type: 'box',
            xMin: 0,
            xMax: 24,
            yMin: hotTemp,
            yMax:
              Math.ceil(maxFeltTemp) > hotTemp
                ? ceilToEven(Math.ceil(maxFeltTemp))
                : hotTemp,
            backgroundColor: 'hsla(-5, 70%, 60%, 0.25)',
            borderWidth: 0,
            label: {
              content: '高溫警告',
              display: true,
              color: 'hsla(-5, 70%, 90%, 0.5)',
              xAdjust: -16,
              font: {
                size: 24,
              },
            },
          },
          lowTempWarn: {
            display: minFeltTemp <= coldTemp,
            type: 'box',
            xMin: 0,
            xMax: 24,
            yMax: coldTemp,
            yMin:
              Math.ceil(minFeltTemp) < coldTemp
                ? floorToEven(Math.ceil(minFeltTemp))
                : coldTemp,
            backgroundColor: 'hsla(205, 70%, 60%, 0.25)',
            borderWidth: 0,
            label: {
              content: '低溫警告',
              display: true,
              color: 'hsla(205, 70%, 90%, 0.5)',
              xAdjust: -16,
              font: {
                size: 24,
              },
            },
          },
        },
      },
    },
  };

  const overlayClickHandler = () => {
    props.closeHourlyWeather();
  };

  const plugins: any[] = [CustomOWMIconLabelPlugin];
  return (
    <Fragment>
      <div
        className="overlay"
        hidden={!props.show}
        onClick={overlayClickHandler}
      ></div>
      <div
        className={styles.hourlyWeatherModal + `${props.show ? ' show' : ''}`}
      >
        {props.show && <Line data={data} options={options} plugins={plugins} />}
      </div>
    </Fragment>
  );
};

export default HourlyWeather;
