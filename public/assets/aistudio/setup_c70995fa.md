# Elli – Local Setup Guide

Step-by-step instructions to run Elli on your machine.

---

## 1. Prerequisites

- Python 3.11 or 3.12
- Git
- (Optional) Ollama for local models → https://ollama.com
- (Optional) Node.js 20+ if building the React Dashboard
- FFmpeg (for some audio pipelines)

### System packages (examples)

**Ubuntu / Debian**
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv ffmpeg
```

**macOS (Homebrew)**
```bash
brew install python@3.11 ffmpeg
```

**Windows**
- Install Python from python.org (check “Add to PATH”)
- Install FFmpeg and add to PATH

---

## 2. Clone / Extract Project

```bash
cd /path/to/your/projects
# if from git
git clone <repo-url> desktop-elli-agent
cd desktop-elli-agent
```

---

## 3. Virtual Environment

```bash
python -m venv .venv

# Linux / macOS
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

---

## 4. Install Dependencies

```bash
pip install --upgrade pip
pip install -e .
# or
pip install -r requirements.txt
```

---

## 5. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Required for cloud models (leave empty for pure local)
OPENAI_API_KEY=
GEMINI_API_KEY=

# Local model
OLLAMA_BASE_URL=http://127.0.0.1:11434
LOCAL_MODEL_NAME=llama3.2

# Agent
ELLI_HOST=127.0.0.1
ELLI_PORT=8741
WORKSPACE_DIR=./agent_workspace
TRASH_DIR=./.agent_trash
DATABASE_PATH=./agent_memory.db

# Security
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRE_MINUTES=1440
```

---

## 6. Initialize Database

```bash
python -m src.database init
# or the agent will auto-create tables on first run
```

Create the first admin user (if required by your setup script):

```bash
python -m src.database create-user --username alex --password 'your-secure-password' --role admin
```

---

## 7. (Optional) Pull Local Model

```bash
ollama pull llama3.2
# or any other model you prefer
```

---

## 8. Run the Agent

```bash
python -m src.agent_core
```

You should see:
```
Elli Agent starting on http://127.0.0.1:8741
Database ready
Workspace ready
State: Idle
```

---

## 9. Open the Dashboard

- If using the React UI: `cd ui && npm install && npm run dev`
- Or open `http://127.0.0.1:8741` if the agent serves a simple UI
- Or launch the packaged Electron / desktop app

---

## 10. First Test

In the Prompt Runner type:

```
create a file named hello.txt with the content "Hello from Elli"
```

You should see the Gatekeeper appear. Click **Yes**.  
Check `agent_workspace/hello.txt`.

---

## 11. Common Issues

| Problem                    | Solution |
|---------------------------|----------|
| `ModuleNotFoundError`     | Make sure venv is activated and `pip install -e .` was run |
| Port already in use       | Change `ELLI_PORT` in `.env` |
| Whisper model download    | First run downloads the model; needs internet once |
| Ollama connection refused | Start Ollama (`ollama serve`) |
| Permission denied on files| Ensure the process can write to `agent_workspace/` |

---

## 12. Development Mode

```bash
# Auto-reload (if using uvicorn or similar)
uvicorn src.api:app --reload --port 8741
```

See `debugging.md` for more help when things break.
