// Shared display helpers for the UI.

export function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Format an ISO/Date value as "YYYY-MM-DD" for <input type="date">.
export function toDateInputValue(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export const STATUS_LABELS = {
  planned: "Planned",
  ongoing: "Ongoing",
  done: "Done",
};
