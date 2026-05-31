"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate, STATUS_LABELS } from "@/lib/format";
import NewReleaseModal from "@/components/NewReleaseModal";

export default function ReleasesListPage() {
  const [releases, setReleases] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  async function load() {
    try {
      setReleases(await api.listReleases());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(release) {
    if (!confirm(`Delete "${release.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteRelease(release.id);
      setReleases((cur) => cur.filter((r) => r.id !== release.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">All releases</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          New release +
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {releases === null && !error && <p className="muted">Loading…</p>}

      {releases !== null && releases.length === 0 && (
        <p className="empty">No releases yet. Create your first one!</p>
      )}

      {releases !== null && releases.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Release</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {releases.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{formatDate(r.date)}</td>
                  <td>
                    <span className={`status ${r.status}`}>{STATUS_LABELS[r.status]}</span>
                  </td>
                  <td className="row-actions">
                    <Link href={`/releases/${r.id}`}>View</Link>
                  </td>
                  <td className="row-actions">
                    <button className="danger" onClick={() => handleDelete(r)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <NewReleaseModal
          onClose={() => setShowModal(false)}
          onCreated={(release) => {
            setShowModal(false);
            setReleases((cur) => (cur ? [release, ...cur] : [release]));
          }}
        />
      )}
    </div>
  );
}
