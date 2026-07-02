import notifee, { AndroidImportance } from '@notifee/react-native';
import Geolocation from 'react-native-geolocation-service';
import { fireArrivalAlarm, TRACKING_CHANNEL_ID } from './alarm';
import { distanceInMeters, LatLng } from '../utils/distance';
import { Trip, useTripStore } from '../store/tripStore';

const NOTIFICATION_ID = 'tracking-fg';

let watchId: number | null = null;

/**
 * Reads the active trip straight from the store. Kept as a function so the
 * foreground task always sees the latest value (e.g. after the user cancels).
 */
function currentTrip(): Trip | null {
  return useTripStore.getState().trip;
}

function formatDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km lagi`
    : `${Math.round(meters)} m lagi`;
}

async function updateTrackingNotification(body: string): Promise<void> {
  await notifee.displayNotification({
    id: NOTIFICATION_ID,
    title: 'BanguninGue memantau perjalananmu',
    body,
    android: {
      channelId: TRACKING_CHANNEL_ID,
      importance: AndroidImportance.LOW,
      asForegroundService: true,
      ongoing: true,
      onlyAlertOnce: true,
      pressAction: { id: 'default' },
    },
  });
}

/**
 * The long-running foreground task. Resolves (ending the service) only when
 * the trip is cleared or the alarm has fired. Registered once at startup via
 * registerTrackingService().
 */
function foregroundRunner(): Promise<void> {
  return new Promise<void>(resolve => {
    let fired = false;

    const stop = () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
        watchId = null;
      }
      resolve();
    };

    const onPosition = (lat: number, lng: number) => {
      const trip = currentTrip();
      if (!trip) {
        stop();
        return;
      }
      const here: LatLng = { latitude: lat, longitude: lng };
      const meters = distanceInMeters(here, trip.destination);

      updateTrackingNotification(
        `${trip.destination.name} · ${formatDistance(meters)}`,
      );

      if (!fired && meters <= trip.radius) {
        fired = true;
        fireArrivalAlarm(trip.destination.name);
        // Flag the ringing state so the app shows the full-screen AlarmScreen.
        useTripStore.getState().triggerAlarm();
        // Keep the service alive briefly so the alarm is delivered, then stop.
        setTimeout(stop, 1500);
      }
    };

    watchId = Geolocation.watchPosition(
      pos => onPosition(pos.coords.latitude, pos.coords.longitude),
      () => {
        /* ignore transient GPS errors; keep watching */
      },
      {
        accuracy: { android: 'high', ios: 'best' },
        enableHighAccuracy: true,
        distanceFilter: 20,
        interval: 5000,
        fastestInterval: 3000,
        showsBackgroundLocationIndicator: true,
      },
    );

    // Also stop if the trip is cleared while we're idle between GPS updates.
    const unsubscribe = useTripStore.subscribe(state => {
      if (!state.trip) {
        unsubscribe();
        stop();
      }
    });
  });
}

/**
 * Registers the foreground service runner. MUST be called once at app startup
 * (in index.js), before React renders — notifee requires the task to be
 * registered synchronously on load.
 */
export function registerTrackingService(): void {
  notifee.registerForegroundService(() => foregroundRunner());
}

/** Starts background tracking for the current trip. */
export async function startTracking(): Promise<void> {
  const trip = currentTrip();
  if (!trip) {
    return;
  }
  await updateTrackingNotification(`${trip.destination.name} · memulai…`);
}

/** Stops background tracking and removes the persistent notification. */
export async function stopTracking(): Promise<void> {
  await notifee.stopForegroundService();
  await notifee.cancelNotification(NOTIFICATION_ID);
}
