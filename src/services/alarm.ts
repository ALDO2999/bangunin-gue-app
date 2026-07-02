import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
} from '@notifee/react-native';

// Bump the suffix whenever the channel's sound/vibration changes — Android
// caches channel settings, so a new id is the reliable way to apply changes.
export const CHANNEL_ID = 'arrival-alarm-v2';
export const TRACKING_CHANNEL_ID = 'tracking-service';

/**
 * Alarm sound. Point this at a file in android/app/src/main/res/raw
 * (referenced WITHOUT extension), e.g. 'alarm_default'. Until the file is
 * added, 'default' uses the system notification sound so the app still works.
 *
 * NOTE: changing a channel's sound requires deleting & recreating the channel
 * (Android caches channel settings), which setupAlarm handles on version bump.
 */
export const ALARM_SOUND = 'alarm_default';

/**
 * Creates notification channels and asks for notification permission
 * (required on Android 13+). Safe to call multiple times.
 */
export async function setupAlarm(): Promise<void> {
  await notifee.requestPermission();
  // Loud channel for the actual wake-up alarm.
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Alarm Kedatangan',
    importance: AndroidImportance.HIGH,
    sound: ALARM_SOUND,
    vibration: true,
    vibrationPattern: [300, 500, 300, 500],
    visibility: AndroidVisibility.PUBLIC,
  });
  // Quiet, low-importance channel for the persistent tracking notification.
  await notifee.createChannel({
    id: TRACKING_CHANNEL_ID,
    name: 'Pemantauan Perjalanan',
    importance: AndroidImportance.LOW,
    vibration: false,
  });
}

/** Whether the user has granted notification permission. */
export async function hasNotificationPermission(): Promise<boolean> {
  const settings = await notifee.getNotificationSettings();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

export const ALARM_NOTIFICATION_ID = 'arrival-alarm-notif';

/**
 * Fires the arrival alarm notification. The actual looping audio is played
 * separately via alarmSound (on the media stream, so it survives silent mode);
 * this notification handles the vibration + the full-screen intent that
 * launches the app over the lock screen so the AlarmScreen can take over.
 */
export async function fireArrivalAlarm(destinationName: string): Promise<void> {
  await notifee.displayNotification({
    id: ALARM_NOTIFICATION_ID,
    title: '⏰ Hampir sampai!',
    body: `Kamu sudah dekat dengan ${destinationName}. Bangun ya, siap-siap turun!`,
    android: {
      channelId: CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      category: AndroidCategory.ALARM,
      visibility: AndroidVisibility.PUBLIC,
      vibrationPattern: [500, 1000],
      ongoing: true,
      autoCancel: false,
      fullScreenAction: { id: 'alarm', launchActivity: 'default' },
      pressAction: { id: 'alarm', launchActivity: 'default' },
    },
  });
}

/** Stops the looping alarm sound/vibration and removes the notification. */
export async function dismissArrivalAlarm(): Promise<void> {
  await notifee.cancelNotification(ALARM_NOTIFICATION_ID);
}
