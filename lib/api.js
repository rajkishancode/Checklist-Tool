// Tiny browser-side API client. All UI <-> server communication goes through
// these REST calls against /api/releases.

async function request(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  listReleases: () => request("/api/releases"),
  getRelease: (id) => request(`/api/releases/${id}`),
  createRelease: (data) =>
    request("/api/releases", { method: "POST", body: JSON.stringify(data) }),
  updateRelease: (id, data) =>
    request(`/api/releases/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteRelease: (id) => request(`/api/releases/${id}`, { method: "DELETE" }),
};
