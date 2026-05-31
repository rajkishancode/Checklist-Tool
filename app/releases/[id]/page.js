"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { STEPS } from "@/lib/steps";
import { toDateInputValue, STATUS_LABELS } from "@/lib/format";

export default function ReleaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [release, setRelease] = useState(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [completed, setCompleted] = useState(() => new Set());

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .getRelease(id)
      .then((r) => {
        if (!active) return;
        hydrate(r);
      })
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [id]);

  function hydrate(r) {
    setRelease(r);
    setName(r.name);
    setDate(toDateInputValue(r.date));
    setAdditionalInfo(r.additionalInfo);
    setCompleted(new Set(r.completedSteps));
  }

  function toggleStep(key) {
    setCompleted((cur) => {
      const next = new Set(cur);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    setSavedAt(null);
  }

  // Live status preview, computed the same way the server does.
  const liveStatus =
    completed.size === 0 ? "planned" : completed.size >= STEPS.length ? "done" : "ongoing";

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const updated = await api.updateRelease(id, {
        name,
        date,
        additionalInfo,
        completedSteps: Array.from(completed),
      });
      hydrate(updated);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${release?.name ?? "this release"}"? This cannot be undone.`)) return;
    try {
      await api.deleteRelease(id);
      router.push("/");
    } catch (err) {
      setError(err.message);
    }
  }

  if (!release && !error) return <p className="muted">Loading…</p>;

  return (
    <div className="card">
      <div className="card-header">
        <nav className="breadcrumb">
          <Link href="/">All releases</Link>
          <span>›</span>
          <span className="current">{release?.name ?? "Release"}</span>
        </nav>
        {release && (
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete 🗑
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {release && (
        <form onSubmit={handleSave}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="r-name">Release</label>
              <input
                id="r-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="r-date">Date</label>
              <input
                id="r-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="section-title">
            Checklist —{" "}
            <span className={`status ${liveStatus}`}>{STATUS_LABELS[liveStatus]}</span>{" "}
            <span className="muted">
              ({completed.size}/{STEPS.length})
            </span>
          </div>
          <ul className="checklist">
            {STEPS.map((step) => (
              <li key={step.key}>
                <label>
                  <input
                    type="checkbox"
                    checked={completed.has(step.key)}
                    onChange={() => toggleStep(step.key)}
                  />
                  <span>{step.label}</span>
                </label>
              </li>
            ))}
          </ul>

          <div className="field">
            <label htmlFor="r-info">Additional remarks / tasks</label>
            <textarea
              id="r-info"
              value={additionalInfo}
              placeholder="Please enter any other important notes for the release"
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>

          <div className="save-row">
            {savedAt && <span className="muted">Saved ✓</span>}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save ✓"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
