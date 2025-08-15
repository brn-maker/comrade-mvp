import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { API_URL, AuthContext } from '../App';

export default function LoginScreen() {
  const { setToken, setUserId } = useContext(AuthContext);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');

  const requestOtp = async () => {
    await fetch(`${API_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    setStep(2);
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
    <View style={styles.container}>
      <Text style={styles.title}>Comrade</Text>
      {step === 1 ? (
        <>
          <Text>Enter phone number</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+254712345678" />
          <Text>Optional username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="nickname" />
          <Button title="Request OTP" onPress={requestOtp} />
        </>
      ) : (
        <>
          <Text>Enter OTP (any 6 digits for MVP)</Text>
          <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="123456" />
          <Button title="Verify" onPress={verifyOtp} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 24 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginVertical: 8 }
});
