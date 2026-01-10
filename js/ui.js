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
    // V29.5 P2-001: XSS sanitization applied
    showToast: (msg, type = "success") => {
      const con = document.getElementById("toast-container");
      const t = document.createElement("div");
      t.className = `toast toast-${type}`;
      let icon =
        type === "success"
          ? '<i class="fa-solid fa-arrow-up"></i>'
          : '<i class="fa-solid fa-triangle-exclamation"></i>';
      // V29.5 P2-001: Sanitize message to prevent XSS (defense-in-depth)
      const safeMsg = window.APP.validation.sanitizeHTML(msg);
      t.innerHTML = `<div class="toast-icon">${icon}</div><div class="text-xs font-bold text-white leading-tight">${safeMsg}</div>`;
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

      // Initialize state if not exists
      if (!APP.state.expandedCards) APP.state.expandedCards = {};
      const sessKey = `${APP.state.currentSessionId}_${exerciseIdx}`;

      const allCheckboxes = card.querySelectorAll(".checkbox-done");
      if (allCheckboxes.length === 0) return; // Skip cardio or empty exercises

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
        // Removed eager class addition here to allow state check below
        // card.classList.add("all-completed"); 
        card.classList.add("card-collapsed");

        const volumeCounter = document.getElementById(
          `volume-counter-${exerciseIdx}`
        );
        if (volumeCounter) {
          volumeCounter.classList.add("completed-card-summary");
        }

        // Detect transition from incomplete -> complete
        const wasCompleted = card.classList.contains("all-completed");
        
        // RESPECT MANUAL EXPANSION STATE
        if (APP.state.expandedCards[sessKey]) {
          card.classList.remove("card-collapsed");
          if (setsContainer) setsContainer.classList.remove("sets-collapsed");
        } else {
             // Ensure collapsed
             card.classList.add("card-collapsed");
             if (setsContainer) setsContainer.classList.add("sets-collapsed");
        }

        // Only show toast if it wasn't already completed
        if (!wasCompleted) {
            card.classList.add("all-completed");
            // Toast removed per user request
        }
        
        // Ensure class is added (idempotent)
        card.classList.add("all-completed");
      } else {
        const setsContainer = card.querySelector(".sets-container");
        // Don't auto-expand sets container, let user decide
        card.classList.remove("all-completed");
        card.classList.remove("card-collapsed");

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

      // Logic: If Collapsed -> Expand. If Expanded -> Collapse.
      const isCurrentlyCollapsed = card.classList.contains("card-collapsed");
      
      if (!APP.state.expandedCards) APP.state.expandedCards = {};
      const sessKey = `${APP.state.currentSessionId}_${exerciseIdx}`;

      if (isCurrentlyCollapsed) {
          // USER WANTS TO EXPAND
          setsContainer.classList.remove("sets-collapsed");
          card.classList.remove("card-collapsed");
          APP.state.expandedCards[sessKey] = true;
      } else {
          // USER WANTS TO COLLAPSE
          setsContainer.classList.add("sets-collapsed");
          card.classList.add("card-collapsed");
          APP.state.expandedCards[sessKey] = false;
      }
    },

    // Modal System
    openModal: (n) => {
      document.getElementById(`${n}-modal`).classList.remove("hidden");
      if (n === "weight") APP.ui.renderWeight();
      if (n === "profile") APP.data.loadProfile();
      if (n === "nutrition") APP.data.loadNutrition();
      if (n === "stats") {
        APP.stats.loadOptions();
        setTimeout(() => {
          APP.stats.switchTab("dashboard");
          // V29.0: Render advanced ratios and insights
          if (typeof APP.stats.renderAdvancedRatios === 'function') {
            APP.stats.renderAdvancedRatios(30);
          }
          if (typeof APP.ui.renderInsightCards === 'function') {
            APP.ui.renderInsightCards(30);
          }
        }, 100);
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
            <div class="glass-card p-3 rounded-xl border border-blue-700/50 mb-2">
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
                  ? `<div class="text-[10px] text-slate-400 mt-2 italic">💭 ${window.APP.validation.sanitizeHTMLWithTags(x.note, ['br'])}</div>`
                  : ""
              }
            </div>
          `;
          // V29.5 P2-002: Cardio note sanitized above
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
                  <div class="glass-card p-3 rounded-xl border border-white/10 mb-2">
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
        html += `<div class="bg-white/5 p-2 rounded text-sm mb-2 border border-white/10"><div class="flex justify-between items-center"><span class="text-slate-400">${s.l}</span><span class="font-mono font-bold text-white">${w}kg <span class="text-emerald-400 text-xs">x${s.r}</span></span></div>${pHTML}</div>`;
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
          (html += `<div class="flex justify-between p-2 glass-card rounded mb-1 text-xs"><span class="text-white font-bold">${x.v} kg</span><span class="text-slate-500">${x.d}</span></div>`)
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
        // V29.5 P2-004: Sanitize library names (user-created)
        const safeName = window.APP.validation.sanitizeHTML(item.name || 'Untitled');
        html += `<div class="glass-card p-2 rounded border border-white/10 flex justify-between items-center"><div><div class="text-xs text-white font-bold">${safeName}</div><div class="text-[10px] text-slate-500">${dStr}</div></div><div class="flex gap-2"><button onclick="APP.data.loadFromLibrary(${i})" class="bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded text-[10px] hover:bg-emerald-900/50 border border-emerald-900">Load</button><button onclick="APP.data.deleteFromLibrary(${i})" class="text-red-500 hover:text-white px-2 text-[10px]"><i class="fa-solid fa-trash"></i></button></div></div>`;
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
        let c = "bg-white/5 text-slate-400";
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
        html += `<div onclick="APP.ui.viewDay('${dStr}')" class="h-12 rounded-lg ${c} flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition active:scale-95"><span class="text-xs font-bold leading-none">${d}</span>${dot}</div>`;
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

      // V29.5 P2-003: Sanitize session title from logs
      const rawTitle =
        logs[0].title ||
        (logs[0].src === "spontaneous" ? "Spontaneous" : logs[0].src);
      const sessionTitle = window.APP.validation.sanitizeHTML(rawTitle);
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
                       <div class="bg-white/5 p-1.5 rounded text-center border border-white/10">
                          <div class="text-[9px] text-slate-500 uppercase">Total Vol</div>
                          <div class="text-xs font-bold text-blue-300">${totalVol} <span class="text-[9px]">kg</span></div>
                       </div>
                       <div class="bg-white/5 p-1.5 rounded text-center border border-white/10">
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
                  <div class="flex justify-between items-center glass-card p-1.5 rounded border border-white/10">
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

    // V28.1: Simplified manual copy using textarea modal
    showManualCopy: (txt) => {
      APP.ui.openModal("library");
      const textarea = document.getElementById("ai-input");
      if (textarea) {
        textarea.value = txt;
        textarea.focus();
        textarea.select();
      }
    },

    // V28.1: Copy text from library modal textarea
    copyTextFromLibraryModal: () => {
      const textarea = document.getElementById("ai-input");
      if (!textarea || !textarea.value) {
        APP.ui.showToast("⚠️ Tidak ada text untuk dicopy", "warning");
        return;
      }

      // Try clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(textarea.value)
          .then(() => {
            APP.ui.showToast("✅ Text berhasil dicopy!", "success");
          })
          .catch((err) => {
            console.error("[UI] Clipboard copy failed:", err);
            // Fallback: text is already selected, user can copy manually
            textarea.focus();
            textarea.select();
            APP.ui.showToast("⚠️ Gunakan Ctrl+C atau long-press untuk copy", "warning");
          });
      } else {
        // Fallback for older browsers or mobile
        textarea.focus();
        textarea.select();
        try {
          // Try execCommand as fallback
          const success = document.execCommand("copy");
          if (success) {
            APP.ui.showToast("✅ Text berhasil dicopy!", "success");
          } else {
            APP.ui.showToast("⚠️ Gunakan Ctrl+C atau long-press untuk copy", "warning");
          }
        } catch (err) {
          console.error("[UI] execCommand copy failed:", err);
          APP.ui.showToast("⚠️ Gunakan Ctrl+C atau long-press untuk copy", "warning");
        }
      }
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
                  <div class="glass-card p-3 rounded-lg border border-white/10 hover:border-emerald-500/50 transition">
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

          // V29.5 P2-011: Guard session.exercises access
          if (!session.exercises || !Array.isArray(session.exercises)) {
            console.error("[UI] selectExercise: Invalid exercises array");
            session.exercises = []; // Auto-fix: Initialize empty array
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

          // V29.5 P2-011: Guard session.exercises access in "new" mode
          const currentSession = APP.state.workoutData[sessionId];
          if (!currentSession) {
            alert("Session not found!");
            return;
          }
          if (!currentSession.exercises || !Array.isArray(currentSession.exercises)) {
            console.error("[UI] selectExercise (new): Invalid exercises array");
            currentSession.exercises = []; // Auto-fix
          }

          const isCardio =
            name.includes("[Cardio]") ||
            APP.ui.exercisePicker.allExercises.find(
              (ex) => ex.n === name && ex.type === "cardio"
            );

          if (isCardio) {
            const cardioExercise = APP.ui.exercisePicker.allExercises.find(
              (ex) => ex.n === name
            );

            currentSession.exercises.push({
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
            currentSession.exercises.push({
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

    // ============================================================
    // AI COMMAND CENTER (V28 Phase 3)
    // ============================================================

    /**
     * Opens AI Command Center modal
     * Default mode: context export
     */
    openAICommandCenter: function(initialMode = "context") {
      const modal = document.getElementById("ai-command-center-modal");
      if (!modal) {
        console.error("[UI] AI Command Center modal not found");
        return;
      }

      // Set initial mode
      const selector = document.getElementById("ai-mode-selector");
      if (selector) {
        selector.value = initialMode;
      }

      // Load mode content
      this.switchAIMode(initialMode);

      // Show modal
      modal.classList.remove("hidden");

      console.log(`[UI] AI Command Center opened with mode: ${initialMode}`);
    },

    /**
     * Closes AI Command Center modal and cleans up state
     */
    closeAICommandCenter: function() {
      const modal = document.getElementById("ai-command-center-modal");
      if (modal) {
        modal.classList.add("hidden");
      }

      // Clear content area
      const contentArea = document.getElementById("ai-content-area");
      if (contentArea) {
        contentArea.innerHTML = "";
      }

      // Clear preview state
      window.aiCommandCenterPreview = null;

      console.log("[UI] AI Command Center closed, state cleared");
    },

    /**
     * Switches between AI modes (context export / import / backup)
     * V30.0 Phase 3.5: Now supports both modal and view content areas
     * @param {string} mode - "context", "import", "library", "backup", or "prompt-manager"
     */
    switchAIMode: function(mode) {
      // V30.0 Phase 3.5: Determine which content area to use
      // Check if AI view is visible (not hidden)
      const aiView = document.getElementById("ai-view");
      const aiViewContentArea = document.getElementById("ai-view-content-area");
      const modalContentArea = document.getElementById("ai-content-area");

      let contentArea;

      // If AI view exists and is visible, use its content area
      if (aiView && !aiView.classList.contains('hidden') && aiViewContentArea) {
        contentArea = aiViewContentArea;
      } else if (modalContentArea) {
        // Fall back to modal content area
        contentArea = modalContentArea;
      }

      if (!contentArea) {
        console.error("[UI] Content area not found (neither view nor modal)");
        return;
      }

      // Clear preview state
      window.aiCommandCenterPreview = null;

      if (mode === "context") {
        this.renderContextMode(contentArea);
      } else if (mode === "import") {
        this.renderImportMode(contentArea);
      } else if (mode === "library") {
        this.renderLibraryMode(contentArea);
      } else if (mode === "backup") {
        this.renderBackupMode(contentArea);
      } else if (mode === "prompt-manager") {
        this.renderPromptManagerMode(contentArea);
      }

      console.log(`[UI] Switched to AI mode: ${mode}`);
    },

    /**
     * Renders Context Export Mode
     * @param {HTMLElement} container - Content area container
     */
    renderContextMode: function(container) {
      // Generate context using AI Bridge
      let contextText = "";
      if (window.APP.aiBridge && window.APP.aiBridge.getPromptContext) {
        contextText = window.APP.aiBridge.getPromptContext("coach");
      } else {
        contextText = "[ERROR] AI Bridge module not loaded";
        console.error("[UI] AI Bridge not available");
      }

      const html = `
        <div class="space-y-3">
          <p class="text-xs text-slate-400">
            Konteks di bawah berisi profil, log latihan terakhir, dan struktur program aktif.
            Salin teks ini untuk konsultasi AI.
          </p>

          <textarea
            id="ai-context-textarea"
            readonly
            class="w-full bg-slate-900 text-slate-100 font-mono text-xs p-3 rounded-lg border border-slate-700 resize-none"
            rows="12"
            style="min-height: 300px;"
          >${contextText}</textarea>

          <button
            onclick="APP.ui.copyContextToClipboard()"
            class="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
          >
            <i class="fa-solid fa-copy"></i> SALIN KONTEKS
          </button>

          <p class="text-[10px] text-slate-500 italic text-center">
            Setelah disalin, paste ke AI seperti Gemini atau ChatGPT untuk konsultasi.
          </p>
        </div>
      `;

      container.innerHTML = html;
    },

    /**
     * Renders Import Recipe Mode
     * @param {HTMLElement} container - Content area container
     */
    renderImportMode: function(container) {
      const html = `
        <div class="space-y-3">
          <p class="text-xs text-slate-400">
            Paste JSON resep latihan dari AI di bawah, lalu klik Analyze untuk validasi.
          </p>

          <!-- Template Buttons -->
          <div class="flex gap-2 mb-2">
            <button
              onclick="APP.ui.showProgramTemplateOptions()"
              class="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 px-3 rounded-lg transition flex items-center justify-center gap-1"
              title="Load template atau copy program aktif"
            >
              <i class="fa-solid fa-file-code"></i> Template Program
            </button>
            <button
              onclick="APP.ui.loadRecipeTemplate('spontaneous')"
              class="flex-1 bg-purple-700 hover:bg-purple-600 text-white text-xs py-2 px-3 rounded-lg transition flex items-center justify-center gap-1"
              title="Load template untuk sesi spontan"
            >
              <i class="fa-solid fa-bolt"></i> Template Spontan
            </button>
          </div>

          <!-- Exercise Library Info Button -->
          <button
            onclick="APP.ui.showExerciseLibraryInfo()"
            class="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 border border-slate-600"
            title="Lihat daftar exercise yang tersedia di library"
          >
            <i class="fa-solid fa-dumbbell"></i> Exercise Library Reference
          </button>

          <textarea
            id="ai-import-textarea"
            placeholder="Paste JSON resep dari AI di sini..."
            class="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-lg border border-slate-700 resize-none focus:border-purple-500 transition"
            rows="8"
            style="min-height: 200px;"
          ></textarea>

          <button
            onclick="APP.ui.analyzeAIRecipe()"
            class="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
          >
            <i class="fa-solid fa-wand-magic-sparkles"></i> ANALYZE JSON
          </button>

          <!-- Preview Card (hidden initially) -->
          <div id="ai-preview-card" class="hidden"></div>
        </div>
      `;

      container.innerHTML = html;
    },

    /**
     * Copies context to clipboard
     */
    copyContextToClipboard: async function() {
      const textarea = document.getElementById("ai-context-textarea");
      if (!textarea) {
        console.error("[UI] Context textarea not found");
        return;
      }

      const text = textarea.value;

      try {
        // Try modern Clipboard API
        await navigator.clipboard.writeText(text);
        this.showToast("✅ Konteks berhasil dicopy!", "success");
        console.log("[UI] Context copied to clipboard");
      } catch (e) {
        // Fallback: select text for manual copy
        console.warn("[UI] Clipboard API failed, using fallback:", e);
        textarea.select();
        textarea.setSelectionRange(0, text.length);

        try {
          document.execCommand('copy');
          this.showToast("✅ Teks terpilih - tekan Ctrl+C", "success");
        } catch (err) {
          console.error("[UI] Copy failed:", err);
          this.showToast("❌ Gagal copy - pilih manual", "error");
        }
      }
    },

    /**
     * Analyzes AI recipe JSON and shows preview
     */
    analyzeAIRecipe: function() {
      const textarea = document.getElementById("ai-import-textarea");
      const previewCard = document.getElementById("ai-preview-card");

      if (!textarea || !previewCard) {
        console.error("[UI] Import elements not found");
        return;
      }

      const jsonString = textarea.value.trim();

      // Validate input
      if (!jsonString) {
        this.showToast("❌ JSON kosong", "error");
        return;
      }

      // Parse using AI Bridge
      let result;
      if (window.APP.aiBridge && window.APP.aiBridge.parseRecipe) {
        result = window.APP.aiBridge.parseRecipe(jsonString);
      } else {
        console.error("[UI] AI Bridge not available");
        this.showToast("❌ AI Bridge module tidak tersedia", "error");
        return;
      }

      console.log("[UI] Parse result:", result);

      // Store preview data globally for confirm action
      window.aiCommandCenterPreview = result;

      // Render preview card
      this.renderPreviewCard(previewCard, result);

      // Show preview card
      previewCard.classList.remove("hidden");
    },

    /**
     * Renders preview card based on parse result
     * @param {HTMLElement} container - Preview card container
     * @param {Object} result - Parse result from AI Bridge
     */
    renderPreviewCard: function(container, result) {
      const isSuccess = result.success;
      const borderColor = isSuccess ? "border-emerald-500" : "border-red-500";
      const bgColor = isSuccess ? "bg-emerald-900/20" : "bg-red-900/20";

      let html = `
        <div class="preview-card p-4 rounded-lg border-2 ${borderColor} ${bgColor}">
          <!-- Status Badge -->
          <div class="mb-3 flex items-center gap-2">
            ${isSuccess
              ? '<span class="text-emerald-400 text-sm font-bold">✅ Valid Recipe</span>'
              : '<span class="text-red-400 text-sm font-bold">❌ Invalid Recipe</span>'
            }
          </div>
      `;

      // Summary (if success)
      if (isSuccess && result.data) {
        const sessionCount = Object.keys(result.data).length;
        let exerciseCount = 0;

        Object.values(result.data).forEach(session => {
          if (session.exercises) {
            exerciseCount += session.exercises.length;
          }
        });

        html += `
          <div class="summary mb-3 text-xs text-slate-300">
            <h4 class="font-bold text-white mb-2">Ringkasan:</h4>
            <p>• Schema: <span class="font-mono text-purple-400">${result.schemaType}</span></p>
            <p>• Sesi: <span class="font-bold text-emerald-400">${sessionCount}</span> sesi</p>
            <p>• Total Latihan: <span class="font-bold text-emerald-400">${exerciseCount}</span> exercises</p>
          </div>
        `;
      }

      // Errors (if any)
      if (result.errors && result.errors.length > 0) {
        html += `
          <div class="errors mb-3">
            <h4 class="text-xs font-bold text-red-400 mb-2">❌ Errors:</h4>
            <ul class="text-xs text-slate-300 space-y-1 list-disc list-inside">
              ${result.errors.map(err => `<li>${err}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      // Warnings (if any)
      if (result.warnings && result.warnings.length > 0) {
        html += `
          <div class="warnings mb-3">
            <h4 class="text-xs font-bold text-yellow-400 mb-2">⚠️ Warnings:</h4>
            <ul class="text-xs text-slate-300 space-y-1 list-disc list-inside">
              ${result.warnings.map(warn => `<li>${warn}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      // Confirm Button (ONLY if success)
      if (isSuccess) {
        html += `
          <button
            onclick="APP.ui.confirmAIImport()"
            class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 mt-4"
          >
            <i class="fa-solid fa-check-circle"></i> CONFIRM IMPORT
          </button>

          <p class="text-[10px] text-slate-500 italic text-center mt-2">
            ⚠️ Backup otomatis akan dibuat sebelum import
          </p>
        `;
      }

      html += `</div>`;

      container.innerHTML = html;
    },

    /**
     * Confirms and executes AI recipe import (SAFETY CRITICAL)
     */
    confirmAIImport: function() {
      // Get preview data
      const preview = window.aiCommandCenterPreview;

      if (!preview || !preview.success || !preview.data) {
        console.error("[UI] Invalid preview state");
        this.showToast("❌ Error: Preview data tidak valid", "error");
        return;
      }

      console.log("[UI] Confirming AI import:", preview);

      try {
        // STEP 1: Create backup (MANDATORY)
        if (window.APP.safety && window.APP.safety.createBackup) {
          window.APP.safety.createBackup("pre_ai_import");
          console.log("[UI] Backup created before import");
        } else {
          console.warn("[UI] Safety module not available, skipping backup");
        }

        // STEP 2: Save based on schema type
        if (preview.schemaType === "program_import") {
          // PARTIAL MERGE: Only overwrite sessions that exist in the recipe
          // Other sessions remain untouched (safe!)
          Object.keys(preview.data).forEach(sessionId => {
            if (sessionId !== "spontaneous") {
              window.APP.state.workoutData[sessionId] = preview.data[sessionId];
              console.log(`[UI] Imported/Updated session: ${sessionId}`);
            }
          });

          // Persist to localStorage
          if (window.APP.core && window.APP.core.saveProgram) {
            window.APP.core.saveProgram();
            console.log("[UI] Program saved to localStorage");
          }

          // Refresh UI to dashboard
          if (window.APP.nav && window.APP.nav.switchView) {
            window.APP.nav.switchView('dashboard');
          }

          this.closeAICommandCenter();
          this.showToast("✅ Program berhasil diimport!", "success");

        } else if (preview.schemaType === "spontaneous_import") {
          // SAVE TO PRESETS (don't overwrite active spontaneous session)
          const spontaneousData = preview.data.spontaneous;
          const presetName = spontaneousData.title || "AI Import";

          // Get existing presets
          const presets = window.LS_SAFE.getJSON("cscs_spon_presets", []);

          // Add new preset
          presets.push({
            name: `${presetName} (AI)`,
            data: spontaneousData
          });

          // Save to localStorage
          window.LS_SAFE.setJSON("cscs_spon_presets", presets);
          console.log("[UI] Saved spontaneous recipe to presets");

          this.closeAICommandCenter();
          this.showToast("✅ Resep spontan tersimpan di Presets!", "success");
        }

        console.log("[UI] AI import completed successfully");

      } catch (e) {
        console.error("[UI] AI import failed:", e);
        this.showToast("❌ Import gagal: " + e.message, "error");

        // Try to restore from backup
        if (window.APP.safety && window.APP.safety.restore) {
          const backups = window.APP.safety.listBackups();
          const latestBackup = backups.find(b => b.id.includes("pre_ai_import"));

          if (latestBackup) {
            console.log("[UI] Attempting to restore from backup");
            window.APP.safety.restore(latestBackup.id);
            this.showToast("⚠️ Restored from backup", "warning");
          }
        }
      }
    },

    /**
     * Loads example recipe template into import textarea
     * @param {string} type - "program" or "spontaneous"
     */
    loadRecipeTemplate: function(type) {
      const textarea = document.getElementById("ai-import-textarea");
      if (!textarea) {
        console.error("[UI] Import textarea not found");
        return;
      }

      // Get templates from AI Bridge
      if (!window.APP.aiBridge || !window.APP.aiBridge.getRecipeTemplates) {
        console.error("[UI] AI Bridge getRecipeTemplates() not available");
        this.showToast("❌ Template tidak tersedia", "error");
        return;
      }

      const templates = window.APP.aiBridge.getRecipeTemplates();
      let template;

      if (type === "program") {
        template = templates.programTemplate;
      } else if (type === "spontaneous") {
        template = templates.spontaneousTemplate;
      } else {
        console.error("[UI] Unknown template type:", type);
        return;
      }

      // Format JSON with 2-space indentation
      const formattedJSON = JSON.stringify(template, null, 2);
      textarea.value = formattedJSON;

      // Auto-scroll to top
      textarea.scrollTop = 0;

      // Show toast
      const templateName = type === "program" ? "Program" : "Spontaneous";
      this.showToast(`📋 Template ${templateName} loaded`, "success");

      console.log(`[UI] Loaded ${type} template into textarea`);
    },

    /**
     * Shows modal with program template options (example template or copy current program)
     */
    showProgramTemplateOptions: function() {
      const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
            <!-- Header -->
            <div class="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-4 rounded-t-2xl">
              <h3 class="text-white font-bold text-lg flex items-center gap-2">
                <i class="fa-solid fa-file-code"></i> Template Program
              </h3>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-4">
              <p class="text-slate-300 text-sm mb-4">
                Pilih sumber template untuk resep program:
              </p>

              <!-- Option 1: Example Template -->
              <button
                onclick="APP.ui.loadRecipeTemplate('program'); APP.ui.closeProgramTemplateModal();"
                class="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold py-4 px-4 rounded-xl transition active:scale-95 flex items-center gap-3 border-2 border-slate-600 hover:border-slate-500"
              >
                <div class="bg-slate-600 p-3 rounded-lg">
                  <i class="fa-solid fa-file-code text-xl"></i>
                </div>
                <div class="text-left flex-1">
                  <div class="font-bold">📄 Template Contoh</div>
                  <div class="text-xs text-slate-400">Load template contoh dari AI Bridge</div>
                </div>
              </button>

              <!-- Option 2: Copy Current Program -->
              <button
                onclick="APP.ui.copyCurrentProgram(); APP.ui.closeProgramTemplateModal();"
                class="w-full bg-purple-700 hover:bg-purple-600 text-white text-sm font-bold py-4 px-4 rounded-xl transition active:scale-95 flex items-center gap-3 border-2 border-purple-600 hover:border-purple-500"
              >
                <div class="bg-purple-600 p-3 rounded-lg">
                  <i class="fa-solid fa-copy text-xl"></i>
                </div>
                <div class="text-left flex-1">
                  <div class="font-bold">📋 Copy Program Aktif</div>
                  <div class="text-xs text-slate-300">Copy program saat ini (tanpa spontaneous)</div>
                </div>
              </button>
            </div>

            <!-- Footer -->
            <div class="px-6 pb-6">
              <button
                onclick="APP.ui.closeProgramTemplateModal()"
                class="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm py-2 rounded-lg transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      `;

      // Create and append modal
      const modalDiv = document.createElement('div');
      modalDiv.id = 'program-template-modal';
      modalDiv.innerHTML = modalHTML;
      document.body.appendChild(modalDiv);
    },

    /**
     * Closes the program template options modal
     */
    closeProgramTemplateModal: function() {
      const modal = document.getElementById('program-template-modal');
      if (modal) {
        modal.remove();
      }
    },

    /**
     * Copies current active program to import textarea (excludes spontaneous session)
     */
    copyCurrentProgram: function() {
      const textarea = document.getElementById("ai-import-textarea");
      if (!textarea) {
        console.error("[UI] Import textarea not found");
        return;
      }

      // Get current program data
      if (!window.APP.state || !window.APP.state.workoutData) {
        this.showToast("❌ Data program tidak tersedia", "error");
        return;
      }

      const workoutData = window.APP.state.workoutData;

      // Filter out spontaneous session and ensure proper structure
      const programOnly = {};
      Object.keys(workoutData).forEach(sessionId => {
        if (sessionId !== 'spontaneous') {
          const session = workoutData[sessionId];

          // Ensure session has all required fields
          const sessionCopy = {
            label: session.label || sessionId.toUpperCase(),
            title: session.title || "Untitled Session"
          };

          // Add dynamic if it exists
          if (session.dynamic) {
            sessionCopy.dynamic = session.dynamic;
          }

          // Map exercises
          sessionCopy.exercises = Array.isArray(session.exercises) ? session.exercises.map(ex => {
            const exerciseCopy = {
              sets: ex.sets || 3,
              rest: ex.rest || 90
            };

            // Add note if exists
            if (ex.note) {
              exerciseCopy.note = ex.note;
            }

            // Map options
            exerciseCopy.options = Array.isArray(ex.options) ? ex.options.map(opt => {
              const optionCopy = {
                n: opt.n || "",
                t_r: opt.t_r || "8-12",
                t_k: opt.t_k || 0
              };

              // Add optional fields if they exist
              if (opt.bio) optionCopy.bio = opt.bio;
              if (opt.note) optionCopy.note = opt.note;
              if (opt.vid) optionCopy.vid = opt.vid;

              return optionCopy;
            }) : [];

            return exerciseCopy;
          }) : [];

          programOnly[sessionId] = sessionCopy;
        }
      });

      // Check if there's any program data
      if (Object.keys(programOnly).length === 0) {
        this.showToast("❌ Tidak ada program aktif untuk di-copy", "error");
        return;
      }

      // Format JSON with 2-space indentation
      const formattedJSON = JSON.stringify(programOnly, null, 2);
      textarea.value = formattedJSON;

      // Auto-scroll to top
      textarea.scrollTop = 0;

      // Show toast
      const sessionCount = Object.keys(programOnly).length;
      this.showToast(`✅ Program aktif copied (${sessionCount} session)`, "success");

      console.log(`[UI] Copied current program (${sessionCount} sessions) to textarea`);
    },

    /**
     * Shows modal with exercise library reference for AI
     */
    showExerciseLibraryInfo: function() {
      // Check if EXERCISE_TARGETS is available
      if (!window.EXERCISE_TARGETS) {
        this.showToast("❌ Exercise library tidak tersedia", "error");
        return;
      }

      // Generate compact exercise list grouped by muscle
      const exercisesByMuscle = {};

      Object.keys(window.EXERCISE_TARGETS).forEach(exerciseName => {
        const targets = window.EXERCISE_TARGETS[exerciseName];

        // Group by primary muscle
        if (targets.length > 0) {
          const primaryMuscle = targets.find(t => t.role === "PRIMARY")?.muscle || "other";

          if (!exercisesByMuscle[primaryMuscle]) {
            exercisesByMuscle[primaryMuscle] = [];
          }

          exercisesByMuscle[primaryMuscle].push(exerciseName);
        }
      });

      // Sort exercises within each muscle group
      Object.keys(exercisesByMuscle).forEach(muscle => {
        exercisesByMuscle[muscle].sort();
      });

      // Build compact text format for AI
      let libraryText = `# THE GRIND DESIGN - Exercise Library Reference\n\n`;
      libraryText += `**Total Exercises:** ${Object.keys(window.EXERCISE_TARGETS).length}\n\n`;
      libraryText += `**IMPORTANT:** All exercise names in recipes MUST exactly match names from this list.\n\n`;
      libraryText += `---\n\n`;

      // Muscle groups in order
      const muscleOrder = ['chest', 'back', 'shoulders', 'arms', 'legs'];

      muscleOrder.forEach(muscle => {
        if (exercisesByMuscle[muscle]) {
          libraryText += `## ${muscle.toUpperCase()} (${exercisesByMuscle[muscle].length} exercises)\n`;
          exercisesByMuscle[muscle].forEach(ex => {
            libraryText += `- ${ex}\n`;
          });
          libraryText += `\n`;
        }
      });

      // Add "other" category if exists
      if (exercisesByMuscle.other) {
        libraryText += `## OTHER (${exercisesByMuscle.other.length} exercises)\n`;
        exercisesByMuscle.other.forEach(ex => {
          libraryText += `- ${ex}\n`;
        });
      }

      // Create modal
      const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-700 max-h-[90vh] flex flex-col">
            <!-- Header -->
            <div class="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 class="text-white font-bold text-lg flex items-center gap-2">
                <i class="fa-solid fa-dumbbell"></i> Exercise Library Reference
              </h3>
              <button
                onclick="APP.ui.closeExerciseLibraryModal()"
                class="text-slate-300 hover:text-white transition"
              >
                <i class="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            <!-- Body with scrollable content -->
            <div class="p-6 overflow-y-auto flex-1">
              <div class="bg-slate-900 rounded-lg p-4 mb-4">
                <p class="text-slate-300 text-sm mb-2">
                  <i class="fa-solid fa-info-circle text-blue-400"></i>
                  <strong class="text-white">Copy text di bawah dan paste ke AI</strong> untuk memastikan AI menggunakan exercise names yang valid.
                </p>
                <p class="text-xs text-slate-400">
                  Library ini otomatis update saat exercise baru ditambahkan.
                </p>
              </div>

              <div class="relative">
                <textarea
                  id="exercise-library-text"
                  readonly
                  class="w-full bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded-lg border border-slate-700 resize-none"
                  style="min-height: 400px;"
                >${libraryText}</textarea>

                <button
                  onclick="APP.ui.copyExerciseLibraryToClipboard()"
                  class="absolute top-2 right-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition active:scale-95"
                >
                  <i class="fa-solid fa-copy"></i> COPY
                </button>
              </div>

              <!-- Stats -->
              <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div class="bg-slate-900 rounded-lg p-3 border border-slate-700">
                  <div class="text-slate-400">Total Exercises</div>
                  <div class="text-white font-bold text-lg">${Object.keys(window.EXERCISE_TARGETS).length}</div>
                </div>
                <div class="bg-slate-900 rounded-lg p-3 border border-slate-700">
                  <div class="text-slate-400">Muscle Groups</div>
                  <div class="text-white font-bold text-lg">${Object.keys(exercisesByMuscle).length}</div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 pb-6">
              <button
                onclick="APP.ui.closeExerciseLibraryModal()"
                class="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      `;

      // Create and append modal
      const modalDiv = document.createElement('div');
      modalDiv.id = 'exercise-library-modal';
      modalDiv.innerHTML = modalHTML;
      document.body.appendChild(modalDiv);

      console.log(`[UI] Showed exercise library with ${Object.keys(window.EXERCISE_TARGETS).length} exercises`);
    },

    /**
     * Closes the exercise library modal
     */
    closeExerciseLibraryModal: function() {
      const modal = document.getElementById('exercise-library-modal');
      if (modal) {
        modal.remove();
      }
    },

    /**
     * Copies exercise library text to clipboard
     */
    copyExerciseLibraryToClipboard: async function() {
      const textarea = document.getElementById('exercise-library-text');
      if (!textarea) {
        console.error("[UI] Exercise library textarea not found");
        return;
      }

      try {
        await navigator.clipboard.writeText(textarea.value);
        this.showToast("✅ Exercise library copied to clipboard!", "success");
        console.log("[UI] Exercise library copied to clipboard");
      } catch (err) {
        console.error("[UI] Failed to copy to clipboard:", err);

        // Fallback: select text
        textarea.select();
        textarea.setSelectionRange(0, 99999);

        try {
          document.execCommand('copy');
          this.showToast("✅ Exercise library copied!", "success");
        } catch (fallbackErr) {
          this.showToast("❌ Failed to copy to clipboard", "error");
        }
      }
    },

    /**
     * Renders Backup & Restore Mode
     * @param {HTMLElement} container - Content area container
     */
    renderBackupMode: function(container) {
      // Check if safety module is available
      if (!window.APP.safety || !window.APP.safety.listBackups) {
        container.innerHTML = `
          <div class="text-center text-slate-400 py-8">
            <i class="fa-solid fa-triangle-exclamation text-4xl mb-3"></i>
            <p>Safety module tidak tersedia</p>
          </div>
        `;
        return;
      }

      // Get backups list
      const backups = window.APP.safety.listBackups();

      if (backups.length === 0) {
        container.innerHTML = `
          <div class="text-center text-slate-400 py-8">
            <i class="fa-solid fa-database text-4xl mb-3"></i>
            <p class="text-sm">Tidak ada backup tersedia</p>
            <p class="text-xs mt-2">Backup otomatis dibuat saat operasi penting</p>
          </div>
        `;
        return;
      }

      // Build backup list HTML
      let html = `
        <div class="space-y-3">
          <!-- Header with Info Button -->
          <div class="flex items-start justify-between gap-2 mb-4">
            <p class="text-xs text-slate-400 flex-1">
              Daftar backup otomatis. Klik <strong>RESTORE</strong> untuk mengembalikan data ke backup tersebut.
            </p>
            <button
              onclick="APP.ui.showBackupLegend()"
              class="text-slate-400 hover:text-purple-400 transition shrink-0"
              title="Lihat penjelasan simbol"
            >
              <i class="fa-solid fa-circle-info text-lg"></i>
            </button>
          </div>
      `;

      backups.forEach(backup => {
        // Format timestamp
        const date = new Date(backup.timestamp);
        const dateStr = date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        });

        // Operation icon and label mapping
        let opIcon = "💾";
        let opLabel = backup.operation.replace(/_/g, ' ').toUpperCase();

        // Map legacy/specific operation names to generic labels
        if (backup.operation.includes("v26") || backup.operation.includes("integrity")) {
          opIcon = "🔧";
          opLabel = "DATA INTEGRITY FIX";
        } else if (backup.operation.includes("delete")) {
          opIcon = "🗑️";
        } else if (backup.operation.includes("edit")) {
          opIcon = "✏️";
        } else if (backup.operation.includes("create")) {
          opIcon = "➕";
        } else if (backup.operation.includes("restore")) {
          opIcon = "🔄";
        } else if (backup.operation.includes("init")) {
          opIcon = "🚀";
        } else if (backup.operation.includes("ai_import")) {
          opIcon = "🤖";
        } else if (backup.operation.includes("emergency")) {
          opIcon = "🚨";
          opLabel = "EMERGENCY BACKUP";
        }

        // Session count (already calculated by listBackups())
        const sessionCount = backup.sessionCount || 0;
        const spontaneousTag = backup.hasSpontaneous ? ' + <span class="text-purple-400">spontaneous</span>' : '';

        html += `
          <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-lg">${opIcon}</span>
                  <span class="text-white text-sm font-semibold truncate">${opLabel}</span>
                </div>
                <div class="text-xs text-slate-400 space-y-0.5">
                  <div>📅 ${dateStr} • ${timeStr}</div>
                  <div>📊 ${sessionCount} session(s)${spontaneousTag}</div>
                </div>
              </div>
              <button
                onclick="APP.safety.confirmRestore('${backup.id}')"
                class="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition active:scale-95 shrink-0"
              >
                RESTORE
              </button>
            </div>
          </div>
        `;
      });

      html += `</div>`;

      container.innerHTML = html;
      console.log(`[UI] Rendered ${backups.length} backups in Backup Mode`);
    },

    /**
     * Renders Prompt Manager Mode - V28 Feature
     * Manage built-in and custom AI prompts
     * @param {HTMLElement} container - Content area container
     */
    renderPromptManagerMode: function(container) {
      if (!window.APP || !window.APP.aiBridge) {
        container.innerHTML = `<div class="text-center text-slate-400 py-8">AI Bridge module not loaded</div>`;
        return;
      }

      const builtInPrompts = window.APP.aiBridge._builtInPrompts || {};
      const customPrompts = window.APP.aiBridge._customPrompts || {};

      // Group built-in prompts by category
      const promptsByCategory = {
        coaching: {},
        development: {},
        schema: {}
      };

      Object.keys(builtInPrompts).forEach(id => {
        const prompt = builtInPrompts[id];
        const category = prompt.category || 'schema';
        promptsByCategory[category][id] = prompt;
      });

      // Start building HTML
      let html = `
        <div class="space-y-4">
          <!-- Header Section -->
          <div class="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-4 border border-purple-500/30">
            <h4 class="text-white font-bold text-sm mb-2 flex items-center gap-2">
              <i class="fa-solid fa-wand-magic-sparkles text-purple-400"></i> Kelola Prompt AI
            </h4>
            <p class="text-xs text-slate-400">
              Kelola prompt template untuk AI consultation, debugging, dan brainstorming.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-3 gap-2">
            <button onclick="window.APP.ui.showAddPromptForm()"
              class="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-3 rounded-lg transition active:scale-95">
              <i class="fa-solid fa-plus"></i> Tambah
            </button>
            <button onclick="window.APP.ui.exportCustomPrompts()"
              class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold py-3 rounded-lg transition active:scale-95">
              <i class="fa-solid fa-file-export"></i> Export
            </button>
            <button onclick="window.APP.ui.importCustomPrompts()"
              class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold py-3 rounded-lg transition active:scale-95">
              <i class="fa-solid fa-file-import"></i> Import
            </button>
          </div>

          <!-- Built-in Prompts Section -->
          <div>
            <h5 class="text-xs text-slate-400 font-bold uppercase border-b border-slate-700 pb-2 mb-3 flex items-center gap-2">
              <i class="fa-solid fa-lock"></i> Prompt Bawaan (${Object.keys(builtInPrompts).length})
            </h5>
      `;

      // Render each category
      const categories = [
        { key: 'coaching', icon: '🏋️', label: 'Coaching' },
        { key: 'development', icon: '💻', label: 'Development' },
        { key: 'schema', icon: '📋', label: 'Schema' }
      ];

      categories.forEach(cat => {
        const prompts = promptsByCategory[cat.key];
        const count = Object.keys(prompts).length;

        if (count > 0) {
          html += `
            <div class="mb-4">
              <h6 class="text-xs text-slate-300 font-semibold mb-2">${cat.icon} Kategori: ${cat.label} (${count})</h6>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          `;

          Object.keys(prompts).forEach(id => {
            const prompt = prompts[id];
            html += `
              <div class="bg-slate-900 border border-slate-700 rounded-lg p-3 hover:border-slate-600 transition">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div class="flex-1 min-w-0">
                    <h6 class="text-white font-bold text-sm truncate">${prompt.title}</h6>
                    <p class="text-xs text-slate-400 mt-1">${prompt.description}</p>
                  </div>
                </div>
                <div class="flex gap-2 mt-2">
                  <button onclick="window.APP.ui.previewPrompt('${id}')"
                    class="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold py-2 rounded-lg transition">
                    <i class="fa-solid fa-eye"></i> Lihat
                  </button>
                </div>
              </div>
            `;
          });

          html += `
              </div>
            </div>
          `;
        }
      });

      html += `</div>`;

      // Custom Prompts Section
      const customCount = Object.keys(customPrompts).length;
      html += `
        <div>
          <h5 class="text-xs text-slate-400 font-bold uppercase border-b border-slate-700 pb-2 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-pen-to-square"></i> Prompt Kustom (${customCount})
          </h5>
      `;

      if (customCount === 0) {
        html += `
          <div class="text-center py-8 bg-slate-900/50 rounded-lg border border-dashed border-slate-700">
            <p class="text-slate-400 text-sm mb-2">Belum ada prompt kustom</p>
            <p class="text-slate-500 text-xs">Klik "Tambah" untuk membuat prompt baru</p>
          </div>
        `;
      } else {
        html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">`;

        Object.keys(customPrompts).forEach(id => {
          const prompt = customPrompts[id];
          html += `
            <div class="bg-slate-900 border border-purple-500/50 rounded-lg p-3 hover:border-purple-400 transition">
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="flex-1 min-w-0">
                  <h6 class="text-white font-bold text-sm truncate">${prompt.title}</h6>
                  <p class="text-xs text-slate-400 mt-1">${prompt.description}</p>
                  <p class="text-xs text-purple-400 mt-1">
                    <i class="fa-solid fa-tag"></i> ${prompt.category || 'custom'}
                  </p>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-1 mt-2">
                <button onclick="window.APP.ui.previewPrompt('${id}')"
                  class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold py-2 rounded-lg transition">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button onclick="window.APP.ui.showEditPromptForm('${id}')"
                  class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg transition">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button onclick="window.APP.ui.deleteCustomPrompt('${id}')"
                  class="bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold py-2 rounded-lg transition">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          `;
        });

        html += `</div>`;
      }

      html += `
          </div>
        </div>
      `;

      container.innerHTML = html;
      console.log(`[UI] Rendered Prompt Manager: ${Object.keys(builtInPrompts).length} built-in, ${customCount} custom`);
    },

    /**
     * Shows backup legend/explanation modal
     */
    showBackupLegend: function() {
      const legendHTML = `
        <div class="space-y-3">
          <h4 class="text-white font-bold text-sm mb-3">📖 Penjelasan Simbol Backup</h4>

          <div class="space-y-2 text-xs">
            <div class="flex items-start gap-2">
              <span class="text-lg shrink-0">🤖</span>
              <div>
                <strong class="text-white">PRE AI IMPORT</strong>
                <p class="text-slate-400">Backup otomatis sebelum import resep AI. Safety net jika import bermasalah.</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <span class="text-lg shrink-0">🚀</span>
              <div>
                <strong class="text-white">APP INIT</strong>
                <p class="text-slate-400">Snapshot saat aplikasi dibuka. Baseline untuk recovery.</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <span class="text-lg shrink-0">➕</span>
              <div>
                <strong class="text-white">CREATE SESSION</strong>
                <p class="text-slate-400">Backup setelah membuat session baru. Bisa rollback jika ingin undo.</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <span class="text-lg shrink-0">✏️</span>
              <div>
                <strong class="text-white">EDIT SESSION</strong>
                <p class="text-slate-400">Backup setelah edit session. Kembalikan ke versi sebelum edit.</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <span class="text-lg shrink-0">🗑️</span>
              <div>
                <strong class="text-white">DELETE SESSION</strong>
                <p class="text-slate-400">Backup sebelum hapus session. Bisa restore jika salah hapus.</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <span class="text-lg shrink-0">🔄</span>
              <div>
                <strong class="text-white">PRE RESTORE</strong>
                <p class="text-slate-400">Safety net otomatis saat restore. Bisa rollback jika restore bermasalah.</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <span class="text-lg shrink-0">🔧</span>
              <div>
                <strong class="text-white">DATA INTEGRITY FIX</strong>
                <p class="text-slate-400">Backup otomatis saat perbaikan data (normalisasi nama latihan, dll).</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <span class="text-lg shrink-0">🚨</span>
              <div>
                <strong class="text-white">EMERGENCY BACKUP</strong>
                <p class="text-slate-400">Backup darurat saat terjadi error atau recovery.</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <span class="text-lg shrink-0">💾</span>
              <div>
                <strong class="text-white">MANUAL BACKUP</strong>
                <p class="text-slate-400">Backup manual atau operasi lainnya.</p>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-700">
            <p class="text-xs text-slate-400">
              💡 <strong>Tips:</strong> Maksimal 5 backup disimpan. Backup terlama otomatis dihapus.
            </p>
          </div>

          <button
            onclick="APP.ui.closeBackupLegend()"
            class="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg transition active:scale-95 mt-3"
          >
            OK, Mengerti
          </button>
        </div>
      `;

      // Create temporary modal
      const modalHTML = `
        <div
          id="backup-legend-modal"
          class="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
          onclick="if(event.target === this) APP.ui.closeBackupLegend()"
        >
          <div class="bg-slate-800 w-full max-w-md rounded-2xl border border-purple-500/50 p-5 fade-in max-h-[90vh] overflow-y-auto">
            ${legendHTML}
          </div>
        </div>
      `;

      // Append to body
      document.body.insertAdjacentHTML('beforeend', modalHTML);

      console.log("[UI] Backup legend modal opened");
    },

    /**
     * Closes backup legend modal
     */
    closeBackupLegend: function() {
      const modal = document.getElementById('backup-legend-modal');
      if (modal) {
        modal.remove();
        console.log("[UI] Backup legend modal closed");
      }
    },

    /**
     * Renders Library Mode (Saved Recipes)
     * @param {HTMLElement} container - Content area container
     */
    renderLibraryMode: function(container) {
      // Check if data module is available
      if (!window.APP.data) {
        container.innerHTML = `
          <div class="text-center text-slate-400 py-8">
            <i class="fa-solid fa-triangle-exclamation text-4xl mb-3"></i>
            <p>Data module tidak tersedia</p>
          </div>
        `;
        return;
      }

      // Get saved recipes from localStorage
      const savedRecipes = window.LS_SAFE.getJSON("cscs_library", []);

      let html = `
        <div class="space-y-4">
          <!-- Header Section -->
          <div class="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-4 border border-indigo-500/30">
            <h4 class="text-white font-bold text-sm mb-2 flex items-center gap-2">
              <i class="fa-solid fa-book-bookmark text-indigo-400"></i> Resep Tersimpan
            </h4>
            <p class="text-xs text-slate-400">
              Simpan dan kelola resep program untuk digunakan kembali atau dibagikan ke AI.
            </p>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-2 gap-2">
            <button
              onclick="APP.data.saveToLibrary()"
              class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition active:scale-95"
            >
              <i class="fa-solid fa-floppy-disk"></i> Simpan Resep Aktif
            </button>
            <button
              onclick="APP.data.copyProgramToClipboard()"
              class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition active:scale-95"
            >
              <i class="fa-regular fa-copy"></i> Copy JSON
            </button>
          </div>

          <!-- Saved Recipes List -->
          <div>
            <h5 class="text-xs text-slate-400 font-bold uppercase border-b border-slate-700 pb-2 mb-3">
              📚 Daftar Resep (${savedRecipes.length})
            </h5>
      `;

      if (savedRecipes.length === 0) {
        html += `
            <div class="text-center py-8">
              <i class="fa-solid fa-inbox text-slate-600 text-4xl mb-3"></i>
              <p class="text-xs text-slate-500 italic">Belum ada resep tersimpan</p>
              <p class="text-xs text-slate-600 mt-2">Klik "Simpan Resep Aktif" untuk menyimpan program</p>
            </div>
        `;
      } else {
        html += `<div class="space-y-2">`;

        savedRecipes.forEach((recipe, index) => {
          const sessionCount = Object.keys(recipe.data || {}).filter(k => k !== 'spontaneous').length;
          const hasSpontaneous = recipe.data && recipe.data.spontaneous;

          html += `
            <div class="bg-slate-900 rounded-lg p-3 border border-slate-700 hover:border-indigo-500/50 transition">
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h6 class="text-white font-bold text-sm truncate">${recipe.name || `Resep ${index + 1}`}</h6>
                    <button
                      onclick="APP.ui.editRecipeName(${index})"
                      class="text-slate-500 hover:text-indigo-400 transition text-xs"
                      title="Edit nama"
                    >
                      <i class="fa-solid fa-pen"></i>
                    </button>
                  </div>
                  <p class="text-xs text-slate-400">
                    📊 ${sessionCount} session${hasSpontaneous ? ' + <span class="text-purple-400">spontaneous</span>' : ''}
                  </p>
                  <p class="text-xs text-slate-500 mt-1">
                    💾 ${new Date(recipe.timestamp || Date.now()).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  onclick="APP.data.loadFromLibrary(${index})"
                  class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition active:scale-95"
                >
                  <i class="fa-solid fa-download"></i> Load
                </button>
                <button
                  onclick="APP.data.deleteFromLibrary(${index})"
                  class="bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition active:scale-95"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          `;
        });

        html += `</div>`;
      }

      html += `
          </div>
        </div>
      `;

      container.innerHTML = html;
      console.log(`[UI] Rendered library mode with ${savedRecipes.length} recipes`);
    },

    /**
     * Edits the name of a saved recipe
     * @param {number} index - Index of recipe in library
     */
    editRecipeName: function(index) {
      const savedRecipes = window.LS_SAFE.getJSON("cscs_library", []);

      if (index < 0 || index >= savedRecipes.length) {
        this.showToast("❌ Resep tidak ditemukan", "error");
        return;
      }

      const recipe = savedRecipes[index];
      const currentName = recipe.name || `Resep ${index + 1}`;

      // Prompt for new name
      const newName = prompt("Edit Nama Resep:", currentName);

      if (newName === null) {
        // User cancelled
        return;
      }

      if (!newName.trim()) {
        this.showToast("❌ Nama tidak boleh kosong", "error");
        return;
      }

      // Update recipe name
      recipe.name = newName.trim();
      savedRecipes[index] = recipe;

      // Save back to localStorage
      window.LS_SAFE.setJSON("cscs_library", savedRecipes);

      // Refresh library view
      const contentArea = document.getElementById("ai-content-area");
      if (contentArea) {
        this.renderLibraryMode(contentArea);
      }

      this.showToast("✅ Nama resep diperbarui", "success");
      console.log(`[UI] Recipe ${index} renamed to: ${newName}`);
    },

    // ========================================
    // V28: PROMPT MANAGER CRUD FUNCTIONS
    // ========================================

    /**
     * Shows Add Custom Prompt Form Modal
     */
    showAddPromptForm: function() {
      const modalHTML = `
        <div id="add-prompt-modal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-purple-500/50 max-h-[90vh] flex flex-col">
            <!-- Header -->
            <div class="bg-gradient-to-r from-purple-700 to-indigo-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 class="text-white font-bold text-lg flex items-center gap-2">
                <i class="fa-solid fa-plus"></i> Tambah Prompt Kustom
              </h3>
              <button onclick="document.getElementById('add-prompt-modal').remove()"
                class="text-white hover:text-slate-200 transition">
                <i class="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            <!-- Body -->
            <form id="custom-prompt-form" class="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label class="text-xs text-slate-400 font-bold uppercase block mb-2">
                  ID Prompt (unik, tanpa spasi)
                </label>
                <input type="text" id="prompt-id"
                  pattern="[a-zA-Z0-9_]+"
                  required
                  placeholder="contoh: myCustomPrompt"
                  class="w-full bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-lg focus:border-purple-500 transition">
                <p class="text-xs text-slate-500 mt-1">Hanya huruf, angka, dan underscore</p>
              </div>

              <div>
                <label class="text-xs text-slate-400 font-bold uppercase block mb-2">
                  Judul
                </label>
                <input type="text" id="prompt-title"
                  required
                  placeholder="Judul prompt yang akan ditampilkan"
                  class="w-full bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-lg focus:border-purple-500 transition">
              </div>

              <div>
                <label class="text-xs text-slate-400 font-bold uppercase block mb-2">
                  Deskripsi
                </label>
                <textarea id="prompt-description"
                  rows="2"
                  required
                  placeholder="Deskripsi singkat fungsi prompt ini"
                  class="w-full bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-lg focus:border-purple-500 transition resize-none"></textarea>
              </div>

              <div>
                <label class="text-xs text-slate-400 font-bold uppercase block mb-2">
                  Kategori
                </label>
                <select id="prompt-category"
                  required
                  class="w-full bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-lg focus:border-purple-500 transition">
                  <option value="coaching">🏋️ Coaching</option>
                  <option value="development">💻 Development</option>
                  <option value="schema">📋 Schema</option>
                </select>
              </div>

              <div>
                <label class="text-xs text-slate-400 font-bold uppercase block mb-2">
                  Template Prompt
                </label>
                <textarea id="prompt-template"
                  rows="8"
                  required
                  placeholder="Tulis prompt AI di sini. Gunakan placeholder: {{CONTEXT}}, {{VERSION}}, {{USER_DESCRIPTION}}, {{ARCHITECTURE}}, {{STACK}}"
                  class="w-full bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-lg focus:border-purple-500 transition resize-none font-mono"></textarea>
                <p class="text-xs text-slate-500 mt-1">Placeholder yang tersedia: {{CONTEXT}}, {{VERSION}}, {{USER_DESCRIPTION}}, {{ARCHITECTURE}}, {{STACK}}, {{FILES}}</p>
              </div>

              <div>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="prompt-include-context"
                    class="w-4 h-4 text-purple-600 bg-slate-900 border-slate-700 rounded focus:ring-purple-500">
                  <span class="text-sm text-slate-300">Sertakan data konteks workout (profil, log, program)</span>
                </label>
              </div>

              <div class="flex gap-2 pt-4 border-t border-slate-700">
                <button type="button"
                  onclick="document.getElementById('add-prompt-modal').remove()"
                  class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition">
                  Batal
                </button>
                <button type="submit"
                  class="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition">
                  <i class="fa-solid fa-save"></i> Simpan Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      // Create and append modal
      const modalDiv = document.createElement('div');
      modalDiv.innerHTML = modalHTML;
      document.body.appendChild(modalDiv.firstElementChild);

      // Add submit handler
      document.getElementById('custom-prompt-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('prompt-id').value.trim();
        const title = document.getElementById('prompt-title').value.trim();
        const description = document.getElementById('prompt-description').value.trim();
        const category = document.getElementById('prompt-category').value;
        const template = document.getElementById('prompt-template').value.trim();
        const includeContext = document.getElementById('prompt-include-context').checked;

        // Call library.add
        const success = window.APP.aiBridge.library.add(id, {
          title,
          description,
          category,
          includeContext,
          template
        });

        if (success) {
          window.APP.ui.showToast("✅ Prompt berhasil ditambahkan", "success");
          document.getElementById('add-prompt-modal').remove();

          // Refresh UI if still in prompt manager mode
          const contentArea = document.getElementById("ai-content-area");
          if (contentArea) {
            window.APP.ui.renderPromptManagerMode(contentArea);
          }
        } else {
          window.APP.ui.showToast("❌ Gagal menambahkan prompt. Cek console untuk detail.", "error");
        }
      });
    },

    /**
     * Shows Edit Custom Prompt Form Modal
     * @param {string} promptId - ID of prompt to edit
     */
    showEditPromptForm: function(promptId) {
      if (!window.APP || !window.APP.aiBridge || !window.APP.aiBridge._customPrompts[promptId]) {
        this.showToast("❌ Prompt tidak ditemukan", "error");
        return;
      }

      const prompt = window.APP.aiBridge._customPrompts[promptId];

      const modalHTML = `
        <div id="edit-prompt-modal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-indigo-500/50 max-h-[90vh] flex flex-col">
            <!-- Header -->
            <div class="bg-gradient-to-r from-indigo-700 to-purple-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 class="text-white font-bold text-lg flex items-center gap-2">
                <i class="fa-solid fa-pen"></i> Edit Prompt: ${prompt.title}
              </h3>
              <button onclick="document.getElementById('edit-prompt-modal').remove()"
                class="text-white hover:text-slate-200 transition">
                <i class="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            <!-- Body -->
            <form id="edit-prompt-form" class="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label class="text-xs text-slate-400 font-bold uppercase block mb-2">
                  ID Prompt (tidak bisa diubah)
                </label>
                <input type="text"
                  value="${promptId}"
                  disabled
                  class="w-full bg-slate-900/50 border border-slate-700 text-slate-500 text-sm p-3 rounded-lg cursor-not-allowed">
              </div>

              <div>
                <label class="text-xs text-slate-400 font-bold uppercase block mb-2">
                  Judul
                </label>
                <input type="text" id="edit-prompt-title"
                  required
                  value="${prompt.title}"
                  class="w-full bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-lg focus:border-indigo-500 transition">
              </div>

              <div>
                <label class="text-xs text-slate-400 font-bold uppercase block mb-2">
                  Deskripsi
                </label>
                <textarea id="edit-prompt-description"
                  rows="2"
                  required
                  class="w-full bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-lg focus:border-indigo-500 transition resize-none">${prompt.description}</textarea>
              </div>

              <div>
                <label class="text-xs text-slate-400 font-bold uppercase block mb-2">
                  Kategori
                </label>
                <select id="edit-prompt-category"
                  required
                  class="w-full bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-lg focus:border-indigo-500 transition">
                  <option value="coaching" ${prompt.category === 'coaching' ? 'selected' : ''}>🏋️ Coaching</option>
                  <option value="development" ${prompt.category === 'development' ? 'selected' : ''}>💻 Development</option>
                  <option value="schema" ${prompt.category === 'schema' ? 'selected' : ''}>📋 Schema</option>
                </select>
              </div>

              <div>
                <label class="text-xs text-slate-400 font-bold uppercase block mb-2">
                  Template Prompt
                </label>
                <textarea id="edit-prompt-template"
                  rows="8"
                  required
                  class="w-full bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-lg focus:border-indigo-500 transition resize-none font-mono">${prompt.template}</textarea>
              </div>

              <div>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="edit-prompt-include-context"
                    ${prompt.includeContext ? 'checked' : ''}
                    class="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500">
                  <span class="text-sm text-slate-300">Sertakan data konteks workout</span>
                </label>
              </div>

              <div class="flex gap-2 pt-4 border-t border-slate-700">
                <button type="button"
                  onclick="document.getElementById('edit-prompt-modal').remove()"
                  class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition">
                  Batal
                </button>
                <button type="submit"
                  class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition">
                  <i class="fa-solid fa-save"></i> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      // Create and append modal
      const modalDiv = document.createElement('div');
      modalDiv.innerHTML = modalHTML;
      document.body.appendChild(modalDiv.firstElementChild);

      // Add submit handler
      document.getElementById('edit-prompt-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const updates = {
          title: document.getElementById('edit-prompt-title').value.trim(),
          description: document.getElementById('edit-prompt-description').value.trim(),
          category: document.getElementById('edit-prompt-category').value,
          template: document.getElementById('edit-prompt-template').value.trim(),
          includeContext: document.getElementById('edit-prompt-include-context').checked
        };

        // Call library.edit
        const success = window.APP.aiBridge.library.edit(promptId, updates);

        if (success) {
          window.APP.ui.showToast("✅ Prompt berhasil diperbarui", "success");
          document.getElementById('edit-prompt-modal').remove();

          // Refresh UI
          const contentArea = document.getElementById("ai-content-area");
          if (contentArea) {
            window.APP.ui.renderPromptManagerMode(contentArea);
          }
        } else {
          window.APP.ui.showToast("❌ Gagal memperbarui prompt", "error");
        }
      });
    },

    /**
     * Deletes a custom prompt with confirmation
     * @param {string} promptId - ID of prompt to delete
     */
    deleteCustomPrompt: function(promptId) {
      if (!window.APP || !window.APP.aiBridge || !window.APP.aiBridge._customPrompts[promptId]) {
        this.showToast("❌ Prompt tidak ditemukan", "error");
        return;
      }

      const prompt = window.APP.aiBridge._customPrompts[promptId];

      if (confirm(`Hapus prompt "${prompt.title}"?\n\nTindakan ini tidak bisa dibatalkan.`)) {
        const success = window.APP.aiBridge.library.delete(promptId);

        if (success) {
          this.showToast("✅ Prompt berhasil dihapus", "success");

          // Refresh UI
          const contentArea = document.getElementById("ai-content-area");
          if (contentArea) {
            this.renderPromptManagerMode(contentArea);
          }
        } else {
          this.showToast("❌ Gagal menghapus prompt", "error");
        }
      }
    },

    /**
     * Exports all custom prompts to JSON file
     */
    exportCustomPrompts: function() {
      if (!window.APP || !window.APP.aiBridge) {
        this.showToast("❌ AI Bridge tidak tersedia", "error");
        return;
      }

      const json = window.APP.aiBridge.library.export();

      if (!json) {
        this.showToast("❌ Gagal mengekspor prompts", "error");
        return;
      }

      // Create blob and download
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grind-custom-prompts-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      const customCount = Object.keys(window.APP.aiBridge._customPrompts || {}).length;
      this.showToast(`✅ ${customCount} prompt berhasil dieksport`, "success");
    },

    /**
     * Imports custom prompts from JSON file
     */
    importCustomPrompts: function() {
      if (!window.APP || !window.APP.aiBridge) {
        this.showToast("❌ AI Bridge tidak tersedia", "error");
        return;
      }

      // Create file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const result = window.APP.aiBridge.library.import(event.target.result);

            if (result.success) {
              window.APP.ui.showToast(
                `✅ Import berhasil: ${result.imported} ditambahkan, ${result.skipped} dilewati`,
                "success"
              );
            } else {
              window.APP.ui.showToast(
                `⚠️ Import gagal: ${result.errors.join(', ')}`,
                "error"
              );
            }

            // Refresh UI
            const contentArea = document.getElementById("ai-content-area");
            if (contentArea) {
              window.APP.ui.renderPromptManagerMode(contentArea);
            }
          } catch (err) {
            window.APP.ui.showToast("❌ File JSON tidak valid", "error");
            console.error("[UI] Import error:", err);
          }
        };

        reader.readAsText(file);
      };

      input.click();
    },

    /**
     * Shows preview modal for a prompt
     * @param {string} promptId - ID of prompt to preview
     */
    previewPrompt: function(promptId) {
      if (!window.APP || !window.APP.aiBridge) {
        this.showToast("❌ AI Bridge tidak tersedia", "error");
        return;
      }

      const allPrompts = window.APP.aiBridge.prompts;
      const prompt = allPrompts[promptId];

      if (!prompt) {
        this.showToast("❌ Prompt tidak ditemukan", "error");
        return;
      }

      const isBuiltIn = window.APP.aiBridge._builtInPrompts[promptId] !== undefined;
      const badge = isBuiltIn ?
        '<span class="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">🔒 Built-in</span>' :
        '<span class="text-xs bg-purple-600 text-white px-2 py-1 rounded">✏️ Custom</span>';

      const modalHTML = `
        <div id="preview-prompt-modal" class="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div class="glass-panel w-full max-w-4xl rounded-2xl border border-white/10 flex flex-col max-h-[90vh] fade-in overflow-y-auto">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 class="text-white font-bold text-lg flex items-center gap-2 mb-1">
                  <i class="fa-solid fa-eye"></i> ${prompt.title}
                </h3>
                <p class="text-sm text-slate-300">${prompt.description}</p>
              </div>
              <button onclick="document.getElementById('preview-prompt-modal').remove()"
                class="text-white hover:text-slate-200 transition">
                <i class="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 overflow-y-auto flex-1 space-y-4">
              <!-- Metadata -->
              <div class="flex items-center gap-2 text-sm">
                ${badge}
                <span class="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                  <i class="fa-solid fa-tag"></i> ${prompt.category || 'custom'}
                </span>
                <span class="text-xs ${prompt.includeContext ? 'bg-green-600' : 'bg-slate-700'} text-white px-2 py-1 rounded">
                  ${prompt.includeContext ? '✅ Includes Context' : '❌ No Context'}
                </span>
              </div>

              <!-- Template -->
              <div>
                <label class="text-xs text-slate-400 font-bold uppercase block mb-2">
                  Template:
                </label>
                <textarea readonly id="prompt-template-preview"
                  class="w-full glass-input border border-white/10 text-slate-100 font-mono text-xs p-3 rounded-lg resize-none"
                  rows="15">${prompt.template}</textarea>
              </div>

              <!-- Placeholders Info -->
              <div class="glass-card border border-white/10 rounded-lg p-3">
                <h5 class="text-xs text-slate-400 font-bold uppercase mb-2">Available Placeholders:</h5>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div><code class="text-purple-400">{{CONTEXT}}</code> - Workout data & history</div>
                  <div><code class="text-purple-400">{{VERSION}}</code> - App version</div>
                  <div><code class="text-purple-400">{{ARCHITECTURE}}</code> - Architecture pattern</div>
                  <div><code class="text-purple-400">{{STACK}}</code> - Tech stack</div>
                  <div><code class="text-purple-400">{{FILES}}</code> - Module files</div>
                  <div><code class="text-purple-400">{{USER_DESCRIPTION}}</code> - User input</div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col sm:flex-row gap-2">
              <button id="generate-prompt-btn"
                class="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Prompt
              </button>
              <button id="copy-template-btn"
                class="w-full sm:flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base">
                <i class="fa-solid fa-copy"></i> Copy Template
              </button>
              <button onclick="document.getElementById('preview-prompt-modal').remove()"
                class="w-full sm:flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base">
                Tutup
              </button>
            </div>
          </div>
        </div>
      `;

      // Create and append modal
      const modalDiv = document.createElement('div');
      modalDiv.innerHTML = modalHTML;
      document.body.appendChild(modalDiv.firstElementChild);

      // Add generate button event listener
      const generateBtn = document.getElementById('generate-prompt-btn');
      if (generateBtn) {
        generateBtn.addEventListener('click', () => {
          window.APP.ui.showGeneratePromptModal(promptId);
        });
      }

      // Add copy button event listener (avoid inline template literal escaping)
      const copyBtn = document.getElementById('copy-template-btn');
      const templateTextarea = document.getElementById('prompt-template-preview');

      if (copyBtn && templateTextarea) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(templateTextarea.value)
            .then(() => {
              window.APP.ui.showToast('✅ Template disalin', 'success');
            })
            .catch(() => {
              window.APP.ui.showToast('❌ Gagal menyalin', 'error');
            });
        });
      }
    },

    /**
     * Shows modal for generating a prompt with user inputs
     * @param {string} promptId - ID of the prompt to generate
     */
    showGeneratePromptModal: function(promptId) {
      if (!window.APP || !window.APP.aiBridge) {
        this.showToast("❌ AI Bridge tidak tersedia", "error");
        return;
      }

      const prompt = window.APP.aiBridge.prompts[promptId];
      if (!prompt) {
        this.showToast("❌ Prompt tidak ditemukan", "error");
        return;
      }

      // Detect which placeholders are used in the template
      const usedPlaceholders = [];
      const commonPlaceholders = [
        { key: 'USER_DESCRIPTION', label: 'Description / Issue', placeholder: 'Describe your issue or request...', multiline: true },
        { key: 'TOPIC', label: 'Topic', placeholder: 'Enter topic...', multiline: false },
        { key: 'PROPOSAL', label: 'Proposal', placeholder: 'Enter your proposal...', multiline: true },
        { key: 'DECISIONS', label: 'Decisions Made', placeholder: 'Enter decisions...', multiline: true },
        { key: 'FEEDBACK', label: 'Feedback', placeholder: 'Enter feedback...', multiline: true },
        { key: 'NEXT_STEP', label: 'Next Step', placeholder: 'Enter next step...', multiline: false },
        { key: 'FEATURE_REQUEST', label: 'Feature Request', placeholder: 'Describe the feature...', multiline: true },
        { key: 'DESIGN_PROGRESS', label: 'Design Progress', placeholder: 'Current progress...', multiline: true },
        { key: 'AUDIT_FEEDBACK', label: 'Audit Feedback', placeholder: 'Audit notes...', multiline: true },
        { key: 'NEXT_DELIVERABLE', label: 'Next Deliverable', placeholder: 'What needs to be delivered...', multiline: false }
      ];

      commonPlaceholders.forEach(ph => {
        const regex = new RegExp(`\\{\\{${ph.key}\\}\\}`, 'g');
        if (regex.test(prompt.template)) {
          usedPlaceholders.push(ph);
        }
      });

      // Build input fields HTML
      let inputFieldsHTML = '';
      if (usedPlaceholders.length > 0) {
        inputFieldsHTML = `
          <div class="glass-card border border-white/10 rounded-lg p-4 space-y-3">
            <h5 class="text-xs text-slate-400 font-bold uppercase mb-2">
              <i class="fa-solid fa-edit"></i> User Inputs:
            </h5>
            ${usedPlaceholders.map(ph => {
              if (ph.multiline) {
                return `
                  <div>
                    <label class="text-xs text-slate-300 font-bold block mb-1">${ph.label}:</label>
                    <textarea id="input-${ph.key.toLowerCase()}"
                      placeholder="${ph.placeholder}"
                      class="w-full glass-input border border-white/10 text-white text-sm p-2 rounded-lg focus:border-emerald-500 transition resize-none"
                      rows="3"></textarea>
                  </div>
                `;
              } else {
                return `
                  <div>
                    <label class="text-xs text-slate-300 font-bold block mb-1">${ph.label}:</label>
                    <input type="text" id="input-${ph.key.toLowerCase()}"
                      placeholder="${ph.placeholder}"
                      class="w-full glass-input border border-white/10 text-white text-sm p-2 rounded-lg focus:border-emerald-500 transition">
                  </div>
                `;
              }
            }).join('')}
          </div>
        `;
      } else {
        inputFieldsHTML = `
          <div class="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
            <p class="text-xs text-slate-400 italic">
              ℹ️ No user input required for this prompt.
            </p>
          </div>
        `;
      }

      const modalHTML = `
        <div id="generate-prompt-modal" class="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div class="glass-panel w-full max-w-4xl rounded-2xl border border-white/10 flex flex-col max-h-[90vh] fade-in overflow-y-auto">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 class="text-white font-bold text-lg flex items-center gap-2 mb-1">
                  <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Prompt: ${prompt.title}
                </h3>
                <p class="text-sm text-slate-400">${prompt.description}</p>
              </div>
              <button onclick="document.getElementById('generate-prompt-modal').remove()"
                class="text-slate-400 hover:text-white transition">
                <i class="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 overflow-y-auto flex-1 space-y-4">
              ${inputFieldsHTML}

              <!-- Generated Output (hidden initially) -->
              <div id="generated-output-container" class="hidden space-y-2">
                <label class="text-xs text-slate-400 font-bold uppercase block">
                  <i class="fa-solid fa-check-circle text-emerald-500"></i> Generated Prompt (Placeholders Replaced):
                </label>
                <textarea readonly id="generated-prompt-output"
                  class="w-full glass-input border border-emerald-500/50 text-slate-100 font-mono text-xs p-3 rounded-lg resize-none"
                  rows="15"></textarea>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 pb-6 flex gap-2">
              <button id="generate-action-btn"
                class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition">
                <i class="fa-solid fa-magic"></i> Generate
              </button>
              <button id="copy-generated-btn" class="hidden flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition">
                <i class="fa-solid fa-copy"></i> Copy Generated
              </button>
              <button onclick="document.getElementById('generate-prompt-modal').remove()"
                class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      `;

      // Create and append modal
      const modalDiv = document.createElement('div');
      modalDiv.innerHTML = modalHTML;
      document.body.appendChild(modalDiv.firstElementChild);

      // Add generate button handler
      const generateActionBtn = document.getElementById('generate-action-btn');
      const generatedOutputContainer = document.getElementById('generated-output-container');
      const generatedOutput = document.getElementById('generated-prompt-output');
      const copyGeneratedBtn = document.getElementById('copy-generated-btn');

      if (generateActionBtn) {
        generateActionBtn.addEventListener('click', () => {
          // Collect user inputs
          const userInputs = {};
          usedPlaceholders.forEach(ph => {
            const inputEl = document.getElementById(`input-${ph.key.toLowerCase()}`);
            if (inputEl) {
              userInputs[ph.key.toLowerCase()] = inputEl.value.trim();
            }
          });

          // Call getPrompt with user inputs
          const generatedPrompt = window.APP.aiBridge.getPrompt(promptId, userInputs);

          if (!generatedPrompt) {
            window.APP.ui.showToast("❌ Gagal generate prompt", "error");
            return;
          }

          // Check if any placeholders remain
          const hasPlaceholders = /\{\{[A-Z_]+\}\}/.test(generatedPrompt.content);

          if (hasPlaceholders) {
            window.APP.ui.showToast("⚠️ Warning: Some placeholders not replaced", "warning");
          } else {
            window.APP.ui.showToast("✅ Prompt generated successfully!", "success");
          }

          // Display generated output
          generatedOutput.value = generatedPrompt.content;
          generatedOutputContainer.classList.remove('hidden');
          copyGeneratedBtn.classList.remove('hidden');

          // Scroll to output
          generatedOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }

      // Add copy generated button handler
      if (copyGeneratedBtn) {
        copyGeneratedBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(generatedOutput.value)
            .then(() => {
              window.APP.ui.showToast('✅ Generated prompt copied!', 'success');
            })
            .catch(() => {
              window.APP.ui.showToast('❌ Failed to copy', 'error');
            });
        });
      }
    },

    // ============================================================================
    // V29.0: CLINICAL INSIGHTS RENDERING
    // ============================================================================

    /**
     * Render clinical insight cards in Analytics dashboard
     * @param {number} daysBack - Number of days to analyze (default: 30)
     */
    renderInsightCards: function(daysBack = 30) {
      // V30.0 Phase 3.5: Support both modal and klinik-view contexts
      const klinikView = document.getElementById("klinik-view");
      const isKlinikView = klinikView && !klinikView.classList.contains('hidden');
      const containerId = isKlinikView ? 'klinik-insights-container' : 'insights-container';

      const container = document.getElementById(containerId);
      if (!container) {
        console.warn("[UI] Insights container not found:", containerId);
        return;
      }

      // Get insights from interpretation engine
      const insights = window.APP.stats.interpretWorkoutData(daysBack);

      if (insights.length === 0) {
        container.innerHTML = `
          <div class="text-center text-slate-500 py-6">
            <div class="text-3xl mb-2">📊</div>
            <div class="text-xs">Log more workouts to generate insights</div>
          </div>
        `;
        return;
      }

      // V30.0 Phase 4: Build HTML for each insight with dark theme styling
      let html = '';

      insights.forEach(insight => {
        // V30.0: Determine left border color based on severity
        const borderColor = insight.type === 'danger' ? 'border-l-red-500' :
                            insight.type === 'warning' ? 'border-l-yellow-500' :
                            insight.type === 'info' ? 'border-l-blue-500' :
                            'border-l-emerald-500';

        // V30.0: Subtle background tint based on severity
        const bgTint = insight.type === 'danger' ? 'bg-red-500/5' :
                       insight.type === 'warning' ? 'bg-yellow-500/5' :
                       insight.type === 'info' ? 'bg-blue-500/5' :
                       'bg-emerald-500/5';

        // V30.0: Title text color
        const titleColor = insight.type === 'danger' ? 'text-red-400' :
                           insight.type === 'warning' ? 'text-yellow-400' :
                           insight.type === 'info' ? 'text-blue-400' :
                           'text-emerald-400';

        // V30.0: Evidence link color
        const evidenceColor = insight.type === 'danger' ? 'text-red-400 hover:text-red-300' :
                              insight.type === 'warning' ? 'text-yellow-400 hover:text-yellow-300' :
                              insight.type === 'info' ? 'text-blue-400 hover:text-blue-300' :
                              'text-emerald-400 hover:text-emerald-300';

        html += `
          <div class="bg-app-card ${bgTint} border-l-4 ${borderColor} rounded-xl p-4 mb-3">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <span class="text-xl">${insight.icon}</span>
              </div>
              <div class="flex-1 min-w-0">
                <!-- Title -->
                <h4 class="text-sm font-semibold ${titleColor} mb-2">
                  ${insight.title}
                </h4>

                <!-- Metrics -->
                <p class="text-xs text-app-subtext mb-2">
                  ${insight.metrics}
                </p>

                ${insight.risk ? `
                  <!-- Risk (danger/warning only) -->
                  <div class="text-xs text-app-subtext mb-2">
                    <span class="font-semibold text-white">Risk:</span> ${insight.risk}
                  </div>
                ` : ''}

                <!-- Action -->
                <div class="text-xs text-app-subtext mb-2">
                  <span class="font-semibold text-white">Action:</span> ${insight.action}
                </div>

                ${insight.evidence ? `
                  <!-- Evidence (with tooltip) -->
                  <div class="flex items-center text-[10px] mt-3 pt-2 border-t border-white/10">
                    <span class="font-semibold text-app-subtext mr-1">Evidence:</span>
                    <button class="${evidenceColor} underline transition-colors"
                            onclick="window.APP.ui.showEvidenceTooltip('${insight.id}', event)"
                            onmouseleave="window.APP.ui.hideTooltip()">
                      ${insight.evidence.source}
                    </button>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      });

      // Render
      container.innerHTML = html;

      // Store insights for tooltip access
      window.APP._currentInsights = insights;
    },

    // ============================================================================
    // V29.0: TOOLTIP SYSTEM
    // ============================================================================

    /**
     * V30.0: Position tooltip with viewport awareness
     * @param {HTMLElement} container - Tooltip container
     * @param {DOMRect} triggerRect - Bounding rect of trigger element
     */
    _positionTooltip: function(container, triggerRect) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 12;
      const tooltipMaxWidth = 280;

      // Reset position to measure natural size
      container.style.left = '0px';
      container.style.top = '0px';
      container.style.display = 'block';
      container.classList.remove('hidden');

      // Force reflow to get accurate dimensions
      const tooltipWidth = Math.min(container.offsetWidth, tooltipMaxWidth);
      const tooltipHeight = container.offsetHeight;

      // Calculate centered position below trigger
      let left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2);
      let top = triggerRect.bottom + 8;

      // Horizontal boundary checks
      if (left < padding) {
        left = padding;
      } else if (left + tooltipWidth > viewportWidth - padding) {
        left = viewportWidth - tooltipWidth - padding;
      }

      // Vertical boundary checks - show above if no space below
      if (top + tooltipHeight > viewportHeight - padding) {
        top = triggerRect.top - tooltipHeight - 8;
      }

      // Final boundary check - keep in viewport
      if (top < padding) {
        top = padding;
      }

      container.style.left = left + 'px';
      container.style.top = top + 'px';
    },

    /**
     * Show scientific evidence tooltip
     * @param {string} insightId - ID of the insight
     * @param {Event} event - Click/hover event for positioning
     */
    showEvidenceTooltip: function(insightId, event) {
      event.stopPropagation();

      const insights = window.APP._currentInsights || [];
      const insight = insights.find(i => i.id === insightId);

      if (!insight || !insight.evidence) return;

      const container = document.getElementById('tooltip-container');
      const content = document.getElementById('tooltip-content');

      if (!container || !content) return;

      // Set content
      content.innerHTML = `
        <div class="font-semibold text-sm mb-1">${insight.evidence.source}</div>
        ${insight.evidence.title ? `<div class="text-xs italic mb-1 text-slate-300">${insight.evidence.title}</div>` : ''}
        <div class="text-xs text-slate-400">${insight.evidence.citation}</div>
      `;

      // Position tooltip
      const rect = event.target.getBoundingClientRect();
      this._positionTooltip(container, rect);
    },

    /**
     * Show informational tooltip for ratio cards
     * @param {string} tooltipId - ID of the tooltip content
     * @param {Event} event - Click/hover event
     */
    showTooltip: function(tooltipId, event) {
      event.stopPropagation();

      const container = document.getElementById('tooltip-container');
      const content = document.getElementById('tooltip-content');

      if (!container || !content) return;

      // Tooltip content database
      const tooltips = {
        'qh-info': {
          title: 'Quad/Hamstring Ratio',
          text: 'Optimal ratio: 0.6-0.8 (hamstrings should be 60-80% of quad strength). Prevents ACL injuries and anterior knee instability.',
          source: 'Croisier et al. (2008)'
        },
        'pp-info': {
          title: 'Push/Pull Ratio',
          text: 'Optimal ratio: 1.0-1.2 (pull volume should equal or slightly exceed push). Prevents shoulder impingement and maintains posture.',
          source: 'NSCA Guidelines'
        },
        'core-info': {
          title: 'Core Training Volume',
          text: 'Optimal range: 15-25 sets/week. Maintains spine health, athletic performance, and force transfer without overtraining. Dedicated anti-movement work (planks, dead bugs).',
          source: 'Dr. Stuart McGill'
        },
        'stability-info': {
          title: 'Core Stability Demand',
          text: 'Volume from exercises with core as SECONDARY (unilateral work, standing cables). Complements but does NOT replace dedicated core training. Stability ≠ Strength.',
          source: 'McGill & Boyle - Stability vs Strength'
        },
        'bw-info': {
          title: 'Bodyweight Contribution',
          text: 'Shows percentage of training volume from bodyweight exercises. Load estimated using biomechanics research (e.g., push-up = 64% bodyweight).',
          source: 'Ebben et al. (2011)'
        }
      };

      const tooltip = tooltips[tooltipId];
      if (!tooltip) return;

      // Set content
      content.innerHTML = `
        <div class="font-semibold text-sm mb-1">${tooltip.title}</div>
        <div class="text-xs mb-2 text-slate-300">${tooltip.text}</div>
        <div class="text-xs italic text-slate-400">Source: ${tooltip.source}</div>
      `;

      // Position tooltip
      const rect = event.target.getBoundingClientRect();
      this._positionTooltip(container, rect);
    },

    /**
     * Hide tooltip
     */
    hideTooltip: function() {
      const container = document.getElementById('tooltip-container');
      if (container) {
        container.classList.add('hidden');
        container.style.display = 'none';
      }
    },

    // ============================================================================
    // V30.0 PHASE 3.5: AI VIEW INITIALIZATION
    // ============================================================================

    /**
     * Initialize the AI View when navigating via bottom nav
     * Sets up the content area and triggers default mode render
     */
    initAIView: function() {
      console.log("[UI] Initializing AI View");

      // Get the mode selector and content area for the view (not modal)
      const modeSelector = document.getElementById('ai-view-mode-selector');
      const contentArea = document.getElementById('ai-view-content-area');

      if (!modeSelector || !contentArea) {
        console.error("[UI] AI View elements not found");
        return;
      }

      // Default to 'context' mode
      const currentMode = modeSelector.value || 'context';

      // Render the appropriate mode content
      this.switchAIModeForView(currentMode, contentArea);
    },

    /**
     * Switch AI mode specifically for the View (not modal)
     * @param {string} mode - The mode to switch to
     * @param {HTMLElement} contentArea - The content area to render into
     */
    switchAIModeForView: function(mode, contentArea) {
      if (!contentArea) {
        contentArea = document.getElementById('ai-view-content-area');
      }

      if (!contentArea) {
        console.error("[UI] AI View content area not found");
        return;
      }

      console.log(`[UI] Switching AI View to mode: ${mode}`);

      // Clear previous content
      contentArea.innerHTML = '';

      // Render based on mode (reusing existing render methods)
      switch(mode) {
        case 'context':
          this.renderContextMode(contentArea);
          break;
        case 'import':
          this.renderImportMode(contentArea);
          break;
        case 'library':
          this.renderLibraryMode(contentArea);
          break;
        case 'backup':
          this.renderBackupMode(contentArea);
          break;
        case 'prompt-manager':
          this.renderPromptManagerMode(contentArea);
          break;
        default:
          this.renderContextMode(contentArea);
      }
    },
  };

})();
