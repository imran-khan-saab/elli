# Elli – Debugging Guide

When something breaks, follow this order.

---

## 1. Check the Obvious First

1. Is the virtual environment activated?
2. Are you in the correct directory?
3. Does `.env` exist and contain the expected keys?
4. Is the port free? (`lsof -i :8741` or `netstat`)
5. Do `agent_workspace/` and `.agent_trash/` exist and are they writable?

---

## 2. Read the Logs

Structured logs are your best friend.

```bash
# Follow live logs
tail -f logs/elli.log

# Or if using stdout
# Look for the last ERROR or exception traceback
```

Key fields to look for:
- `request_id`
- `state` (Idle, Planning, AwaitingConfirmation, …)
- `tool_name`
- `error`

---

## 3. Common Failure Modes & Fixes

| Symptom                              | Likely Cause                        | Fix |
|--------------------------------------|-------------------------------------|-----|
| 401 on every request                 | Missing / expired JWT               | Re-login |
| “Path outside sandbox”               | Path traversal or wrong workspace   | Check realpath logic & WORKSPACE_DIR |
| Gatekeeper never appears             | Tool marked `side_effect=False`     | Set correct flag on the tool |
| Local model not used                 | Ollama not running or wrong name    | `ollama list` + check config |
| Cloud model fails                    | Missing API key or rate limit       | Check `.env` and provider status |
| File created but not visible in UI   | UI not refreshing workspace list    | Call `/workspace/list` or hard refresh |
| Voice does nothing                   | Whisper model not downloaded        | First run needs network; check logs |
| Agent stuck in “Executing”           | Crash mid-action                    | Restart → recovery prompt should appear |
| Progressive trust not triggering     | Signature not normalized the same way | Log the pattern_hash and compare |

---

## 4. State Machine Debugging

Add temporary debug prints or increase log level:

```python
logger.debug("Transition", from_state=old, to_state=new, request_id=rid)
```

Useful queries:

```sql
SELECT * FROM action_history ORDER BY created_at DESC LIMIT 10;
SELECT * FROM tool_logs ORDER BY created_at DESC LIMIT 20;
```

---

## 5. Reproducing Issues Cleanly

1. Create a fresh temporary workspace:
   ```bash
   export WORKSPACE_DIR=/tmp/elli_test_ws
   export TRASH_DIR=/tmp/elli_test_trash
   export DATABASE_PATH=/tmp/elli_test.db
   ```
2. Restart the agent
3. Reproduce the exact prompt
4. Capture logs + database dump

---

## 6. Tool-Level Debugging

- Call the tool directly in a Python shell:
  ```python
  from src.tools.filesystem_tool import FilesystemTool
  tool = FilesystemTool(workspace="...")
  print(tool.execute(name="create_file", path="test.txt", content="hi"))
  ```
- Check returned `ToolResult.success` and `error`

---

## 7. UI ↔ API Mismatch

- Open browser DevTools → Network tab
- Confirm the request payload and the response status
- Verify `Authorization` header is present
- Compare with the OpenAPI / api.md contract

---

## 8. When All Else Fails

1. Reduce to the smallest possible prompt that still fails
2. Disable progressive trust and cloud model (force local)
3. Run with `ELLI_LOG_LEVEL=DEBUG`
4. Check Git history for recent changes to the failing component
5. Open an issue with: prompt, logs, Elli version, OS, and whether local or cloud was used

---

## 9. Health Endpoint

```bash
curl http://127.0.0.1:8741/api/v1/health
```

Should return something like:

```json
{
  "status": "ok",
  "state": "Idle",
  "workspace_writable": true,
  "database_ok": true,
  "local_model": "available",
  "cloud_model": "available"
}
```

If any field is false, start there.
