import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { API_URL, AuthContext } from '../../App';

export default function StoriesScreen() {
  const { token } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [type, setType] = useState('text');
  const [stories, setStories] = useState([]);

  const loadStories = async () => {
    const res = await fetch(`${API_URL}/api/stories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setStories(data.stories || []);
  };

  useEffect(() => {
    loadStories();
  }, []);

  const postStory = async () => {
    const res = await fetch(`${API_URL}/api/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type, content })
    });
    const data = await res.json();
    if (data.story) {
      setContent('');
      loadStories();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stories (24h)</Text>
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Your story text or URL" value={content} onChangeText={setContent} />
      </View>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setType('text')}><Text style={[styles.tag, type==='text'&&styles.tagActive]}>Text</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setType('image')}><Text style={[styles.tag, type==='image'&&styles.tagActive]}>Image URL</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setType('video')}><Text style={[styles.tag, type==='video'&&styles.tagActive]}>Video URL</Text></TouchableOpacity>
        <Button title="Post" onPress={postStory} />
      </View>
      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.story}>
            <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()} • {item.type}</Text>
            <Text>{item.content}</Text>
            <TouchableOpacity onPress={() => {/* TODO: download to device with expo-file-system */}}>
              <Text style={styles.download}>Download</Text>
            </TouchableOpacity>
          </View>
        )}
        style={{ flex: 1, width: '100%', marginTop: 8 }}
      />
      <Button title="Refresh" onPress={loadStories} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 20, fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  tag: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 16, marginRight: 6 },
  tagActive: { backgroundColor: '#e0e7ff', borderColor: '#6366f1' },
  story: { padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginVertical: 6 },
  meta: { fontSize: 12, color: '#666' },
  download: { color: '#2563eb', marginTop: 6 }
});
