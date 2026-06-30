import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LatLng } from '../utils/distance';
import { colors } from '../theme/colors';
import { LEAFLET_CSS_B64, LEAFLET_JS_B64 } from '../assets/leaflet/leafletInline';

export type LeafletPickerHandle = {
  /** Recenter the map (e.g. from a search result), animating to the point. */
  flyTo: (coord: LatLng, zoom?: number) => void;
  /** Update the radius circle (in meters) without reloading the map. */
  setRadius: (meters: number) => void;
};

type Props = {
  initialCenter: LatLng;
  /** Radius in meters for the circle drawn around the center pin. */
  radius: number;
  /** Fired (debounced) whenever the map stops moving, with the new center. */
  onCenterChange: (coord: LatLng) => void;
};

/**
 * Interactive OpenStreetMap picker rendered with Leaflet inside a WebView.
 * The pin stays fixed at the screen center; panning the map moves the
 * underlying coordinate, which is reported back via onCenterChange.
 */
const LeafletPicker = forwardRef<LeafletPickerHandle, Props>(
  ({ initialCenter, radius, onCenterChange }, ref) => {
    const webRef = useRef<React.ElementRef<typeof WebView>>(null);

    const html = useMemo(() => buildHtml(initialCenter, radius), []);
    // initialCenter/radius intentionally only used for first render; updates
    // are pushed imperatively to avoid reloading the whole WebView.

    useImperativeHandle(ref, () => ({
      flyTo: (coord, zoom = 16) => {
        webRef.current?.injectJavaScript(
          `window.flyTo(${coord.latitude}, ${coord.longitude}, ${zoom}); true;`,
        );
      },
      setRadius: meters => {
        webRef.current?.injectJavaScript(`window.setRadius(${meters}); true;`);
      },
    }));

    const handleMessage = (e: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(e.nativeEvent.data);
        if (data.type === 'center') {
          onCenterChange({ latitude: data.lat, longitude: data.lng });
        }
      } catch {
        // ignore malformed messages
      }
    };

    return (
      <View style={styles.container}>
        <WebView
          ref={webRef}
          originWhitelist={['*']}
          source={{ html }}
          style={styles.webview}
          containerStyle={styles.webview}
          onMessage={handleMessage}
          androidLayerType="hardware"
        />
        {/* Fixed center pin overlay (rendered natively so it never moves). */}
        <View style={styles.pinWrapper} pointerEvents="none">
          <MaterialIcons
            name="location-on"
            size={44}
            color={colors.primary}
            style={styles.pinIcon}
          />
        </View>
      </View>
    );
  },
);

function buildHtml(center: LatLng, radius: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <!-- Leaflet bundled locally (base64), decoded here in the WebView. -->
  <script>
    (function () {
      var style = document.createElement('style');
      style.textContent = atob('${LEAFLET_CSS_B64}');
      document.head.appendChild(style);
      var s = document.createElement('script');
      s.textContent = atob('${LEAFLET_JS_B64}');
      document.head.appendChild(s);
    })();
  </script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: ${colors.surface}; }
    .leaflet-container { background: ${colors.surface}; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
    }).setView([${center.latitude}, ${center.longitude}], 15);

    // Satellite imagery (Esri World Imagery) + a transparent labels overlay
    // so the user sees buildings AND street/place names (hybrid view).
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(map);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(map);

    // Radius circle that follows the map center.
    var circle = L.circle(map.getCenter(), {
      radius: ${radius},
      color: '${colors.primary}',
      weight: 1.5,
      fillColor: '${colors.primary}',
      fillOpacity: 0.12,
    }).addTo(map);

    function post(type, payload) {
      window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({ type: type }, payload)));
    }

    function sendCenter() {
      var c = map.getCenter();
      circle.setLatLng(c);
      post('center', { lat: c.lat, lng: c.lng });
    }

    // Keep the circle glued to the center while dragging, report when settled.
    map.on('move', function () { circle.setLatLng(map.getCenter()); });
    map.on('moveend', sendCenter);

    // Allow the radius to be updated from RN.
    window.setRadius = function (m) { circle.setRadius(m); };
    window.flyTo = function (lat, lng, zoom) { map.flyTo([lat, lng], zoom); };

    // Emit the initial center once ready.
    setTimeout(sendCenter, 300);
  </script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  // Center pin: an upright Material 'location-on' icon whose tip marks center.
  pinWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    // The icon is 44px wide and its tip is at the bottom-center, so offset by
    // half the width horizontally and the full height vertically.
    marginLeft: -22,
    marginTop: -44,
  },
  pinIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default LeafletPicker;
