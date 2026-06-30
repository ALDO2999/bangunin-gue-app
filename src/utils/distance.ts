/** Geographic coordinate pair. */
export type LatLng = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_M = 6371000; // mean Earth radius in meters

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Great-circle distance between two coordinates in meters (Haversine formula).
 */
export function distanceInMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Convenience wrapper returning the distance in kilometers. */
export function distanceInKm(a: LatLng, b: LatLng): number {
  return distanceInMeters(a, b) / 1000;
}
