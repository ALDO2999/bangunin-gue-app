import { Linking, PermissionsAndroid, Platform } from 'react-native';

/**
 * Requests "Allow all the time" background location. On Android 11+ this can't
 * be granted via a normal dialog — the OS only lets the user enable it from the
 * app's settings page. We request what we can, and return whether it's granted.
 */
export async function ensureBackgroundLocation(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  // Foreground location first — background can't be granted without it.
  const fine = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  if (fine !== PermissionsAndroid.RESULTS.GRANTED) {
    return false;
  }

  const bgPerm = PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION;
  if (!bgPerm) {
    return true; // older Android without the separate background permission
  }

  const already = await PermissionsAndroid.check(bgPerm);
  if (already) {
    return true;
  }

  // On Android 11+ this returns "never_ask_again" without showing UI; the user
  // must flip it in settings. The caller can guide them there.
  const result = await PermissionsAndroid.request(bgPerm);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/** Opens this app's system settings page (for the user to grant permissions). */
export function openAppSettings(): void {
  Linking.openSettings();
}
