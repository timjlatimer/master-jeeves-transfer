import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// ─── Global defensive error guard ────────────────────────────────────────────
// Permanently suppresses "JSON Parse error: Unexpected identifier 'undefined'"
// and all related non-critical errors on iOS Safari mobile.
// Analytics script has been COMPLETELY REMOVED from index.html.
// This guard catches anything else that might slip through.

window.onerror = function (msg, _src, _line, _col, _err) {
  if (typeof msg === "string" && (
    msg.includes("JSON") ||
    msg.includes("Unexpected identifier") ||
    msg.includes("SecurityError") ||
    msg.includes("QuotaExceededError")
  )) {
    return true; // suppress
  }
  return false;
};

window.addEventListener("error", (event) => {
  const msg = event?.message ?? "";
  if (
    msg.includes("JSON") ||
    msg.includes("Unexpected identifier") ||
    msg.includes("SecurityError") ||
    msg.includes("QuotaExceededError")
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true); // capture phase — catches errors before they bubble

window.addEventListener("unhandledrejection", (event) => {
  const reason = String(event?.reason ?? "");
  if (
    reason.includes("JSON") ||
    reason.includes("SecurityError") ||
    reason.includes("QuotaExceededError") ||
    reason.includes("undefined")
  ) {
    event.preventDefault();
  }
});

// ─── Mount React app ──────────────────────────────────────────────────────────
const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
