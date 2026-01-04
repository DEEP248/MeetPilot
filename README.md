# MeetPilot 🧭

MeetPilot is a lightweight demo of a Smart Video Assistant built with Stream Video + Stream Chat, and a Realtime LLM backend for live transcription and Q&A.

Features
- ✅ Live video & chat using Stream
- ✅ Real-time captions and transcripts
- ✅ Meeting assistant ("Hey Assistant") for quick Q&A and meeting summaries
- ✅ Modern dark UI with responsive behavior

Quick start 🚀

Prerequisites
- Node.js (>=18) and npm/yarn/pnpm
- Python 3.13+ (backend uses `pyproject.toml`)
- A GetStream account and API key (for video/chat) — set as env vars (see below)

1) Clone the repo

```bash
git clone https://github.com/YOUR_USER/YOUR_REPO.git
cd YOUR_REPO
```

2) Backend (Python)

```powershell
# Windows (PowerShell)
cd backend
python -m venv .venv
.\.venv\Scripts\activate
# install dependencies (use poetry if you prefer):
# poetry install
pip install -r requirements.txt  # if you keep a requirements file
# or install from pyproject (pip should read pyproject metadata):
pip install .
# Run the assistant (example)
python .\main.py
```

3) Frontend (Next.js)

```bash
cd meetpilot
npm install
# Create your .env.local from .env.example (see repo) and add your Stream keys
npm run dev
# Open http://localhost:3000
```

Environment variables (example)
- backend/.env
  - CALL_ID (optional, random generated if missing)
  - STREAM_API_KEY, STREAM_API_SECRET (as required by your vision_agents/getstream setup)
- meetpilot/.env.local
  - NEXT_PUBLIC_STREAM_API_KEY
  - any other NEXT_PUBLIC_* keys your project expects

Troubleshooting & tips ⚠️
- If you see: "Use client.disconnect() before trying to connect as a different user", check `app/hooks/useStreamClients.js` — the hook handles safe reconnects.
- Strict Mode (React dev) can run effects twice; the hooks in this repo guard against double joins/disconnects.

Contributing
- Feel free to open issues or PRs — document your changes and keep commits small.

License
- MIT

---

If you'd like, I can also add a `setup.sh` / `setup.ps1` script to automate environment scaffolding.