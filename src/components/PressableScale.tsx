import React, { useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

type Props = PressableProps & {
  /** How far to shrink while pressed. 0.96 = 96% of original size. */
  activeScale?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/**
 * A Pressable that smoothly scales down while pressed, giving buttons a
 * tactile, premium feel. Uses the native driver so the animation runs at
 * 60fps off the JS thread.
 */
export default function PressableScale({
  activeScale = 0.96,
  style,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) => {
    Animated.timing(scale, {
      toValue,
      duration: 120,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={e => {
        animateTo(activeScale);
        onPressIn?.(e);
      }}
      onPressOut={e => {
        animateTo(1);
        onPressOut?.(e);
      }}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
