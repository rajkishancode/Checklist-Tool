"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function NewReleaseModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const release = await api.createRelease({ name, date, additionalInfo });
      onCreated(release);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h2>New release</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="nr-name">Release name *</label>
            <input
              id="nr-name"
              type="text"
              value={name}
              placeholder="e.g. Version 1.0.1"
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="nr-date">Date *</label>
            <input
              id="nr-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="nr-info">Additional remarks / tasks</label>
            <textarea
              id="nr-info"
              value={additionalInfo}
              placeholder="Please enter any other important notes for the release"
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>
          <div className="actions-right">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Creating…" : "Create release"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
