# Elli – Architecture & Tech Stack

**Version**: 1.0  
**UI Reference**: https://ellie-ai.ai.studio/

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Elli Desktop UI                          │
│  (System Dashboard – React / Electron or CustomTkinter)      │
│  Prompt Runner · Metrics · Commands · History · Settings     │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP / IPC
┌────────────────────────────▼─────────────────────────────────┐
│                     Agent Core (Python)                      │
│  State Machine · Hybrid Router · Gatekeeper · Logging        │
└──────┬──────────────┬──────────────┬──────────────┬──────────┘
       │              │              │              │
┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼─────┐
│ Voice/STT  │ │   TTS      │ │  MCP Host  │ │  Database  │
│ Whisper    │ │ Engine     │ │  Router    │ │  SQLite    │
└────────────┘ └────────────┘ └──────┬─────┘ └────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   Tool Layer        │
                          │ filesystem · web    │
                          │ system · custom     │
                          └─────────────────────┘
```

## 2. Tech Stack

| Layer              | Technology                          | Notes |
|--------------------|-------------------------------------|-------|
| UI                 | React + Tailwind (or CustomTkinter) | Matches ellie-ai.ai.studio dashboard |
| Desktop Shell      | Electron (optional) or pure Python  | System tray support |
| Agent Core         | Python 3.11+                        | Main runtime |
| Voice (STT)        | faster-whisper                      | Local, offline capable |
| TTS                | pyttsx3 / edge-tts / Coqui          | Configurable |
| LLM Router         | MCP Host + Ollama / OpenAI-compatible | Hybrid local + cloud |
| Database           | SQLite + optional SQLAlchemy        | Local, zero-config |
| Tool Protocol      | Model Context Protocol (MCP)        | Standard tool interface |
| Packaging          | pyproject.toml + uv / pip           | Modern Python packaging |
| Logging            | structlog or logging + JSON         | Structured observability |

## 3. Folder Structure (Exportable Project)

```
desktop-elli-agent/
├── agent_workspace/              # Sandboxed user files
├── .agent_trash/                 # Soft-delete location
├── src/
│   ├── agent_core.py             # Main loop & state machine
│   ├── voice_listener.py
│   ├── tts_engine.py
│   ├── gatekeeper.py
│   ├── mcp_host.py               # Hybrid router
│   ├── database.py
│   ├── health.py
│   ├── logging_config.py
│   └── tools/
│       ├── filesystem_tool.py
│       ├── web_tool.py
│       └── system_tool.py
├── ui/                           # Dashboard (if separate)
│   ├── src/
│   └── package.json
├── mcp_config.json
├── pyproject.toml
├── requirements.txt
├── .env.example
├── README.md
└── tests/
    ├── unit/
    └── e2e/
```

## 4. Core Components

### Agent Core (`agent_core.py`)
- State machine: Idle → Listening → Planning → AwaitingConfirmation → Executing → Speaking → Error → Recovery
- Orchestrates all other modules
- Handles timeouts, retries, and graceful degradation

### Hybrid MCP Host (`mcp_host.py`)
- Decides local vs cloud model
- Plans tool sequences
- Validates tool results before next step

### Gatekeeper (`gatekeeper.py`)
- Modal / panel for Yes / No / Edit
- Progressive trust logic
- Shows exact preview of content and target path

### Tools
- All tools implement a common MCP-compatible interface
- Strict permission boundaries and path validation

### Database
- SQLite for chat_history, action_history, user_preferences, tool_logs, trusted_patterns

## 5. Data Flow (Compound Example)

1. User types/speaks command in Prompt Runner
2. STT (if voice) → text
3. Hybrid Router creates plan: `[web_tool.fetch_quotes, filesystem_tool.create_file]`
4. First tool executes → result validated
5. Gatekeeper shows full preview
6. User confirms → second tool executes inside sandbox
7. Action logged + TTS confirmation
8. UI updates metrics and history

## 6. Security Boundaries

- All file I/O restricted to `agent_workspace/` and `.agent_trash/`
- Path canonicalization + allow-list checks
- Tools cannot escalate privileges
- No automatic network writes without confirmation
- API keys stored in environment / local secret store

## 7. Deployment Modes

1. **Development**: `python -m src.agent_core`
2. **Desktop App**: Electron wrapper or PyInstaller / briefcase
3. **Background**: System tray + global hotkey
4. **Headless**: API-only mode for scripting

## 8. Scalability & Limits (v1)

- Single user, single machine
- SQLite is sufficient (WAL mode recommended)
- Tool calls are sequential by design for safety
- Large file previews are truncated in Gatekeeper with “show more” option
