import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // Include cookies in requests for authentication
  // CSRF mitigation: the backend requires this header on mutating requests. A
  // cross-site form/img/navigation can't set a custom header, so it's forced into a
  // CORS preflight the backend's allowlist rejects. (See server requireXHR middleware.)
  headers: { "X-Requested-With": "XMLHttpRequest" },
});