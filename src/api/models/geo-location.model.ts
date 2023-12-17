export interface Location {
  lat: number;
  lng: number;
}

export type GeoLocation = {
  accuracy: number;
  location: Location;
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


