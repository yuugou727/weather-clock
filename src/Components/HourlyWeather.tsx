import React, { memo, useCallback, useMemo, Fragment } from 'react';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { ChartData, ScatterDataPoint, LineOptions, ChartOptions } from 'chart.js';  // chart.js types
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { IWeatherResp } from '../API';
import styles from './HourlyWeather.module.scss';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend );

const iconLabelPlugin: any = {
  iconSize: 36,
  iconPadding: -4,
  xOffset: 0,
  yOffset: 0,
  circleColor: '#91a9b8',
  afterDatasetsDraw(chart: any, args: any, options: any): void {
    const { ctx, chartArea, data } = chart;
    if (!chartArea) {
      return;
    }
    const meta = chart.getDatasetMeta(0); // render weather icon at datasets[0]
    const rawData = data.datasets[0].data;

    const { iconSize, iconPadding, xOffset, yOffset, circleColor } = this;
    meta.data.forEach((metaData: any, i: number) => {
      const { x, y } = metaData;
      const { icon, desc } = rawData[i];
      const prevIcon = i === 0 ? '' : rawData[i - 1].icon;
      if (icon !== prevIcon) {
        if (!rawData[i].image) {
          const image = new Image(iconSize, iconSize);
          image.alt = desc;
          image.crossOrigin = 'anonymous';
          image.src = `https://openweathermap.org/img/wn/${icon}.png`;
          rawData[i].image = image;
          rawData[i].image.onload = drawIcon(ctx, x, y, image);
        }
        drawCircle(ctx, x, y);
        if (rawData[i].image.complete) {
          drawIcon(ctx, x, y, rawData[i].image);
        }
      }
    })
    function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number): void {
      ctx.restore();
      ctx.strokeStyle = circleColor;
      ctx.fillStyle = circleColor;
      ctx.beginPath();
      ctx.arc(x - xOffset, y - yOffset, (iconSize / 2) + iconPadding, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    }
    function drawIcon(ctx: CanvasRenderingContext2D, x: number, y: number, iconImg: HTMLImageElement): void {
      ctx.restore();
      ctx.drawImage(
        iconImg,
        x - (iconSize / 2) - xOffset,
        y - (iconSize / 2) - yOffset,
        iconSize,
        iconSize
      );
    }
  }
};

const tempHSL = (temp = 24): string => {
  const hue = temp < 0 ? 220 :
    temp > 38 ? 0 :
      220 - Math.round((temp / 38) * 220);
  return `hsl(${hue},70%,60%)`;
};

interface IProps {
  show: boolean;
  closeHourlyWeather: () => void;
  weatherInfo: IWeatherResp['hourly'];
  city: String;
}

const HourlyWeather = (props: IProps) => {
  const createCtxGradient = useCallback(
    (context: any) => {
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

  const weatherData: any[] = useMemo(() => props.weatherInfo
    .map((hr) => ({
      time: format((hr.dt * 1000), 'E haaa'),
      temp: Math.round(hr.temp * 10) / 10,
      feltTemp: Math.round(hr.feels_like * 10) / 10,
      humidity: hr.humidity,
      icon: hr.weather[0].icon,
      desc: hr.weather[0].description
    })),
    [props.weatherInfo]
  );

  const data: ChartData<'line', (number | ScatterDataPoint | null)[], unknown> = {
    datasets: [
      {
        label: '氣溫',
        data: weatherData,
        parsing: {
          xAxisKey: 'time',
          yAxisKey: 'temp'
        },
        backgroundColor: '#bbb',
        borderColor: '#bbb',
      },
      {
        label: '體感',
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

  const options: ChartOptions<'line'> & Partial<LineOptions> = {
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      y: {
        ticks: {
          callback: (value: string | number, index: number, values: any) => (value + '°'),
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
      title: {
        display: true,
        text: props.city + ' 未來24小時天氣預測',
      },
      legend: {
        onClick: (event: any) => event.native.preventDefault(),
        labels: {
          usePointStyle: true
        }
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
          }
        }
      },
    }
  };

  const overlayClickHandler = () => {
    props.closeHourlyWeather();
  };

  const plugins: any = [iconLabelPlugin];
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
            plugins={plugins}
          />
        }
      </div>
    </Fragment>
  );
};

export default memo(HourlyWeather, (prevProps, nextProps) => {
  return (prevProps.show === nextProps.show)
});
