import { GeoLocation, Geocoding, Location, WeatherResponse } from './models';

// Envs: GCP Weather API and Key
const {
  VITE_VAR_GEOLOCATION_API,
  VITE_VAR_GEOLOCATION_API_KEY,
  VITE_VAR_LOCAL_FUNCTIONS,
} = import.meta.env;

const FUNCTIONS_ROOT = import.meta.env.PROD ?
  '' : VITE_VAR_LOCAL_FUNCTIONS;

export const geolocationAPI = async (): Promise<Location> => {
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
  const geolocation: GeoLocation = await res.json();
  if ('error' in geolocation) {
    throw new Error(geolocation.error.message);
  }
  const { lat, lng } = geolocation.location;
  return ({ lat, lng });
};

export const weatherAPI = async (lat: number, lng: number): Promise<WeatherResponse> => {
  const api = `${FUNCTIONS_ROOT}/weather?lat=${lat}&lng=${lng}`;
  const weatherResp: Response = await fetch(api)
  if (!weatherResp.ok) {
    throw new Error(weatherResp.statusText);
  }
  const weather: Promise<WeatherResponse> = await weatherResp.json();
  return weather;
}

export const reverseGeocodingAPI = async (lat: number, lng: number): Promise<Geocoding[]> => {
  const api = `${FUNCTIONS_ROOT}/reverseGeocoding?lat=${lat}&lng=${lng}`;
  const geocodingResp: Response = await fetch(api);
  if (!geocodingResp.ok) {
    throw new Error(geocodingResp.statusText);
  }
  const geocoding: Promise<Geocoding[]> = await geocodingResp.json();
  return geocoding;
}

