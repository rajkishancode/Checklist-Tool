# ReleaseCheck

A small, single-page **release checklist tool**. Create releases, tick off a
fixed set of release steps, and the status (**planned / ongoing / done**) is
computed automatically from how many steps are complete.

Built with **Next.js (App Router)** for both the SPA and the REST API, backed by
**PostgreSQL** (Neon).

> Live demo: _add your Vercel URL here after deploying (see [Deployment](#deployment))._

---

## Features

- View a list of all releases with their auto-computed status.
- Create a release (name + date required, additional info optional).
- Open a release, check/uncheck steps, edit the name/date and additional info, and save.
- Delete a release (from the list or the detail view).
- Responsive layout.

### How status works

The status is **never chosen by the user** — it is derived from the completed steps:

| Completed steps        | Status    |
| ---------------------- | --------- |
| none                   | `planned` |
| at least one (not all) | `ongoing` |
| all                    | `done`    |

The checklist steps are the same for every release and live in code
([`lib/steps.js`](lib/steps.js)) — only *which* steps are completed is stored per
release. The current steps are:

1. All relevant GitHub pull requests have been merged
2. CHANGELOG.md files have been updated
3. All tests are passing
4. Releases in GitHub created
5. Deployed in demo
6. Tested thoroughly in demo
7. Deployed in production

---

## Tech stack

- **Frontend:** Next.js 15 / React 19 (App Router, client components), plain CSS.
- **Backend:** Next.js Route Handlers (REST, JSON).
- **Database:** PostgreSQL via [Neon](https://neon.tech) using
  [`@neondatabase/serverless`](https://github.com/neondatabase/serverless) (HTTP driver,
  serverless-friendly).
- **Tests:** Node's built-in test runner.

---

## Run locally

### Prerequisites

- Node.js 18.18+ (Node 20 recommended)
- A PostgreSQL database. The easiest free option is [Neon](https://neon.tech):
  create a project and copy the **pooled** connection string.

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Configure the database connection
cp .env.example .env.local
#   then edit .env.local and set DATABASE_URL=postgresql://...

# 3. (Optional) create the table explicitly.
#    The app also creates it automatically on first request.
npm run db:setup

# 4. Start the dev server
npm run dev
```

Open <http://localhost:3000>.

### Run the tests

```bash
npm test
```

These cover the core status-computation rule (no database required).

---

## API

All endpoints return JSON. A **release** object looks like:

```json
{
  "id": 1,
  "name": "Version 1.0.1",
  "date": "2022-09-20T00:00:00.000Z",
  "additionalInfo": "Notes about the release",
  "completedSteps": ["prs_merged", "tests_passing"],
  "status": "ongoing",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

| Method   | Endpoint             | Description                  | Body                                                              |
| -------- | -------------------- | ---------------------------- | ---------------------------------------------------------------- |
| `GET`    | `/api/releases`      | List all releases            | —                                                                |
| `POST`   | `/api/releases`      | Create a release             | `{ name*, date*, additionalInfo? }`                              |
| `GET`    | `/api/releases/:id`  | Get one release              | —                                                                |
| `PATCH`  | `/api/releases/:id`  | Update a release (partial)   | `{ name?, date?, additionalInfo?, completedSteps? }`             |
| `DELETE` | `/api/releases/:id`  | Delete a release             | —                                                                |

`*` = required. `completedSteps` is an array of step keys (see
[`lib/steps.js`](lib/steps.js)); unknown keys are ignored and `status` is always
recomputed server-side.

### Examples

```bash
# Create
curl -X POST http://localhost:3000/api/releases \
  -H 'Content-Type: application/json' \
  -d '{"name":"Version 1.0.1","date":"2022-09-20","additionalInfo":"first cut"}'

# Toggle steps
curl -X PATCH http://localhost:3000/api/releases/1 \
  -H 'Content-Type: application/json' \
  -d '{"completedSteps":["prs_merged","tests_passing"]}'

# Delete
curl -X DELETE http://localhost:3000/api/releases/1
```

---

## Database schema

A single table; the fixed steps are defined in code, so no steps table is needed.
The `status` column intentionally does not exist — it is computed at read time.
See [`db/schema.sql`](db/schema.sql).

```sql
CREATE TABLE releases (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,                       -- mandatory
  release_date    TIMESTAMPTZ NOT NULL,                -- mandatory
  additional_info TEXT NOT NULL DEFAULT '',            -- optional notes
  completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,  -- array of completed step keys
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Project structure

```
app/
  layout.js                 # shared header + page shell
  page.js                   # releases list (SPA view)
  releases/[id]/page.js     # release detail / checklist (SPA view)
  api/releases/route.js     # GET list, POST create
  api/releases/[id]/route.js# GET, PATCH, DELETE
components/
  NewReleaseModal.js        # "New release" dialog
lib/
  db.js                     # Neon client + lazy schema creation
  releases.js               # data access (DB <-> API shape)
  steps.js                  # fixed steps + status computation
  api.js                    # browser fetch client
  format.js                 # date/label helpers
db/schema.sql               # database schema
scripts/setup-db.mjs        # optional one-shot schema setup
tests/steps.test.mjs        # status-rule tests
```

---

## Deployment

Deployed on **Vercel** with a **Neon** Postgres database.

1. Push this repo to GitHub.
2. Create a Neon project and copy the pooled connection string.
3. Import the repo into [Vercel](https://vercel.com/new).
4. Add an environment variable **`DATABASE_URL`** with the Neon connection string.
5. Deploy. The `releases` table is created automatically on the first request
   (or run `npm run db:setup` against the Neon URL beforehand).

> Tip: Vercel's Neon integration can set `DATABASE_URL` for you automatically.
