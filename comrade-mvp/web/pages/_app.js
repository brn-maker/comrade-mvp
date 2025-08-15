import React, { useMemo, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const SocketContext = React.createContext(null);
export const AuthContext = React.createContext({ token: null, setToken: () => {}, userId: null, setUserId: () => {} });

export default function MyApp({ Component, pageProps }) {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const socket = useMemo(() => io(API_URL, { autoConnect: false }), []);

  useEffect(() => {
    if (token) {
      socket.connect();
      socket.on('connect', () => socket.emit('auth', token));
    }
    return () => socket.disconnect();
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken, userId, setUserId }}>
      <SocketContext.Provider value={socket}>
        <Component {...pageProps} />
      </SocketContext.Provider>
    </AuthContext.Provider>
  );
}
