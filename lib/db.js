import { neon } from "@neondatabase/serverless";

// Lazily create the Neon client on first query. Building/importing the app
// must not require DATABASE_URL (Next collects page data at build time), so we
// avoid calling neon() until an actual request runs.
let _sql = null;

function client() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string."
      );
    }
    // neon() returns a tagged-template query function that talks to Neon over
    // HTTPS — avoiding connection-pool exhaustion on serverless (Vercel) cold starts.
    _sql = neon(url);
  }
  return _sql;
}

// Proxy so callers can use `sql\`...\`` as a tagged template, while the real
// client is only instantiated on first use.
export const sql = (strings, ...values) => client()(strings, ...values);

let schemaReady = null;

/**
 * Lazily ensure the `releases` table exists. Runs once per server instance.
 * Makes the app zero-config to deploy: the first request provisions the schema.
 * (db/schema.sql contains the same DDL for manual setup / documentation.)
 */
export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS releases (
        id              SERIAL PRIMARY KEY,
        name            TEXT NOT NULL,
        release_date    TIMESTAMPTZ NOT NULL,
        additional_info TEXT NOT NULL DEFAULT '',
        completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.catch((err) => {
      schemaReady = null; // allow retry on next request if provisioning failed
      throw err;
    });
  }
  return schemaReady;
}
