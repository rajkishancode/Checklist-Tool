import { NextResponse } from "next/server";
import { getRelease, updateRelease, deleteRelease } from "@/lib/releases";

export const dynamic = "force-dynamic";

function parseId(params) {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /api/releases/:id -> single release
export async function GET(_request, { params }) {
  const id = parseId(await params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const release = await getRelease(id);
    if (!release) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(release);
  } catch (err) {
    console.error("GET /api/releases/:id", err);
    return NextResponse.json({ error: "Failed to load release" }, { status: 500 });
  }
}

// PATCH /api/releases/:id -> partial update
// body: { name?, date?, additionalInfo?, completedSteps? }
export async function PATCH(request, { params }) {
  const id = parseId(await params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch = {};
  if (typeof body.name === "string") {
    if (!body.name.trim()) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    patch.name = body.name.trim();
  }
  if (body.date !== undefined) {
    if (Number.isNaN(new Date(body.date).getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    patch.date = new Date(body.date).toISOString();
  }
  if (typeof body.additionalInfo === "string") patch.additionalInfo = body.additionalInfo;
  if (Array.isArray(body.completedSteps)) patch.completedSteps = body.completedSteps;

  try {
    const release = await updateRelease(id, patch);
    if (!release) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(release);
  } catch (err) {
    console.error("PATCH /api/releases/:id", err);
    return NextResponse.json({ error: "Failed to update release" }, { status: 500 });
  }
}

// DELETE /api/releases/:id
export async function DELETE(_request, { params }) {
  const id = parseId(await params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const ok = await deleteRelease(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/releases/:id", err);
    return NextResponse.json({ error: "Failed to delete release" }, { status: 500 });
  }
}
