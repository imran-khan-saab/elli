# Elli – Feature Implementation Guides

Step-by-step instructions for building each major feature.

---

## 1. Prompt Runner (Text)

1. Create API endpoint `POST /api/v1/agent/prompt`.
2. Accept `{ "text": "...", "session_id": "..." }`.
3. Pass text into the agent state machine.
4. Return `request_id` and current status.
5. UI: text input + Run button + quick suggestion chips (match ellie-ai.ai.studio).

## 2. Voice Input (Push-to-Talk / Whisper)

1. Integrate `faster-whisper`.
2. Endpoint `POST /api/v1/agent/voice` accepts audio file or stream.
3. Transcribe → feed text into the same prompt pipeline.
4. Show waveform or listening indicator in the UI.
5. Fallback: if transcription fails, ask user to type instead.

## 3. Hybrid Router

1. Implement two adapters: `LocalModelAdapter` (Ollama) and `CloudModelAdapter`.
2. Routing logic:
   - No internet or `prefer_local=true` → local
   - Simple intent + high local confidence → local
   - Complex / multi-step / web needed → cloud
3. Always return a structured plan of tool calls.

## 4. Gatekeeper

1. When a side-effecting tool is about to run, pause the state machine.
2. Store pending action (tools + preview content + target path).
3. Expose `GET /gatekeeper/pending` and confirm/deny/edit endpoints.
4. UI: modal or side panel with Yes / No / Edit buttons and content preview.
5. After 3 identical approvals, offer “Remember this”.

## 5. Filesystem Tool (Sandbox)

1. All paths resolved with `os.path.realpath` and checked against workspace root.
2. Methods: `create_file`, `read_file`, `soft_delete_file`, `restore_file`.
3. Soft-delete = `shutil.move` into `.agent_trash/` preserving relative structure.
4. Log every operation in `action_history`.

## 6. Web / Fetch Tool

1. Use `httpx` or `aiohttp` with strict timeouts (e.g. 15 s).
2. Retry transient failures (max 2–3).
3. Return clean text / Markdown.
4. Never write to disk itself – only return data.

## 7. Compound Workflow Example (“today_quotes”)

1. Router produces plan: `[fetch_quotes, create_file]`.
2. Execute fetch → validate result.
3. Show Gatekeeper with both actions and full content preview.
4. On Yes → execute create_file.
5. Speak confirmation and update UI.

## 8. Soft-Delete & Restore

1. `soft_delete_file` moves file and writes action record.
2. `restore` moves it back and updates status.
3. UI: Trash list + Restore button.
4. Optional background job to purge old trash.

## 9. System Metrics Dashboard

1. Endpoint `GET /api/v1/metrics` returns CPU, memory, disk, LLM latency.
2. UI cards matching the reference (CPU Load, Memory, Free Disk, LLM Engine).
3. Poll every 2–5 seconds while dashboard is open.

## 10. Progressive Trust

1. Normalize action signature (tool + key arguments).
2. Store hash + approval count in `trusted_patterns`.
3. When count ≥ 3, show “Remember this?” option.
4. If trusted and still active, skip Gatekeeper but still log.

## 11. TTS Feedback

1. After successful or failed actions, call TTS engine.
2. Keep messages short.
3. Fallback to visual-only if TTS fails.

## 12. Crash Recovery

1. On startup, query `action_history` for rows with status `EXECUTING` or incomplete.
2. Present user with “Resume / Discard” choices.
3. Clean up any partial files if Discard is chosen.
