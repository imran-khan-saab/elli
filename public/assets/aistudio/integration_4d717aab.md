# Elli – External Integrations

How Elli connects to models, storage, and other services.

---

## 1. Language Models

### Local (Preferred)
- **Provider**: Ollama
- **Default model**: `llama3.2` (or any tool-calling capable model)
- **Config**: `OLLAMA_BASE_URL`, `LOCAL_MODEL_NAME`
- **When used**: offline, simple requests, privacy-sensitive tasks

### Cloud
- **OpenAI-compatible** (OpenAI, Groq, Together, Fireworks, etc.)
- **Gemini** (via Google AI Studio or Vertex)
- **Config**: `OPENAI_API_KEY` / `GEMINI_API_KEY`
- **When used**: complex multi-step reasoning, when local confidence is low

### Switching Logic
See `agent.md` and `mcp.md` for routing rules.

---

## 2. Speech-to-Text

- **Primary**: `faster-whisper` (local)
- Model size configurable (`tiny`, `base`, `small`, `medium`)
- First run downloads the model
- Fallback: user types instead of speaking

---

## 3. Text-to-Speech

Options (configurable):
- `pyttsx3` – fully offline, basic quality
- `edge-tts` – good quality, requires network
- Coqui / Piper – high quality local

TTS failures never block the main action; they only skip the spoken reply.

---

## 4. Storage

| Purpose              | Technology      | Location |
|----------------------|-----------------|----------|
| Agent memory         | SQLite          | `agent_memory.db` |
| User files           | Local filesystem| `./agent_workspace/` |
| Soft-deleted files   | Local filesystem| `./.agent_trash/` |
| Logs                 | Structured files + optional DB | `logs/` |
| Secrets              | Environment variables / `.env` | Never committed |

No cloud object storage is required for core functionality.

Optional future:
- S3-compatible backup of workspace
- Encrypted local vault for sensitive notes

---

## 5. HTTP Client

- `httpx` (async) for web tool and model API calls
- Strict timeouts
- Automatic retries for transient errors (429, 5xx)
- User-Agent identifies Elli

---

## 6. Optional Future Integrations

- **Calendar / Email**: via connected connectors (not in v1 core)
- **Git**: summarize commits, create files in repo (still sandboxed)
- **Browser automation**: Playwright (heavily gated)
- **Notification center**: OS-level notifications for long-running tasks

All new integrations must:
1. Be registered as MCP tools
2. Declare whether they have side effects
3. Go through Gatekeeper when appropriate
4. Respect the sandbox and permission model

---

## 7. Secrets Management

- All keys live in `.env` or OS keychain
- Never logged
- Never sent to the model in prompts
- `.env` is in `.gitignore`
