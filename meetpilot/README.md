# MeetPilot — Frontend (Next.js) ✨

This is the MeetPilot frontend: a Next.js app that renders the meeting room, transcript panel, and UI for the meeting assistant.

Getting started (quick)

```bash
cd meetpilot
npm install
# copy .env to .env.local and add your Stream keys
npm run dev
# open http://localhost:3000
```

Environment variables
- `NEXT_PUBLIC_STREAM_API_KEY` — Stream publish key (client side)

Notes
- For full functionality (tokens, assistant), run the backend server described in the repository root before opening the frontend.
- For deployment, use `npm run build` and `npm run start` or configure Vercel for zero-config deploys.
