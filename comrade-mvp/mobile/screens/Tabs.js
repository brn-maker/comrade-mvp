import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatScreen from './chat/ChatScreen';
import StoriesScreen from './stories/StoriesScreen';
import LiveSwipeScreen from './live/LiveSwipeScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Stories" component={StoriesScreen} />
      <Tab.Screen name="Live" component={LiveSwipeScreen} />
    </Tab.Navigator>
  );
}
