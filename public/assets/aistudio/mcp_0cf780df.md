# Elli – Model Context Protocol (MCP) Integration

Elli uses the **Model Context Protocol (MCP)** as the standard way to expose tools to the language model and to keep the tool layer modular.

---

## 1. Why MCP?

- Standardized tool interface
- Easy to add or swap tools without changing the core agent
- Works with both local and cloud models that support tool calling
- Clear separation between planning (router) and execution (tools)

---

## 2. MCP Host Role

The `mcp_host.py` module acts as the MCP Host:

- Registers available tools
- Receives a user request + context
- Asks the chosen LLM (local or cloud) to produce a plan of tool calls
- Executes tools sequentially (with validation between steps)
- Feeds results back to the model when needed
- Hands side-effecting actions to Gatekeeper before execution

---

## 3. Tool Interface

Every tool implements a common contract:

```python
class BaseTool:
    name: str
    description: str
    parameters: dict  # JSON Schema

    def execute(self, **kwargs) -> ToolResult:
        ...
```

`ToolResult` contains:
- `success: bool`
- `content: str | dict`
- `error: str | None`
- `side_effect: bool`  # True → must go through Gatekeeper

---

## 4. Built-in Tools

| Tool                 | Side Effect | Description |
|----------------------|-------------|-------------|
| `filesystem.create_file` | Yes     | Create file inside sandbox |
| `filesystem.read_file`   | No      | Read file from sandbox |
| `filesystem.soft_delete` | Yes     | Move to trash |
| `filesystem.restore`     | Yes     | Restore from trash |
| `web.fetch` / `web.search` | No   | Retrieve information |
| `system.open_application`| Yes    | Launch allow-listed app |
| `system.run_command`     | Yes    | Restricted shell (future) |

---

## 5. Configuration (`mcp_config.json`)

```json
{
  "tools": [
    {
      "name": "filesystem",
      "module": "src.tools.filesystem_tool",
      "enabled": true
    },
    {
      "name": "web",
      "module": "src.tools.web_tool",
      "enabled": true
    }
  ],
  "models": {
    "local": {
      "provider": "ollama",
      "model": "llama3.2",
      "base_url": "http://127.0.0.1:11434"
    },
    "cloud": {
      "provider": "openai",
      "model": "gpt-4o-mini",
      "api_key_env": "OPENAI_API_KEY"
    }
  },
  "routing": {
    "prefer_local": true,
    "offline_force_local": true
  }
}
```

---

## 6. Adding a New Tool

1. Create `src/tools/my_tool.py` implementing `BaseTool`.
2. Register it in `mcp_config.json`.
3. Add any required permission checks.
4. If the tool has side effects, set `side_effect = True` so Gatekeeper is triggered.
5. Write unit tests.
6. Restart the agent (or hot-reload if supported).

---

## 7. Sequential Execution & Validation

For compound requests the host:

1. Asks the model for a plan: list of `{tool, arguments}`
2. Executes the first tool
3. Validates the result (non-empty, expected shape)
4. If next tool has side effects → Gatekeeper
5. Continues only after confirmation
6. Returns final summary to the user

---

## 8. Security Notes

- Tools run in the same process but under strict path and permission checks.
- Never pass unsanitized user input directly into shell commands.
- Web tool should respect a domain allow-list if desired.
- All tool calls are logged in `tool_logs`.
