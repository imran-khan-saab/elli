# Elli – Testing Plan

---

## 1. Testing Philosophy

- Unit tests for pure logic (path validation, routing rules, progressive trust, database helpers)
- Integration tests for tool + database + gatekeeper interactions
- End-to-end tests for full user flows (especially the compound “today_quotes” path)
- Manual exploratory testing against the real Dashboard UI

---

## 2. Test Layout

```
tests/
├── unit/
│   ├── test_path_validation.py
│   ├── test_router.py
│   ├── test_gatekeeper_logic.py
│   ├── test_database.py
│   └── test_auth.py
├── integration/
│   ├── test_filesystem_tool.py
│   ├── test_web_tool.py
│   └── test_mcp_host.py
└── e2e/
    ├── test_compound_quotes.py
    ├── test_soft_delete_restore.py
    └── test_voice_fallback.py
```

---

## 3. Unit Test Priorities

| Area                | What to assert |
|---------------------|----------------|
| Path validation     | Paths outside workspace are rejected; `..` attacks fail |
| Router              | Offline → local; complex request → cloud when available |
| Progressive trust   | After 3 approvals the pattern becomes trusted |
| JWT                 | Valid token accepted, expired/invalid rejected |
| Soft-delete helpers | File moves correctly and can be restored |

---

## 4. End-to-End Scenarios

### Scenario A – Happy Path Compound
1. Send prompt: “create today_quotes.txt with inspirational quotes from the web”
2. Assert status moves to `awaiting_confirmation`
3. Call confirm
4. Assert file exists in `agent_workspace/`
5. Assert action_history row with status `EXECUTED`
6. Assert TTS or final message was produced

### Scenario B – User Denies
1. Same prompt
2. Call deny
3. Assert no file created
4. Assert status `DENIED` in history

### Scenario C – Soft Delete + Restore
1. Create a file
2. Soft-delete it
3. Assert it is gone from workspace and present in trash
4. Restore
5. Assert it is back

### Scenario D – Offline Fallback
1. Simulate no network / cloud key missing
2. Send a simple prompt
3. Assert local model was used and response still returned

### Scenario E – Crash Recovery
1. Start an action
2. Kill the process mid-execution
3. Restart
4. Assert unfinished action is detected and user is offered Resume/Discard

---

## 5. Test Tools

- `pytest` + `pytest-asyncio`
- `httpx.AsyncClient` for API tests
- Temporary directories for workspace/trash (use `tmp_path` fixture)
- Mock LLM responses for deterministic unit tests
- Real Ollama only in optional integration jobs

---

## 6. CI Recommendations

- Run unit + integration on every PR
- Run e2e on main branch or nightly
- Fail if path-validation tests do not pass
- Keep test workspace isolated so parallel runs do not collide

---

## 7. Coverage Goals (v1)

- Path validation & sandbox: 100%
- Gatekeeper decision logic: > 90%
- Router decision paths: > 85%
- Critical e2e flows: all scenarios above passing
