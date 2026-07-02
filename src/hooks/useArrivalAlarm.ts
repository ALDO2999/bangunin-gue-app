import { useEffect, useState } from 'react';
import { distanceInMeters, LatLng } from '../utils/distance';
import { Destination } from '../store/tripStore';

/**
 * Detects whether the user has reached the destination radius, purely for UI
 * (e.g. the "Sudah sampai!" badge).
 *
 * The alarm itself is fired by the background foreground service
 * (trackingService), not here — otherwise it would ring twice when the app is
 * in the foreground. This hook only reflects the arrival state.
 *
 * @param location     Current GPS position, or null before the first fix.
 * @param destination  The trip destination, or null when there's no trip.
 * @param radius       Wake-up radius in meters.
 * @returns `arrived` — true once the user is inside the radius.
 */
export function useArrivalAlarm(
  location: LatLng | null,
  destination: Destination | null,
  radius: number,
): { arrived: boolean } {
  const [arrived, setArrived] = useState(false);

  // Reset when the destination changes (new trip).
  useEffect(() => {
    setArrived(false);
  }, [destination?.latitude, destination?.longitude]);

  useEffect(() => {
    if (!location || !destination || arrived) {
      return;
    }
    if (distanceInMeters(location, destination) <= radius) {
      setArrived(true);
    }
  }, [location, destination, radius, arrived]);

  return { arrived };
}
