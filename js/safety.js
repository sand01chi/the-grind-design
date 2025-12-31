/**
 * The Grind Design - Safety Module
 * Handles backup creation, restoration, and safety operations
 * Dependencies: APP.state, LS_SAFE, DT, APP.ui
 */

(function () {
  'use strict';
  console.log("[SAFETY] Loading... APP.nav =", window.APP?.nav);


  // Ensure APP exists
  if (!window.APP) window.APP = {};

  APP.safety = {
    MAX_BACKUPS: 5,

    createBackup: function (operation) {
      try {
        const timestamp = Date.now();
        const backupId = `backup_${timestamp}_${operation.replace(
          /\s+/g,
          "_"
        )}`;

        const backup = {
          id: backupId,
          operation: operation,
          timestamp: timestamp,
          date: new Date(timestamp).toISOString(),

          workoutData: JSON.parse(
            JSON.stringify(APP.state.workoutData || {})
          ),
          gym_hist: LS_SAFE.getJSON("gym_hist", []),
          profile: LS_SAFE.getJSON("profile", {}),
          weights: LS_SAFE.getJSON("weights", []),
          blueprints: LS_SAFE.getJSON("blueprints", []),

          version: "V26.6 Stable",
          userAgent: navigator.userAgent,
        };

        if (
          !backup.workoutData ||
          Object.keys(backup.workoutData).length === 0
        ) {
          console.warn("[SAFETY] Backup created with empty workoutData");
        }

        const saved = LS_SAFE.setJSON(backupId, backup);

        if (!saved) {
          throw new Error("Failed to save backup to localStorage");
        }

        console.log(`[SAFETY] Backup created: ${backupId}`);

        this.pruneOldBackups(this.MAX_BACKUPS);

        return backupId;
      } catch (e) {
        console.error("[SAFETY] Backup creation failed:", e);
        APP.ui.showToast(
          "⚠️ Backup gagal! Operation tetap dilanjutkan.",
          "warning"
        );
        return null;
      }
    },

    restore: function (backupId) {
      try {
        const backup = LS_SAFE.getJSON(backupId);

        if (!backup) {
          throw new Error("Backup not found: " + backupId);
        }

        if (!backup.workoutData || !backup.timestamp) {
          throw new Error("Invalid backup structure");
        }

        console.log(`[SAFETY] Restoring backup from ${backup.date}`);

        const preRestoreId = this.createBackup("pre_restore");

        APP.state.workoutData = backup.workoutData;
        LS_SAFE.setJSON("cscs_program_v10", backup.workoutData);
        LS_SAFE.setJSON("gym_hist", backup.gym_hist);
        LS_SAFE.setJSON("profile", backup.profile);
        LS_SAFE.setJSON("weights", backup.weights);

        if (backup.blueprints) {
          LS_SAFE.setJSON("blueprints", backup.blueprints);
        }

        console.log(
          "[SAFETY] Restore complete. Pre-restore backup:",
          preRestoreId
        );

        return true;
      } catch (e) {
        console.error("[SAFETY] Restore failed:", e);
        alert("Restore gagal: " + e.message);
        return false;
      }
    },

    pruneOldBackups: function (maxCount) {
      try {
        const backups = this.listBackups();

        if (backups.length <= maxCount) {
          return;
        }

        backups.sort((a, b) => a.timestamp - b.timestamp);

        const toDelete = backups.length - maxCount;

        for (let i = 0; i < toDelete; i++) {
          LS_SAFE.remove(backups[i].id);
          console.log(`[SAFETY] Pruned old backup: ${backups[i].id}`);
        }

        console.log(
          `[SAFETY] Pruned ${toDelete} old backups. Kept ${maxCount} most recent.`
        );
      } catch (e) {
        console.error("[SAFETY] Prune failed:", e);
      }
    },

    listBackups: function () {
      const backups = [];

      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);

          if (key && key.startsWith("backup_")) {
            const backup = LS_SAFE.getJSON(key);

            if (backup && backup.timestamp) {
              backups.push({
                id: key,
                operation: backup.operation,
                timestamp: backup.timestamp,
                date:
                  backup.date || new Date(backup.timestamp).toISOString(),
                sessionCount: Object.keys(backup.workoutData || {})
                  .length,
                historyCount: (backup.gym_hist || []).length,
              });
            }
          }
        }

        backups.sort((a, b) => b.timestamp - a.timestamp);
      } catch (e) {
        console.error("[SAFETY] List backups failed:", e);
      }

      return backups;
    },

    getLatestBackup: function () {
      const backups = this.listBackups();
      return backups.length > 0 ? backups[0] : null;
    },

    deleteBackup: function (backupId) {
      try {
        LS_SAFE.remove(backupId);
        console.log(`[SAFETY] Deleted backup: ${backupId}`);

        if (
          document
            .getElementById("profile-modal")
            .classList.contains("hidden") === false
        ) {
          this.renderBackupHistory();
        }
      } catch (e) {
        console.error("[SAFETY] Delete backup failed:", e);
      }
    },

    renderBackupHistory: function () {
      const container = document.getElementById(
        "backup-history-container"
      );

      if (!container) {
        console.warn("[SAFETY] backup-history-container not found");
        return;
      }

      const backups = this.listBackups();

      if (backups.length === 0) {
        container.innerHTML = `
        <div class="text-center text-slate-500 py-8">
          <i class="fa-solid fa-clock-rotate-left text-3xl mb-2 opacity-30"></i>
          <p class="text-xs italic">Belum ada backup tersimpan.</p>
          <p class="text-[10px] text-slate-600 mt-1">Backup otomatis dibuat saat edit/delete sesi.</p>
        </div>
      `;
        return;
      }

      let html = '<div class="space-y-2">';

      backups.forEach((backup, index) => {
        const isLatest = index === 0;
        const dateObj = new Date(backup.timestamp);
        const dateStr = DT.formatRelative(backup.timestamp);
        const timeStr = dateObj.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });

        let opLabel = backup.operation;
        let opIcon = "💾";

        if (backup.operation.includes("delete")) opIcon = "🗑️";
        else if (backup.operation.includes("edit")) opIcon = "✏️";
        else if (backup.operation.includes("create")) opIcon = "➕";
        else if (backup.operation.includes("restore")) opIcon = "🔄";
        else if (backup.operation.includes("init")) opIcon = "🚀";

        html += `
        <div class="bg-slate-800/50 rounded-lg border ${
          isLatest ? "border-emerald-500/50" : "border-slate-700"
        } p-3">
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-lg">${opIcon}</span>
                <span class="text-xs font-bold text-white">${opLabel
                  .replace(/_/g, " ")
                  .toUpperCase()}</span>
                ${
                  isLatest
                    ? '<span class="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">LATEST</span>'
                    : ""
                }
              </div>
              <div class="text-[10px] text-slate-400">
                ${dateStr} • ${timeStr}
              </div>
            </div>
            <div class="flex gap-2">
              <button
                onclick="APP.safety.confirmRestore('${backup.id}')"
                class="text-emerald-400 hover:text-emerald-300 px-2 py-1 text-xs bg-emerald-900/20 rounded border border-emerald-900/50"
                title="Restore backup ini"
              >
                <i class="fa-solid fa-rotate-left"></i>
              </button>
              <button
                onclick="APP.safety.deleteBackup('${backup.id}')"
                class="text-red-400 hover:text-red-300 px-2 py-1 text-xs bg-red-900/20 rounded border border-red-900/50"
                title="Hapus backup"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
            <div>
              <i class="fa-solid fa-dumbbell mr-1"></i>
              ${backup.sessionCount} Sessions
            </div>
            <div>
              <i class="fa-solid fa-clock-rotate-left mr-1"></i>
              ${backup.historyCount} Logs
            </div>
          </div>
        </div>
      `;
      });

      html += "</div>";

      container.innerHTML = html;
    },

    confirmRestore: function (backupId) {
      const backup = LS_SAFE.getJSON(backupId);

      if (!backup) {
        alert("Backup tidak ditemukan!");
        return;
      }

      const dateStr = new Date(backup.timestamp).toLocaleString("id-ID");
      const currentSessions = Object.keys(APP.state.workoutData).length;
      const backupSessions = Object.keys(backup.workoutData).length;

      const confirmed = confirm(
        `🔄 RESTORE BACKUP\n\n` +
          `From: ${dateStr}\n` +
          `Operation: ${backup.operation}\n\n` +
          `Current Sessions: ${currentSessions}\n` +
          `Backup Sessions: ${backupSessions}\n\n` +
          `⚠️ Data saat ini akan ditimpa!\n\n` +
          `Lanjutkan restore?`
      );

      if (!confirmed) return;

      const success = this.restore(backupId);

      if (success) {
        APP.ui.showToast("✅ Restore berhasil! Reloading...", "success");
        setTimeout(() => location.reload(), 1500);
      }
    },
  };

  console.log("[SAFETY] ✅ Safety module loaded");
})();
