import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation, {
  GeoError,
  GeoPosition,
} from 'react-native-geolocation-service';
import { LatLng } from '../utils/distance';

export type LocationStatus =
  | 'idle'
  | 'requesting'
  | 'denied'
  | 'tracking'
  | 'error';

type UseLocationResult = {
  /** Latest known coordinates, or null until the first fix arrives. */
  location: LatLng | null;
  /** Accuracy of the last fix in meters, if available. */
  accuracy: number | null;
  status: LocationStatus;
  errorMessage: string | null;
};

async function requestAndroidPermission(): Promise<boolean> {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Izin Lokasi',
      message:
        'BanguninGue butuh akses lokasi untuk membangunkanmu saat hampir sampai.',
      buttonPositive: 'Izinkan',
      buttonNegative: 'Tolak',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Requests location permission and streams the device's position.
 *
 * @param enabled  When false, no permission is requested and no watcher runs.
 */
export function useLocation(enabled: boolean = true): UseLocationResult {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    const start = async () => {
      setStatus('requesting');

      const ok =
        Platform.OS === 'android'
          ? await requestAndroidPermission()
          : (await Geolocation.requestAuthorization('whenInUse')) === 'granted';

      if (cancelled) {
        return;
      }

      if (!ok) {
        setStatus('denied');
        setErrorMessage('Izin lokasi ditolak.');
        return;
      }

      watchId.current = Geolocation.watchPosition(
        (pos: GeoPosition) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setAccuracy(pos.coords.accuracy);
          setStatus('tracking');
          setErrorMessage(null);
        },
        (err: GeoError) => {
          setStatus('error');
          setErrorMessage(err.message);
        },
        {
          accuracy: { android: 'high', ios: 'best' },
          enableHighAccuracy: true,
          distanceFilter: 5, // only emit after moving 5m
          interval: 3000,
          fastestInterval: 1000,
        },
      );
    };

    start();

    return () => {
      cancelled = true;
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [enabled]);

  return { location, accuracy, status, errorMessage };
}
