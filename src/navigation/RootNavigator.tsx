import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { QueueScreen } from '../screens/QueueScreen';

/**
 * Navigation uses React Navigation v6 NativeStack.
 * Expo Router is explicitly NOT used (per assignment constraint).
 *
 * Structure:
 *   Root Stack
 *   ├── Home         (main screen)
 *   ├── Player       (modal, full screen)
 *   └── Queue        (modal, slides up from Player)
 */

export type RootStackParamList = {
  Home: undefined;
  Player: undefined;
  Queue: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Queue"
          component={QueueScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}