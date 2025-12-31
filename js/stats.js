/**
 * The Grind Design - Stats Module
 * Handles all analytics, charts, volume tracking, and body part analysis
 * Dependencies: Chart.js, LS_SAFE, EXERCISE_TARGETS, VOLUME_DISTRIBUTION, DT, APP.ui
 */

(function () {
  'use strict';

  // Ensure APP exists
  if (!window.APP) window.APP = {};

  APP.stats = {
    chart: null,
    currentView: "dashboard",
    bodyPartViewMode: "combined",

    getTargets: (exerciseName) => {
      const cleanName = (exerciseName || "").trim();

      if (
        typeof EXERCISE_TARGETS !== "undefined" &&
        EXERCISE_TARGETS.hasOwnProperty(cleanName)
      ) {
        const targets = EXERCISE_TARGETS[cleanName];

        if (Array.isArray(targets) && targets.length === 0) {
          console.log(`[VOLUME] Passive exercise (0 volume): ${cleanName}`);
          return [];
        }

        return targets;
      }

      console.warn(
        `[VOLUME] Exercise not in library: ${exerciseName} - using fallback classification`
      );
      const muscle = APP.stats.classifyExercise(exerciseName);
      return [{ muscle: muscle, role: "PRIMARY" }];
    },
    classifyExercise: (name) => {
      const lower = (name || "").toLowerCase();

      if (
        lower.includes("squat") ||
        lower.includes("leg") ||
        lower.includes("lunge") ||
        lower.includes("hack") ||
        lower.includes("calf") ||
        lower.includes("rdl") ||
        lower.includes("sumo")
      ) {
        return "legs";
      }

      if (
        lower.includes("curl") ||
        lower.includes("tricep") ||
        lower.includes("bicep") ||
        lower.includes("skull") ||
        lower.includes("extension") ||
        lower.includes("pushdown")
      ) {
        return "arms";
      }

      if (
        lower.includes("shoulder") ||
        lower.includes("overhead") ||
        lower.includes("ohp") ||
        lower.includes("lateral") ||
        lower.includes("delt") ||
        lower.includes("face pull") ||
        lower.includes("military")
      ) {
        return "shoulders";
      }

      if (
        lower.includes("bench") ||
        lower.includes("chest") ||
        lower.includes("fly") ||
        lower.includes("push up") ||
        lower.includes("pec") ||
        lower.includes("incline") ||
        lower.includes("dips") ||
        (lower.includes("press") &&
          (lower.includes("dumbbell") ||
            lower.includes("machine") ||
            lower.includes("barbell")))
      ) {
        return "chest";
      }

      if (
        lower.includes("pull") ||
        lower.includes("row") ||
        lower.includes("deadlift") ||
        lower.includes("back") ||
        lower.includes("lat") ||
        lower.includes("chin up")
      ) {
        return "back";
      }

      return "back";
    },

    init: () => {
      APP.stats.loadOptions();
    },

    loadOptions: () => {
      const h = LS_SAFE.getJSON("gym_hist", []);
      const u = [
        ...new Set(h.filter((x) => x && x.ex).map((x) => x.ex)),
      ].sort();
      const s = document.getElementById("stats-select");
      if (!s) return;

      s.innerHTML = "";
      if (u.length === 0) {
        s.innerHTML = '<option value="">No Data</option>';
        return;
      }

      u.forEach(
        (x) => (s.innerHTML += `<option value="${x}">${x}</option>`)
      );

      if (u.length > 0) {
        APP.stats.updateDashboard();
      }
    },

    switchTab: (t) => {
      const views = [
        "stats-dashboard-view",
        "stats-chart-view",
        "stats-table-view",
        "stats-bodyparts-view",
      ];
      views.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
      });

      const vitalEl = document.getElementById("vital-signs");
      const exerciseSelector = document.getElementById(
        "exercise-selector-container"
      );

      if (vitalEl) {
        vitalEl.classList.add("hidden");
        vitalEl.style.display = "none";
      }

      if (exerciseSelector) {
        if (t === "chart" || t === "table") {
          exerciseSelector.classList.remove("hidden");
          exerciseSelector.style.display = "";
        } else {
          exerciseSelector.classList.add("hidden");
          exerciseSelector.style.display = "none";
        }
      }

      ["dashboard", "chart", "table", "bodyparts"].forEach((tab) => {
        const btn = document.getElementById(`tab-${tab}`);
        if (btn) {
          btn.className =
            tab === t
              ? "tab-btn active flex-shrink-0"
              : "tab-btn inactive flex-shrink-0";
        }
      });

      const labelMap = {
        dashboard: "Dashboard",
        chart: "Grafik Tren",
        table: "Tabel Klinis",
        bodyparts: "Body Parts",
      };

      const labelEl = document.getElementById("active-tab-label");
      if (labelEl) {
        labelEl.innerText = labelMap[t] || "Dashboard";
        labelEl.style.opacity = "0";
        setTimeout(() => {
          labelEl.style.opacity = "1";
        }, 150);
      }

      APP.stats.currentView = t;

      if (t === "dashboard") {
        const el = document.getElementById("stats-dashboard-view");
        if (el) el.classList.remove("hidden");

        APP.stats.updateDashboard();

        if (vitalEl) {
          vitalEl.classList.add("hidden");
          vitalEl.style.display = "none";
        }
        if (exerciseSelector) {
          exerciseSelector.classList.add("hidden");
          exerciseSelector.style.display = "none";
        }
      } else if (t === "chart") {
        const el = document.getElementById("stats-chart-view");
        if (el) el.classList.remove("hidden");

        if (vitalEl) {
          vitalEl.classList.remove("hidden");
          vitalEl.style.display = "";
        }
        APP.stats.updateChart();
      } else if (t === "table") {
        const el = document.getElementById("stats-table-view");
        if (el) el.classList.remove("hidden");

        if (vitalEl) {
          vitalEl.classList.remove("hidden");
          vitalEl.style.display = "";
        }
        APP.stats.updateChart();
      } else if (t === "bodyparts") {
        const el = document.getElementById("stats-bodyparts-view");
        if (el) el.classList.remove("hidden");

        APP.stats.updateBodyParts();

        if (vitalEl) {
          vitalEl.classList.add("hidden");
          vitalEl.style.display = "none";
        }
        if (exerciseSelector) {
          exerciseSelector.classList.add("hidden");
          exerciseSelector.style.display = "none";
        }
      }
    },

    updateDashboard: () => {
      const h = LS_SAFE.getJSON("gym_hist", []);
      if (h.length === 0) return;

      const now = new Date();
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - now.getDay());
      thisWeekStart.setHours(0, 0, 0, 0);

      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);

      const thisWeekLogs = h.filter(
        (log) => new Date(log.ts) >= thisWeekStart
      );
      const lastWeekLogs = h.filter((log) => {
        const d = new Date(log.ts);
        return d >= lastWeekStart && d < thisWeekStart;
      });

      const thisWeekVol = thisWeekLogs.reduce((sum, log) => {
        if (log.type === "cardio") return sum;
        return sum + (log.vol || 0);
      }, 0);
      const lastWeekVol = lastWeekLogs.reduce((sum, log) => {
        if (log.type === "cardio") return sum;
        return sum + (log.vol || 0);
      }, 0);
      const volDiff =
        lastWeekVol > 0
          ? (((thisWeekVol - lastWeekVol) / lastWeekVol) * 100).toFixed(1)
          : 0;

      let thisWeekRPE = 0,
        thisWeekRPECount = 0;
      let lastWeekRPE = 0,
        lastWeekRPECount = 0;

      thisWeekLogs.forEach((log) => {
        if (log.d) {
          log.d.forEach((set) => {
            if (set.rpe) {
              thisWeekRPE += parseFloat(set.rpe);
              thisWeekRPECount++;
            }
          });
        }
      });

      lastWeekLogs.forEach((log) => {
        if (log.d) {
          log.d.forEach((set) => {
            if (set.rpe) {
              lastWeekRPE += parseFloat(set.rpe);
              lastWeekRPECount++;
            }
          });
        }
      });

      const avgThisWeekRPE =
        thisWeekRPECount > 0
          ? (thisWeekRPE / thisWeekRPECount).toFixed(1)
          : 0;
      const avgLastWeekRPE =
        lastWeekRPECount > 0
          ? (lastWeekRPE / lastWeekRPECount).toFixed(1)
          : 0;
      const rpeDiff = (avgThisWeekRPE - avgLastWeekRPE).toFixed(1);

      const thisWeekSessions = new Set(thisWeekLogs.map((l) => l.date))
        .size;
      const lastWeekSessions = new Set(lastWeekLogs.map((l) => l.date))
        .size;

      const volCurrentEl = document.getElementById("dash-volume-current");
      const volDiffEl = document.getElementById("dash-volume-diff");
      const rpeCurrentEl = document.getElementById("dash-rpe-current");
      const rpeDiffEl = document.getElementById("dash-rpe-diff");
      const sessionsCurrentEl = document.getElementById(
        "dash-sessions-current"
      );
      const sessionsDiffEl = document.getElementById("dash-sessions-diff");
      const tonnageCurrentEl = document.getElementById(
        "dash-tonnage-current"
      );
      const tonnageDiffEl = document.getElementById("dash-tonnage-diff");

      if (volCurrentEl)
        volCurrentEl.innerText = thisWeekVol.toLocaleString();
      if (volDiffEl)
        volDiffEl.innerHTML = APP.stats.formatDiff(volDiff, "volume");

      if (rpeCurrentEl) rpeCurrentEl.innerText = avgThisWeekRPE || "0";
      if (rpeDiffEl)
        rpeDiffEl.innerHTML = APP.stats.formatDiff(rpeDiff, "rpe");

      if (sessionsCurrentEl) sessionsCurrentEl.innerText = thisWeekSessions;
      if (sessionsDiffEl) {
        sessionsDiffEl.innerHTML =
          thisWeekSessions === lastWeekSessions
            ? '<span class="text-slate-400">Same ➡️</span>'
            : thisWeekSessions > lastWeekSessions
            ? '<span class="text-emerald-400">+' +
              (thisWeekSessions - lastWeekSessions) +
              " ↑</span>"
            : '<span class="text-red-400">-' +
              (lastWeekSessions - thisWeekSessions) +
              " ↓</span>";
      }

      if (tonnageCurrentEl)
        tonnageCurrentEl.innerText = thisWeekVol.toLocaleString();
      if (tonnageDiffEl)
        tonnageDiffEl.innerHTML = APP.stats.formatDiff(volDiff, "volume");

      APP.stats.calculateTopGainers(thisWeekLogs, lastWeekLogs);
      APP.stats.checkFatigue(thisWeekLogs);
    },

    formatDiff: (diff, type) => {
      const numDiff = parseFloat(diff);

      if (type === "volume") {
        if (numDiff > 5)
          return `<span class="text-emerald-400">+${diff}% ↑</span>`;
        if (numDiff < -5)
          return `<span class="text-red-400">${diff}% ↓</span>`;
        return `<span class="text-slate-400">${
          numDiff >= 0 ? "+" : ""
        }${diff}% ➡️</span>`;
      }

      if (type === "rpe") {
        if (numDiff > 0.5)
          return `<span class="text-yellow-400">+${diff} ⚠️</span>`;
        if (numDiff < -0.5)
          return `<span class="text-emerald-400">${diff} ✅</span>`;
        return `<span class="text-slate-400">${
          numDiff >= 0 ? "+" : ""
        }${diff} ➡️</span>`;
      }

      return diff;
    },

    calculateTopGainers: (thisWeek, lastWeek) => {
      const exerciseMap = {};

      thisWeek.forEach((log) => {
        if (log.type === "cardio") return;

        if (!exerciseMap[log.ex]) {
          exerciseMap[log.ex] = { thisVol: 0, lastVol: 0 };
        }
        exerciseMap[log.ex].thisVol += log.vol || 0;
      });

      lastWeek.forEach((log) => {
        if (log.type === "cardio") return;

        if (!exerciseMap[log.ex]) {
          exerciseMap[log.ex] = { thisVol: 0, lastVol: 0 };
        }
        exerciseMap[log.ex].lastVol += log.vol || 0;
      });

      const gainers = Object.keys(exerciseMap)
        .map((ex) => {
          const data = exerciseMap[ex];
          const pctChange =
            data.lastVol > 0
              ? ((data.thisVol - data.lastVol) / data.lastVol) * 100
              : 0;
          return { ex, pctChange, thisVol: data.thisVol };
        })
        .filter((item) => item.thisVol > 0)
        .sort((a, b) => b.pctChange - a.pctChange)
        .slice(0, 3);

      const container = document.getElementById("dash-top-gainers");
      if (!container) return;

      if (gainers.length === 0) {
        container.innerHTML =
          '<p class="text-xs text-slate-500 italic">Not enough data yet.</p>';
        return;
      }

      let html = "";
      gainers.forEach((item, idx) => {
        const emoji = idx === 0 ? "🔥" : idx === 1 ? "📈" : "✅";
        const color =
          item.pctChange > 10
            ? "text-emerald-400"
            : item.pctChange > 0
            ? "text-blue-400"
            : "text-slate-400";

        html += `
        <div class="flex justify-between items-center bg-slate-800/30 p-2 rounded">
          <span class="text-xs text-slate-300">${idx + 1}. ${item.ex}</span>
          <span class="text-xs font-bold ${color}">[${
          item.pctChange > 0 ? "+" : ""
        }${item.pctChange.toFixed(1)}%] ${emoji}</span>
        </div>
      `;
      });

      container.innerHTML = html;
    },

    checkFatigue: (logs) => {
      const alert = document.getElementById("dash-fatigue-alert");
      const message = document.getElementById("dash-fatigue-message");

      if (!alert || !message) return;

      let highRPECount = 0;
      logs.forEach((log) => {
        if (log.type === "cardio") return;

        if (log.d && Array.isArray(log.d)) {
          log.d.forEach((set) => {
            if (set.rpe && parseFloat(set.rpe) >= 9) {
              highRPECount++;
            }
          });
        }
      });

      if (highRPECount >= 5) {
        alert.classList.remove("hidden");
        message.innerText = `${highRPECount} sets with RPE ≥9 this week. Consider deload or rest day.`;
      } else {
        alert.classList.add("hidden");
      }
    },

    getTargets: (exName) => {
      const cleanName = (exName || "").trim();

      if (window.EXERCISE_TARGETS && window.EXERCISE_TARGETS[cleanName]) {
        return window.EXERCISE_TARGETS[cleanName];
      }

      const lowerName = cleanName.toLowerCase();
      let fallbackMuscle = null;

      if (
        lowerName.includes("squat") ||
        lowerName.includes("leg") ||
        lowerName.includes("lunge") ||
        lowerName.includes("hack") ||
        lowerName.includes("calf") ||
        lowerName.includes("rdl") ||
        lowerName.includes("sumo")
      ) {
        fallbackMuscle = "legs";
      } else if (
        lowerName.includes("curl") ||
        lowerName.includes("tricep") ||
        lowerName.includes("bicep") ||
        lowerName.includes("skull") ||
        lowerName.includes("extension") ||
        lowerName.includes("pushdown")
      ) {
        fallbackMuscle = "arms";
      } else if (
        lowerName.includes("shoulder") ||
        lowerName.includes("overhead") ||
        lowerName.includes("ohp") ||
        lowerName.includes("lateral") ||
        lowerName.includes("delt") ||
        lowerName.includes("face pull") ||
        lowerName.includes("military")
      ) {
        fallbackMuscle = "shoulders";
      } else if (
        lowerName.includes("bench") ||
        lowerName.includes("chest") ||
        lowerName.includes("fly") ||
        lowerName.includes("push up") ||
        lowerName.includes("pec") ||
        lowerName.includes("incline") ||
        lowerName.includes("dips") ||
        (lowerName.includes("press") &&
          (lowerName.includes("dumbbell") ||
            lowerName.includes("machine") ||
            lowerName.includes("barbell")))
      ) {
        fallbackMuscle = "chest";
      } else if (
        lowerName.includes("pull") ||
        lowerName.includes("row") ||
        lowerName.includes("deadlift") ||
        lowerName.includes("back") ||
        lowerName.includes("lat") ||
        lowerName.includes("chin up")
      ) {
        fallbackMuscle = "back";
      }

      if (fallbackMuscle) {
        return [{ muscle: fallbackMuscle, role: "PRIMARY" }];
      }

      return [];
    },

    updateBodyParts: () => {
      const periodEl = document.getElementById("bodypart-period");
      const weeks = parseInt(periodEl?.value || 4);
      const h = LS_SAFE.getJSON("gym_hist", []);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - weeks * 7);

      const recentLogs = h.filter((log) => new Date(log.ts) >= cutoffDate);

      const directVolume = {
        chest: 0,
        back: 0,
        legs: 0,
        shoulders: 0,
        arms: 0,
      };
      const indirectVolume = {
        chest: 0,
        back: 0,
        legs: 0,
        shoulders: 0,
        arms: 0,
      };
      const bodyPartMap = {
        chest: 0,
        back: 0,
        legs: 0,
        shoulders: 0,
        arms: 0,
      };

      recentLogs.forEach((log) => {
        if (log.type === "cardio") return;

        const targets = APP.stats.getTargets(log.ex);
        const volume = log.vol || 0;

        if (targets.length > 0) {
          targets.forEach((target) => {
            const factor =
              (window.VOLUME_DISTRIBUTION &&
                window.VOLUME_DISTRIBUTION[target.role]) ||
              1.0;
            const weightedVol = volume * factor;

            if (target.role === "PRIMARY") {
              directVolume[target.muscle] += weightedVol;
            } else if (target.role === "SECONDARY") {
              indirectVolume[target.muscle] += weightedVol;
            }

            bodyPartMap[target.muscle] += weightedVol;
          });
        }
      });

      APP.stats.renderStackedVolume(
        directVolume,
        indirectVolume,
        bodyPartMap
      );

      APP.stats.checkImbalance(bodyPartMap);
    },

    setBodyPartView: (mode) => {
      APP.stats.bodyPartViewMode = mode;

      const combinedBtn = document.getElementById("view-combined-btn");
      const splitBtn = document.getElementById("view-split-btn");

      if (mode === "combined") {
        combinedBtn.className =
          "px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 bg-emerald-600 text-white shadow-lg";
        splitBtn.className =
          "px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 bg-slate-700 text-slate-400";
      } else {
        combinedBtn.className =
          "px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 bg-slate-700 text-slate-400";
        splitBtn.className =
          "px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 bg-emerald-600 text-white shadow-lg";
      }

      APP.stats.updateBodyParts();
    },

    renderStackedVolume: (direct, indirect, total) => {
      const container = document.getElementById("bodypart-bars");
      if (!container) return;

      const viewMode = APP.stats.bodyPartViewMode || "combined";

      if (viewMode === "combined") {
        APP.stats.renderCombinedView(direct, indirect, total);
      } else {
        APP.stats.renderSplitView(direct, indirect, total);
      }
    },

    renderCombinedView: (direct, indirect, total) => {
      const container = document.getElementById("bodypart-bars");
      const muscles = ["chest", "back", "legs", "shoulders", "arms"];
      const maxVol = Math.max(
        ...muscles.map((m) => (direct[m] || 0) + (indirect[m] || 0))
      );

      if (maxVol === 0) {
        container.innerHTML =
          '<p class="text-xs text-slate-500 italic">No data in selected period.</p>';
        return;
      }

      let html = '<div class="space-y-3">';

      muscles.forEach((muscle) => {
        const directVol = direct[muscle] || 0;
        const indirectVol = indirect[muscle] || 0;
        const totalVol = directVol + indirectVol;
        const pctTotal = maxVol > 0 ? (totalVol / maxVol) * 100 : 0;
        const pctDirect = totalVol > 0 ? (directVol / totalVol) * 100 : 0;

        const label = muscle.charAt(0).toUpperCase() + muscle.slice(1);

        html += `
      <div class="mb-3">
        <div class="flex justify-between text-xs mb-1">
          <span class="text-slate-300 font-bold">${label}</span>
          <span class="text-slate-400 font-mono">${totalVol.toLocaleString()} kg</span>
        </div>

        <div class="bg-slate-700/30 rounded-full h-8 overflow-hidden relative">
          <div class="absolute inset-0 flex" style="width: ${pctTotal}%">
            <div
              class="bg-emerald-500 h-full transition-all duration-500"
              style="width: ${pctDirect}%"
              title="Direct: ${directVol.toLocaleString()} kg"
            ></div>
            <div
              class="bg-emerald-500/25 border-l border-emerald-500/50 h-full transition-all duration-500"
              style="width: ${100 - pctDirect}%"
              title="Indirect: ${indirectVol.toLocaleString()} kg"
            ></div>
          </div>

          ${
            pctTotal > 15
              ? `
            <div class="absolute inset-0 flex items-center justify-end pr-3">
              <span class="text-xs font-bold text-white">${pctTotal.toFixed(
                0
              )}%</span>
            </div>
          `
              : ""
          }
        </div>

        <div class="flex gap-4 mt-1 text-[10px] text-slate-500">
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 bg-emerald-500 rounded-sm"></div>
            <span>Direct: ${directVol.toLocaleString()} kg</span>
          </div>
          ${
            indirectVol > 0
              ? `
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 bg-emerald-500/25 border border-emerald-500/50 rounded-sm"></div>
              <span>Indirect: ${indirectVol.toLocaleString()} kg</span>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;
      });

      html += "</div>";
      container.innerHTML = html;
    },

    renderSplitView: (direct, indirect, total) => {
      const container = document.getElementById("bodypart-bars");

      const upperBody = ["chest", "back", "shoulders", "arms"];
      const lowerBody = ["legs"];

      const upperMax = Math.max(
        ...upperBody.map((m) => (direct[m] || 0) + (indirect[m] || 0))
      );
      const lowerMax = Math.max(
        ...lowerBody.map((m) => (direct[m] || 0) + (indirect[m] || 0))
      );

      let html = "";

      html += `
    <div class="mb-6 pb-4 border-b border-slate-700">
      <h4 class="text-xs font-bold text-blue-400 uppercase mb-3 flex items-center gap-2">
        <i class="fa-solid fa-person-running"></i> Lower Body (Absolute Scale)
      </h4>
      <div class="space-y-3">
  `;

      lowerBody.forEach((muscle) => {
        const directVol = direct[muscle] || 0;
        const indirectVol = indirect[muscle] || 0;
        const totalVol = directVol + indirectVol;
        const pctTotal = lowerMax > 0 ? (totalVol / lowerMax) * 100 : 0;
        const pctDirect = totalVol > 0 ? (directVol / totalVol) * 100 : 0;

        const label = muscle.charAt(0).toUpperCase() + muscle.slice(1);

        html += APP.stats.renderMuscleBar(
          label,
          directVol,
          indirectVol,
          totalVol,
          pctTotal,
          pctDirect
        );
      });

      html += "</div></div>";

      html += `
    <div>
      <h4 class="text-xs font-bold text-emerald-400 uppercase mb-3 flex items-center gap-2">
        <i class="fa-solid fa-dumbbell"></i> Upper Body (Relative Scale)
      </h4>
      <div class="space-y-3">
  `;

      upperBody.forEach((muscle) => {
        const directVol = direct[muscle] || 0;
        const indirectVol = indirect[muscle] || 0;
        const totalVol = directVol + indirectVol;
        const pctTotal = upperMax > 0 ? (totalVol / upperMax) * 100 : 0;
        const pctDirect = totalVol > 0 ? (directVol / totalVol) * 100 : 0;

        const label = muscle.charAt(0).toUpperCase() + muscle.slice(1);

        html += APP.stats.renderMuscleBar(
          label,
          directVol,
          indirectVol,
          totalVol,
          pctTotal,
          pctDirect
        );
      });

      html += "</div></div>";

      const upperTotal = upperBody.reduce(
        (sum, m) => sum + (direct[m] || 0) + (indirect[m] || 0),
        0
      );
      const lowerTotal = lowerBody.reduce(
        (sum, m) => sum + (direct[m] || 0) + (indirect[m] || 0),
        0
      );

      if (lowerTotal === 0 && upperTotal === 0) {
        html += `
    <div class="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
      <div class="text-xs text-slate-500 italic text-center">
        No volume data available for ratio calculation.
      </div>
    </div>
  `;
        container.innerHTML = html;
        return;
      }

      if (lowerTotal === 0) {
        html += `
    <div class="mt-4 p-3 bg-red-900/20 rounded-lg border border-red-500">
      <div class="text-xs text-red-400 font-bold">⚠️ No lower body volume detected</div>
      <div class="text-[9px] text-slate-500 mt-1">Add leg exercises to enable ratio analysis.</div>
    </div>
  `;
        container.innerHTML = html;
        return;
      }

      const ratio = (upperTotal / lowerTotal) * 100;

      html += `
  <div class="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
    <div class="text-[10px] text-slate-400 mb-1">Upper:Lower Ratio</div>
    <div class="text-lg font-bold text-white">
      ${ratio.toFixed(
        0
      )}% <span class="text-xs text-slate-500">(Upper as % of Lower)</span>
    </div>
    <div class="text-[9px] text-slate-500 mt-1 italic">
      ${APP.stats.interpretRatio(ratio)}
    </div>
    <div class="mt-2 text-[10px] text-slate-600 border-t border-slate-700 pt-2">
      Upper: ${upperTotal.toLocaleString()} kg | Lower: ${lowerTotal.toLocaleString()} kg
    </div>
  </div>
`;

      container.innerHTML = html;
    },

    interpretRatio: (ratio) => {
      if (ratio < 50) {
        return `
      <span class="text-red-400">⚠️ Upper body critically lagging</span>
      <div class="text-[10px] text-slate-600 mt-1">
        Risk: Severe imbalance. Add 3-4 upper exercises ASAP.
      </div>
    `;
      }

      if (ratio >= 50 && ratio < 80) {
        return `
      <span class="text-orange-400">⚠️ Upper body significantly lagging</span>
      <div class="text-[10px] text-slate-600 mt-1">
        Typical for powerlifting/athletic focus. If goal is aesthetics, add upper work.
      </div>
    `;
      }

      if (ratio >= 80 && ratio < 90) {
        return `
      <span class="text-yellow-400">🦵 Lower body bias (slight)</span>
      <div class="text-[10px] text-slate-600 mt-1">
        Common for strength programs. Upper at 80-89% of lower volume.
      </div>
    `;
      }

      if (ratio >= 90 && ratio <= 110) {
        return `
      <span class="text-emerald-400">✅ Balanced program</span>
      <div class="text-[10px] text-slate-600 mt-1">
        Ideal ratio (90-110%). Upper and lower proportionally developed.
      </div>
    `;
      }

      if (ratio > 110 && ratio <= 130) {
        return `
      <span class="text-blue-400">💪 Upper body bias (slight)</span>
      <div class="text-[10px] text-slate-600 mt-1">
        Common for hypertrophy/bodybuilding focus. Lower at 77-91% of upper.
      </div>
    `;
      }

      if (ratio > 130 && ratio <= 150) {
        return `
      <span class="text-indigo-400">💪 Upper body dominant</span>
      <div class="text-[10px] text-slate-600 mt-1">
        Strong upper focus. Ensure adequate leg volume for hormonal/metabolic benefits.
      </div>
    `;
      }

      return `
    <span class="text-red-400">🚨 Skip Leg Day Alert</span>
    <div class="text-[10px] text-slate-600 mt-1">
      Upper >150% of lower. Add 2-3 compound leg movements immediately.
    </div>
  `;
    },

    renderMuscleBar: (
      label,
      directVol,
      indirectVol,
      totalVol,
      pctTotal,
      pctDirect
    ) => {
      return `
    <div class="mb-3">
      <div class="flex justify-between text-xs mb-1">
        <span class="text-slate-300 font-bold">${label}</span>
        <span class="text-slate-400 font-mono">${totalVol.toLocaleString()} kg</span>
      </div>

      <div class="bg-slate-700/30 rounded-full h-8 overflow-hidden relative">
        <div class="absolute inset-0 flex" style="width: ${pctTotal}%">
          <div
            class="bg-emerald-500 h-full transition-all duration-500"
            style="width: ${pctDirect}%"
            title="Direct: ${directVol.toLocaleString()} kg"
          ></div>
          <div
            class="bg-emerald-500/25 border-l border-emerald-500/50 h-full transition-all duration-500"
            style="width: ${100 - pctDirect}%"
            title="Indirect: ${indirectVol.toLocaleString()} kg"
          ></div>
        </div>

        ${
          pctTotal > 15
            ? `
          <div class="absolute inset-0 flex items-center justify-end pr-3">
            <span class="text-xs font-bold text-white">${pctTotal.toFixed(
              0
            )}%</span>
          </div>
        `
            : ""
        }
      </div>

      <div class="flex gap-4 mt-1 text-[10px] text-slate-500">
        <div class="flex items-center gap-1">
          <div class="w-2 h-2 bg-emerald-500 rounded-sm"></div>
          <span>Direct: ${directVol.toLocaleString()} kg</span>
        </div>
        ${
          indirectVol > 0
            ? `
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 bg-emerald-500/25 border border-emerald-500/50 rounded-sm"></div>
            <span>Indirect: ${indirectVol.toLocaleString()} kg</span>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;
    },

    checkImbalance: (bodyPartMap) => {
      const chestVol = bodyPartMap.chest;
      const backVol = bodyPartMap.back;
      const imbalanceDiv = document.getElementById("bodypart-imbalance");
      const imbalanceMsg = document.getElementById(
        "bodypart-imbalance-message"
      );

      if (!imbalanceDiv || !imbalanceMsg) return;

      if (chestVol > 0 && backVol > 0) {
        const ratio = chestVol / backVol;

        if (ratio > 1.3) {
          imbalanceDiv.classList.remove("hidden");
          imbalanceDiv.className =
            "mt-6 bg-red-900/20 border border-red-500/30 p-4 rounded-xl";

          imbalanceMsg.innerHTML = `
        <div class="mb-2 text-red-400 font-bold">
          ⚠️ High Injury Risk (Anterior Dominant)
        </div>
        <div class="text-xs text-slate-300 mb-2">
          Volume dada <strong>${((ratio - 1) * 100).toFixed(
            0
          )}% lebih tinggi</strong> dari punggung.
        </div>
        <div class="text-xs text-slate-400 space-y-1">
          <div>→ Risk: Upper Cross Syndrome / Impingement</div>
          <div>→ Rx: Prioritaskan Face Pulls & Rows</div>
        </div>
        ${APP.stats.renderConsultButton("chest", ratio)}
      `;
        } else if (ratio < 0.5) {
          imbalanceDiv.classList.remove("hidden");
          imbalanceDiv.className =
            "mt-6 bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl";

          const reverseRatio = 1 / ratio;
          imbalanceMsg.innerHTML = `
        <div class="mb-2 text-blue-400 font-bold">
          ℹ️ Aesthetic Imbalance (Lagging Chest)
        </div>
        <div class="text-xs text-slate-300 mb-2">
           Volume dada tertinggal jauh (Back is <strong>${reverseRatio.toFixed(
             1
           )}x</strong> Chest).
        </div>
        <div class="text-xs text-slate-400 space-y-1">
          <div>→ Note: Postur aman, tapi dada kurang tebal visual.</div>
          <div>→ Rx: Tambah volume Incline Press / Fly.</div>
        </div>
        ${APP.stats.renderConsultButton("chest", ratio)}
      `;
        } else {
          imbalanceDiv.classList.add("hidden");
        }
      } else {
        imbalanceDiv.classList.add("hidden");
      }
    },

    renderConsultButton: (focus, ratio) => {
      return `
    <button
      onclick="APP.stats.prepareImbalanceConsultation('${focus}', ${ratio.toFixed(
        2
      )})"
      class="mt-3 w-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition active:scale-95 border border-slate-600"
    >
      <i class="fa-solid fa-user-doctor"></i> Analisis AI
    </button>
  `;
    },

    prepareImbalanceConsultation: (dominantPart, ratio) => {
      const h = LS_SAFE.getJSON("gym_hist", []);
      const p = LS_SAFE.getJSON("profile", {});
      const weeks = parseInt(
        document.getElementById("bodypart-period")?.value || 4
      );

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - weeks * 7);
      const recentLogs = h.filter((log) => new Date(log.ts) >= cutoffDate);

      const bodyPartMap = {
        chest: { vol: 0, exercises: [] },
        back: { vol: 0, exercises: [] },
        legs: { vol: 0, exercises: [] },
        shoulders: { vol: 0, exercises: [] },
        arms: { vol: 0, exercises: [] },
      };

      recentLogs.forEach((log) => {
        const targets = APP.stats.getTargets(log.ex);
        const volume = log.vol || 0;
        const realName = log.ex || "Unknown";

        if (targets.length > 0) {
          targets.forEach((target) => {
            const factor =
              (window.VOLUME_DISTRIBUTION &&
                window.VOLUME_DISTRIBUTION[target.role]) ||
              1.0;
            const weightedVol = volume * factor;

            if (bodyPartMap[target.muscle]) {
              bodyPartMap[target.muscle].vol += weightedVol;

              if (
                !bodyPartMap[target.muscle].exercises.includes(realName)
              ) {
                bodyPartMap[target.muscle].exercises.push(realName);
              }
            }
          });
        }
      });

      let promptText = `[MUSCLE IMBALANCE CONSULTATION]\n\n`;
      promptText += `DETECTED ISSUE:\n`;

      const cVol = bodyPartMap.chest.vol;
      const bVol = bodyPartMap.back.vol;

      if (cVol > bVol) {
        const pct = cVol > 0 ? ((cVol - bVol) / cVol) * 100 : 0;

        promptText += `- Back volume is ${pct.toFixed(
          0
        )}% LOWER than chest volume\n`;
        promptText += `- Risk: Shoulder impingement, postural issues, upper cross syndrome\n\n`;
      } else {
        const pct = bVol > 0 ? ((bVol - cVol) / bVol) * 100 : 0;

        promptText += `- Chest volume is ${pct.toFixed(
          0
        )}% LOWER than back volume\n`;
        promptText += `- Risk: Limited pressing strength, aesthetic imbalance\n\n`;
      }

      promptText += `USER PROFILE:\n`;
      promptText += `- Name: ${p.name || "Unknown"}\n`;
      promptText += `- Age: ${p.a || "N/A"}\n`;
      promptText += `- Height: ${p.h || "N/A"}cm\n`;
      promptText += `- Training Period Analyzed: Last ${weeks} weeks\n\n`;

      promptText += `VOLUME BREAKDOWN (Last ${weeks} weeks):\n`;
      promptText += `\nVOLUME METHODOLOGY:\n`;
      promptText += `- Primary Work (1.0x): Direct muscle targeting\n`;
      promptText += `- Secondary Work (0.5x): Synergist contribution\n`;
      promptText += `- Total includes weighted distribution from compound lifts\n\n`;

      Object.keys(bodyPartMap).forEach((part) => {
        const data = bodyPartMap[part];
        promptText += `- ${part.toUpperCase()}: ${data.vol.toLocaleString()}kg`;
        if (data.exercises.length > 0) {
          promptText += ` (${
            data.exercises.length
          } exercises: ${data.exercises.slice(0, 3).join(", ")}${
            data.exercises.length > 3 ? "..." : ""
          })`;
        }
        promptText += `\n`;
      });

      promptText += `\nQUESTION:\n`;
      promptText += `Saya mengalami muscle imbalance seperti data di atas. Berikan:\n`;
      promptText += `1. Analisis penyebab imbalance ini\n`;
      promptText += `2. Apakah perlu ganti resep exercise? jika perlu, rekomendasi exercises untuk balance (3-4 gerakan spesifik)\n`;
      promptText += `3. Target volume yang sehat untuk ${weeks} minggu ke depan\n`;
      promptText += `4. Protokol koreksi (berapa lama untuk balance kembali)\n\n`;
      promptText += `-Format response dalam Bahasa Indonesia, to-the-point, dan actionable.\n`;
      promptText += `-Kamu bisa crossreference dengan log kamu di google task.\n`;
      promptText += `-Ingat standar output resep JSON: Instructional Cueing (Notes) , Tri-Option System , Full Metadata.`;

      APP.ui.showManualCopy(promptText);

      APP.ui.showToast(
        "📋 Prompt konsultasi disalin! Paste ke Gemini AI untuk analisis mendalam.",
        "success"
      );
    },

    updateChart: () => {
      if (typeof Chart === "undefined") return;
      const sel = document.getElementById("stats-select").value;
      if (!sel) return;

      const h = LS_SAFE.getJSON("gym_hist", [])
        .filter((x) => x.ex === sel)
        .sort((a, b) => a.ts - b.ts);

      const msg = document.getElementById("no-data-msg");
      const vital = document.getElementById("vital-signs");
      const tbody = document.getElementById("hist-table-body");

      if (!h.length) {
        if (APP.stats.chart) {
          APP.stats.chart.destroy();
          APP.stats.chart = null;
        }
        if (msg) msg.classList.remove("hidden");
        if (vital) vital.classList.add("hidden");
        if (tbody) tbody.innerHTML = "";
        return;
      }

      if (msg) msg.classList.add("hidden");
      if (vital) vital.classList.remove("hidden");

      const isCardio = h[0].type === "cardio";

      if (isCardio) {
        APP.stats.renderCardioChart(h);
        APP.stats.renderCardioTable(h, tbody);
        APP.stats.updateCardioVitals(h, vital);
      } else {
        const tableEl = tbody.closest("table");
        if (tableEl) {
          tableEl.style.tableLayout = "fixed";
          tableEl.style.width = "100%";
          tableEl.style.borderSpacing = "0";
          tableEl.style.padding = "0";
          tableEl.className = "w-full border-collapse p-0 m-0";

          const thead = tableEl.querySelector("thead tr");
          if (thead) {
            thead.innerHTML = `
                  <th class="py-3 px-0 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700" style="width: 15%">TGL</th>
                  <th class="py-3 px-0 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700" style="width: 20%">KG</th>
                  <th class="py-3 px-0 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700" style="width: 20%">REPS</th>
                  <th class="py-3 px-0 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700" style="width: 20%">RPE</th>
                  <th class="py-3 px-0 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700" style="width: 25%">VOL</th>
                `;
          }
        }

        let mx = 0,
          tv = 0;
        let tHtml = "";

        [...h]
          .sort((a, b) => b.ts - a.ts)
          .forEach((l) => {
            if (l.type === "cardio") return;

            if (l.top > mx) mx = l.top;
            tv += l.vol || 0;

            if (l.d && Array.isArray(l.d)) {
              l.d.forEach((s) => {
                tHtml += `
                      <tr class="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                        <td class="py-3 px-0 text-center text-slate-400 text-xs font-mono">${
                          l.date
                        }</td>
                        <td class="py-3 px-0 text-center text-sm font-bold text-white">${
                          s.k
                        }<span class="text-slate-600 text-[10px] ml-0.5">kg</span></td>
                        <td class="py-3 px-0 text-center text-emerald-400 font-mono text-sm">x${
                          s.r
                        }</td>
                        <td class="py-3 px-0 text-center text-yellow-400 font-bold text-sm">${
                          s.rpe || "-"
                        }</td>
                        <td class="py-3 px-0 text-center text-blue-400 text-xs font-mono">${Math.round(
                          s.k * s.r
                        ).toLocaleString()}</td>
                      </tr>`;
              });
            }
          });
        if (tbody) tbody.innerHTML = tHtml;
        if (vital) {
          vital.className = "grid grid-cols-3 gap-2 text-center";
          vital.style.display = "";
          vital.style.width = "";

          vital.innerHTML = `
                <div class="bg-slate-700/30 p-2 rounded border border-slate-700">
                  <div class="text-[10px] text-slate-400 uppercase">PR</div>
                  <div class="text-lg font-bold text-emerald-400" id="stat-pr">--</div>
                </div>
                <div class="bg-slate-700/30 p-2 rounded border border-slate-700">
                  <div class="text-[10px] text-slate-400 uppercase">Vol Avg</div>
                  <div class="text-lg font-bold text-blue-400" id="stat-vol">--</div>
                </div>
                <div class="bg-slate-700/30 p-2 rounded border border-slate-700">
                  <div class="text-[10px] text-slate-400 uppercase">Count</div>
                  <div class="text-lg font-bold text-white" id="stat-count">--</div>
                </div>
              `;
        }

        if (tbody) tbody.innerHTML = tHtml;

        if (vital) {
          vital.className = "grid grid-cols-3 gap-2 text-center";
          vital.style.display = "";
          vital.style.width = "";

          vital.innerHTML = `
                <div class="bg-slate-700/30 p-2 rounded border border-slate-700">
                  <div class="text-[10px] text-slate-400 uppercase tracking-tighter">PR (Top)</div>
                  <div class="text-lg font-bold text-emerald-400" id="stat-pr">--</div>
                </div>
                <div class="bg-slate-700/30 p-2 rounded border border-slate-700">
                  <div class="text-[10px] text-slate-400 uppercase tracking-tighter">Vol Avg</div>
                  <div class="text-lg font-bold text-blue-400" id="stat-vol">--</div>
                </div>
                <div class="bg-slate-700/30 p-2 rounded border border-slate-700">
                  <div class="text-[10px] text-slate-400 uppercase tracking-tighter">Sesi</div>
                  <div class="text-lg font-bold text-white" id="stat-count">--</div>
                </div>
              `;
        }

        const prEl = document.getElementById("stat-pr");
        const volEl = document.getElementById("stat-vol");
        const countEl = document.getElementById("stat-count");
        if (prEl) prEl.innerText = mx;
        if (volEl)
          volEl.innerText =
            h.length > 0 ? Math.round(tv / h.length).toLocaleString() : 0;
        if (countEl) countEl.innerText = h.length;

        const ctx = document.getElementById("progressChart");
        if (!ctx) {
          console.error("[DOM ERROR] progressChart canvas not found");
          return;
        }

        const context = ctx.getContext("2d");
        if (!context) {
          console.error("[DOM ERROR] Cannot get 2d context from canvas");
          return;
        }

        if (APP.stats.chart) APP.stats.chart.destroy();
        APP.stats.chart = new Chart(context, {
          type: "line",
          data: {
            labels: h.map((d) => d.date),
            datasets: [
              {
                label: "Top Set",
                data: h.map((d) => d.top),
                borderColor: "#10b981",
                backgroundColor: "#10b981",
                yAxisID: "y",
                tension: 0.3,
              },
              {
                label: "Volume",
                data: h.map((d) => d.vol),
                type: "bar",
                yAxisID: "y1",
                backgroundColor: "rgba(59,130,246,0.2)",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                display: true,
                position: "left",
                grid: {
                  color: "#334155",
                },
              },
              y1: {
                display: true,
                position: "right",
                grid: {
                  display: false,
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: "#94a3b8",
                  maxTicksLimit: 5,
                },
              },
            },
          },
        });
      }
    },

    renderCardioChart: (logs) => {
      const ctx = document.getElementById("progressChart");
      if (!ctx) return;

      const context = ctx.getContext("2d");
      if (!context) return;

      const zone2Lower = logs[0].zoneTarget[0];
      const zone2Upper = logs[0].zoneTarget[1];

      if (APP.stats.chart) APP.stats.chart.destroy();

      APP.stats.chart = new Chart(context, {
        type: "line",
        data: {
          labels: logs.map((l) => l.date),
          datasets: [
            {
              label: "Duration (min)",
              data: logs.map((l) => l.duration),
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              yAxisID: "y",
              tension: 0.3,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: "Avg HR (bpm)",
              data: logs.map((l) => l.avgHR),
              borderColor: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              yAxisID: "y1",
              tension: 0.3,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                color: "#94a3b8",
                font: { size: 11 },
                usePointStyle: true,
              },
            },
            annotation: {
              annotations: {
                zone2Box: {
                  type: "box",
                  yMin: zone2Lower,
                  yMax: zone2Upper,
                  yScaleID: "y1",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  borderColor: "rgba(16, 185, 129, 0.3)",
                  borderWidth: 1,
                  label: {
                    display: true,
                    content: "Zone 2 Target",
                    position: "start",
                    color: "#10b981",
                    font: { size: 9 },
                  },
                },
              },
            },
          },
          scales: {
            y: {
              display: true,
              position: "left",
              title: {
                display: true,
                text: "Duration (min)",
                color: "#3b82f6",
                font: { size: 11, weight: "bold" },
              },
              grid: {
                color: "#334155",
              },
              ticks: {
                color: "#3b82f6",
              },
            },
            y1: {
              display: true,
              position: "right",
              title: {
                display: true,
                text: "Heart Rate (bpm)",
                color: "#ef4444",
                font: { size: 11, weight: "bold" },
              },
              grid: {
                display: false,
              },
              ticks: {
                color: "#ef4444",
              },
              min: zone2Lower - 10,
              max: zone2Upper + 10,
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: "#94a3b8",
                maxTicksLimit: 5,
              },
            },
          },
        },
      });
    },

    renderCardioTable: (logs, tbody) => {
      if (!tbody) return;

      const tableEl = tbody.closest("table");
      if (tableEl) {
        tableEl.style.tableLayout = "fixed";
        tableEl.style.width = "100%";
        tableEl.style.borderSpacing = "0";
        tableEl.style.padding = "0";
        tableEl.className = "w-full border-collapse p-0 m-0";

        const thead = tableEl.querySelector("thead tr");
        if (thead) {
          thead.innerHTML = `
                <th class="py-3 px-0 text-center text-[10px] font-bold text-slate-500 uppercase border-b border-slate-700" style="width: 15%">TGL</th>
                <th class="py-3 px-0 text-center text-[10px] font-bold text-slate-500 uppercase border-b border-slate-700" style="width: 25%">Machine</th>
                <th class="py-3 px-0 text-center text-[10px] font-bold text-slate-500 uppercase border-b border-slate-700" style="width: 20%">Dur.</th>
                <th class="py-3 px-0 text-center text-[10px] font-bold text-slate-500 uppercase border-b border-slate-700" style="width: 20%">HR Avg</th>
                <th class="py-3 px-0 text-center text-[10px] font-bold text-slate-500 uppercase border-b border-slate-700" style="width: 20%">Note</th>
              `;
        }
      }

      let html = "";
      [...logs]
        .sort((a, b) => b.ts - a.ts)
        .forEach((l) => {
          const lower = l.zoneTarget ? l.zoneTarget[0] : 0;
          const upper = l.zoneTarget ? l.zoneTarget[1] : 200;
          const inZone = l.avgHR >= lower && l.avgHR <= upper;

          const zoneIcon = inZone
            ? '<i class="fa-solid fa-circle-check text-emerald-500 text-[9px] inline-block ml-0.5"></i>'
            : '<i class="fa-solid fa-circle-exclamation text-yellow-500 text-[9px] inline-block ml-0.5"></i>';
          const hrClass = inZone ? "text-emerald-400" : "text-yellow-400";

          html += `
              <tr class="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                <td class="py-3 px-0 text-center text-slate-400 text-xs font-mono">${
                  l.date
                }</td>

                <td class="py-3 px-0 text-center text-sm font-bold text-blue-400 truncate capitalize">${
                  l.machine
                }</td>

                <td class="py-3 px-0 text-center text-white font-mono text-sm">
                    ${
                      l.duration
                    }<span class="text-slate-600 text-[10px]">m</span>
                </td>

                <td class="py-3 px-0 text-center whitespace-nowrap">
                    <span class="${hrClass} font-bold font-mono text-sm">${
            l.avgHR
          }</span><span class="text-[9px] text-slate-600">bpm</span>${zoneIcon}
                </td>

                <td class="py-3 px-0 text-center text-slate-500 text-[10px] italic truncate px-1">${
                  l.note || "-"
                }</td>
              </tr>
            `;
        });

      tbody.innerHTML = html;
    },

    updateCardioVitals: (logs, vital) => {
      if (!vital) return;

      const avgDuration = Math.round(
        logs.reduce((sum, l) => sum + l.duration, 0) / logs.length
      );
      const avgHR = Math.round(
        logs.reduce((sum, l) => sum + l.avgHR, 0) / logs.length
      );
      const totalSessions = logs.length;

      const inZoneCount = logs.filter(
        (l) => l.avgHR >= l.zoneTarget[0] && l.avgHR <= l.zoneTarget[1]
      ).length;
      const consistency = Math.round((inZoneCount / totalSessions) * 100);

      vital.className = "";
      vital.style.display = "block";
      vital.style.width = "100%";

      vital.innerHTML = `
            <div class="w-full space-y-2">
              <div class="grid grid-cols-3 gap-2">
                <div class="bg-slate-700/30 p-2 rounded border border-slate-700">
                  <div class="text-[8px] text-slate-400 uppercase mb-1">Avg Duration</div>
                  <div class="text-2xl font-black text-blue-400">${avgDuration}</div>
                  <div class="text-[9px] text-blue-300 font-bold">min</div>
                </div>
                <div class="bg-slate-700/30 p-2 rounded border border-slate-700">
                  <div class="text-[8px] text-slate-400 uppercase mb-1">Avg HR</div>
                  <div class="text-2xl font-black text-red-400">${avgHR}</div>
                  <div class="text-[9px] text-red-300 font-bold">bpm</div>
                </div>
                <div class="bg-slate-700/30 p-2 rounded border border-slate-700">
                  <div class="text-[8px] text-slate-400 uppercase mb-1">Sessions</div>
                  <div class="text-3xl font-black text-white">${totalSessions}</div>
                </div>
              </div>

              <div class="bg-slate-700/30 p-2 rounded border ${
                consistency >= 80
                  ? "border-emerald-500/50"
                  : consistency >= 60
                  ? "border-yellow-500/50"
                  : "border-red-500/50"
              }">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-[9px] text-slate-300 uppercase font-bold flex items-center gap-1">
                    <span>${
                      consistency >= 80 ? "✅" : consistency >= 60 ? "⚠️" : "❌"
                    }</span>
                    Zone 2 Consistency
                  </span>
                  <span class="text-lg font-black ${
                    consistency >= 80
                      ? "text-emerald-400"
                      : consistency >= 60
                      ? "text-yellow-400"
                      : "text-red-400"
                  }">${consistency}%</span>
                </div>
                <div class="bg-slate-900/50 rounded-full h-2 overflow-hidden">
                  <div class="h-full transition-all duration-500 ${
                    consistency >= 80
                      ? "bg-emerald-500"
                      : consistency >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }" style="width: ${consistency}%"></div>
                </div>
                <div class="flex justify-between mt-1 text-[8px] text-slate-500">
                  <span>0%</span>
                  <span class="text-slate-400">${inZoneCount}/${totalSessions}</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          `;
    },
  };

  console.log("[STATS] ✅ Stats module loaded");
})();
