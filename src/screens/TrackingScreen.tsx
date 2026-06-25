import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tracking'>;
  route: RouteProp<RootStackParamList, 'Tracking'>;
};

export default function TrackingScreen({ navigation, route }: Props) {
  const { destination, radius } = route.params;
  const distanceKm = 0.1;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isTracking] = useState(true);

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

  const currentLocation = {
    latitude: destination.latitude + 0.001,
    longitude: destination.longitude + 0.001,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Tracking Badge */}
      <View style={styles.trackingBadgeWrapper}>
        <View style={styles.trackingBadge}>
          <View style={styles.trackingDot} />
          <Text style={styles.trackingBadgeText}>Tracking</Text>
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
          <Text style={styles.distanceValue}>{distanceKm.toFixed(1)}</Text>
          <Text style={styles.distanceUnit}>KM AWAY</Text>
        </View>
      </View>

      {/* Mini Map */}
      <View style={styles.miniMapContainer}>
        <MapView
          style={styles.miniMap}
          region={{
            latitude:
              (currentLocation.latitude + destination.latitude) / 2,
            longitude:
              (currentLocation.longitude + destination.longitude) / 2,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          customMapStyle={darkMapStyle}
        >
          <Marker coordinate={currentLocation}>
            <View style={styles.currentLocationMarker} />
          </Marker>
          <Marker coordinate={destination} title={destination.name}>
            <View style={styles.destinationMarker}>
              <Text style={styles.destinationMarkerIcon}>📍</Text>
            </View>
          </Marker>
          <Polyline
            coordinates={[currentLocation, destination]}
            strokeColor={colors.primary}
            strokeWidth={2}
            lineDashPattern={[6, 4]}
          />
        </MapView>
      </View>

      {/* Cancel Button */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnIcon}>✕</Text>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8888aa' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2a2a45' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0d1b2a' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#1e1e38' }],
  },
];

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
  miniMap: {
    flex: 1,
  },
  currentLocationMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
    borderWidth: 2.5,
    borderColor: colors.textPrimary,
  },
  destinationMarker: {
    alignItems: 'center',
  },
  destinationMarkerIcon: {
    fontSize: 22,
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
  cancelBtnIcon: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});
