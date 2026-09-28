# BUILD_NOTES.md
_This document logs every phase of the AI-assisted upgrade of the Restaurant
Reservation Management System. It records what I asked, where the AI helped,
where it was wrong, and how I verified each step — as required by the
AI-Native Full Stack Developer Intern application._

---

## Phase 0 — Fix Render crash + /health endpoint

### What I asked
The Render backend was crash-looping with exit status 1. I asked the AI to
help me read the logs, find the cause, and fix it, then add a /health endpoint.

### Logs I provided
MongoDB connection error: querySrv ENOTFOUND _mongodb._tcp.cluster0.0c1js16.mongodb.net
Server running on port 10000

(repeated in a loop — Render kept restarting the process)

### Root cause found
Two issues:

1. **MongoDB Atlas free-tier auto-pause.** The cluster had paused from
   inactivity. Render's DNS SRV lookup for the cluster host failed because
   the cluster wasn't running. This was the immediate trigger.

2. **`process.exit(1)` in `config/db.js`.** When `mongoose.connect()` threw,
   the catch block called `process.exit(1)`, killing the Node process. Render
   saw the process die and restarted it, which hit the same dead cluster and
   died again → crash loop. Port binding was never the problem.

### What the AI got wrong
The AI initially said: *"Mongoose will keep retrying in the background via its
default reconnection behavior."* This is **incorrect**. Mongoose auto-reconnects
only after a connection has been established at least once. If the initial
`mongoose.connect()` fails, Mongoose does not retry automatically — it just
rejects. The AI caught and corrected this mistake when I ran the verification
step, but it should not have been in the first answer.

The AI also wrote `const mongoose = require('mongoose')` as a comment
("add this import at the top") rather than a concrete step. I missed it,
restarted, and got `{"message":"mongoose is not defined"}`. I found the
mistake, added the import, and it worked.

### Changes made

**`config/db.js`** — removed `process.exit(1)`, replaced with an explicit
retry loop using `setTimeout(connectDB, 5000)`. Added
`serverSelectionTimeoutMS: 5000` so each attempt fails fast (in 5 s) instead
of hanging for Mongoose's default 30 s.

**`server.js`** — added `const mongoose = require('mongoose')` at the top.
Added a `GET /health` endpoint that returns:
- `status: 'ok'` (server alive)
- `uptime` in seconds
- `mongo: 'connected' | 'disconnected' | 'connecting'` (from
  `mongoose.connection.readyState`)
- `timestamp` (ISO string)

Existing `/` route was left untouched.

### Why this design (interview defence)
- **Non-fatal connection error:** the server stays up and observable even
  when the DB is down. Health checks still respond. This is standard
  production behaviour — crashing the whole server because of a transient
  DB blip is too aggressive.
- **Explicit retry loop:** because Mongoose's auto-reconnect only fires after
  a first successful connection. The retry loop covers the startup failure
  case; Mongoose handles later drops after the first connect.
- **`serverSelectionTimeoutMS: 5000`:** default is 30 s. Without this, each
  retry attempt hangs for 30 s before failing, making the retry loop very
  slow to react. 5 s is a reasonable trade-off for a dev/staging environment.
- **`/health` vs `/`:** I kept the existing `/` route (which just confirms
  the API is up) and added a separate `/health` that also reports Mongo state.
  Render health checks and monitoring tools conventionally hit `/health`.

### How I verified
1. `npm start` locally → `curl http://localhost:5000/health`
2. First attempt failed: `{"message":"mongoose is not defined"}` — caught the
   missing import, fixed it.
3. Second attempt: returned
   `{"status":"ok","uptime":31.24,"mongo":"connected","timestamp":"..."}` ✓
4. Pushed to Render → redeployed → hit `https://<render-url>/health` → 200 ✓

### What I would add later
- Exponential backoff instead of fixed 5 s retry delay.
- A `/health/ready` vs `/health/live` split (Kubernetes liveness vs readiness
  probe convention) if this ever runs on k8s.
- Alert on sustained `mongo: disconnected` duration.


# Phase 1 — Backend Quality
## What I asked the AI

I asked the AI to improve the backend quality by adding request validation, better error handling, an .env.example file, rate limiting for authentication routes, and restricting CORS to my frontend URL.

## What the AI built
Added Zod validation for authentication and reservation request bodies.
Added or improved the centralized error handler with a consistent JSON error format.
Added .env.example containing the required environment variables without exposing their values.
Added rate limiting to /api/auth to protect login and registration endpoints.
Restricted CORS to my frontend URL using the ALLOWED_ORIGIN environment variable.

# Where the AI was wrong or I had to fix it

The AI's first implementation of the Zod validation response was not formatted as clean JSON; two files were empty and you had to find them with cat. Add one sentence about it..

## What I actually changed / verified

I added a separate validate.js middleware to handle Zod schemas, applied it to the relevant auth and reservation routes, improved the centralized error handler, added .env.example, configured rate limiting for /api/auth, and changed CORS to use ALLOWED_ORIGIN.

I then tested the API with valid and invalid requests to confirm that invalid input was rejected, authentication requests were rate-limited, and requests from the configured frontend origin were allowed.

## What I'd explain in an interview if asked

## Why is validate.js a separate middleware file?

I kept validation separate so the controllers don't have to contain validation logic. It makes the validation reusable across different routes and keeps the route/controller code cleaner.

## Why did the Zod error look like a nested JSON string?

The AI wrote the error formatter for Zod v3, but I had installed Zod v4 which was the current version. In v4, err.errors returns a raw string instead of an array, so the whole error dumped as escaped JSON. The fix was using err.issues instead, which is where v4 puts the array.

## Why rate limit only auth routes?

Authentication endpoints are more likely to be targeted by brute-force or automated requests, so they need stricter limits. Reservation availability can involve several legitimate requests in a short period, so applying the same strict limit there could block genuine customers.