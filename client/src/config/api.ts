// Centralized API base URL — reads from VITE_API_URL env var,
// falls back to localhost for local development.
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";
