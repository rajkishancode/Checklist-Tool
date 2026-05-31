import { NextResponse } from "next/server";
import { listReleases, createRelease } from "@/lib/releases";

export const dynamic = "force-dynamic"; // never cache; always hit the DB

// GET /api/releases -> list all releases
export async function GET() {
  try {
    const releases = await listReleases();
    return NextResponse.json(releases);
  } catch (err) {
    console.error("GET /api/releases", err);
    return NextResponse.json({ error: "Failed to load releases" }, { status: 500 });
  }
}

// POST /api/releases -> create a release { name, date, additionalInfo? }
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const date = body.date;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!date || Number.isNaN(new Date(date).getTime())) {
    return NextResponse.json({ error: "A valid date is required" }, { status: 400 });
  }

  try {
    const release = await createRelease({
      name,
      date: new Date(date).toISOString(),
      additionalInfo: typeof body.additionalInfo === "string" ? body.additionalInfo : "",
    });
    return NextResponse.json(release, { status: 201 });
  } catch (err) {
    console.error("POST /api/releases", err);
    return NextResponse.json({ error: "Failed to create release" }, { status: 500 });
  }
}
