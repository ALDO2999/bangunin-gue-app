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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import PressableScale from '../components/PressableScale';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const RADAR_DURATION = 4500;

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
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
              <MaterialIcons name="location-on" size={52} color={colors.primary} />
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
          onPress={() => {
            navigation.navigate('Tracking', {
              destination: { latitude: -6.2, longitude: 106.816, name: 'Destination' },
              radius: 500,
            });
          }}
        >
          <MaterialIcons name="add-location" size={20} color={colors.onSurface} />
          <Text style={styles.setDestinationText}>Set Destination</Text>
        </PressableScale>
      </View>

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
