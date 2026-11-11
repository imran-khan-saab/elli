# Elli – Authentication & Authorization

Elli uses a simple local authentication system with JWT tokens. Designed for single-machine / single-user or small trusted multi-user desktop use.

---

## 1. Goals

- Protect all agent and tool endpoints.
- Support basic roles (`admin`, `user`).
- Work fully offline (no external identity provider required for core use).
- Optional future extension to SSO later.

---

## 2. User Model

See `database.md` → `users` table.

- Passwords hashed with **argon2** or **bcrypt** (never store plaintext).
- Default role = `user`.
- First user created during setup is `admin`.

---

## 3. JWT Strategy

- Algorithm: HS256 (or RS256 if you prefer key pairs)
- Secret: long random value from `.env` (`JWT_SECRET`)
- Access token lifetime: 24 hours (configurable)
- Refresh token: optional; can be implemented as a longer-lived token stored in DB

### Claims
```json
{
  "sub": "1",
  "username": "alex",
  "role": "admin",
  "exp": 1730000000,
  "iat": 1729913600
}
```

---

## 4. Endpoints

| Method | Path                | Description                  | Auth Required |
|--------|---------------------|------------------------------|---------------|
| POST   | `/api/v1/auth/login`| Username + password → token  | No            |
| POST   | `/api/v1/auth/logout`| Invalidate token (optional) | Yes           |
| GET    | `/api/v1/auth/me`   | Current user profile         | Yes           |
| POST   | `/api/v1/auth/refresh`| Get new access token       | Yes           |

---

## 5. Protecting Routes

All routes under `/api/v1/agent/*`, `/api/v1/gatekeeper/*`, `/api/v1/workspace/*`, `/api/v1/metrics`, etc. require a valid Bearer token.

Example middleware / dependency (FastAPI style):

```python
async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_jwt(token)
    user = get_user_by_id(payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401)
    return user
```

---

## 6. Roles & Permissions

| Role   | Can do                                      |
|--------|---------------------------------------------|
| user   | All normal agent actions, own history       |
| admin  | Everything + create users, empty trash, shutdown, view all logs |

Role checks are performed inside the endpoint or via a dependency.

---

## 7. Login Flow (UI)

1. User opens Dashboard → if no valid token, show login form.
2. Submit credentials → receive `access_token`.
3. Store token in memory / secure local storage / httpOnly cookie.
4. Attach `Authorization: Bearer <token>` to every subsequent request.
5. On 401 → redirect to login.

---

## 8. Security Notes

- Never log the raw password or full JWT.
- Use HTTPS if the agent is ever exposed beyond localhost.
- Rotate `JWT_SECRET` if compromised.
- Rate-limit the login endpoint to prevent brute force.
- For pure single-user local installs you may disable auth with a config flag (not recommended for production).
