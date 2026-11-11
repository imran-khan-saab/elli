# Elli – Personal Desktop AI Assistant

**Elli** is a local-first, voice-enabled desktop AI assistant that safely manages files, fetches information, and runs multi-step workflows on your machine — with human confirmation before every important action.

UI inspired by: [ellie-ai.ai.studio](https://ellie-ai.ai.studio/)

---

## Features

- Natural language Prompt Runner (text + voice)
- Hybrid local + cloud reasoning (Ollama / Gemini / OpenAI-compatible)
- Gatekeeper intercept (Yes / No / Edit) before any write or system action
- Soft-delete + one-click restore
- Compound workflows (e.g. fetch quotes → save to file)
- System Dashboard with live metrics (CPU, memory, disk, LLM latency)
- Structured logging and crash recovery
- Progressive trust for repeated safe actions
- Full exportable Python codebase

---

## Quick Start

```bash
# 1. Clone / extract the project
cd desktop-elli-agent

# 2. Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 3. Install
pip install -e .

# 4. Copy environment file
cp .env.example .env
# Edit .env with your API keys (optional for pure local mode)

# 5. Run
python -m src.agent_core
```

Open the Dashboard at `http://127.0.0.1:8741` (or the Electron window if packaged).

---

## Documentation Index

| Document            | Purpose                                      |
|---------------------|----------------------------------------------|
| PRD.md              | Full product requirements                    |
| architecture.md     | Tech stack & folder structure                |
| database.md         | Tables and relationships                     |
| api.md              | All HTTP endpoints                           |
| agent.md            | AI rules & guardrails                        |
| plan.md             | Step-by-step implementation roadmap          |
| setup.md            | Detailed local setup                         |
| features.md         | How to build each feature                    |
| authentication.md   | Login, JWT, roles                            |
| mcp.md              | Model Context Protocol & tools               |
| integration.md      | OpenAI, storage, external services           |
| testing.md          | Unit & end-to-end test plan                  |
| debugging.md        | How to find and fix errors                   |

---

## Project Structure

See `architecture.md` for the complete layout.

Key directories:
- `agent_workspace/` – safe place for files Elli creates
- `.agent_trash/` – soft-deleted files
- `src/` – all Python agent code
- `tests/` – unit and e2e tests

---

## Safety Model

1. Every file write / delete / system command goes through Gatekeeper.
2. All paths are validated against the sandbox.
3. Actions are logged and can be undone.
4. Progressive trust reduces friction only after repeated explicit approvals.

---

## License

MIT (or your chosen license)

---

## Credits

Built according to the production-ready Elli architecture plan.  
UI reference: https://ellie-ai.ai.studio/
