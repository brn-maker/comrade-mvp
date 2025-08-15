import React, { useContext, useEffect, useState } from 'react';
import { API_URL, AuthContext } from './_app';

export default function StoriesPage() {
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
  useEffect(() => { loadStories(); }, []);

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
    <div style={{ padding: 24 }}>
      <h2>Stories (24h)</h2>
      <div>
        <select value={type} onChange={e=>setType(e.target.value)}>
          <option value="text">Text</option>
          <option value="image">Image URL</option>
          <option value="video">Video URL</option>
        </select>
        <input placeholder="content" value={content} onChange={e=>setContent(e.target.value)} style={{ padding:8, width:400, marginLeft:8 }} />
        <button onClick={postStory} style={{ marginLeft:8 }}>Post</button>
      </div>
      <div style={{ marginTop: 16 }}>
        {stories.map(s => (
          <div key={s.id} style={{ border:'1px solid #eee', padding:10, borderRadius:8, marginBottom:8 }}>
            <div style={{ fontSize:12, color:'#777' }}>{new Date(s.createdAt).toLocaleString()} • {s.type}</div>
            <div>{s.content}</div>
            <button onClick={()=>window.open(s.content, '_blank')}>Download</button>
          </div>
        ))}
      </div>
    </div>
  );
}
