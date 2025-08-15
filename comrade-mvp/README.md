# Comrade MVP (Codespaces Monorepo)

This is a **starter skeleton** for your Comrade MVP with **mobile (Expo)**, **web (Next.js)**, and a **Node.js backend** using **Socket.IO**. 
It’s designed for **GitHub Codespaces** so you can run everything in the cloud and test on your phone via **Expo Go**.

> ⚠️ Encryption is stubbed with placeholders for now (so you can ship quickly). You’ll plug in Signal Protocol later.

## What’s Included
- **backend/**: Express + Socket.IO, mock OTP login, in-memory data for users, messages, stories.
- **mobile/**: Expo React Native app with Login, Chat, Stories (24h), Live Swipe (random connect placeholder).
- **web/**: Next.js app with Login, Chat, Stories.
- **.devcontainer/**: Codespaces config.
- **Shared Instructions**: How to run each part.

## Quick Start (in Codespaces)
1. Open this folder in **GitHub Codespaces**.
2. Install deps (first time):  
   ```bash
   cd backend && npm i && cd ../mobile && npm i && cd ../web && npm i
   ```
3. Run the backend:  
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on port **4000**.
4. Run the web app (new terminal):  
   ```bash
   cd web
   npm run dev
   ```
   Web runs on port **3000**.
5. Run the mobile app (new terminal):  
   ```bash
   cd mobile
   npx expo start --tunnel
   ```
   Scan the QR with **Expo Go** on your phone to preview the app **live**.

## Environment Variables
Copy `backend/.env.example` to `backend/.env` and adjust if needed.

## Notes
- Stories are stored server-side with a 24-hour TTL simulated by a timestamp. Cleanup runs on request for simplicity.
- Live Swipe is a placeholder that pairs you with a random online user via Socket.IO (no video yet). We will integrate WebRTC (LiveKit/Agora) later.
- Device linking for web is stubbed; the same user token can be used on web + mobile.

## Next Steps (after MVP boots):
- Integrate proper E2E encryption (Signal).
- Replace in-memory data with Postgres + Redis.
- Add media storage for stories (S3/Supabase Storage).
- Add WebRTC for live video and real matching logic.
- Implement real OTP via Twilio/Firebase.
