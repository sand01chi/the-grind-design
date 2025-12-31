/**
 * The Grind Design - Session Module
 * Handles session CRUD operations, spontaneous sessions, and workout flow
 * Dependencies: APP.state, APP.safety, APP.core, APP.ui, APP.nav, APP.validation, APP.stats, APP.data, LS_SAFE, DT
 */

(function () {
  'use strict';
  console.log("[SESSION] Loading... APP.nav =", window.APP?.nav);


  // Ensure APP exists
  if (!window.APP) window.APP = {};

  APP.session = {
    openCreator: function () {
      document.getElementById("new-session-name").value = "";
      document.getElementById("new-session-label").value = "";
      document.getElementById("new-session-warmup").value =
        "Arm Circles, Leg Swings";

      document.getElementById("clone-options").classList.add("hidden");

      APP.ui.openModal("session-creator");
    },

    createEmpty: function () {
      const name = document
        .getElementById("new-session-name")
        .value.trim();
      const label = document
        .getElementById("new-session-label")
        .value.trim();
      const warmup = document
        .getElementById("new-session-warmup")
        .value.trim();

      if (!name) {
        alert("⚠️ Nama sesi harus diisi!");
        return;
      }

      const sessionId = Date.now().toString();

      const newSession = {
        label: label || "CUSTOM",
        title: name,
        dynamic: warmup || "Arm Circles",
        exercises: [],
      };

      APP.state.workoutData[sessionId] = newSession;

      APP.safety.createBackup(`create_session_${sessionId}`);

      APP.core.saveProgram();

      APP.ui.closeModal("session-creator");

      APP.ui.showToast(`✅ Sesi "${name}" berhasil dibuat!`, "success");

      APP.nav.renderDashboard();

      setTimeout(() => {
        if (
          confirm(
            `Sesi berhasil dibuat!\n\nBuka sekarang untuk menambah exercises?`
          )
        ) {
          APP.nav.loadWorkout(sessionId);
        }
      }, 300);
    },

    showCloneOptions: function () {
      const container = document.getElementById("clone-options");
      const select = document.getElementById("clone-source-select");

      let options = '<option value="">-- Pilih Sesi --</option>';

      Object.keys(APP.state.workoutData).forEach((sessionId) => {
        const session = APP.state.workoutData[sessionId];
        if (sessionId !== "spontaneous") {
          options += `<option value="${sessionId}">${
            session.title || session.label
          }</option>`;
        }
      });

      select.innerHTML = options;
      container.classList.remove("hidden");
    },

    createClone: function () {
      const name = document
        .getElementById("new-session-name")
        .value.trim();
      const label = document
        .getElementById("new-session-label")
        .value.trim();
      const warmup = document
        .getElementById("new-session-warmup")
        .value.trim();
      const sourceId = document.getElementById(
        "clone-source-select"
      ).value;

      if (!name) {
        alert("⚠️ Nama sesi harus diisi!");
        return;
      }

      if (!sourceId) {
        alert("⚠️ Pilih sesi yang akan di-clone!");
        return;
      }

      const sourceSession = APP.state.workoutData[sourceId];
      if (!sourceSession) {
        alert("❌ Sesi source tidak ditemukan!");
        return;
      }

      const newSessionId = Date.now().toString();

      const clonedSession = JSON.parse(JSON.stringify(sourceSession));

      clonedSession.label = label || clonedSession.label;
      clonedSession.title = name;
      clonedSession.dynamic = warmup || clonedSession.dynamic;

      APP.state.workoutData[newSessionId] = clonedSession;

      APP.safety.createBackup(
        `clone_session_${sourceId}_to_${newSessionId}`
      );

      APP.core.saveProgram();

      APP.ui.closeModal("session-creator");

      APP.ui.showToast(
        `✅ Sesi "${name}" berhasil dibuat dari "${sourceSession.title}"!`,
        "success"
      );

      APP.nav.renderDashboard();
    },

    reorder: function (sessionId, direction) {
      try {
        const sessions = Object.keys(APP.state.workoutData).filter(
          (id) => id !== "spontaneous"
        );

        const currentIndex = sessions.indexOf(sessionId);

        if (currentIndex === -1) {
          console.error("Session not found:", sessionId);
          return;
        }

        const newIndex = currentIndex + direction;

        if (newIndex < 0 || newIndex >= sessions.length) {
          console.log("Cannot move: out of bounds");
          return;
        }

        [sessions[currentIndex], sessions[newIndex]] = [
          sessions[newIndex],
          sessions[currentIndex],
        ];

        const reordered = {};

        sessions.forEach((id) => {
          reordered[id] = APP.state.workoutData[id];
        });

        if (APP.state.workoutData.spontaneous) {
          reordered.spontaneous = APP.state.workoutData.spontaneous;
        }

        APP.safety.createBackup("reorder_sessions");

        APP.state.workoutData = reordered;

        APP.core.saveProgram();

        APP.nav.renderDashboard();

        console.log(
          `[SESSION] Reordered: ${sessionId} moved ${
            direction > 0 ? "down" : "up"
          }`
        );
      } catch (e) {
        console.error("[SESSION] Reorder error:", e);
        alert("Gagal reorder sesi: " + e.message);
      }
    },

    confirmDelete: function (event, sessionId) {
      event.stopPropagation();

      const session = APP.state.workoutData[sessionId];
      if (!session) return;

      const confirmed = confirm(
        `🗑️ HAPUS SESI\n\n` +
          `Nama: ${session.title}\n` +
          `Exercises: ${session.exercises.length}\n\n` +
          `⚠️ Sesi akan hilang permanen!\n` +
          `(History logs tetap tersimpan)\n\n` +
          `Lanjutkan hapus?`
      );

      if (!confirmed) return;

      APP.safety.createBackup(`delete_session_${sessionId}`);

      delete APP.state.workoutData[sessionId];

      this.cleanupSessionKeys(sessionId);

      APP.core.saveProgram();

      APP.nav.renderDashboard();

      APP.ui.showToast(
        `✅ Sesi "${session.title}" berhasil dihapus`,
        "success"
      );
    },

    cleanupSessionKeys: function (sessionId) {
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (
          key &&
          (key.startsWith(`${sessionId}_ex`) ||
            key.startsWith(`last_${sessionId}`) ||
            key.startsWith(`pref_${sessionId}`) ||
            key.startsWith(`note_${sessionId}`) ||
            key.startsWith(`vid_ovr_${sessionId}`))
        ) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => LS_SAFE.remove(key));

      console.log(
        `[SESSION] Cleaned up ${keysToRemove.length} localStorage keys for session ${sessionId}`
      );
    },

    openEditor: function (event, sessionId) {
      if (event) event.stopPropagation();

      const session = APP.state.workoutData[sessionId];
      if (!session) {
        alert("Session not found!");
        return;
      }

      APP.state.currentEditingSessionId = sessionId;

      document.getElementById("edit-session-label").value =
        session.label || "";
      document.getElementById("edit-session-title").value =
        session.title || "";
      document.getElementById("edit-session-warmup").value =
        session.dynamic || "";

      this.updateRotationStatus(sessionId);

      this.renderExerciseList();

      this.updateVolumePreview();

      APP.ui.openModal("session-editor");
    },

    updateRotationStatus: function (sessionId) {
      const lastPerformed = LS_SAFE.get(`last_${sessionId}`);
      const statusEl = document.getElementById("rotation-status");

      if (!statusEl) return;

      if (lastPerformed) {
        const date = new Date(parseInt(lastPerformed));
        const dateStr = DT.formatRelative(lastPerformed);
        statusEl.innerHTML = `Last performed: <span class="text-blue-400">${dateStr}</span>`;
      } else {
        statusEl.innerHTML = `Last performed: <span class="text-emerald-400">Never</span>`;
      }
    },

    resetRotation: function () {
      const sessionId = APP.state.currentEditingSessionId;

      if (
        !confirm(
          `Tandai sesi ini sebagai "Belum Pernah Dilakukan"?\n\n` +
            `Sesi ini akan menjadi prioritas "Next Workout" pada dashboard.`
        )
      ) {
        return;
      }

      LS_SAFE.remove(`last_${sessionId}`);

      this.updateRotationStatus(sessionId);

      APP.ui.showToast("✅ Rotation status direset", "success");
    },

    renderExerciseList: function () {
      const sessionId = APP.state.currentEditingSessionId;
      const session = APP.state.workoutData[sessionId];
      const container = document.getElementById("editor-exercise-list");
      const badge = document.getElementById("exercise-count-badge");

      if (!session || !container) return;

      const exercises = session.exercises || [];
      badge.innerText = exercises.length;

      if (exercises.length === 0) {
        container.innerHTML = `
        <div class="text-center py-6 text-slate-500">
          <i class="fa-solid fa-dumbbell text-3xl mb-2 opacity-30"></i>
          <p class="text-xs italic">Belum ada exercise di sesi ini.</p>
          <p class="text-[10px] mt-1">Klik "Add Exercise" untuk menambah.</p>
        </div>
      `;
        return;
      }

      let html = "";

      exercises.forEach((exercise, idx) => {
        const option = exercise.options[0] || {};
        const exerciseName = option.n || "Unknown Exercise";
        const sets = exercise.sets || 0;
        const rest = exercise.rest || 0;

        html += `
        <div class="bg-slate-800/50 rounded-lg border border-slate-700 p-3 flex items-center gap-3">
          <div class="flex flex-col gap-1">
            <button
              onclick="APP.session.moveExercise(${idx}, -1)"
              class="text-slate-500 hover:text-emerald-400 text-xs transition"
              title="Move up"
              ${idx === 0 ? 'disabled style="opacity:0.3"' : ""}
            >
              <i class="fa-solid fa-chevron-up"></i>
            </button>
            <button
              onclick="APP.session.moveExercise(${idx}, 1)"
              class="text-slate-500 hover:text-emerald-400 text-xs transition"
              title="Move down"
              ${
                idx === exercises.length - 1
                  ? 'disabled style="opacity:0.3"'
                  : ""
              }
            >
              <i class="fa-solid fa-chevron-down"></i>
            </button>
          </div>

          <div class="flex-1 min-w-0">
            <div class="text-sm font-bold text-white truncate">${exerciseName}</div>
            <div class="text-[10px] text-slate-400 mt-1">
              ${sets} sets × ${rest}s rest
              ${option.t_k ? ` • Target: ${option.t_k}kg × ${option.t_r}` : ""}
            </div>
          </div>

          <button
            onclick="APP.session.deleteExercise(${idx})"
            class="text-red-500/70 hover:text-red-500 px-2 transition"
            title="Delete exercise"
          >
            <i class="fa-solid fa-trash text-sm"></i>
          </button>
        </div>
      `;
      });

      container.innerHTML = html;
    },

    moveExercise: function (index, direction) {
      const sessionId = APP.state.currentEditingSessionId;
      const session = APP.state.workoutData[sessionId];

      if (!session || !session.exercises) return;

      const newIndex = index + direction;

      if (newIndex < 0 || newIndex >= session.exercises.length) return;

      [session.exercises[index], session.exercises[newIndex]] = [
        session.exercises[newIndex],
        session.exercises[index],
      ];

      this.renderExerciseList();
      this.updateVolumePreview();
    },

    deleteExercise: function (index) {
      const sessionId = APP.state.currentEditingSessionId;
      const session = APP.state.workoutData[sessionId];

      if (!session || !session.exercises) return;

      const exercise = session.exercises[index];
      const exerciseName = exercise.options[0]?.n || "Unknown";

      if (!confirm(`Hapus "${exerciseName}" dari sesi ini?`)) return;

      session.exercises.splice(index, 1);

      this.renderExerciseList();
      this.updateVolumePreview();

      APP.ui.showToast(`✅ "${exerciseName}" dihapus`, "success");
    },

    addExerciseToSession: function () {
      APP.state.pickerContext = {
        mode: "add-to-editor",
        sessionId: APP.state.currentEditingSessionId,
      };

      APP.ui.openExercisePicker(
        "editor",
        APP.state.currentEditingSessionId,
        null
      );
    },

    updateVolumePreview: function () {
      const sessionId = APP.state.currentEditingSessionId;
      const session = APP.state.workoutData[sessionId];
      const container = document.getElementById("volume-bars-container");

      if (!session || !container) return;

      const volumeMap = {
        chest: 0,
        back: 0,
        legs: 0,
        shoulders: 0,
        arms: 0,
      };

      console.log(
        "[VOLUME] Starting volume calculation for session:",
        sessionId
      );
      console.log(
        "[VOLUME] Total exercises to process:",
        session.exercises.length
      );

      session.exercises.forEach((exercise, exIndex) => {
        const option = exercise.options[0] || {};
        const exerciseName = option.n;
        const targetWeight = parseFloat(option.t_k) || 0;
        const targetReps = option.t_r
          ? parseInt(option.t_r.split("-")[0])
          : 10;
        const sets = exercise.sets || 3;

        console.log(
          `[VOLUME] Exercise ${exIndex + 1}: "${exerciseName}"`
        );
        console.log(
          `[VOLUME]   - Target: ${targetWeight}kg × ${targetReps} reps × ${sets} sets`
        );

        const estimatedVolume = targetWeight * targetReps * sets;

        console.log(
          `[VOLUME]   - Estimated volume: ${estimatedVolume}kg`
        );

        const targets = APP.stats.getTargets(exerciseName);

        console.log(`[VOLUME]   - Muscle targets:`, targets);

        targets.forEach((target) => {
          const factor = target.role === "PRIMARY" ? 1.0 : 0.5;
          const weightedVolume = estimatedVolume * factor;

          if (volumeMap.hasOwnProperty(target.muscle)) {
            volumeMap[target.muscle] += weightedVolume;
            console.log(
              `[VOLUME]   - Added ${weightedVolume}kg to ${target.muscle} (${target.role}, factor: ${factor})`
            );
          }
        });
      });

      console.log("[VOLUME] Final volume map:", volumeMap);

      const totalVolume = Object.values(volumeMap).reduce(
        (sum, v) => sum + v,
        0
      );
      const maxVolume = Math.max(...Object.values(volumeMap));

      console.log("[VOLUME] Total volume:", totalVolume);
      console.log("[VOLUME] Max muscle volume:", maxVolume);

      if (totalVolume === 0) {
        container.innerHTML = `
        <div class="text-center py-4 text-indigo-400/50 text-xs italic">
          Tambahkan exercises dengan target weight untuk melihat preview
        </div>
      `;
        return;
      }

      let html = "";

      Object.keys(volumeMap).forEach((muscle) => {
        const volume = volumeMap[muscle];
        const percentage = maxVolume > 0 ? (volume / maxVolume) * 100 : 0;
        const percentOfTotal =
          totalVolume > 0 ? (volume / totalVolume) * 100 : 0;

        const label = muscle.charAt(0).toUpperCase() + muscle.slice(1);

        html += `
        <div class="flex items-center gap-2">
          <div class="w-16 text-[10px] text-slate-400 font-bold">${label}</div>
          <div class="flex-1 bg-slate-900 rounded-full h-6 overflow-hidden relative">
            <div
              class="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full transition-all duration-500"
              style="width: ${percentage}%"
            ></div>
            ${
              percentage > 20
                ? `
              <div class="absolute inset-0 flex items-center justify-end pr-2">
                <span class="text-[10px] font-bold text-white">${Math.round(
                  percentOfTotal
                )}%</span>
              </div>
            `
                : ""
            }
          </div>
          <div class="w-20 text-[10px] text-indigo-300 text-right font-mono">
            ${Math.round(volume).toLocaleString()}kg
          </div>
        </div>
      `;
      });

      const pushVolume =
        volumeMap.chest + volumeMap.shoulders + volumeMap.arms * 0.5;
      const pullVolume = volumeMap.back + volumeMap.arms * 0.5;
      const ratio = pullVolume > 0 ? pushVolume / pullVolume : 0;

      let ratioStatus = "";
      let ratioColor = "";

      if (ratio > 1.3) {
        ratioStatus = "⚠️ Push-Dominant (Risk: Shoulder impingement)";
        ratioColor = "text-red-400";
      } else if (ratio < 0.7) {
        ratioStatus = "⚠️ Pull-Dominant (Uncommon pattern)";
        ratioColor = "text-yellow-400";
      } else {
        ratioStatus = "✅ Balanced Push/Pull";
        ratioColor = "text-emerald-400";
      }

      html += `
      <div class="mt-3 pt-3 border-t border-indigo-900/30">
        <div class="flex justify-between items-center text-[10px]">
          <span class="text-slate-400">Push/Pull Ratio:</span>
          <span class="${ratioColor} font-bold">${
            ratio > 0 ? ratio.toFixed(2) : "N/A"
          }</span>
        </div>
        <div class="text-[10px] ${ratioColor} mt-1 font-bold">${ratioStatus}</div>
      </div>
    `;

      container.innerHTML = html;
    },

    saveSessionEdits: function () {
      const sessionId = APP.state.currentEditingSessionId;
      const session = APP.state.workoutData[sessionId];

      if (!session) {
        alert("Error: Session not found!");
        return;
      }

      const newLabel = document
        .getElementById("edit-session-label")
        .value.trim();
      const newTitle = document
        .getElementById("edit-session-title")
        .value.trim();
      const newWarmup = document
        .getElementById("edit-session-warmup")
        .value.trim();

      if (!newTitle) {
        alert("⚠️ Session name tidak boleh kosong!");
        return;
      }

      const validation = APP.validation.validateSessionStructure(
        session,
        sessionId
      );

      if (!validation.valid) {
        const proceed = APP.validation.showValidationReport(
          validation,
          "Save Session"
        );
        if (!proceed) return;
      }

      session.label = newLabel || session.label;
      session.title = newTitle;
      session.dynamic = newWarmup || session.dynamic;

      APP.safety.createBackup(`edit_session_${sessionId}`);

      APP.core.saveProgram();

      APP.ui.closeModal("session-editor");

      APP.nav.renderDashboard();

      APP.ui.showToast(
        `✅ Sesi "${newTitle}" berhasil diupdate!`,
        "success"
      );
    },

    spontaneous: {
      startEmpty: () => {
      const title = prompt("Nama Sesi Spontan:", "Express Session");
      if (!title) return;
      const emptySession = {
        label: "SPONTANEOUS",
        title: title,
        dynamic: "Arm Circles, Jumping Jacks",
        exercises: [],
      };
      APP.state.workoutData["spontaneous"] = emptySession;
      APP.ui.closeModal("spontaneous");
      APP.nav.loadWorkout("spontaneous");
      setTimeout(() => APP.data.addNewExerciseCard(), 500);
    },
    loadFromJSON: () => {
      try {
        const jsonStr = document.getElementById("spon-json-input").value;
        if (!jsonStr) return alert("Paste JSON dulu.");
        const json = JSON.parse(jsonStr);
        if (!json.exercises) throw new Error("Format JSON Salah");
        APP.state.workoutData["spontaneous"] = json;
        APP.state.workoutData["spontaneous"].label = "SPONTANEOUS";
        APP.ui.closeModal("spontaneous");
        APP.nav.loadWorkout("spontaneous");
      } catch (e) {
        alert("JSON Invalid: " + e.message);
      }
    },
    saveToPresets: () => {
      const jsonStr = document.getElementById("spon-json-input").value;
      if (!jsonStr) return alert("Tidak ada data untuk disimpan.");
      const name = prompt("Nama Preset:");
      if (!name) return;
      const presets = LS_SAFE.getJSON("cscs_spon_presets", []);
      presets.push({
        name,
        data: JSON.parse(jsonStr),
      });
      LS_SAFE.setJSON("cscs_spon_presets", presets);
      APP.session.spontaneous.renderPresets();
    },
    deletePreset: (idx) => {
      if (!confirm("Hapus preset ini?")) return;
      const presets = LS_SAFE.getJSON("cscs_spon_presets", []);
      presets.splice(idx, 1);
      LS_SAFE.setJSON("cscs_spon_presets", presets);
      APP.session.spontaneous.renderPresets();
    },
    loadPreset: (idx, fromSource = "custom") => {
      let data;
      if (fromSource === "custom") {
        const presets = LS_SAFE.getJSON("cscs_spon_presets", []);
        data = presets[idx].data;
      } else {
        data = PRESETS[idx];
      }
      if (data) {
        APP.state.workoutData["spontaneous"] = JSON.parse(
          JSON.stringify(data)
        );
        APP.state.workoutData["spontaneous"].label = "SPONTANEOUS";
        APP.ui.closeModal("spontaneous");
        APP.nav.loadWorkout("spontaneous");
      }
    },
    renderPresets: () => {
      const presets = LS_SAFE.getJSON("cscs_spon_presets", []);
      const el = document.getElementById("spon-preset-list");
      if (!presets.length) {
        el.innerHTML = `<div class="text-center text-[10px] text-slate-500 italic">Belum ada preset tersimpan.</div>`;
      } else {
        let html = "";
        presets.forEach((p, i) => {
          html += `<div class="bg-slate-900 p-2 rounded flex justify-between items-center border border-slate-700 mb-1"><span class="text-xs text-indigo-300 font-bold">${p.name}</span><div class="flex gap-2"><button onclick="APP.session.spontaneous.loadPreset(${i})" class="text-emerald-400 hover:text-emerald-300 text-[10px]"><i class="fa-solid fa-play"></i></button><button onclick="APP.session.spontaneous.deletePreset(${i})" class="text-red-500 hover:text-red-400 text-[10px]"><i class="fa-solid fa-trash"></i></button></div></div>`;
        });
        el.innerHTML = html;
      }
      const bpEl = document.getElementById("blueprint-list");
      let bpHtml = "";
      Object.keys(PRESETS).forEach((k) => {
        const p = PRESETS[k];
        bpHtml += `<button onclick="APP.session.spontaneous.loadPreset('${k}', 'blueprint')" class="w-full bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-500/30 p-2 rounded text-left flex items-center gap-3 transition"><div class="bg-indigo-500/20 w-8 h-8 rounded flex items-center justify-center text-indigo-400"><i class="fa-solid fa-dumbbell"></i></div><div><div class="text-xs font-bold text-white">${p.title}</div><div class="text-[10px] text-indigo-300">${p.exercises.length} Exercises</div></div></button>`;
      });
      bpEl.innerHTML = bpHtml;
      },
    },
  };

  console.log("[SESSION] ✅ Session module loaded");
})();
