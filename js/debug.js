(function() {
  'use strict';

  if (!window.APP) window.APP = {};

  // ============================================
  // APP.debug - Error Handling & Debug Utilities
  // ============================================

  APP.debug = {
    showFatalError: (ctx, err, extra) => {
      if (extra === undefined) extra = "";
      document.getElementById("error-modal").classList.remove("hidden");
      document.getElementById(
        "error-log-text"
      ).value = `[THE GRAND DESIGN LOG REPORT]\nCTX: ${ctx}\nERR: ${
        err.message || err
      }\n${extra}`;
    },

    copyErrorLog: () => {
      const t = document.getElementById("error-log-text");
      t.select();
      navigator.clipboard.writeText(t.value).then(() => alert("Copied!"));
    },
  };

  // ============================================
  // Global Error Handler
  // ============================================

  window.onerror = function (msg, url, line, col, error) {
    if (window.APP && APP.debug && APP.debug.showFatalError) {
      APP.debug.showFatalError(
        "System Crash",
        error || msg,
        `Line: ${line}:${col}\nURL: ${url}`
      );
    } else {
      console.error("Fatal Error:", msg, error, `at ${url}:${line}:${col}`);
    }
    return false;
  };

  console.log("[UTILS] ✅ Debug utilities loaded");
})();
