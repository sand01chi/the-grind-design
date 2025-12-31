(function() {
  'use strict';

  if (!window.APP) window.APP = {};

  // ============================================
  // APP.cardio - Cardio Exercise Management
  // ============================================

  APP.cardio = {
    setDuration: (sessionId, exerciseIdx, minutes) => {
      LS_SAFE.set(`${sessionId}_ex${exerciseIdx}_duration`, minutes);
      window.APP.nav.loadWorkout(sessionId);
    },

    validateHR: (sessionId, exerciseIdx, hr) => {
      LS_SAFE.set(`${sessionId}_ex${exerciseIdx}_hr`, hr);

      const profile = LS_SAFE.getJSON("profile", {});
      const age = profile.a || 30;
      const maxHR = 220 - age;
      const zone2Lower = Math.round(maxHR * 0.6);
      const zone2Upper = Math.round(maxHR * 0.7);

      const statusEl = document.getElementById(
        `hr-status-${sessionId}-${exerciseIdx}`
      );
      if (!statusEl) return;

      const hrVal = parseInt(hr);
      if (!hr || isNaN(hrVal)) {
        statusEl.innerHTML = `Target: ${zone2Lower}-${zone2Upper} bpm (Zone 2)`;
        statusEl.className = "text-xs text-slate-400";
        return;
      }

      if (hrVal >= zone2Lower && hrVal <= zone2Upper) {
        statusEl.innerHTML = `✅ Zone 2 (${zone2Lower}-${zone2Upper} bpm)`;
        statusEl.className = "text-xs hr-zone-valid";
      } else if (hrVal >= zone2Lower - 5 && hrVal <= zone2Upper + 5) {
        statusEl.innerHTML = `⚠️ Near Zone 2 (Target: ${zone2Lower}-${zone2Upper})`;
        statusEl.className = "text-xs hr-zone-warning";
      } else {
        statusEl.innerHTML = `❌ Outside Zone 2 (Target: ${zone2Lower}-${zone2Upper})`;
        statusEl.className = "text-xs hr-zone-invalid";
      }
    },

    selectNote: (sessionId, exerciseIdx, note) => {
      LS_SAFE.set(`${sessionId}_ex${exerciseIdx}_cardio_note`, note);
      window.APP.nav.loadWorkout(sessionId);
    },

    toggleComplete: (sessionId, exerciseIdx, complete) => {
      if (complete) {
        const duration = LS_SAFE.get(
          `${sessionId}_ex${exerciseIdx}_duration`
        );
        const hr = LS_SAFE.get(`${sessionId}_ex${exerciseIdx}_hr`);

        if (!duration || !hr) {
          alert("Please fill Duration and Heart Rate before completing");
          return;
        }
      }

      LS_SAFE.set(
        `${sessionId}_ex${exerciseIdx}_completed`,
        complete.toString()
      );
      window.APP.nav.loadWorkout(sessionId);
    },
  };

  // ============================================
  // APP.timer - Workout Timer Utilities
  // ============================================

  APP.timer = {
    startTime: 0,
    start: (s) => {},
    stop: () => {},
  };

  // ============================================
  // APP.showStorageStats - LocalStorage Stats
  // ============================================

  APP.showStorageStats = () => {
    const stats = LS_SAFE.getStats();
    document.getElementById("stat-items").innerText = stats.items;
    document.getElementById("stat-size").innerText = stats.sizeKB + " KB";
    document.getElementById("stat-usage").innerText = stats.usage;

    const usagePercent = parseFloat(stats.usage);
    const bar = document.getElementById("usage-bar");
    bar.style.width = usagePercent + "%";

    if (usagePercent > 80) {
      bar.className = "bg-red-500 h-full transition-all";
    } else if (usagePercent > 50) {
      bar.className = "bg-yellow-500 h-full transition-all";
    } else {
      bar.className = "bg-emerald-500 h-full transition-all";
    }

    console.log("Storage Stats:", stats);
  };

  console.log("[CARDIO] ✅ Cardio, Timer & Storage Stats loaded");
})();
