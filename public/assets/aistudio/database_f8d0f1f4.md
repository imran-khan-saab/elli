# Elli – Database Schema

**Engine**: SQLite (WAL mode recommended)  
**File**: `agent_memory.db` (located next to the agent or in user data dir)

---

## 1. Entity Relationship Overview

```
users 1───* chat_history
users 1───* action_history
users 1───* user_preferences
users 1───* trusted_patterns
action_history 1───* tool_logs
```

## 2. Tables

### users
| Column          | Type         | Notes |
|-----------------|--------------|-------|
| id              | INTEGER PK   | Auto-increment |
| username        | TEXT UNIQUE  | Local login name |
| password_hash   | TEXT         | bcrypt / argon2 |
| role            | TEXT         | `admin`, `user` (default `user`) |
| created_at      | DATETIME     | |
| last_login      | DATETIME     | |
| is_active       | BOOLEAN      | Default 1 |

### chat_history
| Column          | Type         | Notes |
|-----------------|--------------|-------|
| id              | INTEGER PK   | |
| user_id         | INTEGER FK   | → users.id |
| role            | TEXT         | `user` / `assistant` / `system` |
| content         | TEXT         | |
| timestamp       | DATETIME     | |
| session_id      | TEXT         | Group related turns |

### action_history
| Column          | Type         | Notes |
|-----------------|--------------|-------|
| id              | INTEGER PK   | |
| user_id         | INTEGER FK   | |
| action_type     | TEXT         | `CREATE_FILE`, `DELETE_FILE`, `FETCH`, `SYSTEM`, etc. |
| target_path     | TEXT         | Relative or absolute (validated) |
| status          | TEXT         | `EXECUTED`, `DENIED`, `FAILED`, `RESTORED` |
| preview_content | TEXT         | Snapshot of what was shown in Gatekeeper |
| error_message   | TEXT         | Nullable |
| created_at      | DATETIME     | |
| restored_at     | DATETIME     | Nullable |

### user_preferences
| Column          | Type         | Notes |
|-----------------|--------------|-------|
| id              | INTEGER PK   | |
| user_id         | INTEGER FK   | |
| key             | TEXT         | e.g. `voice_speed`, `preferred_model`, `theme` |
| value           | TEXT         | JSON or plain string |
| updated_at      | DATETIME     | |

### trusted_patterns
| Column          | Type         | Notes |
|-----------------|--------------|-------|
| id              | INTEGER PK   | |
| user_id         | INTEGER FK   | |
| pattern_hash    | TEXT         | Hash of normalized action signature |
| action_type     | TEXT         | |
| description     | TEXT         | Human readable |
| approval_count  | INTEGER      | How many times approved |
| last_approved   | DATETIME     | |
| is_active       | BOOLEAN      | User can revoke |

### tool_logs
| Column          | Type         | Notes |
|-----------------|--------------|-------|
| id              | INTEGER PK   | |
| action_id       | INTEGER FK   | → action_history.id (nullable for pure tool calls) |
| tool_name       | TEXT         | `web_tool`, `filesystem_tool`, etc. |
| arguments       | TEXT         | JSON |
| result_summary  | TEXT         | Truncated result |
| latency_ms      | INTEGER      | |
| success         | BOOLEAN      | |
| created_at      | DATETIME     | |

### system_health (optional, for metrics history)
| Column          | Type         | Notes |
|-----------------|--------------|-------|
| id              | INTEGER PK   | |
| cpu_percent     | REAL         | |
| memory_used_mb  | REAL         | |
| disk_free_gb    | REAL         | |
| llm_latency_ms  | INTEGER      | |
| recorded_at     | DATETIME     | |

## 3. Indexes

```sql
CREATE INDEX idx_chat_user_time ON chat_history(user_id, timestamp);
CREATE INDEX idx_action_user_time ON action_history(user_id, created_at);
CREATE INDEX idx_action_status ON action_history(status);
CREATE INDEX idx_trusted_user ON trusted_patterns(user_id, is_active);
CREATE INDEX idx_tool_logs_action ON tool_logs(action_id);
```

## 4. Soft-Delete Strategy

- File is moved from `agent_workspace/` → `.agent_trash/` with original relative path preserved.
- `action_history` row status set to `RESTORED` or a new restore action is logged.
- Trash cleanup can be scheduled (e.g. older than 30 days) as a background job.

## 5. Migration Notes

- Use a simple version table (`schema_version`) for future migrations.
- All timestamps stored in UTC.
- Foreign keys enabled (`PRAGMA foreign_keys = ON`).
