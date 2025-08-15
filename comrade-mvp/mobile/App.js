import React, { useEffect, useState, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import { io } from 'socket.io-client';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

const Stack = createNativeStackNavigator();

export const SocketContext = React.createContext(null);
export const AuthContext = React.createContext({ token: null, setToken: () => {}, userId: null, setUserId: () => {} });

export default function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const socket = useMemo(() => io(API_URL, { autoConnect: false }), []);

  useEffect(() => {
    if (token) {
      socket.connect();
      socket.on('connect', () => {
        socket.emit('auth', token);
      });
      socket.on('auth_ok', () => {});
    }
    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken, userId, setUserId }}>
      <SocketContext.Provider value={socket}>
        <NavigationContainer>
          <Stack.Navigator>
            {!token ? (
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            ) : (
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SocketContext.Provider>
    </AuthContext.Provider>
  );
}
