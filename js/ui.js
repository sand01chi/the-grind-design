(function() {
  'use strict';

  if (!window.APP) window.APP = {};

  // ============================================================
  // APP.ui - UI Rendering & Modal System
  // ============================================================
  console.log("[UI] Loading... APP.nav =", window.APP?.nav);


  APP.ui = {
    // Exercise Picker State
    exercisePicker: {
      mode: null,
      sessionId: null,
      exerciseIndex: null,
      allExercises: [],
      filteredExercises: [],
      currentFilter: "all",
    },

    // Toast Notifications
    showToast: (msg, type = "success") => {
      const con = document.getElementById("toast-container");
      const t = document.createElement("div");
      t.className = `toast toast-${type}`;
      let icon =
        type === "success"
          ? '<i class="fa-solid fa-arrow-up"></i>'
          : '<i class="fa-solid fa-triangle-exclamation"></i>';
      t.innerHTML = `<div class="toast-icon">${icon}</div><div class="text-xs font-bold text-white leading-tight">${msg}</div>`;
      con.appendChild(t);
      requestAnimationFrame(() => t.classList.add("show"));
      setTimeout(() => {
        t.classList.remove("show");
        setTimeout(() => t.remove(), 300);
      }, 4000);
    },

    // Focus Mode
    toggleFocusMode: () => {
      APP.state.focusMode = !APP.state.focusMode;
      APP.ui.updateFocusBtn();
      const el = document.getElementById("exercise-list");
      APP.state.focusMode
        ? el.classList.add("focus-active")
        : el.classList.remove("focus-active");
      if (APP.state.focusMode) APP.ui.checkActiveCard();
    },

    updateFocusBtn: () => {
      const btn = document.getElementById("focus-btn");
      if (APP.state.focusMode) {
        btn.className =
          "text-xs bg-emerald-600 text-white border border-emerald-500 px-3 py-1.5 rounded-full transition flex items-center gap-2 shadow-lg shadow-emerald-500/20";
        btn.innerHTML = `<i class="fa-solid fa-eye-slash"></i> Exit Focus`;
      } else {
        btn.className =
          "text-xs bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1.5 rounded-full hover:text-white transition flex items-center gap-2";
        btn.innerHTML = `<i class="fa-solid fa-eye"></i> Focus Mode`;
      }
    },

    checkActiveCard: () => {
      const cards = document.querySelectorAll(".exercise-card");
      let found = false;
      cards.forEach((c) => {
        c.classList.remove("active-card");
        const chks = c.querySelectorAll(".checkbox-done");
        let all = true;
        chks.forEach((k) => {
          if (!k.checked) all = false;
        });
        if (all) {
          c.classList.add("completed");
          c.classList.remove("opacity-50", "scale-95", "grayscale");
        } else {
          c.classList.remove("completed");
          c.classList.remove("opacity-50", "scale-95", "grayscale");
          if (!found) {
            c.classList.add("active-card");
            if (APP.state.focusMode)
              c.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            found = true;
          }
        }
      });
    },

    toggleWarmup: () =>
      document
        .getElementById("warmup-content")
        .classList.toggle("hidden"),

    updateCompletedSetsCollapse: (exerciseIdx) => {
      const card = document.getElementById(`card-${exerciseIdx}`);
      if (!card) return;

      const allRows = card.querySelectorAll('[id^="row_"]');
      let completedCount = 0;
      let totalSets = allRows.length;

      allRows.forEach((row) => {
        if (row.classList.contains("set-row-completed")) {
          completedCount++;
        }
      });

      const summaryEl = card.querySelector(".completed-sets-summary");
      const setsContainer = card.querySelector(".sets-container");

      if (completedCount > 0 && completedCount < totalSets) {
      } else if (summaryEl && completedCount === 0) {
        summaryEl.remove();
      }
    },

    toggleCompletedSets: (exerciseIdx) => {
      const setsContainer = document.querySelector(
        `#card-${exerciseIdx} .sets-container`
      );
      const icon = document.getElementById(
        `collapse-icon-${exerciseIdx}`
      );

      if (setsContainer.classList.contains("sets-collapsed")) {
        setsContainer.classList.remove("sets-collapsed");
        icon.className = "fa-solid fa-chevron-up";
      } else {
        setsContainer.classList.add("sets-collapsed");
        icon.className = "fa-solid fa-chevron-down";
      }
    },

    checkAllSetsCompleted: (exerciseIdx) => {
      const card = document.getElementById(`card-${exerciseIdx}`);
      if (!card) return;

      const allCheckboxes = card.querySelectorAll(".checkbox-done");
      let allCompleted = true;
      let completedCount = 0;

      allCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          completedCount++;
        } else {
          allCompleted = false;
        }
      });

      if (allCompleted && completedCount > 0) {
        const setsContainer = card.querySelector(".sets-container");
        if (setsContainer) {
          setsContainer.classList.add("sets-collapsed");
        }

        card.classList.add("all-completed");

        const volumeCounter = document.getElementById(
          `volume-counter-${exerciseIdx}`
        );
        if (volumeCounter) {
          volumeCounter.classList.add("completed-card-summary");
        }

        APP.ui.showToast(
          `✅ Exercise #${exerciseIdx + 1} selesai!`,
          "success"
        );
      } else {
        const setsContainer = card.querySelector(".sets-container");
        if (setsContainer) {
          setsContainer.classList.remove("sets-collapsed");
        }
        card.classList.remove("all-completed");

        const volumeCounter = document.getElementById(
          `volume-counter-${exerciseIdx}`
        );
        if (volumeCounter) {
          volumeCounter.classList.remove("completed-card-summary");
        }
      }
    },

    toggleSetsVisibility: (exerciseIdx) => {
      const card = document.getElementById(`card-${exerciseIdx}`);
      if (!card) return;

      const setsContainer = card.querySelector(".sets-container");
      if (!setsContainer) return;

      const isCollapsed =
        setsContainer.classList.contains("sets-collapsed");

      if (isCollapsed) {
        setsContainer.classList.remove("sets-collapsed");
        const volumeCounter = document.getElementById(
          `volume-counter-${exerciseIdx}`
        );
        if (volumeCounter) {
          volumeCounter.classList.remove("completed-card-summary");
        }
      } else {
        setsContainer.classList.add("sets-collapsed");
        const volumeCounter = document.getElementById(
          `volume-counter-${exerciseIdx}`
        );
        if (volumeCounter) {
          volumeCounter.classList.add("completed-card-summary");
        }
      }
    },

    // Modal System
    openModal: (n) => {
      document.getElementById(`${n}-modal`).classList.remove("hidden");
      if (n === "weight") APP.ui.renderWeight();
      if (n === "profile") APP.data.loadProfile();
      if (n === "stats") {
        APP.stats.loadOptions();
        setTimeout(() => APP.stats.switchTab("dashboard"), 100);
      }
      if (n === "library") APP.ui.renderLibrary();
      if (n === "calendar") {
        APP.state.currentCalDate = new Date();
        APP.ui.renderCalendar();
      }
      if (n === "spontaneous") {
        if (APP.session.spontaneous) APP.session.spontaneous.renderPresets();
        else alert("Error: Module Spontaneous Missing");
      }
    },

    closeModal: (n) =>
      document.getElementById(`${n}-modal`).classList.add("hidden"),

    openBio: (t, b) => {
      document.getElementById("bio-title").innerText = t;
      document.getElementById("bio-text").innerText = b;
      APP.ui.openModal("bio");
    },

    // History Modal - WITH SPONTANEOUS TAG FIX
    openHist: (n) => {
      document.getElementById("hist-title").innerText = n;
      const b = document.getElementById("hist-content");
      if (!b) {
        console.error("[DOM ERROR] hist-content element not found");
        return;
      }
      const h = LS_SAFE.getJSON("gym_hist", []);
      const l = h.filter((x) => x.ex === n).sort((a, b) => b.ts - a.ts);
      let html = l.length
        ? ""
        : `<p class='text-slate-500 text-center text-xs'>No Data.</p>`;
      l.forEach((x) => {
        if (x.type === "cardio") {
          const inZone =
            x.avgHR >= x.zoneTarget[0] && x.avgHR <= x.zoneTarget[1];
          const zoneIcon = inZone ? "✅" : "⚠️";

          html += `
            <div class="bg-slate-900/50 p-3 rounded-xl border border-blue-700/50 mb-2">
              <div class="flex justify-between items-center mb-2 border-b border-slate-800 pb-1">
                <span class="text-xs font-bold text-slate-300">${
                  x.date
                }</span>
                <span class="text-[10px] bg-blue-900/30 text-blue-400 px-2 rounded-full border border-blue-900/50">🏃 ${
                  x.machine
                }</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="bg-slate-800/50 p-2 rounded">
                  <div class="text-[9px] text-slate-500">Duration</div>
                  <div class="text-blue-400 font-bold">${
                    x.duration
                  } min</div>
                </div>
                <div class="bg-slate-800/50 p-2 rounded">
                  <div class="text-[9px] text-slate-500">Avg HR</div>
                  <div class="text-blue-400 font-bold">${
                    x.avgHR
                  } bpm ${zoneIcon}</div>
                </div>
              </div>
              ${
                x.note
                  ? `<div class="text-[10px] text-slate-400 mt-2 italic">💭 ${x.note}</div>`
                  : ""
              }
            </div>
          `;
          return;
        }

        // ⚠️ FIX: Add spontaneous tag for resistance logs
        const spontaneousTag = x.src === "spontaneous"
          ? '<span class="px-2 py-0.5 bg-purple-600 text-white text-[9px] font-bold rounded uppercase mr-2">SPONTANEOUS</span>'
          : '';

        let bestSet = {
          k: 0,
          r: 0,
        };
        let maxLoad = 0;
        x.d.forEach((s) => {
          if (s.k > maxLoad) {
            maxLoad = s.k;
            bestSet = s;
          } else if (s.k === maxLoad && s.r > bestSet.r) {
            bestSet = s;
          }
        });
        html += `
                  <div class="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 mb-2">
                      <div class="flex justify-between items-center mb-2 border-b border-slate-800 pb-1">
                          <div class="flex items-center">
                              ${spontaneousTag}
                              <span class="text-xs font-bold text-slate-300">${
                                x.date
                              }</span>
                          </div>
                          <span class="text-[10px] bg-emerald-900/30 text-emerald-400 px-2 rounded-full border border-emerald-900/50">Top: ${
                            bestSet.k
                          }kg x ${bestSet.r}</span>
                      </div>
                      <div class="flex flex-wrap gap-2">
                          ${x.d
                            .map((s) => {
                              const isBest =
                                s.k === bestSet.k && s.r === bestSet.r;
                              let badgeColor = isBest
                                ? "bg-emerald-600 text-white border-emerald-500"
                                : "bg-slate-800 text-slate-400 border-slate-700";
                              return `<span class="text-[10px] px-2 py-1 rounded border ${badgeColor} font-mono">${
                                s.k
                              }x${s.r} ${
                                s.rpe
                                  ? `<span class="text-yellow-400 font-bold">@${s.rpe}</span>`
                                  : ""
                              }</span>`;
                            })
                            .join("")}
                      </div>
                  </div>`;
      });
      b.innerHTML = html;
      APP.ui.openModal("history");
    },

    // Warmup Calculator
    openCalc: (idx) => {
      const inputs = document.querySelectorAll(`#card-${idx} .input-k`);
      let maxK = 0;
      inputs.forEach((i) => {
        const v = parseFloat(i.value);
        if (v > maxK) maxK = v;
      });
      if (maxK === 0) return alert("Isi beban (KG) dulu!");
      const sData = APP.state.workoutData[APP.state.currentSessionId];
      const sOpt = parseInt(
        LS_SAFE.get(`pref_${APP.state.currentSessionId}_${idx}`) || 0
      );
      const name = sData.exercises[idx].options[sOpt].n.toUpperCase();
      const isNonBarbell =
        name.includes("DUMBBELL") ||
        name.includes("DB") ||
        name.includes("MACHINE") ||
        name.includes("CABLE") ||
        name.includes("PRESS") ||
        name.includes("FLY");
      let useBar = true;
      if (isNonBarbell && !name.includes("BARBELL")) useBar = false;
      let baseBar = 20;
      let forcePlate = false;
      if (name.includes("LEG PRESS") || name.includes("HACK SQUAT")) {
        forcePlate = true;
        baseBar = 0;
      }
      document.getElementById("calc-target").innerText = maxK;
      const badge = document.getElementById("calc-type-badge");
      badge.innerText =
        useBar || forcePlate
          ? baseBar === 20
            ? "Barbell Protocol"
            : "Plate Loaded"
          : "Standard Machine/DB";
      badge.className =
        useBar || forcePlate
          ? "px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-700 text-slate-400"
          : "px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-900 text-indigo-400";
      const steps = document.getElementById("calc-steps");
      let sets = useBar
        ? [
            {
              p: 0,
              r: 10,
              l: "Bar Kosong",
            },
            {
              p: 0.5,
              r: 5,
              l: "Warm 1",
            },
            {
              p: 0.7,
              r: 3,
              l: "Warm 2",
            },
            {
              p: 0.9,
              r: 1,
              l: "Potentiation",
            },
          ]
        : [
            {
              p: 0.5,
              r: 8,
              l: "Warm 1",
            },
            {
              p: 0.7,
              r: 3,
              l: "Warm 2",
            },
            {
              p: 0.9,
              r: 1,
              l: "Potentiation",
            },
          ];
      let html = "";
      sets.forEach((s) => {
        let w = Math.round((maxK * s.p) / 2.5) * 2.5;
        if (useBar && s.p === 0) w = 20;
        if (s.p > 0 && w >= maxK) return;
        if (w === 0 && !useBar && !forcePlate) return;
        let pHTML = "";
        if ((useBar && w > 20) || (forcePlate && w > 0))
          pHTML = `<div class="mt-1">${APP.ui.getPlates(
            w,
            baseBar
          )}</div>`;
        html += `<div class="bg-slate-700/50 p-2 rounded text-sm mb-2 border border-slate-700/50"><div class="flex justify-between items-center"><span class="text-slate-400">${s.l}</span><span class="font-mono font-bold text-white">${w}kg <span class="text-emerald-400 text-xs">x${s.r}</span></span></div>${pHTML}</div>`;
      });
      steps.innerHTML = html;
      APP.ui.openModal("calc");
    },

    getPlates: (target, base) => {
      if (target <= base) return "";
      let w = (target - base) / 2;
      const pArr = [20, 15, 10, 5, 2.5, 1.25];
      let html = "";
      for (let p of pArr) {
        while (w >= p) {
          let c = "plate-20";
          if (p === 15) c = "plate-15";
          else if (p === 10) c = "plate-10";
          else if (p === 5) c = "plate-5";
          else if (p === 2.5) c = "plate-2_5";
          else if (p === 1.25) c = "plate-1_25";
          html += `<span class="plate-badge ${c}">${p}</span>`;
          w -= p;
        }
      }
      return html;
    },

    // Render Methods
    renderWeight: () => {
      const l = document.getElementById("weight-list");

      if (!l) {
        console.error("[DOM ERROR] weight-list element not found");
        return;
      }

      const w = LS_SAFE.getJSON("weights", []);
      let html = "";
      w.forEach(
        (x) =>
          (html += `<div class="flex justify-between p-2 bg-slate-900/50 rounded mb-1 text-xs"><span class="text-white font-bold">${x.v} kg</span><span class="text-slate-500">${x.d}</span></div>`)
      );
      l.innerHTML = html;
    },

    renderLibrary: () => {
      const lib = LS_SAFE.getJSON("cscs_library", []);
      const el = document.getElementById("library-list");

      if (!el) {
        console.error("[DOM ERROR] library-list element not found");
        return;
      }

      if (!lib.length) {
        el.innerHTML = `<p class="text-[10px] text-slate-500 text-center italic py-2">Belum ada program tersimpan.</p>`;
        return;
      }

      let html = "";
      lib.forEach((item, i) => {
        const dStr = DT.formatDate(new Date(item.date));
        html += `<div class="bg-slate-900 p-2 rounded border border-slate-700 flex justify-between items-center"><div><div class="text-xs text-white font-bold">${item.name}</div><div class="text-[10px] text-slate-500">${dStr}</div></div><div class="flex gap-2"><button onclick="APP.data.loadFromLibrary(${i})" class="bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded text-[10px] hover:bg-emerald-900/50 border border-emerald-900">Load</button><button onclick="APP.data.deleteFromLibrary(${i})" class="text-red-500 hover:text-white px-2 text-[10px]"><i class="fa-solid fa-trash"></i></button></div></div>`;
      });
      el.innerHTML = html;
    },

    // Calendar - WITH SPONTANEOUS INDICATOR FIX
    renderCalendar: () => {
      const g = document.getElementById("cal-grid");
      const hText = document.getElementById("cal-month-year");

      if (!g || !hText) {
        console.error("[DOM ERROR] Calendar elements not found", {
          g: !!g,
          hText: !!hText,
        });
        return;
      }

      const curr = APP.state.currentCalDate;
      const y = curr.getFullYear(),
        m = curr.getMonth();
      hText.innerText = DT.formatMonth(curr);
      const firstDay = new Date(y, m, 1).getDay();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      let html = "";
      for (let i = 0; i < firstDay; i++) html += `<div></div>`;
      const hist = LS_SAFE.getJSON("gym_hist", []);
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(y, m, d);
        const dStr = DT.formatDate(dateObj);
        const logs = hist.filter(
          (x) => x.date === dStr && new Date(x.ts).getMonth() === m
        );
        let c = "bg-slate-700 text-slate-400";
        let dot = "";

        // ⚠️ FIX: Add spontaneous indicator
        const hasSpontaneous = logs.some((l) => l.src === "spontaneous");

        if (logs.length) {
          const hasCardio = logs.some((l) => l.type === "cardio");
          const hasResistance = logs.some((l) => l.type !== "cardio");

          if (hasCardio && hasResistance) {
            c =
              "bg-emerald-900/50 border border-emerald-500 text-white shadow shadow-emerald-500/20";
            dot = `<div class="flex gap-0.5 justify-center mt-1">
              <div class="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
              <div class="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            </div>`;
          } else if (hasCardio) {
            c =
              "bg-blue-900/50 border border-blue-500 text-white shadow shadow-blue-500/20";
            dot = `<div class="w-1.5 h-1.5 bg-blue-400 rounded-full mx-auto mt-1"></div>`;
          } else {
            c =
              "bg-emerald-900/50 border border-emerald-500 text-white shadow shadow-emerald-500/20";
            dot = `<div class="w-1.5 h-1.5 bg-emerald-400 rounded-full mx-auto mt-1"></div>`;
          }

          // Add purple border for spontaneous workouts
          if (hasSpontaneous) {
            c += " border-l-4 border-purple-500";
          }
        }
        if (new Date().toDateString() === dateObj.toDateString())
          c += " ring-1 ring-yellow-400";
        html += `<div onclick="APP.ui.viewDay('${dStr}')" class="h-12 rounded-lg ${c} flex flex-col items-center justify-center cursor-pointer hover:bg-slate-600 transition active:scale-95"><span class="text-xs font-bold leading-none">${d}</span>${dot}</div>`;
      }
      g.innerHTML = html;
    },

    changeMonth: (d) => {
      APP.state.currentCalDate.setMonth(
        APP.state.currentCalDate.getMonth() + d
      );
      APP.ui.renderCalendar();
    },

    // Calendar Day View - WITH SPONTANEOUS TAG FIX
    viewDay: (dStr) => {
      const box = document.getElementById("cal-details");
      if (!box) {
        console.error("[DOM ERROR] cal-details element not found");
        return;
      }
      const m = APP.state.currentCalDate.getMonth();
      const hist = LS_SAFE.getJSON("gym_hist", []);
      const logs = hist.filter(
        (x) => x.date === dStr && new Date(x.ts).getMonth() === m
      );
      if (!logs.length)
        return (box.innerHTML = `<div class="h-full flex flex-col items-center justify-center text-slate-500 opacity-50"><i class="fa-solid fa-bed mb-1 text-xl"></i><span class="text-xs italic">Rest Day</span></div>`);

      // ⚠️ FIX: Add spontaneous tag to session title
      const isSpontaneous = logs[0].src === "spontaneous";
      const spontaneousTag = isSpontaneous
        ? '<span class="px-2 py-0.5 bg-purple-600 text-white text-[9px] font-bold rounded uppercase ml-2">SPONTANEOUS</span>'
        : '';

      const sessionTitle =
        logs[0].title ||
        (logs[0].src === "spontaneous" ? "Spontaneous" : logs[0].src);
      const duration = logs[0].dur || 0;
      const totalVol = logs
        .reduce((acc, curr) => {
          if (curr.type === "cardio") return acc;
          return acc + (curr.vol || 0);
        }, 0)
        .toLocaleString();
      let maxRPE = 0;
      logs.forEach((l) => {
        if (l.type === "cardio") return;

        if (l.d && Array.isArray(l.d)) {
          l.d.forEach((s) => {
            if (s.rpe && parseFloat(s.rpe) > maxRPE)
              maxRPE = parseFloat(s.rpe);
          });
        }
      });
      let fatigueStatus = "Low";
      let fatigueColor = "text-emerald-400";
      if (maxRPE >= 9.5) {
        fatigueStatus = "High Fatigue";
        fatigueColor = "text-red-400";
      } else if (maxRPE >= 8) {
        fatigueStatus = "Optimal";
        fatigueColor = "text-yellow-400";
      }
      let html = `
              <div class="mb-3 border-b border-slate-700 pb-2">
                  <div class="flex justify-between items-center mb-1">
                      <div class="flex items-center">
                          <span class="text-sm font-bold text-white text-emerald-400">${sessionTitle}</span>
                          ${spontaneousTag}
                      </div>
                      <span class="text-[10px] text-slate-400 bg-slate-800 px-2 rounded"><i class="fa-solid fa-clock mr-1"></i> ${duration}m</span>
                  </div>
                  <div class="grid grid-cols-2 gap-2 mt-2">
                       <div class="bg-slate-800 p-1.5 rounded text-center border border-slate-700">
                          <div class="text-[9px] text-slate-500 uppercase">Total Vol</div>
                          <div class="text-xs font-bold text-blue-300">${totalVol} <span class="text-[9px]">kg</span></div>
                       </div>
                       <div class="bg-slate-800 p-1.5 rounded text-center border border-slate-700">
                          <div class="text-[9px] text-slate-500 uppercase">Max RPE</div>
                          <div class="text-xs font-bold ${fatigueColor}">${maxRPE} <span class="text-[9px] font-normal opacity-70">(${fatigueStatus})</span></div>
                       </div>
                  </div>
              </div>
              <div class="space-y-1 max-h-[120px] overflow-y-auto no-scrollbar">`;
      logs.forEach((l) => {
        if (l.type === "cardio") {
          const inZone =
            l.avgHR >= l.zoneTarget[0] && l.avgHR <= l.zoneTarget[1];
          const zoneIcon = inZone ? "✅" : "⚠️";

          // Add spontaneous indicator for cardio
          const cardioSpontaneousTag = l.src === "spontaneous"
            ? '<span class="text-[9px] bg-purple-600 text-white px-1 py-0.5 rounded uppercase ml-1 font-bold">SPONT</span>'
            : '';

          html += `
            <div class="flex justify-between items-center bg-blue-900/20 p-1.5 rounded border border-blue-700/50 mb-1">
              <div class="flex items-center min-w-0 gap-2">
                <span class="text-[10px]">🏃</span>
                <div>
                  <div class="flex items-center gap-1">
                    <span class="text-[10px] text-blue-200 font-medium">${l.machine} LISS</span>
                    ${cardioSpontaneousTag}
                  </div>
                  <div class="text-[9px] text-slate-400">${l.duration}min • ${l.avgHR}bpm ${zoneIcon}</div>
                </div>
              </div>
            </div>
          `;
          return;
        }

        const prevLogs = hist
          .filter(
            (h) =>
              h.ex === l.ex &&
              h.ts < l.ts &&
              (l.src === "spontaneous" || h.src !== "spontaneous")
          )
          .sort((a, b) => b.ts - a.ts);
        let badge = "";
        if (prevLogs.length > 0) {
          const prev = prevLogs[0];
          const allHistory = hist.filter(
            (h) => h.ex === l.ex && h.ts < l.ts
          );
          const globalMaxLoad = Math.max(...allHistory.map((h) => h.top));
          if (l.top > globalMaxLoad) {
            badge = `<span class="text-[9px] bg-yellow-900/40 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-700 ml-1 font-bold">PR 👑</span>`;
          } else {
            if (l.vol > prev.vol)
              badge = `<span class="text-[9px] bg-emerald-900/40 text-emerald-400 px-1 rounded ml-1">Vol ▲</span>`;
            else if (l.vol < prev.vol)
              badge = `<span class="text-[9px] bg-red-900/40 text-red-400 px-1 rounded ml-1">Vol ▼</span>`;
            else
              badge = `<span class="text-[9px] bg-slate-700 text-slate-400 px-1 rounded ml-1">Vol =</span>`;
          }
        } else {
          badge = `<span class="text-[9px] bg-blue-900/40 text-blue-300 px-1 rounded ml-1">New ✨</span>`;
        }

        // Add spontaneous indicator for individual exercises
        const exerciseSpontaneousTag = l.src === "spontaneous"
          ? '<span class="text-[9px] bg-purple-600 text-white px-1 py-0.5 rounded uppercase ml-1 font-bold">SPONT</span>'
          : '';

        html += `
                  <div class="flex justify-between items-center bg-slate-800/80 p-1.5 rounded border border-slate-700">
                      <div class="flex items-center min-w-0">
                          <span class="text-[10px] text-slate-200 truncate font-medium">${l.ex}</span>
                          ${badge}
                          ${exerciseSpontaneousTag}
                      </div>
                      <span class="text-[10px] font-mono text-emerald-500 font-bold whitespace-nowrap">${l.top}kg</span>
                  </div>`;
      });
      html += `</div>`;
      box.innerHTML = html;
    },

    showManualCopy: (txt) => {
      APP.ui.openModal("library");
      const b = document.getElementById("ai-input");
      b.value = txt;
      b.focus();
      b.select();
      alert("Auto-copy blocked. Silakan copy manual teks di bawah.");
    },

    // Exercise Picker System
    openExercisePicker: (mode, sessionId, exerciseIndex) => {
      try {
        if (typeof EXERCISES_LIBRARY === "undefined") {
          console.error("[ERROR] EXERCISES_LIBRARY not loaded!");
          alert(
            "Exercise library tidak berhasil dimuat. Mohon refresh halaman."
          );
          return;
        }

        APP.ui.exercisePicker.mode = mode;
        APP.ui.exercisePicker.sessionId = sessionId;
        APP.ui.exercisePicker.exerciseIndex = exerciseIndex;
        APP.ui.exercisePicker.currentFilter = "all";

        let allExercises = [];
        const categories = EXERCISES_LIBRARY.getCategories();

        categories.forEach((cat) => {
          const exercises = EXERCISES_LIBRARY[cat] || [];

          exercises.forEach((ex) => {
            allExercises.push({
              category: cat,
              ...ex,
            });
          });
        });

        APP.ui.exercisePicker.allExercises = allExercises;
        APP.ui.exercisePicker.filteredExercises = allExercises;

        const categoryFilter = document.getElementById("category-filter");
        if (categoryFilter) {
          categoryFilter.innerHTML =
            '<button onclick="APP.ui.filterByCategory(\'all\')" class="text-[10px] px-2 py-1 rounded bg-emerald-600 text-white font-bold active-category">All</button>';

          categories.forEach((cat) => {
            const btn = document.createElement("button");
            btn.className =
              "text-[10px] px-2 py-1 rounded bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition";
            btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            btn.onclick = () => APP.ui.filterByCategory(cat);
            categoryFilter.appendChild(btn);
          });
        }

        const searchInput = document.getElementById("exercise-search");
        if (searchInput) {
          searchInput.value = "";
        }

        APP.ui.openModal("exercise-picker");

        APP.ui.renderExerciseList();
      } catch (e) {
        console.error("openExercisePicker Error:", e);
        alert("Error loading exercise library: " + e.message);
      }
    },

    filterByCategory: (category) => {
      APP.ui.exercisePicker.currentFilter = category;

      const buttons = document.querySelectorAll("#category-filter button");
      buttons.forEach((btn) => {
        if (
          btn.textContent.toLowerCase() === category.toLowerCase() ||
          (category === "all" && btn.textContent === "All")
        ) {
          btn.className =
            "text-[10px] px-2 py-1 rounded bg-emerald-600 text-white font-bold active-category";
        } else {
          btn.className =
            "text-[10px] px-2 py-1 rounded bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition";
        }
      });

      if (category === "all") {
        APP.ui.exercisePicker.filteredExercises =
          APP.ui.exercisePicker.allExercises;
      } else {
        APP.ui.exercisePicker.filteredExercises =
          APP.ui.exercisePicker.allExercises.filter(
            (ex) => ex.category === category
          );
      }

      APP.ui.renderExerciseList();
    },

    filterExercises: () => {
      const search =
        document.getElementById("exercise-search")?.value.toLowerCase() || "";

      if (APP.ui.exercisePicker.currentFilter === "all") {
        APP.ui.exercisePicker.filteredExercises =
          APP.ui.exercisePicker.allExercises.filter((ex) =>
            ex.n.toLowerCase().includes(search)
          );
      } else {
        APP.ui.exercisePicker.filteredExercises =
          APP.ui.exercisePicker.allExercises.filter(
            (ex) =>
              ex.category === APP.ui.exercisePicker.currentFilter &&
              ex.n.toLowerCase().includes(search)
          );
      }

      APP.ui.renderExerciseList();
    },

    renderExerciseList: () => {
      const listEl = document.getElementById("picker-exercise-list");
      if (!listEl) return;

      const exercises = APP.ui.exercisePicker.filteredExercises;

      if (exercises.length === 0) {
        listEl.innerHTML =
          '<p class="text-center text-sm text-slate-500 italic py-4">Tidak ada exercise ditemukan.</p>';
        return;
      }

      let html = "";
      exercises.forEach((ex, idx) => {
        const displayName = ex.n || "Unnamed";
        const category =
          (ex.category || "other").charAt(0).toUpperCase() +
          (ex.category || "other").slice(1);
        html += `
                  <div class="bg-slate-900 p-3 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition">
                      <div class="flex justify-between items-start mb-2">
                          <div class="flex-1">
                              <span class="text-sm font-bold text-white">${displayName}</span>
                              <span class="text-[9px] bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900 ml-2">${category}</span>
                          </div>
                      </div>
                      <div class="text-[10px] text-slate-400 mb-1"><strong>Reps:</strong> ${
                        ex.t_r || "-"
                      }</div>
                      <div class="text-[10px] text-slate-400 mb-2 line-clamp-2">${
                        ex.bio || "Tidak ada deskripsi"
                      }</div>
                      ${
                        ex.note
                          ? `<div class="text-[9px] text-slate-500 mb-2 italic">📌 ${ex.note}</div>`
                          : ""
                      }
                      <button onclick="APP.ui.selectExercise('${displayName.replace(
                        /'/g,
                        "\\'"
                      )}', '${ex.t_r || ""}', '${
          ex.bio ? ex.bio.replace(/'/g, "\\'") : ""
        }', '${
          ex.note ? ex.note.replace(/'/g, "\\'") : ""
        }')" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded transition"><i class="fa-solid fa-check mr-1"></i>Pilih</button>
                  </div>
              `;
      });

      listEl.innerHTML = html;
    },

    selectExercise: (name, targetReps, bio, note) => {
      try {
        const mode = APP.ui.exercisePicker.mode;

        if (mode === "editor") {
          const sessionId =
            APP.state.currentEditingSessionId ||
            APP.ui.exercisePicker.sessionId;
          const session = APP.state.workoutData[sessionId];

          if (!session) {
            alert("Session not found!");
            return;
          }

          let targetWeight = 0;

          if (typeof EXERCISES_LIBRARY !== "undefined") {
            const categories = EXERCISES_LIBRARY.getCategories();

            for (let cat of categories) {
              const exercises = EXERCISES_LIBRARY[cat] || [];
              const found = exercises.find((ex) => ex.n === name);

              if (found && found.t_k) {
                targetWeight = found.t_k;
                console.log(
                  `[PICKER] Found library target weight for "${name}": ${targetWeight}kg`
                );
                break;
              }
            }
          }

          if (targetWeight === 0) {
            targetWeight = 20;
            console.log(
              `[PICKER] Using default target weight for "${name}": ${targetWeight}kg`
            );
          }

          const newExercise = {
            sets: 3,
            rest: 90,
            note: note || "From Library",
            options: [
              {
                n: name,
                t_r: targetReps,
                t_k: targetWeight,
                bio: bio,
                vid: "",
                note: note || "",
              },
            ],
          };

          console.log("[PICKER] New exercise object created:", newExercise);

          session.exercises.push(newExercise);

          APP.session.renderExerciseList();
          APP.session.updateVolumePreview();

          APP.ui.closeModal("exercise-picker");
          APP.ui.showToast(`✅ "${name}" ditambahkan ke sesi`, "success");
        } else if (mode === "new") {
          const sessionId = APP.state.currentSessionId;

          const isCardio =
            name.includes("[Cardio]") ||
            APP.ui.exercisePicker.allExercises.find(
              (ex) => ex.n === name && ex.type === "cardio"
            );

          if (isCardio) {
            const cardioExercise = APP.ui.exercisePicker.allExercises.find(
              (ex) => ex.n === name
            );

            APP.state.workoutData[sessionId].exercises.push({
              type: "cardio",
              target_duration: parseInt(targetReps) || 30,
              target_hr_zone: "Zone 2",
              note: note || "Post-workout",
              options: [
                {
                  n: name,
                  t_r: targetReps,
                  bio: bio,
                  note: note || "",
                  type: "cardio",
                  machines: cardioExercise?.machines || [
                    "Treadmill",
                    "Static Bike",
                    "Rowing Machine",
                    "Elliptical",
                  ],
                },
              ],
            });
          } else {
            APP.state.workoutData[sessionId].exercises.push({
              sets: 3,
              rest: 90,
              note: note || "Library",
              options: [
                {
                  n: name,
                  t_r: targetReps,
                  bio: bio,
                  vid: "",
                  note: note || "",
                },
              ],
            });
          }

          APP.core.saveProgram();
          APP.nav.loadWorkout(sessionId);
          APP.ui.showToast(`✅ "${name}" ditambahkan`, "success");
        } else if (mode === "variant") {
          const sessionId = APP.ui.exercisePicker.sessionId;
          const exIdx = APP.ui.exercisePicker.exerciseIndex;

          APP.state.workoutData[sessionId].exercises[exIdx].options.push({
            n: name,
            t_r: targetReps,
            bio: bio,
            vid: "",
            note: note || "",
          });

          APP.core.saveProgram();
          APP.data.changeVariant(
            sessionId,
            exIdx,
            APP.state.workoutData[sessionId].exercises[exIdx].options.length -
              1
          );
          APP.ui.showToast(
            `✅ "${name}" ditambahkan sebagai alternatif`,
            "success"
          );
        }

        APP.ui.closeModal("exercise-picker");
      } catch (e) {
        console.error("selectExercise Error:", e);
        alert("Error: " + e.message);
      }
    },
  };

})();
