import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import LeafletPicker, { LeafletPickerHandle } from '../components/LeafletPicker';
import PressableScale from '../components/PressableScale';
import Slider from '../components/Slider';
import { usePlaceSearch, Place } from '../hooks/usePlaceSearch';
import { useTripStore } from '../store/tripStore';
import { LatLng } from '../utils/distance';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SelectDestination'>;
};

// Default view: Jakarta city center.
const INITIAL: LatLng = { latitude: -6.2, longitude: 106.816 };

const formatRadius = (m: number) =>
  m >= 1000 ? `${(m / 1000).toFixed(1).replace('.0', '')}km` : `${m}m`;

export default function SelectDestinationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<LeafletPickerHandle>(null);

  const [center, setCenter] = useState<LatLng>(INITIAL);
  const [radius, setRadius] = useState(500);
  const [placeName, setPlaceName] = useState('Tujuan');
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { results, loading, rateLimited } = usePlaceSearch(
    showResults ? query : '',
  );

  const handleRadiusChange = (value: number) => {
    setRadius(value);
    mapRef.current?.setRadius(value);
  };

  const handleSelectPlace = (place: Place) => {
    mapRef.current?.flyTo(
      { latitude: place.latitude, longitude: place.longitude },
      16,
    );
    setPlaceName(place.name);
    setQuery(place.name);
    setShowResults(false);
    Keyboard.dismiss();
  };

  const startTrip = useTripStore(s => s.startTrip);

  const handleConfirm = () => {
    startTrip({ destination: { ...center, name: placeName }, radius });
    navigation.navigate('Tracking');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <PressableScale
          style={styles.iconBtn}
          activeScale={0.88}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.onSurfaceVariant}
          />
        </PressableScale>
        <Text style={styles.headerTitle}>Pilih Tujuan</Text>
        <View style={styles.iconBtn} />
      </View>

      {/* Search bar + autocomplete dropdown (overlays the map) */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <MaterialIcons
            name="search"
            size={20}
            color={colors.onSurfaceVariant}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari alamat atau tempat…"
            placeholderTextColor={colors.onSurfaceVariant}
            value={query}
            onChangeText={text => {
              setQuery(text);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            returnKeyType="search"
          />
          {loading && <ActivityIndicator size="small" color={colors.primary} />}
          {query.length > 0 && !loading && (
            <Pressable
              onPress={() => {
                setQuery('');
                setShowResults(false);
                Keyboard.dismiss();
              }}
              hitSlop={8}
            >
              <MaterialIcons
                name="close"
                size={18}
                color={colors.onSurfaceVariant}
              />
            </Pressable>
          )}
        </View>

        {showResults && results.length > 0 && (
          <View style={styles.dropdown}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {results.map((place, i) => (
                <Pressable
                  key={`${place.latitude}-${place.longitude}-${i}`}
                  style={({ pressed }) => [
                    styles.resultItem,
                    pressed && styles.resultItemPressed,
                    i < results.length - 1 && styles.resultDivider,
                  ]}
                  onPress={() => handleSelectPlace(place)}
                >
                  <MaterialIcons
                    name="place"
                    size={20}
                    color={colors.onSurfaceVariant}
                  />
                  <View style={styles.resultText}>
                    <Text style={styles.resultName} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <Text style={styles.resultSub} numberOfLines={1}>
                      {place.fullName}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {showResults && rateLimited && (
          <View style={[styles.dropdown, styles.noticeBox]}>
            <MaterialIcons
              name="hourglass-empty"
              size={18}
              color={colors.onSurfaceVariant}
            />
            <Text style={styles.noticeText}>
              Pencarian sedang sibuk, coba sebentar lagi…
            </Text>
          </View>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapArea}>
        <LeafletPicker
          ref={mapRef}
          initialCenter={INITIAL}
          radius={radius}
          onCenterChange={setCenter}
        />
      </View>

      {/* Bottom sheet */}
      <View style={[styles.sheet, { paddingBottom: 24 + insets.bottom }]}>
        <View style={styles.handle} />

        <View style={styles.sheetHeader}>
          <View style={styles.sheetHeaderText}>
            <Text style={styles.sheetTitle}>Atur Radius Alarm</Text>
            <Text style={styles.sheetSubtitle}>
              Alarm berbunyi saat memasuki area ini.
            </Text>
          </View>
          <View style={styles.radiusBadge}>
            <Text style={styles.radiusBadgeText}>{formatRadius(radius)}</Text>
          </View>
        </View>

        <View style={styles.sliderWrap}>
          <Slider
            min={200}
            max={2000}
            step={100}
            value={radius}
            onChange={handleRadiusChange}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>200m</Text>
            <Text style={styles.sliderLabel}>1km</Text>
            <Text style={styles.sliderLabel}>2km</Text>
          </View>
        </View>

        <PressableScale
          style={styles.confirmBtn}
          activeScale={0.97}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmText}>Konfirmasi Tujuan</Text>
        </PressableScale>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'Inter',
  },

  searchWrap: {
    // Sit above the map so the dropdown can overlay it.
    zIndex: 10,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(66, 70, 83, 0.3)',
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 14,
    fontFamily: 'Inter',
    padding: 0,
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    maxHeight: 260,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(66, 70, 83, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  resultItemPressed: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  resultDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(66, 70, 83, 0.25)',
  },
  resultText: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.onSurface,
    fontFamily: 'Inter',
  },
  resultSub: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: 'Inter',
    marginTop: 1,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  noticeText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: 'Inter',
  },

  mapArea: {
    flex: 1,
    overflow: 'hidden',
  },

  sheet: {
    backgroundColor: colors.surfaceContainer,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(194, 194, 245, 0.1)',
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(66, 70, 83, 0.5)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  sheetHeaderText: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurface,
    fontFamily: 'Inter',
  },
  sheetSubtitle: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  radiusBadge: {
    backgroundColor: 'rgba(86, 141, 254, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    marginLeft: 12,
  },
  radiusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'Inter',
  },

  sliderWrap: {
    paddingVertical: 12,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: 'Inter',
  },

  confirmBtn: {
    height: 50,
    borderRadius: 999,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onPrimaryContainer,
    fontFamily: 'Inter',
  },
});
