import React, { useContext, useEffect, useState } from 'react';
import { API_URL, AuthContext, SocketContext } from './_app';

export default function ChatPage() {
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
    <div style={{ padding: 24, maxWidth: 700 }}>
      <h2>Chat</h2>
      <input placeholder="peer userId" value={peerId} onChange={e=>setPeerId(e.target.value)} style={{ padding:8, width:'100%' }} />
      <button onClick={loadConv}>Load Conversation</button>
      <div style={{ height: 16 }} />
      <div style={{ border:'1px solid #ddd', borderRadius:8, padding:8, minHeight:200 }}>
        {messages.map(m => (
          <div key={m.id} style={{ textAlign: m.from === userId ? 'right' : 'left', margin: '6px 0' }}>
            <span style={{ display:'inline-block', padding:'6px 10px', borderRadius:8, background: m.from === userId ? '#d1ffd6' : '#eee' }}>{m.body}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 12 }} />
      <input placeholder="type message" value={body} onChange={e=>setBody(e.target.value)} style={{ padding:8, width:'70%' }} />
      <button onClick={sendMsg} style={{ marginLeft:8 }}>Send</button>
    </div>
  );
}
