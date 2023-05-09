// Envs: GCP Weather API and Key
const {
  VITE_VAR_GEOLOCATION_API,
  VITE_VAR_GEOLOCATION_API_KEY,
  VITE_VAR_LOCAL_FUNCTIONS,
} = import.meta.env;

const FUNCTIONS_ROOT = import.meta.env.PROD ?
  '' : VITE_VAR_LOCAL_FUNCTIONS;

export interface ILocation {
  lat: number;
  lng: number;
}

type IGeoLocation = {
  accuracy: number;
  location: ILocation;
} | {
  error: {
    errors: {
      domain: string;
      reason: string;
      message: string;
    }[];
    code: number;
    message: string
  }
};

export const geolocationAPI = async (): Promise<ILocation> => {
  const api = VITE_VAR_GEOLOCATION_API;
  if (!api) {
    throw new Error('Geolocation API path not defined');
  }
  const res: Response = await fetch(
    api + '?key=' + VITE_VAR_GEOLOCATION_API_KEY,
    { method: 'POST' }
  );
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const geolocation: IGeoLocation = await res.json();
  if ('error' in geolocation) {
    throw new Error(geolocation.error.message);
  }
  const { lat, lng } = geolocation.location;
  return ({ lat, lng });
};


interface IBasicWeather {
  id: number,
  main: string,
  description: string,
  icon: string
};

interface ICommonWeatherProps {
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
  weather: IBasicWeather[];
  rain?: {
    '1h': number;
  };
  snow?: {
    '1h': number;
  };
}

export type IWeatherResp = {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: ICommonWeatherProps & {
    sunrise: number;
    sunset: number;
  },
  hourly: (ICommonWeatherProps & {
    pop: number;
  })[]
};

export const weatherAPI = async (lat: number, lng: number): Promise<IWeatherResp> => {
  const api = `${FUNCTIONS_ROOT}/weather?lat=${lat}&lng=${lng}`;
  const weatherResp: Response = await fetch(api)
  if (!weatherResp.ok) {
    throw new Error(weatherResp.statusText);
  }
  const weather: Promise<IWeatherResp> = await weatherResp.json();
  return weather;
}

export interface IGeocoding {
  name: string;
  local_names: {
    ascii: string;
    feature_name: string;
    [key: string]: string;
  };
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export const reverseGeocodingAPI = async (lat: number, lng: number): Promise<IGeocoding[]> => {
  const api = `${FUNCTIONS_ROOT}/reverseGeocoding?lat=${lat}&lng=${lng}`;
  const geocodingResp: Response = await fetch(api);
  if (!geocodingResp.ok) {
    throw new Error(geocodingResp.statusText);
  }
  const geocoding: Promise<IGeocoding[]> = await geocodingResp.json();
  return geocoding;
}

