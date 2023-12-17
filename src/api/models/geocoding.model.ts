export interface Geocoding {
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