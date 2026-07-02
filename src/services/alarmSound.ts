import Sound from 'react-native-sound';

// Play through the media/playback path so the alarm is audible even when the
// ringer is on silent/vibrate (which only mutes the ring & notification
// streams, not media/alarm).
Sound.setCategory('Playback');

let sound: Sound | null = null;

/**
 * Starts looping the alarm sound. Loads `alarm_default` from android res/raw
 * (referenced without extension). Safe to call repeatedly — it won't stack.
 */
export function playAlarm(): void {
  if (sound) {
    return; // already playing
  }
  sound = new Sound('alarm_default', Sound.MAIN_BUNDLE, error => {
    if (error || !sound) {
      // Loading failed — nothing to play. Keep silent rather than crash.
      sound = null;
      return;
    }
    sound.setNumberOfLoops(-1); // loop until stopped
    sound.setVolume(1.0);
    sound.play();
  });
}

/** Stops and releases the alarm sound. */
export function stopAlarm(): void {
  if (sound) {
    sound.stop(() => {
      sound?.release();
      sound = null;
    });
  }
}
