import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../theme/colors';
import { useTripStore } from '../store/tripStore';
import { dismissArrivalAlarm } from '../services/alarm';
import { playAlarm, stopAlarm } from '../services/alarmSound';
import { stopTracking } from '../services/trackingService';
import PressableScale from '../components/PressableScale';

/**
 * Full-screen alarm shown when the user reaches the destination radius.
 * The looping sound/vibration is driven by the notifee notification; this
 * screen provides the visual + the controls to stop or snooze it.
 */
export default function AlarmScreen() {
  const insets = useSafeAreaInsets();
  const trip = useTripStore(s => s.trip);
  const dismissAlarm = useTripStore(s => s.dismissAlarm);
  const clearTrip = useTripStore(s => s.clearTrip);

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // Play the looping alarm audio for as long as this screen is shown.
  useEffect(() => {
    playAlarm();
    return () => stopAlarm();
  }, []);

  const handleStop = () => {
    stopAlarm();
    dismissArrivalAlarm();
    stopTracking();
    dismissAlarm();
    clearTrip();
  };

  const handleSnooze = () => {
    // Silence the current alarm; keep the trip so it can ring again if the
    // user is still inside the radius on the next GPS check.
    stopAlarm();
    dismissArrivalAlarm();
    dismissAlarm();
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryContainer} />

      <View style={styles.top}>
        <Animated.View
          style={[styles.iconCircle, { transform: [{ scale: pulse }] }]}
        >
          <MaterialIcons name="notifications-active" size={72} color="#fff" />
        </Animated.View>

        <Text style={styles.title}>Hampir sampai!</Text>
        <Text style={styles.subtitle}>
          Kamu sudah dekat dengan{'\n'}
          <Text style={styles.dest}>{trip?.destination.name ?? 'tujuan'}</Text>
        </Text>
        <Text style={styles.hint}>Bangun ya, siap-siap turun 🎒</Text>
      </View>

      <View style={styles.actions}>
        <PressableScale
          style={styles.snoozeBtn}
          activeScale={0.96}
          onPress={handleSnooze}
        >
          <MaterialIcons name="snooze" size={22} color={colors.onSurface} />
          <Text style={styles.snoozeText}>Tunda</Text>
        </PressableScale>

        <PressableScale
          style={styles.stopBtn}
          activeScale={0.96}
          onPress={handleStop}
        >
          <MaterialIcons name="alarm-off" size={22} color={colors.onPrimary} />
          <Text style={styles.stopText}>Matikan Alarm</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter',
    textAlign: 'center',
    marginTop: 12,
  },
  dest: {
    fontWeight: '700',
    color: '#fff',
    fontSize: 18,
  },
  hint: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter',
    marginTop: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  snoozeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  snoozeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    fontFamily: 'Inter',
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  stopText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onPrimary,
    fontFamily: 'Inter',
  },
});
