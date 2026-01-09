/**
 * The Grind Design - Validation Module
 * Contains all validation, fuzzy matching, and data integrity methods
 * Dependencies: APP.state, APP.safety, APP.ui, LS_SAFE, EXERCISE_TARGETS
 */

(function () {
  'use strict';

  console.log("[VALIDATION] Loading... APP.nav =", window.APP?.nav);

  // Ensure APP exists
  if (!window.APP) window.APP = {};

  APP.validation = {

    // ============================================================================
    // V29.5 P2-001-006: XSS PREVENTION UTILITIES
    // ============================================================================
    // Purpose: Sanitize user input to prevent Cross-Site Scripting attacks
    // Used by: showToast, openHist, renderCalendar, renderLibrary, etc.

    /**
     * Sanitize HTML string to prevent XSS
     * Converts HTML special characters to entities
     * @param {String} str - String to sanitize
     * @returns {String} Sanitized string safe for innerHTML
     */
    sanitizeHTML: function(str) {
      if (str === null || str === undefined) return '';
      if (typeof str !== 'string') return String(str);

      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },

    /**
     * Sanitize and allow specific HTML tags (whitelist approach)
     * @param {String} html - HTML string to sanitize
     * @param {Array} allowedTags - Array of allowed tag names (default: ['br', 'b', 'i', 'strong', 'em'])
     * @returns {String} Sanitized HTML with only allowed tags
     */
    sanitizeHTMLWithTags: function(html, allowedTags = ['br', 'b', 'i', 'strong', 'em']) {
      if (!html) return '';
      if (typeof html !== 'string') return String(html);

      const div = document.createElement('div');
      div.innerHTML = html;

      // Remove script tags
      const scripts = div.querySelectorAll('script');
      scripts.forEach(script => script.remove());

      // Remove event handler attributes from all elements
      const allElements = div.querySelectorAll('*');
      allElements.forEach(el => {
        // Remove all event handler attributes (onclick, onerror, etc.)
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('on')) {
            el.removeAttribute(attr.name);
          }
        });

        // Remove disallowed tags (replace with text content)
        if (!allowedTags.includes(el.tagName.toLowerCase())) {
          el.replaceWith(...el.childNodes);
        }
      });

      return div.innerHTML;
    },

    /**
     * Check if string contains potential XSS patterns
     * @param {String} str - String to check
     * @returns {Boolean} True if suspicious content detected
     */
    containsXSS: function(str) {
      if (!str || typeof str !== 'string') return false;

      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // onclick, onerror, etc.
        /<iframe/gi,
        /<embed/gi,
        /<object/gi
      ];

      return xssPatterns.some(pattern => pattern.test(str));
    },

    // ============================================================================
    // V29.5 P1-011: ENHANCED SESSION VALIDATION
    // ============================================================================

    /**
     * Validate session exists and has required structure
     * V29.5 P1-011: Enhanced with silent mode option
     * @param {String} sessionId - Session identifier (e.g., "s1")
     * @param {Boolean} silent - If true, don't throw errors (default: false for backward compatibility)
     * @returns {Object|null} Session object if valid, null if invalid (in silent mode)
     */
    validateSession: function(sessionId, silent = false) {
      // Check sessionId provided
      if (!sessionId) {
        if (silent) {
          console.error("[VALIDATION] sessionId is required");
          return null;
        }
        throw new Error("sessionId is required");
      }

      // Check workoutData initialized
      if (!window.APP.state || !window.APP.state.workoutData) {
        if (silent) {
          console.error("[VALIDATION] workoutData not initialized");
          return null;
        }
        throw new Error("workoutData not initialized");
      }

      // Check session exists
      const session = window.APP.state.workoutData[sessionId];
      if (!session) {
        if (silent) {
          console.error(`[VALIDATION] Session ${sessionId} not found`);
          return null;
        }
        throw new Error(`Session '${sessionId}' tidak ditemukan`);
      }

      // Check exercises array exists and is valid
      if (!session.exercises || !Array.isArray(session.exercises)) {
        if (silent) {
          console.error(`[VALIDATION] Session ${sessionId} has invalid exercises`);
          return null;
        }
        throw new Error(`Session '${sessionId}' tidak memiliki exercises array`);
      }

      return session;
    },

    /**
     * Validate exercise structure
     * V29.5 P2-010: Enhanced with comprehensive guards
     * @param {String} sessionId - Session identifier
     * @param {Number} exerciseIdx - Exercise index
     * @param {Boolean} silent - If true, return null instead of throwing (default: false)
     * @returns {Object|null} Exercise object if valid
     */
    validateExercise: function(sessionId, exerciseIdx, silent = false) {
      const session = silent
        ? window.APP.validation.validateSession(sessionId, true)
        : window.APP.validation.validateSession(sessionId);

      if (!session) return null;

      const exercise = session.exercises[exerciseIdx];
      if (!exercise) {
        if (silent) {
          console.warn(`[VALIDATION] Exercise index ${exerciseIdx} not found`);
          return null;
        }
        throw new Error(
          `Exercise index ${exerciseIdx} tidak valid (max: ${
            session.exercises.length - 1
          })`
        );
      }

      // V29.5 P2-010: Guard exercise.options
      if (!exercise.options || !Array.isArray(exercise.options) || exercise.options.length === 0) {
        if (silent) {
          console.warn(`[VALIDATION] Exercise ${exerciseIdx} has no valid options`);
          return null;
        }
        throw new Error(`Exercise ${exerciseIdx} tidak memiliki options`);
      }

      return exercise;
    },

    /**
     * Validate exercise options structure (standalone check)
     * V29.5 P2-010: Helper for validating exercise.options
     * @param {Object} exercise - Exercise object to validate
     * @returns {Boolean} True if valid, false otherwise
     */
    validateExerciseOptions: function(exercise) {
      if (!exercise) {
        console.warn("[VALIDATION] validateExerciseOptions: null exercise");
        return false;
      }

      if (!exercise.options || !Array.isArray(exercise.options)) {
        console.warn("[VALIDATION] Exercise has no options array:", exercise);
        return false;
      }

      if (exercise.options.length === 0) {
        console.warn("[VALIDATION] Exercise has empty options:", exercise);
        return false;
      }

      return true;
    },

    getSafeVariantIndex: (sessionId, exerciseIdx) => {
      const exercise = APP.validation.validateExercise(
        sessionId,
        exerciseIdx
      );
      let savedVar = parseInt(
        LS_SAFE.get(`pref_${sessionId}_${exerciseIdx}`) || 0
      );

      if (
        isNaN(savedVar) ||
        savedVar < 0 ||
        savedVar >= exercise.options.length
      ) {
        console.warn(
          `[AUTO-FIX] Invalid variant ${savedVar}, reset to 0`
        );
        savedVar = 0;
        LS_SAFE.set(`pref_${sessionId}_${exerciseIdx}`, 0);
      }

      return savedVar;
    },

    isValidSetKey: (key) => {
      const pattern = /^[a-zA-Z0-9_]+_ex\d+_s\d+_[krped]$/;
      return pattern.test(key);
    },

    cleanCorruptData: () => {
      let cleanedCount = 0;
      const toRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.includes("_ex") && key.includes("_s")) {
          if (!APP.validation.isValidSetKey(key)) {
            toRemove.push(key);
            cleanedCount++;
          }
        }
      }

      toRemove.forEach((k) => LS_SAFE.remove(k));

      if (cleanedCount > 0) {
        console.log(`[CLEANUP] Removed ${cleanedCount} corrupt entries`);
      }

      return cleanedCount;
    },

    sanitizeNumber: (value, min = 0, max = 999, defaultVal = 0) => {
      const num = parseFloat(value);
      if (isNaN(num)) return defaultVal;
      if (num < min) return min;
      if (num > max) return max;
      return num;
    },

    normalizeExerciseNames: function () {
      console.log("Creating safety backup before normalization...");
      APP.safety.createBackup("data_integrity_fix");

      const report = {
        normalized: 0,
        errors: [],
        changes: [],
      };

      const workoutLogs = LS_SAFE.getJSON("gym_hist", []);

      if (!Array.isArray(workoutLogs) || workoutLogs.length === 0) {
        console.log("No workout history to normalize.");
        return report;
      }

      console.groupCollapsed(
        `🛡️ Running Data Integrity Check on ${workoutLogs.length} workout logs...`
      );

      // V29.5 FIX: Use correct gym_hist schema - log.ex (not log.exercises)
      // Each log entry has a single exercise name in log.ex field
      workoutLogs.forEach((log, logIdx) => {
        // Skip logs without exercise name (e.g., cardio entries might have different format)
        if (!log.ex || typeof log.ex !== 'string') {
          return;
        }

        const currentName = log.ex;

        // Check if exercise exists in library
        if (typeof EXERCISE_TARGETS !== 'undefined' && !EXERCISE_TARGETS[currentName]) {
          // Try fuzzy match
          const canonicalName = this.fuzzyMatchExercise(currentName);

          if (canonicalName && canonicalName !== currentName) {
            log.ex = canonicalName; // Update to canonical name
            report.normalized++;
            const changeLog = `Log ${logIdx + 1}: "${currentName}" → "${canonicalName}"`;
            report.changes.push(changeLog);
            console.log(`✅ ${changeLog}`);
          } else {
            console.warn(`[VALIDATION] Unknown exercise: "${currentName}" - no match found`);
          }
        }
      });

      if (report.normalized > 0) {
        LS_SAFE.setJSON("gym_hist", workoutLogs);
        console.log(
          `🎉 SUCCESS: Unified ${report.normalized} fragmented records.`
        );
        console.groupEnd();

        APP.ui.showToast(
          `✅ Fixed ${report.normalized} exercise names in history`,
          "success"
        );
      } else {
        console.log(
          "✅ Data integrity excellent - no fragmentation found."
        );
        console.groupEnd();
      }

      return report;
    },

    suggestExerciseMatch: function (exerciseName) {
      if (typeof EXERCISE_TARGETS === "undefined") {
        return null;
      }

      const libraryKeys = Object.keys(EXERCISE_TARGETS);
      const lowerSearch = exerciseName.toLowerCase();

      for (let key of libraryKeys) {
        if (key.toLowerCase() === lowerSearch) {
          return key;
        }
      }

      for (let key of libraryKeys) {
        if (
          key.toLowerCase().includes(lowerSearch) ||
          lowerSearch.includes(key.toLowerCase())
        ) {
          return key;
        }
      }

      const searchWords = lowerSearch.split(/\s+/);
      let bestMatch = null;
      let maxScore = 0;

      libraryKeys.forEach((key) => {
        const keyWords = key.toLowerCase().split(/\s+/);
        let score = 0;

        searchWords.forEach((searchWord) => {
          keyWords.forEach((keyWord) => {
            if (
              keyWord.includes(searchWord) ||
              searchWord.includes(keyWord)
            ) {
              score++;
            }
          });
        });

        if (score > maxScore) {
          maxScore = score;
          bestMatch = key;
        }
      });

      return maxScore > 0 ? bestMatch : null;
    },

    fuzzyMatchExercise: function (exerciseName) {
      if (!exerciseName) return null;

      if (EXERCISE_TARGETS[exerciseName]) {
        return exerciseName;
      }

      const originalName = exerciseName;

      const strip = (str) => {
        return str
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .trim();
      };

      const cleanInput = strip(originalName);

      const libraryKeys = Object.keys(EXERCISE_TARGETS);

      for (let key of libraryKeys) {
        const cleanKey = strip(key);

        if (cleanKey === cleanInput && cleanInput.length > 3) {
          console.log(
            `[FUZZY] ✅ Canonical Match: "${originalName}" → "${key}"`
          );
          return key;
        }

        const keyWithoutBracket = key.replace(/^\[.*?\]\s*/, "");
        const cleanKeyNoBracket = strip(keyWithoutBracket);

        if (cleanKeyNoBracket === cleanInput && cleanInput.length > 3) {
          console.log(
            `[FUZZY] ✅ No-Prefix Match: "${originalName}" → "${key}"`
          );
          return key;
        }
      }

      const patterns = [
        (name) => name.replace(/^\[.*?\]\s*/, ""),
        (name) => `[Machine] ${name}`,
        (name) => `[Barbell] ${name}`,
        (name) => `[DB] ${name}`,
        (name) => `[Dumbbell] ${name}`,
        (name) => `[Cable] ${name}`,
        (name) => `[Bodyweight] ${name}`,
        (name) => name.replace(/\bDB\b/gi, "Dumbbell"),
        (name) => name.replace(/\bDumbbell\b/gi, "DB"),
      ];

      for (let pattern of patterns) {
        try {
          const normalized = pattern(exerciseName);
          if (EXERCISE_TARGETS[normalized]) {
            console.log(
              `[FUZZY] ✅ Pattern Match: "${originalName}" → "${normalized}"`
            );
            return normalized;
          }
        } catch (e) {}
      }

      console.warn(
        `[FUZZY] ❌ No canonical match for: "${originalName}"`
      );
      return null;
    },

    validateExerciseIntegrity: function (sessionData) {
      const report = {
        valid: true,
        errors: [],
        warnings: [],
        suggestions: [],
      };

      if (!sessionData || !sessionData.exercises) {
        report.valid = false;
        report.errors.push(
          "Invalid session structure: missing exercises array"
        );
        return report;
      }

      sessionData.exercises.forEach((exercise, idx) => {
        if (!exercise.options || exercise.options.length === 0) {
          report.valid = false;
          report.errors.push(`Exercise #${idx + 1}: No options defined`);
          return;
        }

        exercise.options.forEach((option, optIdx) => {
          const exName = option.n || "";

          if (typeof EXERCISE_TARGETS !== "undefined") {
            if (!EXERCISE_TARGETS[exName]) {
              const suggestion = this.suggestExerciseMatch(exName);

              if (suggestion) {
                report.warnings.push(
                  `Exercise #${idx + 1} Option ${
                    optIdx + 1
                  }: "${exName}" not found. Did you mean "${suggestion}"?`
                );
                report.suggestions.push({
                  index: idx,
                  optionIndex: optIdx,
                  original: exName,
                  suggested: suggestion,
                });
              } else {
                report.valid = false;
                report.errors.push(
                  `Exercise #${idx + 1} Option ${
                    optIdx + 1
                  }: "${exName}" not found in library. Multi Muscle Target calculation will fail!`
                );
              }
            } else {
              const targets = EXERCISE_TARGETS[exName];

              if (Array.isArray(targets) && targets.length === 0) {
                console.log(
                  `[VALIDATION] Passive exercise: "${exName}" (0 volume contribution)`
                );
              }
            }
          } else {
            report.warnings.push(
              "EXERCISE_TARGETS library not loaded - cannot validate"
            );
          }

          if (!option.t_r) {
            report.warnings.push(
              `Exercise #${idx + 1}: Missing target reps (t_r)`
            );
          }

          if (!option.bio) {
            report.warnings.push(
              `Exercise #${idx + 1}: Missing biomechanics description`
            );
          }
        });
      });

      return report;
    },

    validateProgramStructure: function (programData) {
      const report = {
        valid: true,
        errors: [],
        warnings: [],
      };

      if (!programData || typeof programData !== "object") {
        report.valid = false;
        report.errors.push("Invalid program structure: not an object");
        return report;
      }

      const sessionIds = Object.keys(programData);

      if (sessionIds.length === 0) {
        report.warnings.push("Program has no sessions");
      }

      sessionIds.forEach((sessionId) => {
        const session = programData[sessionId];
        const sessionReport = this.validateSessionStructure(
          session,
          sessionId
        );

        report.errors.push(...sessionReport.errors);
        report.warnings.push(...sessionReport.warnings);

        if (!sessionReport.valid) {
          report.valid = false;
        }
      });

      return report;
    },

    validateSessionStructure: function (session, sessionId = "unknown") {
      const report = {
        valid: true,
        errors: [],
        warnings: [],
      };

      if (!session.title) {
        report.warnings.push(`Session ${sessionId}: Missing title`);
      }

      if (!session.exercises) {
        report.valid = false;
        report.errors.push(
          `Session ${sessionId}: Missing exercises array`
        );
        return report;
      }

      if (!Array.isArray(session.exercises)) {
        report.valid = false;
        report.errors.push(
          `Session ${sessionId}: exercises is not an array`
        );
        return report;
      }

      if (session.exercises.length === 0) {
        report.warnings.push(
          `Session ${sessionId}: No exercises defined`
        );
      }

      const exerciseReport = this.validateExerciseIntegrity(session);

      report.errors.push(...exerciseReport.errors);
      report.warnings.push(...exerciseReport.warnings);

      if (!exerciseReport.valid) {
        report.valid = false;
      }

      return report;
    },

    showValidationReport: function (report, context = "Operation") {
      if (report.valid && report.warnings.length === 0) {
        return true;
      }

      let message = `${context} Validation:\n\n`;

      if (report.errors.length > 0) {
        message += "❌ ERRORS (Cannot proceed):\n";
        report.errors.forEach((err) => {
          message += `• ${err}\n`;
        });

        message += "\n⚠️ Fix these errors before saving.";
        alert(message);
        return false;
      }

      if (report.warnings.length > 0) {
        message += "⚠️ WARNINGS:\n";
        report.warnings.forEach((warn) => {
          message += `• ${warn}\n`;
        });

        message += "\nThese are optional. Continue anyway?";
        return confirm(message);
      }

      return true;
    },
  };

  console.log("[VALIDATION] ✅ Validation module loaded");
})();
