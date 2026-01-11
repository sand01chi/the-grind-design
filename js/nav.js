(function() {
  'use strict';

  if (!window.APP) window.APP = {};

  // ============================================
  // APP.init - Application Initialization
  // ============================================

  APP.init = function () {
          console.groupCollapsed("[APP] 🚀 Initializing The Grind Design...");
          console.time("Init Duration");

          try {
            console.log("[INIT] Starting application...");

            if (typeof dayjs !== "undefined") {
              dayjs.extend(window.dayjs_plugin_relativeTime);
              dayjs.locale("id");
            }

            if (APP.validation && APP.validation.cleanCorruptData) {
              const cleaned = APP.validation.cleanCorruptData();
              if (cleaned > 0) {
                console.log(`[INIT] Cleaned ${cleaned} corrupt entries`);
              }
            }

            const stored = LS_SAFE.getJSON("cscs_program_v10");

            console.groupCollapsed(`[INIT] 🔄 Normalizing exercise names...`);

            const normalizeReport =
              APP.validation.normalizeExerciseNames(stored);

            if (normalizeReport.normalized > 0) {
              console.log(
                `✅ Normalized ${normalizeReport.normalized} exercise names`
              );

              if (normalizeReport.changes.length > 0) {
                console.log("Detailed changes:");
                normalizeReport.changes.forEach((change) =>
                  console.log(`  - ${change}`)
                );
              }

              LS_SAFE.setJSON("cscs_program_v10", stored);

              try {
                console.log("Running automatic data integrity check...");
                const integrityReport = APP.validation.normalizeExerciseNames();

                if (integrityReport.normalized > 0) {
                  console.warn(
                    `🔧 Repaired ${integrityReport.normalized} fragmented exercise names`
                  );
                } else {
                  console.log(" ✅ Data integrity verified - no issues found");
                }
              } catch (e) {
                console.error(" Integrity check failed:", e);
              }

              APP.ui.showToast(
                `🔄 Migrated ${normalizeReport.normalized} exercises. ${
                  normalizeReport.errors.length > 0
                    ? "⚠️ Some issues detected."
                    : "✅ All clear!"
                }`,
                normalizeReport.errors.length > 0 ? "warning" : "success"
              );
            }

            if (normalizeReport.errors.length > 0) {
              console.warn("⚠️ Normalization errors:");
              normalizeReport.errors.forEach((err) =>
                console.warn(`  - ${err}`)
              );
            }

            console.groupEnd();

            let validationPassed = false;

            if (stored && Object.keys(stored).length > 0) {
              if (stored && stored.spontaneous) {
                let fixed = false;

                if (!stored.spontaneous.title) {
                  stored.spontaneous.title = "Spontaneous & Mobility";
                  fixed = true;
                }
                if (!stored.spontaneous.label) {
                  stored.spontaneous.label = "SPONTANEOUS";
                  fixed = true;
                }
                if (!stored.spontaneous.dynamic) {
                  stored.spontaneous.dynamic = "Arm Circles, Jumping Jacks";
                  fixed = true;
                }
                if (!stored.spontaneous.exercises) {
                  stored.spontaneous.exercises = [];
                  fixed = true;
                }

                if (fixed) {
                  console.log(
                    "[INIT] 🔧 Auto-fixed spontaneous session structure"
                  );

                  LS_SAFE.setJSON("cscs_program_v10", stored);
                }
              }

              console.groupCollapsed(
                "[INIT] 🔍 Validating program structure..."
              );

              const validation =
                APP.validation.validateProgramStructure(stored);

              console.log(
                "Validation result:",
                validation.valid ? "✅ PASSED" : "⚠️ ISSUES DETECTED"
              );

              if (!validation.valid && validation.errors.length > 0) {
                console.warn("Errors found:");
                validation.errors.forEach((err) => console.warn(`  - ${err}`));
              }

              if (validation.warnings.length > 0) {
                console.warn("Warnings:");
                validation.warnings.forEach((warn) =>
                  console.warn(`  - ${warn}`)
                );
              }

              if (validation.valid) {
                APP.state.workoutData = stored;
                validationPassed = true;
                console.log("[INIT] Data validation passed");

                if (validation.warnings.length > 0) {
                  console.warn(
                    "[INIT] Validation warnings:",
                    validation.warnings
                  );
                }
                console.groupEnd();

                if (
                  validation.suggestions &&
                  validation.suggestions.length > 0
                ) {
                  console.log(
                    "[INIT] Exercise suggestions available:",
                    validation.suggestions
                  );
                }
              } else {
                console.error(
                  "[INIT] Data validation FAILED after normalization:",
                  validation.errors
                );

                const latestBackup = APP.safety.getLatestBackup();

                if (latestBackup) {
                  console.log(
                    "[INIT] Corrupt data detected. Latest backup found:",
                    latestBackup.id
                  );

                  const shouldRestore = confirm(
                    `⚠️ DATA VALIDATION FAILED!\n\n` +
                      `After attempting normalization, ${validation.errors.length} errors remain.\n\n` +
                      `Latest backup available:\n` +
                      `Date: ${latestBackup.date}\n` +
                      `Sessions: ${latestBackup.sessionCount}\n\n` +
                      `Restore from backup?\n\n` +
                      `(Cancel = Use Starter Pack)`
                  );

                  if (shouldRestore) {
                    const restored = APP.safety.restore(latestBackup.id);

                    if (restored) {
                      validationPassed = true;
                      console.log("[INIT] Restored from backup successfully");
                      APP.ui.showToast(
                        "✅ Data restored from backup",
                        "success"
                      );
                    } else {
                      console.error(
                        "[INIT] Restore failed - falling back to STARTER_PACK"
                      );
                    }
                  }
                } else {
                  console.warn("[INIT] No backup available for restore");
                }
              }
            }

            if (!validationPassed) {
              console.warn(
                "[INIT] Validation issues detected - attempting graceful recovery"
              );

              APP.safety.createBackup("emergency_pre_merge");

              if (stored && Object.keys(stored).length > 0) {
                APP.state.workoutData = stored;
                APP.state.hasUnmappedExercises = true;

                console.log("[INIT] Loaded data with validation warnings");

                let unmappedCount = 0;
                Object.keys(stored).forEach((sessionId) => {
                  const session = stored[sessionId];
                  if (session.exercises) {
                    session.exercises.forEach((ex) => {
                      ex.options?.forEach((opt) => {
                        if (opt.n && !EXERCISE_TARGETS[opt.n]) {
                          unmappedCount++;
                        }
                      });
                    });
                  }
                });

                if (unmappedCount > 0) {
                  APP.ui.showToast(
                    `⚠️ ${unmappedCount} unmapped exercise(s) detected. Volume tracking may be incomplete.`,
                    "warning"
                  );
                }
              } else {
                console.log(
                  "[INIT] No stored data found - loading STARTER_PACK"
                );

                if (typeof STARTER_PACK !== "undefined") {
                  APP.state.workoutData = STARTER_PACK;
                  LS_SAFE.setJSON("cscs_program_v10", STARTER_PACK);
                  APP.ui.showToast(
                    "🎁 Welcome! Starter program loaded.",
                    "success"
                  );
                } else {
                  APP.state.workoutData = {};
                  alert(
                    "⚠️ Critical Error: No data available. Please refresh page."
                  );
                }
              }
            }

            APP.safety.createBackup("app_init");
            console.log("[INIT] Init snapshot created");

            // V29.5 P0-006: Initialize default next session preference
            if (!LS_SAFE.get("pref_next_session")) {
              const sessionIds = Object.keys(APP.state.workoutData)
                .filter(id => id !== "spontaneous")
                .sort();
              if (sessionIds.length > 0) {
                LS_SAFE.set("pref_next_session", sessionIds[0]);
                console.log(`[INIT] Set default next session: ${sessionIds[0]}`);
              }
            }

            window.APP.data.loadProfile();
            window.APP.nav.renderDashboard();

            if (typeof Chart !== "undefined") {
              window.APP.stats.init();
            }

            window.APP.core.requestWakeLock();
            document.addEventListener("visibilitychange", () => {
              if (document.visibilityState === "visible") {
                window.APP.core.requestWakeLock();
              }
            });

            try {
              const remappedLogs = APP.data.reconcileLogs();

              if (remappedLogs > 0) {
                console.log(
                  `[INIT] ✅ Reconciled ${remappedLogs} orphaned log(s)`
                );
              }
            } catch (e) {
              console.error("[INIT] ❌ Log reconciliation failed:", e);
            }
            console.log("[INIT] Application ready");
          } catch (e) {
            console.error("[INIT] Fatal error:", e);
            window.APP.debug.showFatalError("App Initialization", e);
          }
          console.groupEnd();
          console.timeEnd("Init Duration");
          console.log("✅ Application ready");
  };

  // ============================================
  // APP.nav - Navigation & Dashboard
  // ============================================

  APP.nav = {
    /**
     * V30.0 Phase 3.5: Unified View Switching
     * All main views (dashboard, workout, klinik, ai, settings) use this function
     * @param {string} v - View name without '-view' suffix
     */
    switchView: (v) => {
      console.log(`[NAV] Switching to view: ${v}`);

      // V30.0 Phase 3.5: All main views
      const views = [
        'dashboard-view',
        'workout-view',
        'klinik-view',    // Analytics
        'ai-view',        // AI Command Center
        'settings-view'   // Profile/Settings
      ];

      // Hide all views
      views.forEach(viewId => {
        const viewEl = document.getElementById(viewId);
        if (viewEl) {
          viewEl.classList.add('hidden');
        }
      });

      // Show target view
      const targetView = `${v}-view`;
      const targetEl = document.getElementById(targetView);

      if (targetEl) {
        targetEl.classList.remove('hidden');

        // Scroll to top when switching views
        window.scrollTo(0, 0);
      } else {
        console.error(`[NAV] View not found: ${targetView}`);
        // Fallback to dashboard if view not found
        const dashboardEl = document.getElementById('dashboard-view');
        if (dashboardEl) dashboardEl.classList.remove('hidden');
      }

      // V30.0 Phase 3.5: Hide bottom nav during workout session
      const bottomNav = document.getElementById('bottom-nav');
      if (bottomNav) {
        if (v === 'workout') {
          bottomNav.classList.add('hidden');
        } else {
          bottomNav.classList.remove('hidden');
        }
      }

      // View-specific rendering logic
      if (v === 'dashboard') {
        // Render dashboard
        if (window.APP.nav && window.APP.nav.renderDashboard) {
          window.APP.nav.renderDashboard();
        }
      } else if (v === 'klinik') {
        // V30.0 Phase 3.5: Render analytics view
        // Initialize the klinik view with data
        if (window.APP.stats && window.APP.stats.initKlinikView) {
          window.APP.stats.initKlinikView();
        }
      } else if (v === 'ai') {
        // V30.0 Phase 3.5: Initialize AI view
        if (window.APP.ui && window.APP.ui.initAIView) {
          window.APP.ui.initAIView();
        }
      } else if (v === 'settings') {
        // V30.0 Phase 3.5: Load profile data into settings view
        if (window.APP.data && window.APP.data.loadProfileToSettings) {
          window.APP.data.loadProfileToSettings();
        }
      }

      // V30.0: Update bottom nav active state
      window.APP.nav.updateBottomNav(v);
    },

    /**
     * V30.0 Phase 3.5: Update bottom navigation active state
     * @param {string} activeView - Current view identifier (without '-view' suffix)
     */
    updateBottomNav: function(activeView) {
      // View mapping - maps internal view names to nav data-view attributes
      const viewMap = {
        'dashboard': 'dashboard',
        'workout': 'dashboard',    // Workout doesn't have nav item, keep dashboard active
        'klinik': 'klinik',
        'stats': 'klinik',         // Alias
        'ai': 'ai',
        'settings': 'settings',
        'profile': 'settings'      // Alias
      };

      const mappedView = viewMap[activeView] || activeView;

      // Update all nav items
      document.querySelectorAll('.nav-item').forEach(item => {
        const itemView = item.getAttribute('data-view');

        if (itemView === mappedView) {
          // Activate this item
          item.classList.add('text-app-accent', 'nav-item-active');
          item.classList.remove('text-gray-500');
        } else {
          // Deactivate other items
          item.classList.remove('text-app-accent', 'nav-item-active');
          item.classList.add('text-gray-500');
        }
      });
    },

    renderDashboard: () => {
            try {
              // ============================================
              // V30.0: STATS CARDS (Weight + TDEE)
              // ============================================

              // Get user profile and weight data
              const profile = LS_SAFE.getJSON("profile", {});
              const weights = LS_SAFE.getJSON("weights", []);
              // Use latest weight from weights array, fallback to profile.weight, then default 70
              const userWeight = weights.length > 0 ? parseFloat(weights[0].v) : (profile.weight || 70);
              const userHeight = profile.h || 170; // cm
              const userAge = profile.a || 25;
              const userGender = profile.g || 'male';
              const activityLevel = profile.act || 1.55; // Moderate activity default

              // Calculate BMR (Mifflin-St Jeor Equation)
              let bmr;
              if (userGender === 'male' || userGender === 'M') {
                bmr = (10 * userWeight) + (6.25 * userHeight) - (5 * userAge) + 5;
              } else {
                bmr = (10 * userWeight) + (6.25 * userHeight) - (5 * userAge) - 161;
              }

              // Calculate TDEE (or use stored value if available)
              const storedTdee = LS_SAFE.get("tdee");
              const tdee = storedTdee ? parseInt(storedTdee) : Math.round(bmr * activityLevel);

              // Render stats cards container
              const statsContainer = document.getElementById('stats-cards-container');
              if (statsContainer) {
                statsContainer.innerHTML = `
                  <section aria-label="Stats" class="grid grid-cols-2 mt-2 gap-4 mb-4">

                    <!-- Weight Card (Interactive) -->
                    <article class="bg-app-card rounded-3xl p-5 relative flex flex-col justify-between h-32 border border-white/5 cursor-pointer hover:border-app-accent/30 active:scale-[0.98] transition-all group"
                             onclick="window.APP.ui.openModal('weight')">
                      <div class="flex justify-between items-start">
                        <span class="text-gray-400 font-medium text-sm group-hover:text-app-accent transition">Weight</span>
                        <i class="fa-solid fa-weight-scale text-gray-500 text-sm group-hover:text-app-accent transition"></i>
                      </div>
                      <div>
                        <div class="flex items-baseline gap-1">
                          <span class="font-bold text-white text-4xl group-hover:text-app-accent transition">${userWeight}</span>
                          <span class="text-sm text-gray-400 font-medium">kg</span>
                        </div>
                        <div class="flex items-center gap-1 mt-1 text-xs text-gray-500 group-hover:text-app-accent transition">
                          <i class="fa-solid fa-pen-to-square"></i>
                          <span>Tap to update</span>
                        </div>
                      </div>
                    </article>

                    <!-- TDEE Card (Interactive) -->
                    <article class="bg-app-card rounded-3xl p-5 relative flex flex-col justify-between h-32 border border-white/5 cursor-pointer hover:border-app-accent/30 active:scale-[0.98] transition-all group"
                             onclick="window.APP.ui.openModal('nutrition')">
                      <div class="flex justify-between items-start">
                        <span class="text-gray-400 font-medium text-sm group-hover:text-app-accent transition">TDEE</span>
                        <i class="fa-solid fa-fire text-gray-500 text-sm group-hover:text-app-accent transition"></i>
                      </div>
                      <div>
                        <div class="flex items-baseline gap-1">
                          <span class="font-bold text-white text-4xl group-hover:text-app-accent transition">${tdee}</span>
                          <span class="text-sm text-gray-400 font-medium">kcal</span>
                        </div>
                        <div class="flex items-center gap-1 mt-1 text-xs text-gray-500 group-hover:text-app-accent transition">
                          <i class="fa-solid fa-calculator"></i>
                          <span>Daily energy</span>
                        </div>
                      </div>
                    </article>

                  </section>
                `;
              }

              // ============================================
              // EXISTING SESSION LIST CODE BELOW
              // ============================================
              const list = document.getElementById("schedule-list");

              if (!list) {
                console.error("[DOM ERROR] schedule-list element not found");
                return;
              }

              // V30.0: Get next session preference
              const nextSession = LS_SAFE.get("pref_next_session") || "s1";

              // Build session cards HTML
              let sessionsHTML = '';
              const wData = APP.state.workoutData;

              Object.keys(wData).forEach((k) => {
                try {
                  if (k === "spontaneous") return; // Skip spontaneous

                  const session = wData[k];

                  if (!session || typeof session !== "object") {
                    console.warn(`[DASHBOARD] Session ${k} has invalid structure - skipping`);
                    return;
                  }

                  if (!session.title) {
                    console.warn(`[DASHBOARD] Session ${k} has no title - using fallback`);
                    session.title = "Untitled Session";
                  }

                  // Sanitize session data (V29.5 security)
                  const safeTitle = window.APP.validation?.sanitizeHTML
                    ? window.APP.validation.sanitizeHTML(session.title)
                    : session.title;
                  const safeLabel = session.label || "CUSTOM";

                  // Get last performed timestamp
                  const lastTimestamp = LS_SAFE.get(`last_${k}`);

                  // V30.0: Calculate relative time
                  let timeStr = "Never performed";
                  if (lastTimestamp) {
                    const lastDate = new Date(parseInt(lastTimestamp));
                    const now = new Date();
                    const diffMs = now - lastDate;
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                    if (diffDays === 0) {
                      timeStr = "Today";
                    } else if (diffDays === 1) {
                      timeStr = "Yesterday";
                    } else if (diffDays < 7) {
                      timeStr = `${diffDays} days ago`;
                    } else if (diffDays < 30) {
                      const weeks = Math.floor(diffDays / 7);
                      timeStr = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
                    } else {
                      const months = Math.floor(diffDays / 30);
                      timeStr = `${months} month${months > 1 ? 's' : ''} ago`;
                    }
                  }

                  // Check if this is the next session
                  const isNext = (k === nextSession);

                  // Count exercises for display
                  const exerciseCount = session.exercises?.length || 0;

                  // V30.0: Build session card HTML with modern design
                  sessionsHTML += `
                    <div class="relative p-4 rounded-2xl ${
                      isNext
                        ? 'border border-app-accent bg-[#1E1E1E]'
                        : 'bg-app-card border border-transparent'
                    } mb-4 active:scale-[0.98] transition-transform cursor-pointer"
                         onclick="window.APP.nav.loadWorkout('${k}')">

                      ${isNext ? '<div class="next-badge">Next</div>' : ''}

                      <div class="flex justify-between items-start">
                        <div class="flex-1">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="text-[10px] font-bold text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded uppercase">
                              ${safeLabel}
                            </span>
                            ${isNext ? '<i class="fa-solid fa-bullseye text-app-accent text-xs"></i>' : ''}
                          </div>
                          <h3 class="text-white font-bold text-lg mb-1">${safeTitle}</h3>
                          <div class="flex items-center gap-3 text-xs text-gray-400">
                            <span><i class="fa-solid fa-clock-rotate-left mr-1"></i>${timeStr}</span>
                            <span><i class="fa-solid fa-list-check mr-1"></i>${exerciseCount} exercises</span>
                          </div>
                        </div>

                        <div class="flex flex-col items-end gap-3">
                          <button class="${isNext ? 'text-app-accent' : 'text-slate-500 hover:text-yellow-400'} p-1 transition"
                                  onclick="event.stopPropagation(); window.APP.data.setNextSession('${k}')"
                                  title="${isNext ? 'Current next session' : 'Set as next session'}">
                            <i class="fa-solid ${isNext ? 'fa-bullseye' : 'fa-star'}"></i>
                          </button>
                          <button class="text-gray-400 hover:text-app-accent p-1 transition"
                                  onclick="event.stopPropagation(); window.APP.session.openEditor(event, '${k}')"
                                  title="Edit Session">
                            <i class="fa-regular fa-pen-to-square"></i>
                          </button>
                        </div>
                      </div>

                    </div>
                  `;

                } catch (e) {
                  console.error(`[DASHBOARD] Failed to render session ${k}:`, e);
                }
              });

              // Inject into DOM
              list.innerHTML = sessionsHTML;
            } catch (e) {
              APP.debug.showFatalError("Render Dashboard", e);
            }
    },

    loadWorkout: (id) => {
      try {
      // V30.5: Save scroll position before re-render to prevent UI jump
      const exList = document.getElementById("exercise-list");
      const scrollBefore = exList ? exList.scrollTop : 0;

      APP.state.currentSessionId = id;
      APP.state.focusMode = false;
      APP.ui.updateFocusBtn();

      // Initialize expansion state if needed
      if (!APP.state.expandedCards) APP.state.expandedCards = {};

      const isSpon = id === "spontaneous";
      const badge = document.getElementById("spontaneous-badge");
      isSpon
        ? badge.classList.remove("hidden")
        : badge.classList.add("hidden");
      isSpon
        ? badge.classList.add("flex")
        : badge.classList.remove("flex");

      const data = APP.state.workoutData[id];
      if (!data) {
        alert(`Session '${id}' tidak ditemukan!`);
        APP.nav.switchView("dashboard");
        return;
      }

      if (!data.exercises || !Array.isArray(data.exercises)) {
        alert(`Data sesi corrupt! Exercises tidak valid.`);
        APP.nav.switchView("dashboard");
        return;
      }

      const wGeneral = document.getElementById("warmup-general");
      const wDynamic = document.getElementById("warmup-dynamic");
      if (wGeneral) wGeneral.innerText = "Jalan Cepat 5 Menit.";
      if (wDynamic) wDynamic.innerText = data.dynamic || "Arm Circles";

      // V30.5: exList already declared at start of function for scroll preservation
      if (!exList) {
        console.error("[DOM ERROR] exercise-list element not found");
        alert("Error: Exercise list tidak ditemukan. Refresh halaman.");
        APP.nav.switchView("dashboard");
        return;
      }

      let htmlBuffer = "";

      data.exercises.forEach((ex, idx) => {
        if (ex.type === "cardio") {
          const optIdx = LS_SAFE.get(`pref_${id}_${idx}`) || 0;
          const opt = ex.options[optIdx] || ex.options[0];
          const optName = opt.n || "LISS Cardio";
          const optBio = opt.bio || "Low-intensity steady state cardio";
          // V29.5 P2-005: Sanitize cardio note
          const rawCardioNote = opt.note || "Post-workout";
          const optNote = window.APP.validation.sanitizeHTMLWithTags(rawCardioNote, ['br']);

          const savedMachine =
            LS_SAFE.get(`${id}_ex${idx}_machine`) ||
            (opt.machines ? opt.machines[0] : "Treadmill");
          const savedDuration =
            LS_SAFE.get(`${id}_ex${idx}_duration`) || "30";
          const savedHR = LS_SAFE.get(`${id}_ex${idx}_hr`) || "";
          const savedNote =
            LS_SAFE.get(`${id}_ex${idx}_cardio_note`) || "";
          const isCompleted =
            LS_SAFE.get(`${id}_ex${idx}_completed`) === "true";

          const profile = LS_SAFE.getJSON("profile", {});
          const age = profile.a || 30;
          const maxHR = 220 - age;
          const zone2Lower = Math.round(maxHR * 0.6);
          const zone2Upper = Math.round(maxHR * 0.7);

          let hrStatus = "";
          let hrClass = "";
          if (savedHR) {
            const hr = parseInt(savedHR);
            if (hr >= zone2Lower && hr <= zone2Upper) {
              hrStatus = `✅ Zone 2 (${zone2Lower}-${zone2Upper} bpm)`;
              hrClass = "hr-zone-valid";
            } else if (hr >= zone2Lower - 5 && hr <= zone2Upper + 5) {
              hrStatus = `⚠️ Near Zone 2 (Target: ${zone2Lower}-${zone2Upper})`;
              hrClass = "hr-zone-warning";
            } else {
              hrStatus = `❌ Outside Zone 2 (Target: ${zone2Lower}-${zone2Upper})`;
              hrClass = "hr-zone-invalid";
            }
          }

          const machines = opt.machines || [
            "Treadmill",
            "Static Bike",
            "Rowing Machine",
            "Elliptical",
          ];
          const machineOptions = machines
            .map(
              (m) =>
                `<option value="${m}" ${
                  m === savedMachine ? "selected" : ""
                }>${m}</option>`
            )
            .join("");

          const quickNotes = [
            "Felt easy",
            "Good pace",
            "Tough",
            "Perfect recovery",
          ];
          const noteButtons = quickNotes
            .map(
              (n) =>
                `<button onclick="APP.cardio.selectNote('${id}', ${idx}, '${n}')" class="quick-note-badge ${
                  savedNote === n ? "active" : ""
                }">${n}</button>`
            )
            .join("");

          htmlBuffer += `
    <div class="exercise-card cardio-card glass-panel ${
      isCompleted ? "all-completed card-collapsed" : ""
    } rounded-xl border border-white/10 overflow-hidden shadow-md mb-4" id="card-${idx}">
        <div class="cardio-header p-3">
            <div class="flex justify-between items-center mb-2">
                <span class="text-blue-400 font-bold text-sm flex items-center gap-2">
                    <span>🏃 #${idx + 1} CARDIO</span>
                    <span class="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">${optNote}</span>
                </span>
<div class="flex items-center">
                    <button onclick="APP.data.moveCard('${id}',${idx},-1)" class="text-slate-500 hover:text-white px-2" title="Naik">
                        <i class="fa-solid fa-arrow-up text-xs"></i>
                    </button>
                    <button onclick="APP.data.moveCard('${id}',${idx},1)" class="text-slate-500 hover:text-white px-2" title="Turun">
                        <i class="fa-solid fa-arrow-down text-xs"></i>
                    </button>
                    <button onclick="APP.data.deleteCard('${id}',${idx})" class="text-red-500/50 hover:text-red-500 px-2 ml-1" title="Hapus">
                        <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                </div>
                </div>                    <div class="text-sm font-bold text-white mb-1">${optName}</div>
            <div class="text-xs text-slate-400">${optBio}</div>
        </div>
        
        <div class="p-4 space-y-3 bg-white/5 border-t border-white/10">
            ${
              isCompleted
                ? `
            <div class="cardio-complete-summary">
                <div class="flex items-center gap-3 mb-2">
                    <div class="text-4xl">🎯</div>
                    <div>
                        <div class="text-sm font-bold text-white mb-1 opacity-75"><span class="text-blue-400 mr-2">#${idx + 1}</span> ${optName}</div>
                        <div class="text-2xl font-black text-blue-400">${savedDuration} min</div>
                        <div class="text-sm text-slate-300">💓 ${savedHR} bpm • ${savedMachine}</div>
                    </div>
                </div>
                <button onclick="APP.cardio.toggleComplete('${id}', ${idx}, false)" class="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 rounded-lg mt-2">
                    <i class="fa-solid fa-chevron-down mr-1"></i> Show Details
                </button>
            </div>
            `
                : `
            <div>
                <label class="text-xs text-slate-400 block mb-1">Equipment</label>
                <select onchange="LS_SAFE.set('${id}_ex${idx}_machine', this.value)" class="w-full glass-input border border-white/10 text-white text-sm rounded p-2">
                    ${machineOptions}
                </select>
            </div>
            
            <div>
                <label class="text-xs text-slate-400 block mb-2">⏱️ Duration</label>
                <div class="grid grid-cols-4 gap-2 mb-2">
                    ${[15, 20, 30, 45]
                      .map(
                        (min) => `
                        <button onclick="APP.cardio.setDuration('${id}', ${idx}, ${min})" class="duration-preset-btn ${
                          savedDuration == min ? "active" : ""
                        }">${min}m</button>
                    `
                      )
                      .join("")}
                </div>
                <input type="number" id="duration-${id}-${idx}" value="${savedDuration}" onchange="APP.cardio.setDuration('${id}', ${idx}, this.value)" class="w-full glass-input border border-white/10 text-white text-center rounded p-2 text-sm" placeholder="Custom minutes" />
            </div>
            
            <div>
                <label class="text-xs text-slate-400 block mb-1">💓 Average Heart Rate</label>
                <input type="number" id="hr-${id}-${idx}" value="${savedHR}" oninput="APP.cardio.validateHR('${id}', ${idx}, this.value)" class="w-full glass-input border border-white/10 text-white text-center rounded p-2 text-sm mb-1" placeholder="bpm" />
                <div id="hr-status-${id}-${idx}" class="text-xs ${hrClass}">${
                    hrStatus ||
                    `Target: ${zone2Lower}-${zone2Upper} bpm (Zone 2)`
                  }</div>
            </div>
            
            <div>
                <label class="text-xs text-slate-400 block mb-2">📝 How did it feel?</label>
                <div class="flex flex-wrap gap-2">
                    ${noteButtons}
                </div>
            </div>
            
            <button onclick="APP.cardio.toggleComplete('${id}', ${idx}, true)" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95">
                <i class="fa-solid fa-check"></i> COMPLETE CARDIO
            </button>
            `
            }
        </div>
    </div>`;
          return;
        }

        if (!ex.options || ex.options.length === 0) {
          console.warn(`[SKIP] Exercise ${idx} has no options`);
          return;
        }

        let savedVar = parseInt(LS_SAFE.get(`pref_${id}_${idx}`) || 0);
        if (
          isNaN(savedVar) ||
          savedVar < 0 ||
          savedVar >= ex.options.length
        ) {
          console.warn(
            `[RESET] Invalid variant ${savedVar} for exercise ${idx}, reset to 0`
          );
          savedVar = 0;
          LS_SAFE.set(`pref_${id}_${idx}`, 0);
        }

        const opt = ex.options[savedVar];
        if (!opt) {
          console.error(
            `[CRITICAL] Option not found at index ${savedVar} for exercise ${idx}`
          );
          return;
        }

        const optName = opt.n || "Unknown Exercise";
        const optVid = opt.vid || "";
        const optBio = opt.bio || "No description";
        // V29.5 P2-005: Sanitize exercise notes (allow basic formatting)
        const rawNote = opt.note || ex.note || "Edit Note";
        const optNote = window.APP.validation.sanitizeHTMLWithTags(rawNote, ['br', 'b', 'i', 'strong', 'em']);
        const optTargetK = opt.t_k || "-";
        const optTargetR = opt.t_r || "-";

        const _id = id;
        const _idx = idx;
        const _savedVar = savedVar;

        const vidKey = `vid_ovr_${_id}_${_idx}_${_savedVar}`;
        const vidUrl = LS_SAFE.get(vidKey) || optVid;

        let optHtml = ex.options
          .map(
            (o, i) =>
              `<option value="${i}" ${
                i == _savedVar ? "selected" : ""
              }>${o.n || "Option " + i}</option>`
          )
          .join("");

        const historySuggestion = APP.data.getSuggestion(optName);

        let targetBadge = "";
        if (optTargetK !== "-" || optTargetR !== "-") {
          targetBadge = `<div class="text-[10px] text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-900/50 flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap"><i class="fa-solid fa-crosshairs text-blue-400"></i> Target: <b class="text-white">${optTargetK}kg</b> x <b class="text-white">${optTargetR}</b></div>`;
        }

        let setsHtml = "";
        for (let i = 1; i <= ex.sets; i++) {
          const sid = `${_id}_ex${_idx}_s${i}`;
          const k = LS_SAFE.get(`${sid}_k`) || "";
          const r = LS_SAFE.get(`${sid}_r`) || "";
          const rpe = LS_SAFE.get(`${sid}_rpe`) || "";
          const done = LS_SAFE.get(`${sid}_d`) === "true";
          const note = APP.data.getSetNote(_id, _idx, i);
          let rpeColor = "text-white";
          const rpeVal = parseFloat(rpe);
          if (rpeVal <= 7) rpeColor = "text-yellow-400";
          else if (rpeVal >= 7.5 && rpeVal <= 9)
            rpeColor = "text-emerald-400";
          else if (rpeVal >= 9.5) rpeColor = "text-red-400";

          let rpeOpts = `<option value="">RPE</option>`;
          for (let v = 6; v <= 10; v += 0.5) {
            rpeOpts += `<option value="${v}" ${
              rpe == v ? "selected" : ""
            } class="${
              v <= 7
                ? "text-yellow-400"
                : v >= 9.5
                ? "text-red-400"
                : "text-emerald-400"
            }">${v}</option>`;
          }

          setsHtml += `<div class="grid grid-cols-12 gap-1 mb-1 items-center py-1 border-b border-white/5 ${
            done ? "bg-emerald-900/10" : ""
          }" id="row_${sid}">
    <div class="col-span-1 text-center relative">
        <span class="text-slate-400 text-xs font-bold">${i}</span>
        <i class="fa-solid fa-message set-note-icon ${
          note ? "has-note" : ""
        } absolute -top-1 -right-1 text-[8px]" onclick="APP.data.openSetNoteModal('${_id}',${_idx},${i})" title="${
            note || "Add note"
          }"></i>
    </div>                                <div class="col-span-4"><input type="number" value="${k}" class="w-full glass-input border-white/10 text-white text-center rounded p-1.5 text-sm input-k" data-sid="${sid}" placeholder="kg" onchange="APP.data.saveSet('${sid}','k',this.value)"></div><div class="col-span-3"><input type="number" value="${r}" class="w-full glass-input border-white/10 text-white text-center rounded p-1.5 text-sm" placeholder="10" onchange="APP.data.saveSet('${sid}','r',this.value)"></div><div class="col-span-2"><select class="w-full glass-input border-white/10 ${rpeColor} text-[10px] rounded p-1.5 font-bold text-center" onblur="APP.data.saveSet('${sid}','rpe',this.value)">${rpeOpts}</select></div><div class="col-span-2 flex justify-center"><input type="checkbox" class="w-5 h-5 accent-emerald-500 checkbox-done" ${
            done ? "checked" : ""
          } onchange="APP.data.toggleDone('${sid}',this, ${_idx})"></div></div>`;
        }

        htmlBuffer += `
    <div class="exercise-card glass-panel rounded-xl border border-white/10 overflow-hidden shadow-md mb-4 transition-all duration-300" id="card-${_idx}">
        <div class="exercise-header p-3">
            <div class="flex justify-between items-center mb-2">
                <span class="text-emerald-500 font-bold text-sm">#${
                  _idx + 1
                }</span>
                <div class="flex items-center gap-2">
                    <div class="glass-card px-2 py-0.5 rounded text-[10px] text-slate-400 font-medium border border-white/10"><i class="fa-solid fa-stopwatch mr-1"></i> Rest: ${
                      ex.rest
                    }s</div>
                <button onclick="APP.data.smartAutoFill('${_id}',${_idx})" class="text-blue-400 px-2.5 py-1.5 rounded bg-blue-500/10 text-xs hover:bg-blue-500/20 transition" title="Smart Auto-Fill All Sets">
    <i class="fa-solid fa-wand-magic-sparkles"></i> Fill All
</button>
                    <button onclick="APP.data.addCustomVariant('${_id}',${_idx})" class="text-emerald-500 px-2.5 py-1.5 rounded bg-emerald-500/10 text-xs hover:bg-emerald-500/20 transition" title="Tambah alternatif"><i class="fa-solid fa-plus"></i></button>
                    ${
                      ex.options.length > 1
                        ? `<button onclick="APP.data.deleteVariant('${_id}',${_idx},document.getElementById('variant-select-${_idx}').value)" class="text-red-500 px-2.5 py-1.5 rounded bg-red-500/10 text-xs hover:bg-red-500/20 transition" title="Hapus alternatif"><i class="fa-solid fa-trash"></i></button>`
                        : ""
                    }

                </div>
            </div>
            <div class="flex items-center gap-2 mb-2">
                <select id="variant-select-${_idx}" onchange="APP.data.changeVariant('${_id}',${_idx},this.value)" class="glass-input border border-white/10 text-white text-sm rounded p-2 flex-1 font-bold truncate focus:ring-1 focus:ring-emerald-500 transition">${optHtml}</select>
            </div>
            <div class="grid grid-cols-2 gap-2 px-1 mb-2">
                <div class="flex gap-1 bg-red-900/20 rounded border border-red-900/30 overflow-hidden">
                    <a href="${vidUrl}" target="_blank" class="flex-1 text-red-400 text-[10px] flex items-center justify-center py-1.5 hover:bg-red-900/40 transition truncate"><i class="fa-brands fa-youtube mr-1"></i> Watch</a>
                    <button onclick="APP.data.editVideo('${vidKey}')" class="px-2 text-red-500/70 hover:text-red-400 border-l border-red-900/30"><i class="fa-solid fa-pen text-[9px]"></i></button>
                </div>
                <button onclick="APP.ui.openBio('${optName.replace(
                  /'/g,
                  "\\'"
                )}', \`${optBio.replace(
          /`/g,
          "\\`"
        )}\`)" class="bg-blue-900/20 text-blue-400 py-1.5 rounded text-[10px] border border-blue-900/30 flex items-center justify-center gap-1 hover:bg-blue-900/40 transition truncate"><i class="fa-solid fa-microscope"></i> Info Bio</button>
                <button onclick="APP.ui.openHist('${optName.replace(
                  /'/g,
                  "\\'"
                )}')" class="bg-purple-900/20 text-purple-400 py-1.5 rounded text-[10px] border border-purple-900/30 flex items-center justify-center gap-1 hover:bg-purple-900/40 transition truncate"><i class="fa-solid fa-clock-rotate-left"></i> History</button>
                <button onclick="APP.ui.openCalc(${_idx})" class="bg-yellow-900/20 text-yellow-400 py-1.5 rounded text-[10px] border border-yellow-900/30 flex items-center justify-center gap-1 hover:bg-yellow-900/40 transition truncate"><i class="fa-solid fa-calculator"></i> WarmUp Calc</button>
            </div>
            <div class="flex flex-col gap-2 mb-1 px-1">
    <div onclick="APP.data.editNote('${_id}',${_idx})" class="text-[10px] text-yellow-500 font-bold cursor-pointer hover:text-white leading-relaxed break-words"><i class="fa-solid fa-pen-to-square mr-1"></i> ${optNote}</div>
    <div class="grid grid-cols-2 gap-2">
        <div class="flex flex-col gap-1">
    <div class="text-[9px] text-slate-500 font-mono">${historySuggestion}</div>
    <div id="last-volume-${_idx}" class="text-[9px] text-slate-500 font-mono"></div>
        </div>
        <div class="flex justify-end">
    ${targetBadge}
        </div>
    </div>
</div>
        </div>
<div class="p-4 sets-container bg-white/5 mx-0 mb-0 space-y-1 border-t border-b border-white/10">
    <div class="volume-counter" id="volume-counter-${_idx}"></div>
    <div class="grid grid-cols-12 gap-1 text-[10px] text-slate-500 font-bold text-center mb-1">                        <div class="col-span-1">#</div><div class="col-span-4">KG</div><div class="col-span-3">REPS</div><div class="col-span-2">RPE</div><div class="col-span-2">OK</div>
            </div>
            ${setsHtml}
        </div>
        <div class="exercise-footer flex justify-between items-center p-2 border-t border-white/5 opacity-90">
            <div class="flex gap-1.5">
                <button onclick="APP.data.modifySet('${_id}',${_idx},1)" class="text-[9px] bg-white/5 text-emerald-400/80 px-2 py-1 rounded border border-white/10 hover:bg-emerald-500/10 hover:text-emerald-400 transition"><b>+ Set</b></button>
                <button onclick="APP.data.modifySet('${_id}',${_idx},-1)" class="text-[9px] bg-white/5 text-red-400/80 px-2 py-1 rounded border border-white/10 hover:bg-red-500/10 hover:text-red-400 transition"><b>- Set</b></button>
            </div>
            <div class="flex items-center">
                <button onclick="APP.data.moveCard('${_id}',${_idx},-1)" class="text-slate-600 hover:text-slate-300 px-2 transition" title="Move Up"><i class="fa-solid fa-arrow-up text-[10px]"></i></button>
                <button onclick="APP.data.moveCard('${_id}',${_idx},1)" class="text-slate-600 hover:text-slate-300 px-2 transition" title="Move Down"><i class="fa-solid fa-arrow-down text-[10px]"></i></button>
                <button onclick="APP.data.deleteCard('${_id}',${_idx})" class="text-slate-600 hover:text-red-400 px-2 transition ml-1" title="Delete"><i class="fa-solid fa-trash text-[10px]"></i></button>
            </div>
        </div>
    </div>`;
      });

      exList.innerHTML = htmlBuffer;
      
      // V30.5: Restore scroll position after re-render to prevent UI jump
      if (scrollBefore > 0) {
        requestAnimationFrame(() => {
          if (exList) exList.scrollTop = scrollBefore;
        });
      }
      
      APP.ui.checkActiveCard();

      data.exercises.forEach((ex, idx) => {
        APP.data.updateVolumeCounter(id, idx);
        APP.ui.checkAllSetsCompleted(idx);
      });

      APP.nav.switchView("workout");
      } catch (e) {
        APP.debug.showFatalError("Load Workout Error", e);
      }
    },
  };

  console.log("[NAV] ✅ Navigation & Init loaded");
})();
