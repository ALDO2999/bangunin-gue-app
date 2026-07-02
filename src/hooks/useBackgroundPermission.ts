import { useCallback, useEffect, useState } from 'react';
import { AppState, PermissionsAndroid, Platform } from 'react-native';

/**
 * Tracks whether "Allow all the time" (background location) is granted, and
 * re-checks whenever the app returns to the foreground — so the banner clears
 * itself right after the user flips the toggle in Settings.
 */
export function useBackgroundPermission(): {
  granted: boolean;
  recheck: () => void;
} {
  const [granted, setGranted] = useState(true);

  const check = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setGranted(true);
      return;
    }
    const bgPerm = PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION;
    if (!bgPerm) {
      setGranted(true);
      return;
    }
    setGranted(await PermissionsAndroid.check(bgPerm));
  }, []);

  useEffect(() => {
    check();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        check();
      }
    });
    return () => sub.remove();
  }, [check]);

  return { granted, recheck: check };
}
