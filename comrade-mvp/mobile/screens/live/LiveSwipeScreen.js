import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { SocketContext } from '../../App';

export default function LiveSwipeScreen() {
  const socket = useContext(SocketContext);
  const [peerId, setPeerId] = useState(null);
  const [status, setStatus] = useState('Tap "Find Next" to connect');

  useEffect(() => {
    if (!socket) return;
    const onNone = () => setStatus('No one online. Try again.');
    const onFound = ({ peerId }) => {
      setPeerId(peerId);
      setStatus(`Matched with ${peerId}. (Video TBD)`);
    };
    socket.on('match_none', onNone);
    socket.on('match_found', onFound);
    return () => {
      socket.off('match_none', onNone);
      socket.off('match_found', onFound);
    };
  }, [socket]);

  const findNext = () => {
    setStatus('Searching...');
    socket.emit('request_random_match');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comrade Live (MVP)</Text>
      <Text style={styles.subtitle}>{status}</Text>
      <Button title="Find Next" onPress={findNext} />
      {peerId && <Text style={{ marginTop: 10 }}>Connected to: {peerId}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { marginBottom: 16 }
});
