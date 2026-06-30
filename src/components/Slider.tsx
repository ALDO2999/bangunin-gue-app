import React, { useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

const THUMB = 24;

/**
 * A lightweight horizontal slider built with PanResponder — no native module,
 * so it works without an extra rebuild.
 *
 * Tracking uses the touch's absolute pageX minus the slider's measured left
 * edge, so the value stays stable no matter which child sits under the finger
 * (using locationX caused the value to jump because it's relative to whatever
 * view is currently being touched).
 */
export default function Slider({ min, max, step, value, onChange }: Props) {
  const [width, setWidth] = useState(0);
  // Latest layout, read synchronously inside the gesture handlers.
  const layout = useRef({ x: 0, width: 0 });

  const emit = (pageX: number) => {
    const usable = layout.current.width - THUMB;
    if (usable <= 0) {
      return;
    }
    const localX = pageX - layout.current.x - THUMB / 2;
    const ratio = Math.max(0, Math.min(1, localX / usable));
    const raw = min + ratio * (max - min);
    const stepped = Math.round((raw - min) / step) * step + min;
    onChange(Math.max(min, Math.min(max, stepped)));
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: e => emit(e.nativeEvent.pageX),
        onPanResponderMove: e => emit(e.nativeEvent.pageX),
      }),
    // emit closes over refs/props that are stable enough for a slider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [min, max, step],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w } = e.nativeEvent.layout;
    layout.current.width = w;
    setWidth(w);
  };

  // Measure absolute x on every render via a ref callback would be ideal, but
  // onLayout gives x relative to parent; we instead capture pageX origin from
  // the first touch using measureInWindow on layout.
  const viewRef = useRef<View>(null);
  const captureX = () => {
    viewRef.current?.measureInWindow((x, _y, w) => {
      layout.current.x = x;
      layout.current.width = w;
    });
  };

  const ratio = max > min ? (value - min) / (max - min) : 0;
  const thumbX = ratio * Math.max(0, width - THUMB);

  return (
    <View
      ref={viewRef}
      style={styles.container}
      onLayout={e => {
        onLayout(e);
        captureX();
      }}
      {...responder.panHandlers}
    >
      <View style={styles.track} />
      <View style={[styles.fill, { width: thumbX + THUMB / 2 }]} />
      <View style={[styles.thumb, { left: thumbX }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: THUMB,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceContainerHighest,
  },
  fill: {
    position: 'absolute',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryContainer,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: colors.primaryContainer,
  },
});
