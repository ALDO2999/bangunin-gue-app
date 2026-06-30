import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { LatLng } from '../utils/distance';
import { colors } from '../theme/colors';
import { LEAFLET_CSS_B64, LEAFLET_JS_B64 } from '../assets/leaflet/leafletInline';

type Props = {
  current: LatLng;
  destination: LatLng;
  /** Wake-up radius around the destination, in meters. */
  radius: number;
};

/**
 * A lightweight OpenStreetMap view rendered with Leaflet inside a WebView.
 * Leaflet itself is bundled locally (no CDN), so the map appears almost
 * instantly even on a slow connection — only the tiles need the network.
 * Needs no API key and never touches Google Maps.
 */
export default function LeafletMap({ current, destination, radius }: Props) {
  const [loading, setLoading] = useState(true);
  const webRef = useRef<React.ElementRef<typeof WebView>>(null);

  // Build the map HTML once (with the initial position) to keep it fast and
  // flash-free. Subsequent GPS updates are pushed imperatively below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const html = useMemo(() => buildHtml(current, destination, radius), []);

  // Push the user's live position into the already-rendered map so the line
  // and "me" dot follow the real GPS fix instead of the initial fallback.
  useEffect(() => {
    if (!loading) {
      webRef.current?.injectJavaScript(
        `window.updateMe && window.updateMe(${current.latitude}, ${current.longitude}); true;`,
      );
    }
  }, [current.latitude, current.longitude, loading]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        containerStyle={styles.webview}
        androidLayerType="hardware"
        onLoadEnd={() => setLoading(false)}
      />
      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </View>
  );
}

function buildHtml(current: LatLng, destination: LatLng, radius: number): string {
  // Center between the two points for the initial view.
  const centerLat = (current.latitude + destination.latitude) / 2;
  const centerLng = (current.longitude + destination.longitude) / 2;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <!-- Leaflet is bundled as base64 and decoded here in the WebView (atob is
       always available in a browser context), so no CDN request is needed. -->
  <script>
    (function () {
      var css = atob('${LEAFLET_CSS_B64}');
      var style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
      var s = document.createElement('script');
      s.textContent = atob('${LEAFLET_JS_B64}');
      document.head.appendChild(s);
    })();
  </script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: ${colors.surfaceContainer}; }
    .leaflet-container { background: ${colors.surfaceContainer}; }
    .dest-pin {
      width: 18px; height: 18px; border-radius: 50% 50% 50% 0;
      background: ${colors.primary}; transform: rotate(-45deg);
      border: 2px solid #fff;
    }
    .me-dot {
      width: 14px; height: 14px; border-radius: 50%;
      background: ${colors.accent}; border: 2.5px solid #fff;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    }).setView([${centerLat}, ${centerLng}], 14);

    // Satellite imagery + transparent labels overlay (hybrid view).
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    }).addTo(map);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    }).addTo(map);

    var dest = [${destination.latitude}, ${destination.longitude}];
    var me = [${current.latitude}, ${current.longitude}];

    // Wake-up radius circle around the destination.
    L.circle(dest, {
      radius: ${radius},
      color: '${colors.primary}',
      weight: 1.5,
      fillColor: '${colors.primary}',
      fillOpacity: 0.12,
    }).addTo(map);

    // Dashed line between me and destination (kept in a global so it can be
    // updated as the user's GPS position changes).
    var line = L.polyline([me, dest], {
      color: '${colors.primary}',
      weight: 2,
      dashArray: '6 4',
    }).addTo(map);

    // Destination pin.
    L.marker(dest, {
      icon: L.divIcon({ className: '', html: '<div class="dest-pin"></div>', iconSize: [18, 18], iconAnchor: [9, 18] }),
    }).addTo(map);

    // Current location dot.
    var meMarker = L.marker(me, {
      icon: L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }),
    }).addTo(map);

    // Fit both points with a little padding.
    map.fitBounds([me, dest], { padding: [30, 30], maxZoom: 16 });

    // Called from React Native whenever the GPS position updates.
    window.updateMe = function (lat, lng) {
      me = [lat, lng];
      meMarker.setLatLng(me);
      line.setLatLngs([me, dest]);
      map.fitBounds([me, dest], { padding: [30, 30], maxZoom: 16 });
    };
  </script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
  webview: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
  },
});
