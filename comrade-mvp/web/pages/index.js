import React, { useContext, useState } from 'react';
import { API_URL, AuthContext } from './_app';

export default function Home() {
  const { token, setToken, setUserId, userId } = useContext(AuthContext);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');

  const requestOtp = async () => {
    await fetch(`${API_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    alert('OTP requested (use any 6 digits)');
  };

  const verifyOtp = async () => {
    const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code, username })
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      setUserId(data.userId);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Comrade Web</h1>
      {!token ? (
        <div style={{ maxWidth: 400 }}>
          <h3>Login</h3>
          <input placeholder="phone" value={phone} onChange={e=>setPhone(e.target.value)} style={{ width:'100%', padding:8, marginBottom:8 }} />
          <input placeholder="username (optional)" value={username} onChange={e=>setUsername(e.target.value)} style={{ width:'100%', padding:8, marginBottom:8 }} />
          <button onClick={requestOtp}>Request OTP</button>
          <div style={{ height: 12 }} />
          <input placeholder="OTP (any)" value={code} onChange={e=>setCode(e.target.value)} style={{ width:'100%', padding:8, marginBottom:8 }} />
          <button onClick={verifyOtp}>Verify</button>
        </div>
      ) : (
        <div>
          <p>Logged in as {userId}</p>
          <a href="/chat">Go to Chat</a> | <a href="/stories">Stories</a>
        </div>
      )}
    </div>
  );
}
