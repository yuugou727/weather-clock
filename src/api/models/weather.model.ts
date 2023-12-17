interface BasicWeather {
  id: number,
  main: string,
  description: string,
  icon: string
};

interface CommonWeatherProps {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: BasicWeather[];
  rain?: {
    '1h': number;
  };
  snow?: {
    '1h': number;
  };
}

export type WeatherResponse = {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: CommonWeatherProps & {
    sunrise: number;
    sunset: number;
  },
  hourly: (CommonWeatherProps & {
    pop: number;
  })[]
};
