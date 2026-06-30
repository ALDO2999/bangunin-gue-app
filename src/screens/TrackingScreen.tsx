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
import LeafletMap from '../components/LeafletMap';
import PressableScale from '../components/PressableScale';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { useLocation } from '../hooks/useLocation';
import { distanceInKm } from '../utils/distance';
import { useTripStore } from '../store/tripStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tracking'>;
};

export default function TrackingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const trip = useTripStore(s => s.trip);
  const clearTrip = useTripStore(s => s.clearTrip);

  const { location, status } = useLocation(true);

  // Guard: if there's no active trip (e.g. after cancel), bail to Home.
  useEffect(() => {
    if (!trip) {
      navigation.navigate('Home');
    }
  }, [trip, navigation]);

  const destination = trip?.destination ?? { latitude: 0, longitude: 0, name: '' };
  const radius = trip?.radius ?? 500;
  const distanceKm = location ? distanceInKm(location, destination) : null;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  // Fall back to a point near the destination until the first GPS fix arrives,
  // so the map has something to render.
  const currentLocation = location ?? {
    latitude: destination.latitude + 0.001,
    longitude: destination.longitude + 0.001,
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Tracking Badge */}
      <View style={styles.trackingBadgeWrapper}>
        <View style={styles.trackingBadge}>
          <View style={styles.trackingDot} />
          <Text style={styles.trackingBadgeText}>
            {status === 'tracking'
              ? 'Tracking'
              : status === 'requesting'
              ? 'Mencari lokasi…'
              : status === 'denied'
              ? 'Izin ditolak'
              : status === 'error'
              ? 'Error lokasi'
              : 'Tracking'}
          </Text>
        </View>
      </View>

      {/* Destination Info */}
      <View style={styles.destinationInfo}>
        <Text style={styles.destinationLabel}>TARGET DESTINATION</Text>
        <Text style={styles.destinationCoords}>
          {Math.abs(destination.latitude).toFixed(4)}°{' '}
          {destination.latitude < 0 ? 'S' : 'N'},{' '}
          {Math.abs(destination.longitude).toFixed(4)}°{' '}
          {destination.longitude > 0 ? 'E' : 'W'}
        </Text>
        <Text style={styles.destinationName}>{destination.name}</Text>
        <View style={styles.destinationDivider} />
      </View>

      {/* Distance Radar */}
      <View style={styles.radarSection}>
        <Animated.View
          style={[styles.radarRing3, { transform: [{ scale: pulseAnim }] }]}
        />
        <View style={styles.radarRing2} />
        <View style={styles.radarRing1} />
        <View style={styles.distanceCenter}>
          {distanceKm === null ? (
            <>
              <Text style={styles.distanceValue}>—</Text>
              <Text style={styles.distanceUnit}>MENCARI…</Text>
            </>
          ) : distanceKm < 1 ? (
            <>
              <Text style={styles.distanceValue}>{Math.round(distanceKm * 1000)}</Text>
              <Text style={styles.distanceUnit}>METER LAGI</Text>
            </>
          ) : (
            <>
              <Text style={styles.distanceValue}>{distanceKm.toFixed(1)}</Text>
              <Text style={styles.distanceUnit}>KM LAGI</Text>
            </>
          )}
        </View>
      </View>

      {/* Mini Map */}
      <View style={styles.miniMapContainer}>
        <LeafletMap
          current={currentLocation}
          destination={destination}
          radius={radius}
        />
      </View>

      {/* Cancel Button */}
      <View style={styles.actionRow}>
        <PressableScale
          style={styles.cancelBtn}
          activeScale={0.96}
          onPress={() => {
            clearTrip();
            navigation.navigate('Home');
          }}
        >
          <MaterialIcons name="close" size={18} color={colors.textSecondary} />
          <Text style={styles.cancelBtnText}>Batalkan Perjalanan</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  trackingBadgeWrapper: {
    marginTop: 20,
    marginBottom: 20,
  },
  trackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  trackingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  trackingBadgeText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  destinationInfo: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  destinationLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  destinationCoords: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  destinationName: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
  },
  destinationDivider: {
    width: 40,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },

  radarSection: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  radarRing3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(91, 91, 246, 0.1)',
    backgroundColor: 'rgba(91, 91, 246, 0.03)',
  },
  radarRing2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: 'rgba(91, 91, 246, 0.18)',
    backgroundColor: 'rgba(91, 91, 246, 0.05)',
  },
  radarRing1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(91, 91, 246, 0.35)',
    backgroundColor: 'rgba(91, 91, 246, 0.08)',
  },
  distanceCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceValue: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  },
  distanceUnit: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },

  miniMapContainer: {
    width: '100%',
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },

  actionRow: {
    width: '100%',
    paddingBottom: 8,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 30,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});
