# MeetPilot — Backend (Assistant) 🤖

This is the backend for the MeetPilot meeting assistant. It runs a lightweight agent that:
- Joins a call and listens for closed captions (auto-transcribed speech)
- Stores the transcript and responds to voice-activated prompts ("Hey Assistant")
- Sends chat messages and LLM responses into the meeting channel

Prerequisites
- Python 3.13+
- (Optional) Poetry for dependency management

Quick start (Windows PowerShell example)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
# install dependencies
# If you use poetry:
# poetry install
# Or with pip (if you provide a requirements.txt):
# pip install -r requirements.txt
# Or install from the project using pip
pip install .

# Optionally create a .env file with values e.g.:
# CALL_ID=meeting-demo
# STREAM_API_KEY=pk_live_XXX
# STREAM_API_SECRET=sk_live_XXX

# Run the agent
python .\main.py
```

Notes & troubleshooting
- The agent prints simple timing logs to help debug slow Q&A responses (LLM latency logs).
- If you see an error about connecting the chat user twice, see `app/hooks/useStreamClients.js` — the hook guards against redundant connect/disconnect cycles.

License
- MIT

---

If you'd like, I can add a `requirements.txt` or a `poetry.lock` file and a sample `.env.example` to make onboarding even easier.