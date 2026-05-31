// Optional one-shot DB setup. The app also provisions the schema lazily on
// first request, so this is mainly for explicit/manual setup.
//
//   npm run db:setup
//
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env the same way Next does: .env.local takes precedence, then .env.
dotenv.config({ path: join(__dirname, "..", ".env.local") });
dotenv.config({ path: join(__dirname, "..", ".env") });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// This DDL is identical to db/schema.sql (kept there as documentation) and is
// idempotent, so it is safe to re-run.
try {
  await sql`
    CREATE TABLE IF NOT EXISTS releases (
      id              SERIAL PRIMARY KEY,
      name            TEXT NOT NULL,
      release_date    TIMESTAMPTZ NOT NULL,
      additional_info TEXT NOT NULL DEFAULT '',
      completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("✓ Schema applied successfully.");
} catch (err) {
  console.error("Failed to apply schema:", err.message);
  process.exit(1);
}
