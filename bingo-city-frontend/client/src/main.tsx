import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// ─── Global defensive error guard ────────────────────────────────────────────
// Prevents "JSON Parse error: Unexpected identifier 'undefined'" and similar
// uncaught errors (from analytics scripts, service workers, etc.) from crashing
// the React app on mobile browsers (especially iOS Safari).
window.addEventListener("error", (event) => {
  const msg = event?.message ?? "";
  // Suppress known non-critical third-party script errors
  if (
    msg.includes("JSON Parse error") ||
    msg.includes("Unexpected identifier") ||
    msg.includes("undefined") && event.filename?.includes("umami") ||
    msg.includes("SecurityError") // iOS private browsing localStorage
  ) {
    event.preventDefault();
    // Don't re-throw — these are non-critical analytics/storage errors
    return true;
  }
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = String(event?.reason ?? "");
  if (
    reason.includes("JSON Parse") ||
    reason.includes("SecurityError") ||
    reason.includes("QuotaExceededError")
  ) {
    event.preventDefault();
    return;
  }
});

// ─── Mount React app ──────────────────────────────────────────────────────────
const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
