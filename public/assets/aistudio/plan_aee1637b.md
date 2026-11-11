# Elli – Implementation Roadmap

Step-by-step plan to build the production-ready version of Elli.

---

## Phase 0 – Project Skeleton (Day 1)

- [ ] Create repository and folder structure (see architecture.md)
- [ ] Add `pyproject.toml` + `requirements.txt`
- [ ] Add `.env.example`
- [ ] Basic `README.md`
- [ ] Empty `agent_core.py` that prints “Elli starting…”

**Exit criteria**: `python -m src.agent_core` runs without error.

---

## Phase 1 – Database & Logging (Day 1–2)

- [ ] Implement `database.py` with all tables from database.md
- [ ] Add schema migration / version table
- [ ] Implement structured logging (`logging_config.py`)
- [ ] Health check module (`health.py`)

**Exit criteria**: Can create a user, insert a chat message, and write structured logs.

---

## Phase 2 – Authentication (Day 2)

- [ ] Local user table + password hashing
- [ ] JWT issue / verify / refresh endpoints
- [ ] Role support (`admin` / `user`)
- [ ] Protect all non-public endpoints

**Exit criteria**: Login returns a valid token; protected routes reject missing/invalid tokens.

---

## Phase 3 – Core Agent Loop & State Machine (Day 3–4)

- [ ] Implement full state machine in `agent_core.py`
- [ ] Basic text prompt endpoint
- [ ] Timeout and error transition handling
- [ ] Simple echo / “I received your message” response

**Exit criteria**: Can send a prompt and receive a status update through the full cycle.

---

## Phase 4 – MCP Host & Hybrid Router (Day 4–5)

- [ ] MCP host skeleton
- [ ] Local model adapter (Ollama)
- [ ] Cloud model adapter (OpenAI-compatible / Gemini)
- [ ] Routing rules (offline → local, complex → cloud)
- [ ] Tool registration system

**Exit criteria**: Router correctly chooses local or cloud and can call a dummy tool.

---

## Phase 5 – Filesystem Tool + Sandbox (Day 5–6)

- [ ] `filesystem_tool.py` with path validation
- [ ] create / read / soft-delete / restore
- [ ] Strict sandbox enforcement
- [ ] Integration with action_history

**Exit criteria**: Can create a file only inside `agent_workspace/` and restore it from trash.

---

## Phase 6 – Gatekeeper (Day 6–7)

- [ ] Gatekeeper service + API endpoints
- [ ] Preview generation
- [ ] Yes / No / Edit flow
- [ ] Progressive trust table + logic

**Exit criteria**: Any create/delete requires confirmation; progressive trust works after 3 approvals.

---

## Phase 7 – Web Tool & Compound Workflows (Day 7–8)

- [ ] `web_tool.py` with timeouts and retries
- [ ] Compound planner (fetch → create_file)
- [ ] End-to-end “today_quotes” example

**Exit criteria**: Full compound flow works with Gatekeeper in the middle.

---

## Phase 8 – Voice + TTS (Day 8–9)

- [ ] faster-whisper integration
- [ ] TTS engine with fallback
- [ ] Voice prompt endpoint
- [ ] Spoken confirmations

**Exit criteria**: Can speak a command and hear a spoken reply.

---

## Phase 9 – Dashboard UI (Day 9–11)

- [ ] React (or CustomTkinter) System Dashboard matching ellie-ai.ai.studio
- [ ] Prompt Runner
- [ ] Live metrics cards
- [ ] Command list
- [ ] History and status panels

**Exit criteria**: Full visual parity with the reference UI for core screens.

---

## Phase 10 – Observability, Recovery & Polish (Day 11–12)

- [ ] Crash recovery on startup
- [ ] Metrics endpoint
- [ ] Log viewer in UI
- [ ] Preferences system
- [ ] Packaging (PyInstaller / Electron)

**Exit criteria**: Agent recovers cleanly from forced kills; metrics visible in UI.

---

## Phase 11 – Testing & Documentation (Day 12–14)

- [ ] Unit tests for tools, router, gatekeeper, database
- [ ] End-to-end tests for compound flows
- [ ] Complete all remaining markdown docs
- [ ] Final security review of path validation and permissions

**Exit criteria**: Test suite passes; documentation is complete and consistent.
