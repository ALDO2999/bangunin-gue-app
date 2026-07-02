import React, { useEffect, useMemo, useRef } from 'react';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import PressableScale from '../components/PressableScale';
import LeafletMap from '../components/LeafletMap';
import { useTripStore } from '../store/tripStore';
import { useLocation } from '../hooks/useLocation';
import { distanceInKm } from '../utils/distance';
import { getGreeting } from '../utils/greeting';
import { stopTracking } from '../services/trackingService';
import { fireArrivalAlarm } from '../services/alarm';
import { useBackgroundPermission } from '../hooks/useBackgroundPermission';
import {
  ensureBackgroundLocation,
  openAppSettings,
} from '../services/permissions';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const RADAR_DURATION = 4500;

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const trip = useTripStore(s => s.trip);
  const clearTrip = useTripStore(s => s.clearTrip);
  const triggerAlarm = useTripStore(s => s.triggerAlarm);

  // Only track location while there's an active trip.
  const { location } = useLocation(!!trip);
  const distanceKm =
    trip && location ? distanceInKm(location, trip.destination) : null;

  const { granted: bgGranted, recheck } = useBackgroundPermission();

  const handleEnableBackground = async () => {
    const ok = await ensureBackgroundLocation();
    if (!ok) {
      // Android 11+ won't grant "all the time" via dialog — send to settings.
      openAppSettings();
    }
    recheck();
  };

  const greeting = useMemo(() => getGreeting(), []);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radar1 = useRef(new Animated.Value(0)).current;
  const radar2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    const makeRadar = (value: Animated.Value) =>
      Animated.loop(
        Animated.timing(value, {
          toValue: 1,
          duration: RADAR_DURATION,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      );

    const ring1 = makeRadar(radar1);
    ring1.start();

    // Stagger the second ring by half a cycle for a continuous sonar effect
    const timer = setTimeout(() => makeRadar(radar2).start(), RADAR_DURATION / 2);

    return () => {
      ring1.stop();
      clearTimeout(timer);
    };
  }, [radar1, radar2]);

  const radarStyle = (value: Animated.Value) => ({
    transform: [
      {
        scale: value.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.9],
        }),
      },
    ],
    opacity: value.interpolate({
      inputRange: [0, 0.15, 1],
      outputRange: [0, 0.35, 0],
    }),
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="alarm" size={22} color={colors.primary} />
          <Text style={styles.headerTitle}>BanguninGue</Text>
        </View>
        <PressableScale style={styles.settingsBtn} activeScale={0.88}>
          <MaterialIcons name="settings" size={22} color={colors.onSurfaceVariant} />
        </PressableScale>
      </View>

      {/* Main Content */}
      {trip ? (
        <View style={[styles.main, styles.mainTrip]}>
          {/* Greeting card */}
          <View style={styles.greetingCard}>
            <View style={styles.greetingIconBadge}>
              <MaterialIcons
                name={greeting.icon}
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={styles.greetingTextWrap}>
              <Text style={styles.greetingTitle}>{greeting.title}</Text>
              <Text style={styles.greetingSubtitle}>{greeting.subtitle}</Text>
            </View>
          </View>

          {/* Background-permission warning (only when not yet granted) */}
          {!bgGranted && (
            <PressableScale
              style={styles.permWarn}
              activeScale={0.98}
              onPress={handleEnableBackground}
            >
              <MaterialIcons
                name="warning-amber"
                size={20}
                color={colors.error}
              />
              <View style={styles.permWarnText}>
                <Text style={styles.permWarnTitle}>
                  Aktifkan lokasi "Sepanjang waktu"
                </Text>
                <Text style={styles.permWarnBody}>
                  Supaya alarm tetap bunyi walau app ditutup. Ketuk untuk atur.
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={22}
                color={colors.onSurfaceVariant}
              />
            </PressableScale>
          )}

          {/* Active trip card */}
          <View style={styles.tripCard}>
            <View style={styles.tripMap}>
              <LeafletMap
                current={location ?? trip.destination}
                destination={trip.destination}
                radius={trip.radius}
              />
            </View>

            <View style={styles.tripBody}>
              <View style={styles.tripRow}>
                <MaterialIcons name="place" size={18} color={colors.primary} />
                <View style={styles.tripDestText}>
                  <Text style={styles.tripDestName} numberOfLines={1}>
                    {trip.destination.name}
                  </Text>
                  <Text style={styles.tripDestCoords}>
                    {trip.destination.latitude.toFixed(4)},{' '}
                    {trip.destination.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>

              <View style={styles.tripDivider} />

              <View style={styles.tripDistanceRow}>
                <View>
                  <Text style={styles.tripDistanceValue}>
                    {distanceKm === null
                      ? '—'
                      : distanceKm < 1
                      ? `${Math.round(distanceKm * 1000)} m`
                      : `${distanceKm.toFixed(1)} km`}
                  </Text>
                  <Text style={styles.tripDistanceLabel}>
                    {distanceKm === null ? 'mencari lokasi…' : 'jarak tersisa'}
                  </Text>
                </View>
                <View style={styles.tripRadiusBadge}>
                  <MaterialIcons
                    name="notifications-active"
                    size={14}
                    color={colors.primary}
                  />
                  <Text style={styles.tripRadiusText}>
                    radius {trip.radius >= 1000 ? `${trip.radius / 1000}km` : `${trip.radius}m`}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.tripActions}>
            <View style={styles.tripBtnWrap}>
              <PressableScale
                style={[styles.tripBtn, styles.tripBtnPrimary]}
                activeScale={0.96}
                onPress={() => navigation.navigate('Tracking')}
              >
                <MaterialIcons
                  name="navigation"
                  size={18}
                  color={colors.onPrimaryContainer}
                />
                <Text style={styles.tripBtnPrimaryText}>Lihat Tracking</Text>
              </PressableScale>
            </View>
            <View style={styles.tripBtnWrap}>
              <PressableScale
                style={[styles.tripBtn, styles.tripBtnGhost]}
                activeScale={0.96}
                onPress={() => {
                  stopTracking();
                  clearTrip();
                }}
              >
                <MaterialIcons
                  name="close"
                  size={18}
                  color={colors.onSurfaceVariant}
                />
                <Text style={styles.tripBtnGhostText}>Batalkan</Text>
              </PressableScale>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.main}>
          {/* Pulse Circle with glow */}
          <Animated.View
            style={[styles.pulseWrapper, { transform: [{ scale: pulseAnim }] }]}
          >
            {/* Radar rings emanating outward (decorative, behind the circle) */}
            <Animated.View
              style={[styles.radarRing, radarStyle(radar1)]}
              pointerEvents="none"
            />
            <Animated.View
              style={[styles.radarRing, radarStyle(radar2)]}
              pointerEvents="none"
            />

            {/* Outer glow halos (decorative, behind the circle) */}
            <View style={styles.haloOuter} pointerEvents="none" />
            <View style={styles.haloMid} pointerEvents="none" />
            <View style={styles.pulseCircle}>
              <View style={styles.circleInner}>
                <MaterialIcons
                  name="location-on"
                  size={52}
                  color={colors.primary}
                />
                <View style={styles.bellBadge}>
                  <MaterialIcons
                    name="notifications-active"
                    size={16}
                    color={colors.primary}
                  />
                </View>
              </View>
            </View>
          </Animated.View>

          <Text style={styles.idleLabel}>
            No active trip. Rest easy, we'll wake you up.
          </Text>

          {/* Set Destination Button */}
          <PressableScale
            style={styles.setDestinationBtn}
            activeScale={0.94}
            onPress={() => navigation.navigate('SelectDestination')}
          >
            <MaterialIcons
              name="add-location"
              size={20}
              color={colors.onSurface}
            />
            <Text style={styles.setDestinationText}>Set Destination</Text>
          </PressableScale>

          {/* TEMPORARY: test the alarm without needing to reach a radius. */}
          <PressableScale
            style={styles.testAlarmBtn}
            activeScale={0.94}
            onPress={() => {
              fireArrivalAlarm('Tujuan');
              triggerAlarm();
            }}
          >
            <Text style={styles.testAlarmText}>Test Alarm</Text>
          </PressableScale>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={[styles.bottomNavWrapper, { bottom: 16 + insets.bottom }]}>
        <View style={styles.bottomNav}>
          <View style={styles.navItem}>
            <MaterialIcons name="alarm" size={22} color={colors.primary} />
            <Text style={[styles.navLabel, styles.navLabelActive]}>Alarm</Text>
          </View>
          <PressableScale style={styles.navItem}>
            <MaterialIcons name="public" size={22} color={colors.onSurfaceVariant} />
            <Text style={styles.navLabel}>World</Text>
          </PressableScale>
          <PressableScale style={styles.navItem}>
            <MaterialIcons name="timer" size={22} color={colors.onSurfaceVariant} />
            <Text style={styles.navLabel}>Stopwatch</Text>
          </PressableScale>
          <PressableScale style={styles.navItem}>
            <MaterialIcons
              name="hourglass-empty"
              size={22}
              color={colors.onSurfaceVariant}
            />
            <Text style={styles.navLabel}>Timer</Text>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(66, 70, 83, 0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    fontFamily: 'Inter',
  },
  settingsBtn: {
    padding: 8,
    borderRadius: 20,
  },

  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 96,
  },
  // When a trip is active there's more content (greeting + card + actions),
  // so align to the top with breathing room instead of vertically centering.
  mainTrip: {
    justifyContent: 'flex-start',
    paddingTop: 24,
  },

  // --- Greeting card ---
  greetingCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: 'rgba(176, 198, 255, 0.1)',
  },
  greetingIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(86, 141, 254, 0.15)',
  },
  greetingTextWrap: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.onSurface,
    fontFamily: 'Inter',
  },
  greetingSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceVariant,
    fontFamily: 'Inter',
    marginTop: 3,
  },

  // --- Background permission warning ---
  permWarn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(147, 0, 10, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 171, 0.3)',
  },
  permWarnText: {
    flex: 1,
  },
  permWarnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
    fontFamily: 'Inter',
  },
  permWarnBody: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.onSurfaceVariant,
    fontFamily: 'Inter',
    marginTop: 2,
  },

  // --- Active trip card ---
  tripCard: {
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(176, 198, 255, 0.12)',
    overflow: 'hidden',
  },
  tripMap: {
    height: 200,
    width: '100%',
  },
  tripBody: {
    padding: 16,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tripDestText: {
    flex: 1,
  },
  tripDestName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    fontFamily: 'Inter',
  },
  tripDestCoords: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: 'Inter',
    marginTop: 1,
  },
  tripDivider: {
    height: 1,
    backgroundColor: 'rgba(66, 70, 83, 0.3)',
    marginVertical: 14,
  },
  tripDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tripDistanceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.onSurface,
    fontFamily: 'Inter',
  },
  tripDistanceLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  tripRadiusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(86, 141, 254, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  tripRadiusText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    fontFamily: 'Inter',
  },
  tripActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 16,
  },
  tripBtnWrap: {
    flex: 1,
  },
  tripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    width: '100%',
    borderRadius: 999,
  },
  tripBtnPrimary: {
    backgroundColor: colors.primaryContainer,
  },
  tripBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onPrimaryContainer,
    fontFamily: 'Inter',
  },
  tripBtnGhost: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(66, 70, 83, 0.3)',
  },
  tripBtnGhostText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    fontFamily: 'Inter',
  },

  pulseWrapper: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  radarRing: {
    position: 'absolute',
    width: 152,
    height: 152,
    borderRadius: 76,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  haloOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(176, 198, 255, 0.025)',
  },
  haloMid: {
    position: 'absolute',
    width: 186,
    height: 186,
    borderRadius: 93,
    backgroundColor: 'rgba(176, 198, 255, 0.045)',
  },
  pulseCircle: {
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(176, 198, 255, 0.2)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  circleInner: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    bottom: -18,
    right: -18,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },

  idleLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
    fontFamily: 'Inter',
  },

  setDestinationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingVertical: 11,
    paddingHorizontal: 24,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(66, 70, 83, 0.3)',
  },
  setDestinationText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.onSurface,
    fontFamily: 'Inter',
  },
  testAlarmBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  testAlarmText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: 'Inter',
  },

  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(176, 198, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  navItem: {
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 18,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    fontFamily: 'Inter',
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
