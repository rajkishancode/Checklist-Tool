import { sql, ensureSchema } from "./db";
import { computeStatus, sanitizeSteps } from "./steps";

// Shape a DB row into the JSON object the API/UI consume, including the
// derived status (which is never stored — always computed from the steps).
function serialize(row) {
  const completedSteps = Array.isArray(row.completed_steps)
    ? row.completed_steps
    : [];
  return {
    id: row.id,
    name: row.name,
    date: row.release_date,
    additionalInfo: row.additional_info ?? "",
    completedSteps,
    status: computeStatus(completedSteps),
    createdAt: row.created_at,
  };
}

export async function listReleases() {
  await ensureSchema();
  const rows = await sql`
    SELECT * FROM releases ORDER BY release_date DESC, id DESC
  `;
  return rows.map(serialize);
}

export async function getRelease(id) {
  await ensureSchema();
  const rows = await sql`SELECT * FROM releases WHERE id = ${id}`;
  return rows.length ? serialize(rows[0]) : null;
}

export async function createRelease({ name, date, additionalInfo }) {
  await ensureSchema();
  const rows = await sql`
    INSERT INTO releases (name, release_date, additional_info)
    VALUES (${name}, ${date}, ${additionalInfo ?? ""})
    RETURNING *
  `;
  return serialize(rows[0]);
}

// Partial update: only the provided fields are changed. COALESCE keeps the
// existing value when a field is omitted (passed as null).
export async function updateRelease(id, { name, date, additionalInfo, completedSteps }) {
  await ensureSchema();
  const steps =
    completedSteps === undefined ? null : JSON.stringify(sanitizeSteps(completedSteps));
  const rows = await sql`
    UPDATE releases SET
      name            = COALESCE(${name ?? null}, name),
      release_date    = COALESCE(${date ?? null}, release_date),
      additional_info = COALESCE(${additionalInfo ?? null}, additional_info),
      completed_steps = COALESCE(${steps}::jsonb, completed_steps)
    WHERE id = ${id}
    RETURNING *
  `;
  return rows.length ? serialize(rows[0]) : null;
}

export async function deleteRelease(id) {
  await ensureSchema();
  const rows = await sql`DELETE FROM releases WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
