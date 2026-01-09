/**
 * The Grind Design - Core Module
 * Contains essential utilities: LS_SAFE, DT, APP initialization & core methods
 */

(function () {
  'use strict';

  // ========================================
  // LS_SAFE - Safe LocalStorage Wrapper
  // ========================================
  const LS_SAFE = {
    get: (k) => {
      try {
        const val = localStorage.getItem(k);
        return val;
      } catch (e) {
        console.error("LS Get Error:", k, e);
        return null;
      }
    },

    set: (k, v) => {
      try {
        if (!k || typeof k !== "string") {
          throw new Error("Invalid key");
        }

        localStorage.setItem(k, v);
        return true;
      } catch (e) {
        if (e.name === "QuotaExceededError") {
          alert("⚠️ Memori Penuh! Hapus beberapa data di Profil.");
        } else {
          console.error("LS Set Error:", k, e);
        }
        return false;
      }
    },

    getJSON: (k, def = null) => {
      try {
        const v = localStorage.getItem(k);
        if (!v) return def;

        const parsed = JSON.parse(v);
        return parsed;
      } catch (e) {
        console.error("LS Parse Error:", k, e);

        try {
          localStorage.removeItem(k);
          console.warn(`[AUTO-FIX] Removed corrupt data: ${k}`);
        } catch (err) {}
        return def;
      }
    },

    setJSON: (k, v) => {
      try {
        if (v === undefined) {
          throw new Error("Cannot store undefined");
        }

        const jsonStr = JSON.stringify(v);

        const sizeKB = new Blob([jsonStr]).size / 1024;
        if (sizeKB > 1024) {
          console.warn(`⚠️ Large data (${sizeKB.toFixed(2)}KB): ${k}`);
        }

        localStorage.setItem(k, jsonStr);
        return true;
      } catch (e) {
        if (e.name === "QuotaExceededError") {
          alert("Gagal menyimpan: Memori Penuh!");
        } else {
          console.error("LS JSON Error:", k, e);
        }
        return false;
      }
    },

    remove: (k) => {
      try {
        localStorage.removeItem(k);
        return true;
      } catch (e) {
        console.error("LS Remove Error:", k, e);
        return false;
      }
    },

    clear: () => {
      try {
        localStorage.clear();
        return true;
      } catch (e) {
        console.error("LS Clear Error:", e);
        return false;
      }
    },

    getStats: () => {
      let totalSize = 0;
      let itemCount = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += key.length + (value ? value.length : 0);
        itemCount++;
      }

      const sizeKB = (totalSize / 1024).toFixed(2);
      const maxKB = 5120;
      const usagePercent = ((totalSize / (maxKB * 1024)) * 100).toFixed(1);

      return {
        items: itemCount,
        sizeKB: sizeKB,
        usage: usagePercent + "%",
        remaining: (maxKB - parseFloat(sizeKB)).toFixed(2) + " KB",
      };
    },
  };

  // ========================================
  // DT - Date/Time Utilities (dayjs wrapper)
  // ========================================
  const DT = {
    formatRelative: (ts) => {
      if (!ts) return "Belum pernah";
      return typeof dayjs !== "undefined"
        ? dayjs(parseInt(ts)).fromNow()
        : new Date(parseInt(ts)).toLocaleDateString();
    },
    formatDate: (d) => {
      return typeof dayjs !== "undefined"
        ? dayjs(d).format("D MMM")
        : d.toLocaleDateString();
    },
    formatMonth: (d) => {
      return typeof dayjs !== "undefined"
        ? dayjs(d).format("MMMM YYYY")
        : d.toLocaleDateString([], {
            month: "long",
            year: "numeric",
          });
    },
  };

  // ========================================
  // APP - Main Application Object
  // ========================================
  const APP = {
    state: {
      wakeLock: null,
      focusMode: false,
      currentSessionId: "",
      spontaneousMode: false,
      currentCalDate: new Date(),
      workoutData: {},
      defaultTemplate: {
        s1: {
          label: "SESI 1",
          title: "Upper A",
          dynamic: "Arm Circles",
          exercises: [
            {
              sets: 3,
              rest: 150,
              note: "Warm Up",
              options: [
                {
                  n: "Bench Press",
                  vid: "",
                  bio: "",
                },
              ],
            },
          ],
        },
      },
    },

    core: {
      saveProgram: () =>
        LS_SAFE.setJSON("cscs_program_v10", APP.state.workoutData),

      requestWakeLock: async () => {
        try {
          if ("wakeLock" in navigator)
            APP.state.wakeLock = await navigator.wakeLock.request("screen");
        } catch (err) {}
      },

      finishSession: () => {
        try {
          const now = new Date();
          const durationMins = 45;
          let totalVol = 0,
            totalSets = 0;
          const sessId = APP.state.currentSessionId;
          const d = APP.state.workoutData[sessId];

          // V29.5 P2-009: Guard d.exercises access
          if (!d) {
            console.error("[CORE] finishSession: Session data not found for", sessId);
            window.APP.ui.showToast("Error: Session data missing", "error");
            return;
          }

          if (!d.exercises || !Array.isArray(d.exercises)) {
            console.error("[CORE] finishSession: Invalid exercises array for", sessId);
            window.APP.ui.showToast("Error: Session has no valid exercises", "error");
            return;
          }

          if (d.exercises.length === 0) {
            console.warn("[CORE] finishSession: Empty exercises array");
            window.APP.ui.showToast("Cannot finish session with no exercises", "warning");
            return;
          }

          d.exercises.forEach((ex, i) => {
            for (let j = 1; j <= ex.sets; j++) {
              const s = `${sessId}_ex${i}_s${j}`;
              const k = parseFloat(LS_SAFE.get(`${s}_k`) || 0);
              const re = parseFloat(LS_SAFE.get(`${s}_r`) || 0);
              const do_ = LS_SAFE.get(`${s}_d`) === "true";
              if (do_ && k > 0 && re > 0) {
                totalVol += k * re;
                totalSets++;
              }
            }
          });
          let inputDur = prompt(
            `Selesai Latihan?\n\nVolume: ${totalVol} kg\nSets: ${totalSets}\n\nMasukkan Durasi Latihan (menit):`,
            durationMins
          );
          if (inputDur === null) return;
          const finalDur = parseInt(inputDur) || durationMins;
          const ds = DT.formatDate(now);
          const h = LS_SAFE.getJSON("gym_hist", []);
          d.exercises.forEach((ex, i) => {
            if (ex.type === "cardio") {
              const isCompleted =
                LS_SAFE.get(`${sessId}_ex${i}_completed`) === "true";
              if (!isCompleted) return;

              const optIdx = LS_SAFE.get(`pref_${sessId}_${i}`) || 0;
              const opt = ex.options[optIdx] || ex.options[0];

              const machine =
                LS_SAFE.get(`${sessId}_ex${i}_machine`) || "Treadmill";
              const duration = parseInt(
                LS_SAFE.get(`${sessId}_ex${i}_duration`) || 0
              );
              const hr = parseInt(LS_SAFE.get(`${sessId}_ex${i}_hr`) || 0);
              const note =
                LS_SAFE.get(`${sessId}_ex${i}_cardio_note`) || "";

              if (duration > 0 && hr > 0) {
                const profile = LS_SAFE.getJSON("profile", {});
                const age = profile.a || 30;
                const maxHR = 220 - age;
                const zone2Lower = Math.round(maxHR * 0.6);
                const zone2Upper = Math.round(maxHR * 0.7);

                h.push({
                  date: ds,
                  ts: now.getTime(),
                  ex: "LISS Cardio",
                  type: "cardio",
                  machine: machine,
                  duration: duration,
                  avgHR: hr,
                  zone: "Zone 2",
                  zoneTarget: [zone2Lower, zone2Upper],
                  note: note,
                  src: sessId,
                  title: d.title,
                  vol: 0,
                  dur: finalDur,
                });

                LS_SAFE.set(`${sessId}_ex${i}_completed`, "false");
                totalSets++;
              }
              return;
            }
            const optIdx = LS_SAFE.get(`pref_${sessId}_${i}`) || 0;
            const opt = ex.options[optIdx] || ex.options[0];
            const currentNote = opt.note || ex.note || "";
            let v = 0,
              t = 0,
              r = [];
            for (let j = 1; j <= ex.sets; j++) {
              const s = `${sessId}_ex${i}_s${j}`;
              const k = parseFloat(LS_SAFE.get(`${s}_k`) || 0);
              const re = parseFloat(LS_SAFE.get(`${s}_r`) || 0);
              const rpe = LS_SAFE.get(`${s}_rpe`) || "";
              const rir = LS_SAFE.get(`${s}_e`) || ""; // V29.5: Standardized to empty string
              const do_ = LS_SAFE.get(`${s}_d`) === "true";
              if (do_ && k > 0 && re > 0) {
                v += k * re;
                if (k > t) t = k;
                r.push({
                  k,
                  r: re,
                  rpe: rpe,
                  e: rir, // V29.0.1: Add RIR field
                });
                LS_SAFE.set(`${s}_d`, "false");
              }
            }
            if (r.length)
              h.push({
                type: "strength", // V29.5: Explicit type field for schema consistency
                date: ds,
                ts: now.getTime(),
                ex: opt.n,
                vol: v,
                top: t,
                d: r,
                src: sessId,
                title: d.title,
                dur: finalDur,
                note: currentNote,
              });
          });
          // V29.5 FIX: Check save result before showing success
          const saveSuccess = LS_SAFE.setJSON("gym_hist", h);

          if (!saveSuccess) {
            // Save failed - show error, don't navigate
            window.APP.ui.showToast(
              "⚠️ Failed to save workout! Storage may be full. Try clearing old backups.",
              "error"
            );
            console.error("[CORE] Failed to save gym_hist - storage quota exceeded?");
            return; // Don't navigate away - let user retry
          }

          if (sessId !== "spontaneous") {
            LS_SAFE.set(`last_${sessId}`, now.getTime());
          }

          // Only show success if save actually worked
          if (window.APP.ui && window.APP.ui.showToast) {
            window.APP.ui.showToast(
              `Workout saved! ${totalSets} sets, ${totalVol}kg volume`,
              "success"
            );
          }

          // V29.5 P0-006: Auto-advance to next session
          if (sessId !== "spontaneous") {
            try {
              const currentNext = LS_SAFE.get("pref_next_session") || "s1";

              // Get all regular session IDs (exclude spontaneous)
              const sessionIds = Object.keys(window.APP.state.workoutData)
                .filter(id => id !== "spontaneous")
                .sort();

              const currentIndex = sessionIds.indexOf(currentNext);
              const nextIndex = (currentIndex + 1) % sessionIds.length;
              const nextSessionId = sessionIds[nextIndex] || "s1";

              // Save new next session
              LS_SAFE.set("pref_next_session", nextSessionId);

              console.log(`[CORE] ✅ Auto-advanced: ${currentNext} → ${nextSessionId}`);
            } catch (err) {
              console.warn("[CORE] Auto-advance failed:", err);
              // Not critical - continue with navigation
            }
          }

          // CRITICAL: Delay navigation to ensure localStorage commits
          setTimeout(() => {
            window.APP.nav.switchView("dashboard");
          }, 250); // 250ms buffer for storage operations to complete
        } catch (e) {
          console.error("[FINISH SESSION ERROR]", e);
          if (window.APP.debug && window.APP.debug.showFatalError) {
            window.APP.debug.showFatalError("Finish Session", e);
          } else {
            alert("Error finishing session: " + (e.message || e));
          }
        }
      },
    },
  };

  // ========================================
  // Expose to Global Scope
  // ========================================
  window.LS_SAFE = LS_SAFE;
  window.DT = DT;

  // Merge with existing APP if it exists (from inline scripts)
  if (window.APP) {
    console.log("[CORE] Merging with existing APP. Keys before:", Object.keys(window.APP));
    Object.assign(window.APP, APP);
    console.log("[CORE] Keys after merge:", Object.keys(window.APP));
  } else {
    console.log("[CORE] Initializing APP namespace");
    window.APP = APP;
  }

  console.log("[CORE] ✅ Core module loaded (LS_SAFE, DT, APP.state, APP.core)");
})();
