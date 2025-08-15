import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { AuthContext } from '../../App';
import { API_URL } from '../../App';
import { SocketContext } from '../../App';

export default function ChatScreen() {
  const { token, userId } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [peerId, setPeerId] = useState('');
  const [body, setBody] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const onMessage = (msg) => {
      if (msg.from === peerId || msg.to === peerId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on('message', onMessage);
    return () => socket.off('message', onMessage);
  }, [peerId, socket]);

  const loadConv = async () => {
    if (!peerId) return;
    const res = await fetch(`${API_URL}/api/messages/${peerId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setMessages(data.messages || []);
  };

  const sendMsg = async () => {
    if (!peerId || !body) return;
    const res = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ to: peerId, body })
    });
    const data = await res.json();
    if (data.msg) setMessages((prev) => [...prev, data.msg]);
    setBody('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DM (enter peer userId)</Text>
      <TextInput style={styles.input} value={peerId} onChangeText={setPeerId} placeholder="peer userId" />
      <Button title="Load Conversation" onPress={loadConv} />
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.from === userId ? styles.me : styles.them]}>
            <Text style={styles.msg}>{item.body}</Text>
          </View>
        )}
        style={{ flex: 1, width: '100%', marginVertical: 8 }}
      />
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 1 }]} value={body} onChangeText={setBody} placeholder="Type message" />
        <Button title="Send" onPress={sendMsg} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 20, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginVertical: 8 },
  bubble: { padding: 10, marginVertical: 4, borderRadius: 8, maxWidth: '80%' },
  me: { backgroundColor: '#d1ffd6', alignSelf: 'flex-end' },
  them: { backgroundColor: '#eee', alignSelf: 'flex-start' },
  msg: { fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 }
});
