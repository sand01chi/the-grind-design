/**
 * The Grind Design - Data Module
 * Contains all CRUD operations and data mutations
 * Dependencies: APP.state, APP.core, APP.validation, APP.safety, APP.ui, APP.nav, LS_SAFE, DT, EXERCISE_TARGETS
 */

(function () {
  'use strict';

  console.log("[DATA] Loading... APP.nav =", window.APP?.nav);

  if (!window.APP) window.APP = {};

  APP.data = {

    // ============================================================================
    // V29.5 P1-010: EXTRACTED SESSION TIMESTAMP UTILITY
    // ============================================================================
    // Purpose: Reset session timestamps matching a specific date
    // Extracted from deleteLogs() for reusability and testability

    /**
     * Reset session timestamps that match the given date
     * @param {String} dateStr - Date string to match (e.g., "9 Jan")
     * @returns {Number} Count of timestamps reset
     */
    resetSessionTimestamp: function(dateStr) {
      if (!dateStr || typeof dateStr !== 'string') {
        console.warn("[DATA] resetSessionTimestamp: Invalid dateStr:", dateStr);
        return 0;
      }

      if (!window.APP.state || !window.APP.state.workoutData) {
        console.warn("[DATA] resetSessionTimestamp: workoutData not initialized");
        return 0;
      }

      let resetCount = 0;

      Object.keys(window.APP.state.workoutData).forEach((sid) => {
        const lastTs = parseInt(LS_SAFE.get(`last_${sid}`) || 0);

        if (lastTs > 0) {
          const lastDate = DT.formatDate(new Date(lastTs));

          if (lastDate === dateStr) {
            LS_SAFE.remove(`last_${sid}`);
            console.log(`[DATA] Reset timestamp for ${sid} (matched ${dateStr})`);
            resetCount++;
          }
        }
      });

      return resetCount;
    },

    // ============================================================================
    // CORE DATA METHODS
    // ============================================================================

    saveSet: (id, t, v) => {
      LS_SAFE.set(`${id}_${t}`, v);
      // V30.5: Removed re-render on RPE save to prevent UI jump
      // RPE changes are now saved without full page re-render
    },

    toggleSetsVisibility: (exerciseIdx) => {
      const card = document.getElementById(`card-${exerciseIdx}`);
      if (!card) return;

      const setsContainer = card.querySelector(".sets-container");
      if (setsContainer) {
        setsContainer.classList.toggle("sets-collapsed");
      }
    },

    toggleDone: (id, el, idx) => {
      LS_SAFE.set(`${id}_d`, el.checked);
      document.getElementById(
        `row_${id}`
      ).className = `grid grid-cols-12 gap-1 mb-1 items-center ${
        el.checked ? "bg-emerald-900/20 set-row-completed" : ""
      }`;

      if (el.checked) {
        const rpeVal = parseFloat(LS_SAFE.get(`${id}_rpe`));
        if (!isNaN(rpeVal)) {
          if (rpeVal <= 7)
            APP.ui.showToast(
              `RPE ${rpeVal} (Ringan). Naik beban set depan? 📼`,
              "success"
            );
          else if (rpeVal >= 9.5)
            APP.ui.showToast(
              `RPE ${rpeVal} (Maksimal). Pertahankan/Turun beban ⚠️`,
              "warning"
            );
        }
      }

      APP.ui.checkActiveCard();
      APP.data.updateVolumeCounter(APP.state.currentSessionId, idx);
      APP.ui.updateCompletedSetsCollapse(idx);
      APP.ui.checkAllSetsCompleted(idx);
    },

    updateVolumeCounter: (sessionId, exerciseIdx) => {
      const volumeEl = document.getElementById(
        `volume-counter-${exerciseIdx}`
      );
      if (!volumeEl) return;

      const session = APP.state.workoutData[sessionId];
      if (!session || !session.exercises[exerciseIdx]) return;

      const ex = session.exercises[exerciseIdx];
      let totalVol = 0,
        completedSets = 0;

      for (let i = 1; i <= ex.sets; i++) {
        const sid = `${sessionId}_ex${exerciseIdx}_s${i}`;
        const k = parseFloat(LS_SAFE.get(`${sid}_k`) || 0);
        const r = parseFloat(LS_SAFE.get(`${sid}_r`) || 0);
        const done = LS_SAFE.get(`${sid}_d`) === "true";

        if (done) {
          if (k > 0 && r > 0) {
            totalVol += k * r;
          }

          completedSets++;
        }
      }

      const optIdx = LS_SAFE.get(`pref_${sessionId}_${exerciseIdx}`) || 0;
      const opt = ex.options[optIdx] || ex.options[0];
      const h = LS_SAFE.getJSON("gym_hist", []);
      const lastLog = h
        .filter((x) => x.ex === opt.n)
        .sort((a, b) => b.ts - a.ts)[0];

      let diffHtml = "";
      if (lastLog && completedSets > 0) {
        const diff = totalVol - lastLog.vol;
        if (diff > 0) {
          diffHtml = `<span class="volume-diff-up">+${diff}kg 📈</span>`;
        } else if (diff < 0) {
          diffHtml = `<span class="volume-diff-down">${diff}kg 📉</span>`;
        } else {
          diffHtml = `<span class="text-emerald-400">±0kg ➡️</span>`;
        }
      }

      const allCompleted = completedSets === ex.sets && completedSets > 0;

      const expandButton = allCompleted
        ? `<button onclick="APP.ui.toggleSetsVisibility(${exerciseIdx})"
          class="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-lg active:scale-95">
          <i class="fa-solid fa-chevron-down"></i> Show Sets
      </button>`
        : "";

      volumeEl.innerHTML = `
      <div class="flex justify-between items-center ${
        allCompleted ? "text-base" : "text-xs"
      }">
          <div class="flex items-center gap-3">
              ${allCompleted ? '<div class="text-3xl">🎯</div>' : ""}
              <div>
                  ${
                    allCompleted
                      ? `<div class="text-sm font-bold text-white mb-1 opacity-75"><span class="text-emerald-500 mr-2">#${exerciseIdx + 1}</span> ${opt.n}</div>`
                      : ""
                  }
                  <div class="flex items-baseline gap-2">
                      <span class="text-emerald-400 font-black ${
                        allCompleted ? "text-4xl" : "text-lg"
                      } tracking-tight">${totalVol}</span>
                      <span class="text-emerald-300 ${
                        allCompleted ? "text-lg" : "text-xs"
                      } font-bold">kg</span>
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                      <span class="text-slate-400 text-[10px]">(${completedSets}/${
        ex.sets
      } sets)</span>
                      ${
                        allCompleted
                          ? '<span class="text-emerald-400 text-lg animate-pulse">✅</span>'
                          : ""
                      }
                  </div>
              </div>
          </div>
          <div class="text-right flex flex-col gap-2">
              ${
                lastLog
                  ? `



                  <div class="text-sm font-bold">${diffHtml}</div>
              `
                  : ""
              }
              ${expandButton}
          </div>
      </div>
  `;

      const lastVolumeEl = document.getElementById(
        `last-volume-${exerciseIdx}`
      );
      if (lastVolumeEl && lastLog) {
        lastVolumeEl.innerHTML = `Last Volume: ${lastLog.vol}kg`;
      }
    },

    getSetNote: (sessionId, exerciseIdx, setNum) => {
      return (
        LS_SAFE.get(`note_${sessionId}_ex${exerciseIdx}_s${setNum}`) || ""
      );
    },

    saveSetNote: (sessionId, exerciseIdx, setNum, note) => {
      const key = `note_${sessionId}_ex${exerciseIdx}_s${setNum}`;
      if (note.trim() === "") {
        LS_SAFE.remove(key);
      } else {
        LS_SAFE.set(key, note.trim());
      }
      APP.nav.loadWorkout(sessionId);
    },

    openSetNoteModal: (sessionId, exerciseIdx, setNum) => {
      const currentNote = APP.data.getSetNote(
        sessionId,
        exerciseIdx,
        setNum
      );
      const modal = document.createElement("div");
      modal.className = "set-note-popup";
      modal.innerHTML = `
              <div class="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
                  <h3 class="text-white font-bold text-sm">📝 Note Set #${setNum}</h3>
                  <button onclick="this.closest('.set-note-popup').remove()" class="text-slate-400 hover:text-white">
                      <i class="fa-solid fa-xmark"></i>
                  </button>
              </div>
              <textarea id="set-note-input" class="w-full bg-slate-900 text-white p-3 rounded-lg border border-slate-700 focus:border-emerald-500 mb-3 text-sm" rows="3" placeholder="Catatan set ini...">${currentNote}</textarea>
              <div class="flex gap-2">
                  <button onclick="APP.data.saveSetNote('${sessionId}', ${exerciseIdx}, ${setNum}, document.getElementById('set-note-input').value); this.closest('.set-note-popup').remove();" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm">
                      <i class="fa-solid fa-check mr-1"></i>Simpan
                  </button>
                  <button onclick="this.closest('.set-note-popup').remove()" class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-sm">
                      Batal
                  </button>
              </div>
          `;
      document.body.appendChild(modal);
      document.getElementById("set-note-input").focus();
    },

    smartAutoFill: (sessionId, exerciseIdx) => {
      const session = APP.state.workoutData[sessionId];
      if (!session || !session.exercises[exerciseIdx]) return;

      const ex = session.exercises[exerciseIdx];
      const optIdx = LS_SAFE.get(`pref_${sessionId}_${exerciseIdx}`) || 0;
      const opt = ex.options[optIdx] || ex.options[0];

      const targetWeight = opt.t_k ? parseFloat(opt.t_k) : null;
      const targetReps = opt.t_r ? opt.t_r.toString() : null;

      const h = LS_SAFE.getJSON("gym_hist", []);
      const lastLogs = h
        .filter((x) => x.ex === opt.n)
        .sort((a, b) => b.ts - a.ts);
      const lastLog = lastLogs.length > 0 ? lastLogs[0] : null;

      let baseWeight = 0;
      let baseReps = 10;
      let suggestedRPE = "8";
      let source = "";

      if (targetWeight && targetReps) {
        baseWeight = targetWeight;

        if (targetReps.includes("-")) {
          const [min, max] = targetReps
            .split("-")
            .map((x) => parseInt(x.trim()));
          baseReps = Math.round((min + max) / 2);
        } else {
          baseReps = parseInt(targetReps) || 10;
        }

        source = "TARGET";

        if (lastLog && lastLog.d && lastLog.d.length > 0) {
          let maxRPE = 0;
          lastLog.d.forEach((s) => {
            if (s.rpe && parseFloat(s.rpe) > maxRPE) {
              maxRPE = parseFloat(s.rpe);
            }
          });

          if (maxRPE > 0) {
            if (maxRPE <= 7) {
              baseWeight = baseWeight + 5;
              suggestedRPE = "8";
              source = "TARGET + RPE↑";
            } else if (maxRPE >= 9.5) {
              baseWeight = baseWeight - 5;
              suggestedRPE = "8";
              source = "TARGET + RPE↓";
            } else if (maxRPE >= 8 && maxRPE < 9) {
              baseWeight = baseWeight + 5;
              suggestedRPE = "8";
              source = "TARGET + RPE✓";
            } else {
              suggestedRPE = "8";
              source = "TARGET (maintain)";
            }
          }
        }
      } else if (lastLog) {
        baseWeight = lastLog.top;
        baseReps = lastLog.d[0]?.r || 10;
        source = "HISTORY";

        let maxRPE = 0;
        lastLog.d.forEach((s) => {
          if (s.rpe && parseFloat(s.rpe) > maxRPE) {
            maxRPE = parseFloat(s.rpe);
          }
        });

        if (maxRPE <= 7) {
          baseWeight = baseWeight + 5;
          suggestedRPE = "8";
        } else if (maxRPE >= 9.5) {
          baseWeight = baseWeight - 5;
          suggestedRPE = "8";
        } else if (maxRPE < 8.5) {
          baseWeight = baseWeight + 5;
        }
      } else {
        APP.ui.showToast(
          "⚠️ Tidak ada target/history. Isi manual dulu.",
          "warning"
        );
        return;
      }

      baseWeight = Math.round(baseWeight / 5) * 5;

      let fillCount = 0;
      for (let i = 1; i <= ex.sets; i++) {
        const sid = `${sessionId}_ex${exerciseIdx}_s${i}`;

        let setWeight = baseWeight;
        let setReps = baseReps;
        let setRPE = suggestedRPE;

        if (i === 1) {
          setWeight = Math.round((baseWeight * 0.9) / 5) * 5;
          setRPE = "7";
        } else {
          setWeight = baseWeight;
          setRPE = "8";
        }

        LS_SAFE.set(`${sid}_k`, setWeight);
        LS_SAFE.set(`${sid}_r`, setReps);
        if (setRPE) LS_SAFE.set(`${sid}_rpe`, setRPE);

        fillCount++;
      }

      // V30.5: Don't trigger full re-render to prevent UI jump
      // Instead, update only the affected inputs
      for (let i = 1; i <= ex.sets; i++) {
        const sid = `${sessionId}_ex${exerciseIdx}_s${i}`;
        
        // Find inputs by row container and query selectors
        const row = document.getElementById(`row_${sid}`);
        if (row) {
          const kInput = row.querySelector('input[data-sid]');
          const inputs = row.querySelectorAll('input[type="number"]');
          const rInput = inputs[1]; // Second number input is reps
          const rpeSelect = row.querySelector('select');
          
          if (kInput) kInput.value = LS_SAFE.get(`${sid}_k`);
          if (rInput) rInput.value = LS_SAFE.get(`${sid}_r`);
          if (rpeSelect) rpeSelect.value = LS_SAFE.get(`${sid}_rpe`);
        }
      }
      
      // Update volume counter without full re-render
      APP.data.updateVolumeCounter(sessionId, exerciseIdx);

      APP.ui.showToast(
        `⚡ Auto-filled ${fillCount} sets: ${baseWeight}kg x ${baseReps}\nSource: ${source}`,
        "success"
      );
    },

    getSuggestion: (exName) => {
      const h = LS_SAFE.getJSON("gym_hist", []);
      const filtered = h
        .filter((x) => x && x.ex === exName)
        .sort((a, b) => b.ts - a.ts);
      if (filtered.length === 0) return "";
      const lastLog = filtered[0];
      let msg = `Last Weight: ${lastLog.top || 0}kg`;
      if (lastLog.d && lastLog.d.length > 0) {
        const lastSet = lastLog.d[lastLog.d.length - 1];
        if (lastSet.rpe) {
          const rpeVal = parseFloat(lastSet.rpe);
          if (rpeVal <= 7)
            msg += ` <span class="text-emerald-400 font-bold animate-pulse">📼 +2.5kg</span>`;
          else if (rpeVal >= 9.5)
            msg += ` <span class="text-red-400 font-bold">⚠️ Stay</span>`;
        }
      }
      return msg;
    },

    changeVariant: (d, i, v) => {
      try {
        const session = APP.state.workoutData[d];
        if (!session) {
          throw new Error(`Session '${d}' not found`);
        }

        if (!session.exercises || !session.exercises[i]) {
          throw new Error(`Exercise index ${i} invalid`);
        }

        const newVar = parseInt(v);
        if (
          isNaN(newVar) ||
          newVar < 0 ||
          newVar >= session.exercises[i].options.length
        ) {
          throw new Error(
            `Variant index ${newVar} out of bounds (max: ${
              session.exercises[i].options.length - 1
            })`
          );
        }

        LS_SAFE.set(`pref_${d}_${i}`, newVar);
        APP.nav.loadWorkout(d);
      } catch (e) {
        console.error("changeVariant Error:", e);
        alert(`Error: ${e.message}`);
      }
    },

    addCustomVariant: (d, i) => {
      APP.ui.openExercisePicker("variant", d, i);
    },

    deleteVariant: (d, i, v) => {
      try {
        const variantIdx = parseInt(v);

        const session = APP.state.workoutData[d];
        if (!session || !session.exercises[i]) {
          throw new Error("Invalid session or exercise");
        }

        const exercise = session.exercises[i];

        if (exercise.options.length <= 1) {
          alert("Minimal harus ada 1 alternatif gerakan!");
          return;
        }

        if (!confirm(`Hapus "${exercise.options[variantIdx].n}"?`)) {
          return;
        }

        exercise.options.splice(variantIdx, 1);

        const currentPref = parseInt(LS_SAFE.get(`pref_${d}_${i}`) || 0);
        if (currentPref >= exercise.options.length) {
          LS_SAFE.set(`pref_${d}_${i}`, 0);
        }

        APP.core.saveProgram();
        APP.nav.loadWorkout(d);
        APP.ui.showToast(`✅ Gerakan alternatif dihapus`, "success");
      } catch (e) {
        console.error("deleteVariant Error:", e);
        alert(`Error: ${e.message}`);
      }
    },

    modifySet: (d, i, v) => {
      try {
        const session = APP.state.workoutData[d];
        if (!session || !session.exercises[i]) {
          throw new Error("Invalid session or exercise");
        }

        const newSets = session.exercises[i].sets + v;

        if (newSets < 1) {
          alert("Minimum 1 set!");
          return;
        }
        if (newSets > 10) {
          alert("Maximum 10 sets!");
          return;
        }

        session.exercises[i].sets = newSets;
        APP.core.saveProgram();
        APP.nav.loadWorkout(d);
      } catch (e) {
        console.error("modifySet Error:", e);
        alert(`Error: ${e.message}`);
      }
    },

    deleteCard: (d, i) => {
      try {
        const session = APP.state.workoutData[d];
        if (!session || !session.exercises[i]) {
          throw new Error("Invalid session or exercise");
        }

        const exName = session.exercises[i].options[0]?.n || "Exercise";

        if (confirm(`Hapus gerakan "${exName}"?`)) {
          session.exercises.splice(i, 1);
          APP.core.saveProgram();
          APP.nav.loadWorkout(d);
        }
      } catch (e) {
        console.error("deleteCard Error:", e);
        alert(`Error: ${e.message}`);
      }
    },

    moveCard: (d, i, v) => {
      try {
        const session = APP.state.workoutData[d];
        if (!session || !session.exercises) {
          throw new Error("Invalid session");
        }

        const exercises = session.exercises;
        const newIndex = i + v;

        if (newIndex < 0 || newIndex >= exercises.length) {
          console.log("Cannot move: out of bounds");
          return;
        }

        [exercises[i], exercises[newIndex]] = [
          exercises[newIndex],
          exercises[i],
        ];
        APP.core.saveProgram();
        APP.nav.loadWorkout(d);
      } catch (e) {
        console.error("moveCard Error:", e);
        alert(`Error: ${e.message}`);
      }
    },

    addNewExerciseCard: () => {
      APP.ui.openExercisePicker("new", null, null);
    },

    editNote: (d, i) => {
      try {
        const session = APP.state.workoutData[d];
        if (!session || !session.exercises[i]) {
          throw new Error("Invalid session or exercise");
        }

        const optIdx = parseInt(LS_SAFE.get(`pref_${d}_${i}`) || 0);

        if (!session.exercises[i].options[optIdx]) {
          throw new Error("Selected variant not found");
        }

        const currentNote =
          session.exercises[i].options[optIdx].note ||
          session.exercises[i].note ||
          "";
        const n = prompt("Note (untuk variasi ini):", currentNote);

        if (n !== null) {
          session.exercises[i].options[optIdx].note = n;
          APP.core.saveProgram();
          APP.nav.loadWorkout(d);
        }
      } catch (e) {
        console.error("editNote Error:", e);
        alert(`Error: ${e.message}`);
      }
    },

    editSessionTitle: (e, k) => {
      e.stopPropagation();
      const n = prompt("Rename:", APP.state.workoutData[k].title);
      if (n) {
        APP.state.workoutData[k].title = n;
        APP.core.saveProgram();
        APP.nav.renderDashboard();
      }
    },

    deleteSession: (e, k) => {
      APP.session.confirmDelete(e, k);
    },

    editVideo: (k) => {
      const n = prompt("URL:", LS_SAFE.get(k) || "");
      if (n !== null) {
        n.trim() === "" ? LS_SAFE.remove(k) : LS_SAFE.set(k, n.trim());
        APP.nav.loadWorkout(APP.state.currentSessionId);
      }
    },

    editWarmup: (t) => {
      const n = prompt(
        "Warmup:",
        APP.state.workoutData[APP.state.currentSessionId].dynamic || ""
      );
      if (n !== null) {
        APP.state.workoutData[APP.state.currentSessionId].dynamic = n;
        APP.core.saveProgram();
        APP.nav.loadWorkout(APP.state.currentSessionId);
      }
    },

    saveProfile: () => {
      const p = {
        name: document.getElementById("prof-name").value,
        h: parseFloat(document.getElementById("prof-height").value),
        a: parseFloat(document.getElementById("prof-age").value),
        g: document.getElementById("prof-gender").value,
        act: parseFloat(document.getElementById("prof-active").value),
      };
      
      LS_SAFE.setJSON("profile", p);
      APP.data.calculateTDEE();
      APP.data.loadProfile();
      APP.nav.renderDashboard();
      APP.ui.showToast("Profil diperbarui", "success");
    },

    calculateTDEE: () => {
      const p = LS_SAFE.getJSON("profile", {});
      if (!p.h || !p.a || !p.g || !p.act) return 0;

      const w = LS_SAFE.getJSON("weights", []);
      const kg = w.length > 0 ? parseFloat(w[0].v) : 80;
      
      let bmr = 10 * kg + 6.25 * p.h - 5 * p.a + (p.g === "male" ? 5 : -161);
      const tdee = Math.round(bmr * p.act);
      LS_SAFE.set("tdee", tdee);
      return tdee;
    },

    mergeProgram: function (newData) {
      console.log("[MERGE] Starting smart merge...");

      if (!newData || typeof newData !== "object") {
        alert("Invalid program data");
        return false;
      }

      APP.safety.createBackup("emergency_pre_merge");
      console.log("[MERGE] Emergency backup created");

      let autoMappedCount = 0;
      let unmappedExercises = [];

      Object.keys(newData).forEach((sessionId) => {
        const session = newData[sessionId];

        if (!session.exercises || !Array.isArray(session.exercises)) {
          console.warn(
            `[MERGE] Session ${sessionId} has invalid exercises array`
          );
          return;
        }

        session.exercises.forEach((ex, exIdx) => {
          if (!ex.options || !Array.isArray(ex.options)) {
            console.warn(
              `[MERGE] Exercise ${exIdx} in session ${sessionId} has invalid options`
            );
            return;
          }

          ex.options.forEach((opt, optIdx) => {
            if (!opt.n) {
              console.warn(
                `[MERGE] Option ${optIdx} in exercise ${exIdx} has no name`
              );
              return;
            }

            if (!EXERCISE_TARGETS[opt.n]) {
              const matched = APP.validation.fuzzyMatchExercise(opt.n);

              if (matched && matched !== opt.n) {
                console.log(
                  `[MERGE] 🔄 Auto-mapped: "${opt.n}" → "${matched}"`
                );
                opt.n = matched;
                autoMappedCount++;
              } else {
                unmappedExercises.push({
                  sessionId,
                  exerciseIdx: exIdx,
                  optionIdx: optIdx,
                  name: opt.n,
                });
              }
            }
          });
        });
      });

      if (autoMappedCount > 0) {
        console.log(
          `[MERGE] ✅ Auto-corrected ${autoMappedCount} exercise(s) to match library`
        );
        APP.ui.showToast(
          `🔄 Auto-corrected ${autoMappedCount} exercise(s) to match library`,
          "success"
        );
      }

      if (unmappedExercises.length > 0) {
        console.warn(
          `[MERGE] ⚠️ ${unmappedExercises.length} exercise(s) remain unmapped:`,
          unmappedExercises
        );
        APP.ui.showToast(
          `⚠️ ${unmappedExercises.length} unmapped exercise(s). Volume tracking incomplete.`,
          "warning"
        );
      }

      const conflicts = [];
      Object.keys(newData).forEach((sessionId) => {
        if (APP.state.workoutData[sessionId]) {
          conflicts.push({
            sessionId: sessionId,
            oldTitle: APP.state.workoutData[sessionId].title,
            newTitle: newData[sessionId].title,
          });
        }
      });

      if (conflicts.length > 0) {
        const conflictList = conflicts
          .map((c) => `  • "${c.oldTitle}" → "${c.newTitle}"`)
          .join("\n");

        const userChoice = confirm(
          `🔄 MERGE CONFLICT DETECTED\n\n` +
            `${conflicts.length} existing session(s) will be overwritten:\n\n` +
            conflictList +
            `\n\n` +
            `Continue merge?\n` +
            `(Cancel = keep existing sessions, only add new ones)`
        );

        if (!userChoice) {
          console.log("[MERGE] User chose to skip conflicts");
          const conflictIds = conflicts.map((c) => c.sessionId);

          Object.keys(newData).forEach((sessionId) => {
            if (!conflictIds.includes(sessionId)) {
              APP.state.workoutData[sessionId] = newData[sessionId];
            }
          });

          APP.core.saveProgram();
          APP.ui.showToast(
            `✅ Merged ${
              Object.keys(newData).length - conflicts.length
            } new session(s)`,
            "success"
          );
          return true;
        }
      }

      APP.state.workoutData = {
        ...APP.state.workoutData,
        ...newData,
      };

      APP.core.saveProgram();

      console.log(
        `[MERGE] ✅ Successfully merged ${
          Object.keys(newData).length
        } session(s)`
      );
      APP.ui.showToast(
        `✅ Merged ${
          Object.keys(newData).length
        } session(s) successfully`,
        "success"
      );

      return true;
    },

    reconcileLogs: function () {
      console.groupCollapsed("[RECONCILE] 🔗 Log reconciliation");

      const hist = LS_SAFE.getJSON("gym_hist", []);
      const currentSessions = Object.keys(APP.state.workoutData);
      let remappedCount = 0;
      let orphanedCount = 0;

      hist.forEach((log, logIdx) => {
        if (!log.src) {
          console.warn(`⚠️ Log ${logIdx} has no src field`);
          return;
        }

        if (currentSessions.includes(log.src)) {
          return;
        }

        const matchingSession = currentSessions.find((sid) => {
          const session = APP.state.workoutData[sid];
          return session && session.title === log.title;
        });

        if (matchingSession) {
          console.log(`🔗 Remapped: "${log.src}" → "${matchingSession}"`);
          log.src = matchingSession;
          remappedCount++;
        } else {
          console.warn(`⚠️ Orphaned: "${log.title}" (src: ${log.src})`);
          orphanedCount++;
        }
      });

      if (remappedCount > 0) {
        LS_SAFE.setJSON("gym_hist", hist);
        console.log(`✅ Remapped ${remappedCount} log(s)`);
      }

      if (orphanedCount > 0) {
        console.warn(`⚠️ ${orphanedCount} orphaned log(s) remain`);
      }

      if (remappedCount === 0 && orphanedCount === 0) {
        console.log("✅ All logs properly linked");
      }

      console.groupEnd();
      return remappedCount;
    },

    loadProfile: () => {
      const p = LS_SAFE.getJSON("profile", {
        name: "Dok",
      });
      const w = LS_SAFE.getJSON("weights", []);
      const tdee = LS_SAFE.get("tdee");

      // V30.0: Add null checks for removed dashboard elements
      const displayNameEl = document.getElementById("display-name");
      if (displayNameEl) displayNameEl.innerText = p.name;

      const dashboardBwEl = document.getElementById("dashboard-bw");
      if (dashboardBwEl) {
        dashboardBwEl.innerText = `${w.length ? w[0].v : "--"} kg`;
      }

      const dashboardTdeeEl = document.getElementById("dashboard-tdee");
      if (tdee && dashboardTdeeEl) {
        dashboardTdeeEl.innerHTML = `${tdee} <span class="text-[10px] font-normal">kkal</span>`;
      }

      if (document.getElementById("prof-name")) {
        document.getElementById("prof-name").value = p.name || "";
        if (p.h) document.getElementById("prof-height").value = p.h;
        if (p.a) document.getElementById("prof-age").value = p.a;
        if (p.g) document.getElementById("prof-gender").value = p.g;
        if (p.act) document.getElementById("prof-active").value = p.act;
      }
    },

    loadNutrition: () => {
      // Recalculate to ensure absolute accuracy on load
      const tdee = APP.data.calculateTDEE();
      const w = LS_SAFE.getJSON("weights", []);
      const currentWeight = w.length > 0 ? parseFloat(w[0].v) : 80;

      if (tdee) {
        const t = parseInt(tdee);
        document.getElementById("nut-tdee-val").innerText = t;
        document.getElementById("nut-bulk-val").innerText = t + 300;
        document.getElementById("nut-cut-val").innerText = t - 500;

        // Simple Macro Estimation (2g Protein/kg, 0.8g Fat/kg, Remainder Carbs)
        const protein = Math.round(currentWeight * 2);
        const fat = Math.round(currentWeight * 0.8);
        const carb = Math.round((t - (protein * 4 + fat * 9)) / 4);

        document.getElementById("nut-pro-val").innerText = protein;
        document.getElementById("nut-fat-val").innerText = fat;
        document.getElementById("nut-carb-val").innerText = Math.max(0, carb);
      }
    },

    addWeight: () => {
      const v = document.getElementById("new-weight").value;
      if (!v) return;
      const w = LS_SAFE.getJSON("weights", []);
      const d = DT.formatDate(new Date());
      w.unshift({
        v,
        d,
      });
      LS_SAFE.setJSON("weights", w);
      document.getElementById("new-weight").value = "";
      APP.ui.renderWeight();
      APP.data.saveProfile();
    },

    deleteLogs: (mode) => {
      let logs = LS_SAFE.getJSON("gym_hist", []);
      if (!logs.length) return alert("Log sudah kosong.");

      // V29.5 P1-010: Local function removed - now using APP.data.resetSessionTimestamp

      if (mode === "today") {
        const today = DT.formatDate(new Date());
        if (!confirm(`Hapus semua log latihan hari ini (${today})?`))
          return;

        // V29.5 FIX: Backup before delete
        window.APP.safety.createBackup('delete_today_logs');

        const newLogs = logs.filter((l) => l.date !== today);
        LS_SAFE.setJSON("gym_hist", newLogs);
        window.APP.data.resetSessionTimestamp(today);
        alert("Log hari ini dihapus. Rotasi sesi dikembalikan.");

        // V29.5 FIX: Delay reload for storage commit
        setTimeout(() => {
          APP.stats.loadOptions();
          APP.nav.renderDashboard();
        }, 250);
        return;
      } else if (mode === "date") {
        // Check both Settings view and Data view date pickers
        const inputDate =
          document.getElementById("settings-del-date-picker")?.value ||
          document.getElementById("del-date-picker")?.value;
        if (!inputDate) return alert("Pilih tanggal dulu.");
        const targetDate = DT.formatDate(new Date(inputDate));
        if (!confirm(`Hapus semua log tanggal ${targetDate}?`)) return;
        const initialLen = logs.length;
        const newLogs = logs.filter((l) => l.date !== targetDate);
        if (newLogs.length === initialLen)
          return alert("Tidak ada data di tanggal tersebut.");

        // V29.5 FIX: Backup before delete
        window.APP.safety.createBackup('delete_date_logs');

        LS_SAFE.setJSON("gym_hist", newLogs);
        window.APP.data.resetSessionTimestamp(targetDate);
        alert(`Data tanggal ${targetDate} dihapus.`);

        // V29.5 FIX: Delay reload for storage commit
        setTimeout(() => {
          APP.stats.loadOptions();
          APP.nav.renderDashboard();
        }, 250);
        return;
      } else if (mode === "all") {
        if (
          !confirm(
            "⚠️ FRESH START ⚠️\n\nHapus SEMUA history & reset program ke awal?"
          )
        )
          return;

        // V29.5 FIX: Backup before delete all
        window.APP.safety.createBackup('delete_all_logs');

        LS_SAFE.remove("gym_hist");
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (
            (k.includes("_ex") &&
              (k.endsWith("_k") ||
                k.endsWith("_r") ||
                k.endsWith("_rpe") ||
                k.endsWith("_d"))) ||
            k.startsWith("last_")
          ) {
            toRemove.push(k);
          }
        }
        toRemove.forEach((k) => LS_SAFE.remove(k));
        alert("Fresh Start Berhasil! Kembali ke Sesi 1.");

        // V29.5 FIX: Delay reload for storage commit
        setTimeout(() => location.reload(), 250);
        return;
      }
      APP.stats.loadOptions();
      APP.nav.renderDashboard();
    },

    // V29.5 P0-006: User-controlled session ordering
    setNextSession: function(sessionId) {
      // Validate session exists
      if (!window.APP.state || !window.APP.state.workoutData) {
        console.error("[DATA] workoutData not initialized");
        return false;
      }

      const session = window.APP.state.workoutData[sessionId];
      if (!session) {
        console.error(`[DATA] Session ${sessionId} not found`);
        return false;
      }

      // Save preference
      LS_SAFE.set("pref_next_session", sessionId);

      // Show confirmation
      const sessionTitle = session.title || `Session ${sessionId}`;
      if (window.APP.ui && window.APP.ui.showToast) {
        window.APP.ui.showToast(
          `🎯 Next workout set to: ${sessionTitle}`,
          "success"
        );
      }

      // Refresh dashboard to show new highlight
      if (window.APP.nav && window.APP.nav.renderDashboard) {
        window.APP.nav.renderDashboard();
      }

      console.log(`[DATA] Next session set to ${sessionId}`);
      return true;
    },

    exportData: () => {
      const d = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        d[k] = localStorage.getItem(k);
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([JSON.stringify(d)], {
          type: "application/json",
        })
      );
      a.download = `cscs_bkp_${Date.now()}.json`;
      a.click();
    },

    importData: (i) => {
      const r = new FileReader();
      r.onload = (e) => {
        try {
          const d = JSON.parse(e.target.result);

          // V29.5 FIX: Validate structure before destroying data
          if (!d || typeof d !== 'object' || Object.keys(d).length === 0) {
            throw new Error('Invalid or empty backup file');
          }

          // V29.5 FIX: Backup current state before clear
          window.APP.safety.createBackup('pre_import_backup');

          LS_SAFE.clear();
          for (let k in d) LS_SAFE.set(k, d[k]);

          // V29.5 FIX: Delay for storage commit
          setTimeout(() => location.reload(), 250);
        } catch (err) {
          // V29.5 FIX: Show actual error message
          alert("Import failed: " + (err.message || "File Corrupt/Invalid"));
        }
      };
      r.readAsText(i.files[0]);
    },

    saveToLibrary: () => {
      const dName = `Program ${DT.formatDate(new Date())}`;
      const name = prompt("Nama Program:", dName);
      if (!name) return;

      try {
        const lib = LS_SAFE.getJSON("cscs_library", []);
        lib.push({
          name,
          date: Date.now(),
          data: APP.state.workoutData,
        });

        // V29.5 FIX: Check if save succeeded
        const saved = LS_SAFE.setJSON("cscs_library", lib);

        if (saved) {
          APP.ui.renderLibrary();
          alert("Tersimpan!");
        } else {
          alert("Failed to save - storage may be full");
        }
      } catch (err) {
        alert(`Failed to save to library: ${err.message}`);
        console.error("[DATA] saveToLibrary error:", err);
      }
    },

    loadFromLibrary: (idx) => {
      try {
        const lib = LS_SAFE.getJSON("cscs_library", []);

        // V29.5 FIX: Validate index and entry exist
        if (!lib[idx]) {
          alert(`Program not found in library`);
          return;
        }

        if (confirm(`Load "${lib[idx].name}"?`)) {
          APP.state.workoutData = lib[idx].data;
          APP.core.saveProgram();
          // V29.5 FIX: Delay reload for storage commit
          setTimeout(() => location.reload(), 250);
        }
      } catch (err) {
        alert(`Failed to load from library: ${err.message}`);
        console.error("[DATA] loadFromLibrary error:", err);
      }
    },

    deleteFromLibrary: (idx) => {
      if (!confirm("Hapus?")) return;

      try {
        const lib = LS_SAFE.getJSON("cscs_library", []);

        // V29.5 FIX: Validate index exists
        if (!lib[idx]) {
          alert("Program not found");
          return;
        }

        lib.splice(idx, 1);

        // V29.5 FIX: Check if delete succeeded
        const saved = LS_SAFE.setJSON("cscs_library", lib);

        if (saved) {
          APP.ui.renderLibrary();
        } else {
          alert("Failed to delete - storage error");
        }
      } catch (err) {
        alert(`Failed to delete from library: ${err.message}`);
        console.error("[DATA] deleteFromLibrary error:", err);
      }
    },

    applyAIProgram: () => {
      try {
        const inputStr = document.getElementById("ai-input").value;

        if (!inputStr || inputStr.trim().length === 0) {
          alert("⚠️ Paste JSON program dulu");
          return;
        }

        const newData = JSON.parse(inputStr);

        if (!newData || typeof newData !== "object") {
          alert("⚠️ Format JSON tidak valid");
          return;
        }

        const hasSessionData = Object.keys(newData).some((key) => {
          const session = newData[key];
          return (
            session &&
            session.exercises &&
            Array.isArray(session.exercises)
          );
        });

        if (!hasSessionData) {
          alert("⚠️ JSON tidak mengandung data sesi latihan yang valid");
          return;
        }

        console.log(
          `[AI-IMPORT] Importing ${
            Object.keys(newData).length
          } session(s)`
        );

        const success = APP.data.mergeProgram(newData);

        if (success) {
          const remapped = APP.data.reconcileLogs();
          if (remapped > 0) {
            console.log(
              `[AI-IMPORT] ✅ Reconciled ${remapped} history log(s)`
            );
          }

          APP.ui.closeModal("library");
          APP.nav.renderDashboard();

          APP.ui.showToast(
            "✅ Program merged successfully! Check dashboard for new sessions.",
            "success"
          );

          document.getElementById("ai-input").value = "";
        } else {
          console.error("[AI-IMPORT] Merge failed");
        }
      } catch (e) {
        console.error("[AI-IMPORT] Error:", e);
        alert("❌ JSON Invalid: " + e.message);
      }
    },

    copyProgramToClipboard: () => {
      const txt = JSON.stringify(APP.state.workoutData, null, 2);
      if (navigator.clipboard)
        navigator.clipboard
          .writeText(txt)
          .then(() => alert("Copied!"))
          .catch(() => APP.ui.showManualCopy(txt));
      else APP.ui.showManualCopy(txt);
    },

    prepareGeminiAudit: () => {
      const h = LS_SAFE.getJSON("gym_hist", []);
      if (!h.length) return alert("Belum ada log latihan untuk diaudit.");

      const lastLog = h[h.length - 1];
      const p = LS_SAFE.getJSON("profile", {});

      const sessionLogs = h.filter((x) => x.date === lastLog.date);

      const sessionTotalVol = sessionLogs.reduce((acc, curr) => {
        if (curr.type === "cardio") return acc;

        if (typeof curr.vol === "number" && !isNaN(curr.vol)) {
          return acc + curr.vol;
        }

        if (curr.d && Array.isArray(curr.d)) {
          const manualVol = curr.d.reduce((sum, s) => {
            return sum + (parseFloat(s.k) || 0) * (parseFloat(s.r) || 0);
          }, 0);
          return acc + manualVol;
        }
        return acc;
      }, 0);

      const volDisplay =
        sessionTotalVol === 0 &&
        sessionLogs.some((x) => x.type === "cardio")
          ? "N/A (Cardio Focus)"
          : `${sessionTotalVol.toLocaleString()} kg`;

      let promptText = `[MASTER PROMPT: FULL CYCLE AUDIT & PROGRAM CALIBRATION]\n\n`;
      promptText += `Instruksi:\n"Bertindaklah sebagai Senior CSCS Coach, Clinical Performance Analyst, & System Architect. Saya akan memberikan Resep Program Saat Ini (JSON) dan Log Latihan Terakhir (JSON/Teks). Tugas Anda adalah mengaudit performa saya secara klinis, lalu memperbarui kode program latihan untuk sesi berikutnya berdasarkan hasil audit tersebut.\n\n`;
      promptText += `BAGIAN 1: MISI ANALISIS & AUDIT\nLakukan analisis mendalam sebelum menulis kode, dengan parameter:\n1. Analisis Progres (Progressive Overload): Bandingkan volume/beban antar sesi.\n2. Audit Klinis (Fatigue Management): Deteksi Systemic Fatigue atau Junk Volume.\n3. Protokol Spontan: Jika log bertanda 'Spontan', abaikan tuntutan overload.\n\n`;
      promptText += `BAGIAN 2: ATURAN UPDATE RESEP JSON (EKSEKUSI)\n1. Struktur Imutabel: DILARANG MENGHAPUS gerakan utama.\n2. Kalibrasi Parameter: Perbarui t_k (Target Beban), t_r (Target Reps), rest (Istirahat), dan note.\n3. Metadata Wajib: Tag Alat, Link Video, Bio Note, Note.\n\n`;
      promptText += `NOTE: Aplikasi mendukung Partial JSON Update. Anda tidak perlu menulis ulang seluruh sesi jika hanya mengubah satu Sesi. Cukup outputkan JSON objek sesi tersebut (contoh: { 's2': { ... } }).\n\n`;

      const programForExport = {};
      Object.keys(APP.state.workoutData).forEach((key) => {
        if (key !== "spontaneous") {
          programForExport[key] = APP.state.workoutData[key];
        }
      });

      promptText += `DATA SAYA:\n\n[RESEP SAAT INI (JSON)]\n${JSON.stringify(
        programForExport,
        null,
        2
      )}\n\n`;

      promptText += `[LOG TERAKHIR]\nTanggal: ${lastLog.date}\nSesi: ${
        lastLog.title || sessionLogs[0].title || "Unknown"
      }\nTotal Vol: ${volDisplay}\nDurasi: ${
        lastLog.dur
      } menit\n\nRincian Gerakan:\n`;

      sessionLogs.forEach((l, exerciseIdx) => {
        const exerciseSpontTag = l.src === "spontaneous" ? " [SPONTANEOUS]" : "";
        promptText += `\n${exerciseIdx + 1}. ${l.ex}${exerciseSpontTag}:\n`;

        if (l.type === "cardio") {
          promptText += `   Type: LISS Cardio\n`;
          promptText += `   Machine: ${l.machine}\n`;
          promptText += `   Duration: ${l.duration} minutes\n`;
          promptText += `   Avg HR: ${l.avgHR} bpm (Target Zone 2: ${
            l.zoneTarget ? l.zoneTarget.join("-") : "116-135"
          })\n`;
          if (l.note) promptText += `   Note: ${l.note}\n`;
          return;
        }

        if (l.d && Array.isArray(l.d)) {
          l.d.forEach((s, setIdx) => {
            let setLine = `   Set ${setIdx + 1}: ${s.k}kg x ${s.r}`;
            if (s.rpe) setLine += ` @ RPE ${s.rpe}`;

            const setNote = APP.data.getSetNote(
              l.src,
              exerciseIdx,
              setIdx + 1
            );
            if (setNote) {
              setLine += ` [📝 ${setNote}]`;
            }

            promptText += setLine + "\n";
          });
        }
      });
      APP.ui.showManualCopy(promptText);
      alert("Data Audit Siap! Salin teks di bawah dan paste ke Gemini.");
    },

    exportForConsultation: () => {
      const h = LS_SAFE.getJSON("gym_hist", []);
      const p = LS_SAFE.getJSON("profile", {});
      const w = LS_SAFE.getJSON("weights", []);
      if (!h.length) return alert("Belum ada data.");
      const uniqueDates = [...new Set(h.map((i) => i.date))].slice(-5);
      const currentWeight = w.length > 0 ? w[0].v : 80;
      let rep = `[KONSULTASI KLINIS & PERFORMA]\n`;
      rep += `User: ${p.name || "Dok"} | Usia: ${p.a || "-"} | TB: ${
        p.h || 170
      }cm | BB: ${currentWeight}kg\n`;
      rep += `TDEE: ${
        LS_SAFE.get("tdee") || "?"
      } kkal | Goal: Hypertrophy/Strength\n\n`;
      rep += `--- LOG LATIHAN TERAKHIR ---\n`;
      uniqueDates.forEach((d) => {
        const dayLogs = h.filter((x) => x.date === d);

        const titles = [
          ...new Set(
            dayLogs.map(
              (l) =>
                l.title ||
                (l.src === "spontaneous" ? "Spontaneous" : l.src)
            )
          ),
        ].join(" & ");

        // Add spontaneous tag if session is spontaneous
        const isSpontaneous = dayLogs.some((l) => l.src === "spontaneous");
        const spontaneousTag = isSpontaneous ? " [SPONTANEOUS]" : "";

        const dur = dayLogs[0].dur ? `${dayLogs[0].dur} menit` : "N/A";

        const totalSessionVol = dayLogs.reduce((acc, curr) => {
          if (typeof curr.vol === "number") {
            return acc + curr.vol;
          }

          if (curr.type === "cardio") return acc;

          if (curr.d && Array.isArray(curr.d)) {
            const manualVol = curr.d.reduce((sum, s) => {
              return (
                sum + (parseFloat(s.k) || 0) * (parseFloat(s.r) || 0)
              );
            }, 0);
            return acc + manualVol;
          }

          return acc;
        }, 0);

        rep += `\n📅 ${d} | 🏷️ ${titles}${spontaneousTag}\n`;

        rep += `⏱️ Durasi: ${dur} | 🗃️ Volume Load: ${totalSessionVol.toLocaleString()} kg\n`;
        dayLogs.forEach((l) => {
          if (l.type === "cardio") {
            const noteStr = l.note ? ` [💭 ${l.note}]` : "";
            const cardioSpontTag = l.src === "spontaneous" ? " [SPONTANEOUS]" : "";
            rep += `- 🏃 ${l.machine} LISS: ${l.duration}min @ ${l.avgHR}bpm (Zone 2)${noteStr}${cardioSpontTag}\n`;
            return;
          }

          const noteStr = l.note ? ` [📝 ${l.note}]` : "";
          const exerciseSpontTag = l.src === "spontaneous" ? " [SPONTANEOUS]" : "";
          if (l.d && Array.isArray(l.d)) {
            const sStr = l.d
              .map((s) => `${s.k}x${s.r}${s.rpe ? "@" + s.rpe : ""}`)
              .join(", ");
            rep += `- ${l.ex}${noteStr}: ${sStr}${exerciseSpontTag}\n`;
          }
        });
      });
      rep += `\n--- END ---`;

      // V28.1: Use simplified library modal for manual copy
      APP.ui.showManualCopy(rep);
    },

    // ============================================================================
    // V30.0 PHASE 3.5: SETTINGS VIEW PROFILE FUNCTIONS
    // ============================================================================

    /**
     * Load profile data into the Settings View form fields
     * Called when navigating to Settings via bottom nav
     */
    loadProfileToSettings: function() {
      console.log("[DATA] Loading profile to Settings View");

      const profile = LS_SAFE.getJSON("profile", {});

      // Populate settings form fields
      const nameEl = document.getElementById('settings-prof-name');
      const heightEl = document.getElementById('settings-prof-height');
      const ageEl = document.getElementById('settings-prof-age');
      const genderEl = document.getElementById('settings-prof-gender');
      const activeEl = document.getElementById('settings-prof-active');

      if (nameEl) nameEl.value = profile.name || '';
      if (heightEl) heightEl.value = profile.h || '';
      if (ageEl) ageEl.value = profile.a || '';
      if (genderEl) genderEl.value = profile.g || 'male';
      if (activeEl) activeEl.value = profile.act || '1.55';

      // Also update storage stats
      if (window.APP.showStorageStats) {
        window.APP.showStorageStats();
      }

      console.log("[DATA] Profile loaded to Settings View");
    },

    /**
     * Save profile data from the Settings View form fields
     * Called when user clicks Save button in Settings View
     */
    saveProfileFromSettings: function() {
      console.log("[DATA] Saving profile from Settings View");

      const nameEl = document.getElementById('settings-prof-name');
      const heightEl = document.getElementById('settings-prof-height');
      const ageEl = document.getElementById('settings-prof-age');
      const genderEl = document.getElementById('settings-prof-gender');
      const activeEl = document.getElementById('settings-prof-active');

      const profile = {
        name: nameEl ? nameEl.value : '',
        h: heightEl ? parseInt(heightEl.value) || 170 : 170,
        a: ageEl ? parseInt(ageEl.value) || 25 : 25,
        g: genderEl ? genderEl.value : 'male',
        act: activeEl ? parseFloat(activeEl.value) || 1.55 : 1.55
      };

      // Save to localStorage
      LS_SAFE.setJSON("profile", profile);

      // Show success toast
      if (window.APP.ui && window.APP.ui.showToast) {
        window.APP.ui.showToast("✅ Profil berhasil disimpan", "success");
      }

      console.log("[DATA] Profile saved from Settings View:", profile);
    },
  };

  console.log("[DATA] ✅ Data module loaded (CRUD operations)");
})();
