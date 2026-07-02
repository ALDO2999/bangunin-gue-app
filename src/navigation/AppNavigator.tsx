import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import SelectDestinationScreen from '../screens/SelectDestinationScreen';
import TrackingScreen from '../screens/TrackingScreen';
import AlarmScreen from '../screens/AlarmScreen';
import { useTripStore } from '../store/tripStore';

export type RootStackParamList = {
  Home: undefined;
  SelectDestination: undefined;
  Tracking: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const alarmRinging = useTripStore(s => s.alarmRinging);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="SelectDestination"
          component={SelectDestinationScreen}
        />
        <Stack.Screen name="Tracking" component={TrackingScreen} />
      </Stack.Navigator>

      {/* Full-screen alarm overlay — takes over any screen while ringing. */}
      {alarmRinging && (
        <View style={StyleSheet.absoluteFill}>
          <AlarmScreen />
        </View>
      )}
    </NavigationContainer>
  );
}
