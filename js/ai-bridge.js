/**
 * The Grind Design - AI Bridge Module
 * V28 Implementation - Phase 1: Logic Layer
 *
 * Handles AI prompt generation, JSON parsing, and schema validation
 * for AI-assisted program updates and coaching.
 *
 * Dependencies: core.js, validation.js, exercises-library.js
 * Load Position: After ui.js, before debug.js
 */

(function() {
  'use strict';

  // Namespace guard
  if (!window.APP) window.APP = {};

  /**
   * AI Bridge Module
   * Pure logic layer for AI Command Center integration
   */
  APP.aiBridge = {

    /**
     * Prompt Library
     * Contains 4 core prompt templates for AI interactions
     */
    prompts: {

      /**
       * Coach Prompt - CSCS Fitness Coaching Scenario
       * Uses Indonesian format matching existing prepareGeminiAudit pattern
       */
      coach: {
        title: "Konsultasi CSCS Coach",
        description: "Full cycle audit & program calibration untuk sesi berikutnya",
        includeContext: true,  // Triggers getPromptContext()
        template: `[MASTER PROMPT: FULL CYCLE AUDIT & PROGRAM CALIBRATION]

Instruksi:
"Bertindaklah sebagai Senior CSCS Coach, Clinical Performance Analyst, & System Architect. Saya akan memberikan Resep Program Saat Ini (JSON) dan Log Latihan Terakhir (JSON/Teks). Tugas Anda adalah mengaudit performa saya secara klinis, lalu memperbarui kode program latihan untuk sesi berikutnya berdasarkan hasil audit tersebut.

BAGIAN 1: MISI ANALISIS & AUDIT
Lakukan analisis mendalam sebelum menulis kode, dengan parameter:
1. Analisis Progres (Progressive Overload): Bandingkan volume/beban antar sesi.
2. Audit Klinis (Fatigue Management): Deteksi Systemic Fatigue atau Junk Volume.
3. Protokol Spontan: Jika log bertanda 'Spontan', abaikan tuntutan overload.

BAGIAN 2: ATURAN UPDATE RESEP JSON (EKSEKUSI)
1. Struktur Imutabel: DILARANG MENGHAPUS gerakan utama.
2. Kalibrasi Parameter: Perbarui t_k (Target Beban), t_r (Target Reps), rest (Istirahat), dan note.
3. Metadata Wajib: Tag Alat, Link Video, Bio Note, Note.

NOTE: Aplikasi mendukung Partial JSON Update. Anda tidak perlu menulis ulang seluruh sesi jika hanya mengubah satu Sesi. Cukup outputkan JSON objek sesi tersebut (contoh: { 's2': { ... } }).

{{CONTEXT}}

Mohon berikan:
1. Analisis klinis (RPE trends, volume progression, fatigue indicators)
2. Rekomendasi perubahan program (JSON format untuk import)
3. Penjelasan singkat keputusan Anda
`
      },

      /**
       * Code Partner Prompt - V27 Architecture Debugging Assistant
       * English format for code debugging scenarios
       */
      codePartner: {
        title: "V27 Code Debugging Assistant",
        description: "Debug code issues with V27 architecture context",
        includeContext: true,
        template: `You are a V27 Architecture Expert for THE GRIND DESIGN PWA.

CRITICAL V27 PATTERNS:
1. ALWAYS use window.APP.* for cross-module calls (NOT local APP)
   ❌ WRONG: APP.nav.switchView()
   ✅ CORRECT: window.APP.nav.switchView()

2. Module load order is CRITICAL:
   core.js → validation.js → data.js → ... → ui.js → debug.js → nav.js

3. Namespace merge pattern:
   if (window.APP) {
     Object.assign(window.APP, APP);  // Merge, don't overwrite
   }

4. Defensive error handling:
   if (window.APP?.module?.method) {
     window.APP.module.method();
   }

{{CONTEXT}}

Debug Issue:
{{USER_DESCRIPTION}}

Provide:
1. Root cause analysis
2. Code fix with proper V27 patterns
3. Prevention tips for similar issues
`
      },

      /**
       * Recipe Program Schema - JSON template for full program import
       * Returns raw JSON example with inline comments
       */
      recipeProgram: {
        title: "Program Import Schema",
        description: "JSON schema untuk full program import/merge",
        includeContext: false,
        template: `{
  "s1": {
    "label": "SESI 1",              // Display label
    "title": "Upper Push A",        // Session name
    "dynamic": "Arm Circles, Band Pull-Aparts",  // Warmup protocol
    "exercises": [
      {
        "sets": 4,                  // Number of sets
        "rest": 120,                // Rest seconds between sets
        "note": "Chest Compound",   // Exercise category note
        "options": [                // Min 3 exercise variants required
          {
            "n": "[Barbell] Bench Press",  // MUST match EXERCISE_TARGETS
            "t_r": "6-8",           // Target reps (string, can be range)
            "t_k": 60,              // Target weight in kg
            "bio": "Gold standard untuk horizontal pressing power",
            "note": "Gunakan leg drive. Turunkan bar ke sternum bawah.",
            "vid": "https://youtube.com/..."  // Optional video URL
          },
          {
            "n": "[DB] Flat Dumbbell Press",
            "t_r": "8-10",
            "t_k": 25,
            "bio": "Optimal untuk stabilisasi bahu",
            "note": "Turunkan 3 detik, dorong eksplosif"
          },
          {
            "n": "[Machine] Chest Press",
            "t_r": "10-12",
            "t_k": 50,
            "bio": "High stability untuk isolasi",
            "note": "Soft-lock siku di atas"
          }
        ]
      }
    ]
  },
  "s2": {
    // Additional sessions...
  }
}

VALIDATION RULES:
1. Each session MUST have: label, title, exercises array
2. Each exercise MUST have: sets (number), rest (number), options (array min 3)
3. Each option MUST have: n (name), t_r (target reps), t_k (target weight), bio
4. Exercise names MUST match EXERCISE_TARGETS library (fuzzy matching applied)
5. Session IDs (s1, s2...) must be unique - duplicates get auto-suffix
6. Cardio exercises use type: "cardio" field
`
      },

      /**
       * Recipe Spontaneous Schema - JSON template for spontaneous workout import
       * Reduced requirements (min 2 variants vs 3 for program)
       */
      recipeSpontaneous: {
        title: "Spontaneous Session Import Schema",
        description: "JSON schema untuk spontaneous workout import",
        includeContext: false,
        template: `{
  "spontaneous": {
    "label": "SPONTANEOUS",         // Always "SPONTANEOUS"
    "title": "Express Upper Body",  // Custom session name
    "dynamic": "Jumping Jacks, Arm Circles",
    "exercises": [
      {
        "sets": 3,
        "rest": 90,
        "note": "Quick pump work",
        "options": [                // Min 2 variants required
          {
            "n": "[DB] Dumbbell Curl",
            "t_r": "12-15",
            "t_k": 10,
            "bio": "Bicep isolation",
            "note": "Supinate at top"
          },
          {
            "n": "[Cable] Cable Curl",
            "t_r": "12-15",
            "t_k": 15,
            "bio": "Constant tension",
            "note": "Slow eccentric"
          }
        ]
      }
    ]
  }
}

VALIDATION RULES:
1. Session ID MUST be "spontaneous" (not timestamp)
2. Label MUST be "SPONTANEOUS"
3. Each exercise needs min 2 options (reduced from program import)
4. Same field requirements as program import
5. Will replace existing spontaneous session if exists
6. NOT tracked in last_performed rotation
`
      }
    },

    /**
     * Generates contextual data for AI prompts
     * @param {string} scenario - Prompt scenario name (e.g., "coach", "codePartner")
     * @returns {string} Formatted context string with user profile, recent workouts, and program structure
     */
    getPromptContext: function(scenario) {
      try {
        // Read data using LS_SAFE wrapper (global variable from core.js)
        const profile = window.LS_SAFE.getJSON("profile", {});
        const workoutLogs = window.LS_SAFE.getJSON("gym_hist", []);
        const weights = window.LS_SAFE.getJSON("weights", []);
        const program = window.APP.state.workoutData;

        // Get last 5 unique workout dates
        const uniqueDates = [...new Set(workoutLogs.map(l => l.date))].slice(-5);

        // Format context string
        let context = `\n\n--- CONTEXT DATA ---\n\n`;

        // User Profile Section
        context += `**User Profile:**\n`;
        context += `- Nama: ${profile.name || "Dok"}\n`;
        context += `- Usia: ${profile.a || "-"} tahun\n`;
        context += `- Tinggi: ${profile.h || 170} cm\n`;
        context += `- Berat: ${weights.length > 0 ? weights[0].v : 80} kg\n`;
        context += `- TDEE: ${window.LS_SAFE.get("tdee") || "?"} kkal\n\n`;

        // Recent Workout Logs (formatted like exportForConsultation)
        context += `**5 Latihan Terakhir:**\n`;
        uniqueDates.forEach(date => {
          const dayLogs = workoutLogs.filter(l => l.date === date);

          // Build session titles with individual [SPONTANEOUS] tags
          const sessionTitles = [...new Set(dayLogs.map(l => {
            const title = l.title || l.src;
            const spontTag = l.src === "spontaneous" ? " [SPONTANEOUS]" : "";
            return `${title}${spontTag}`;
          }))].join(" & ");

          // Calculate total volume (exclude cardio)
          const totalVol = dayLogs.reduce((acc, curr) => {
            return acc + (curr.type === "cardio" ? 0 : (curr.vol || 0));
          }, 0);

          context += `\n📅 ${date} | ${sessionTitles}\n`;
          context += `Volume: ${totalVol} kg | Sets: ${dayLogs.filter(l => l.type !== "cardio").length}\n`;

          // Exercise breakdown
          dayLogs.forEach(l => {
            if (l.type === "cardio") {
              const cardioSpontTag = l.src === "spontaneous" ? " [SPONTANEOUS]" : "";
              context += `- 🏃 ${l.machine} LISS: ${l.duration}min @ ${l.avgHR}bpm${cardioSpontTag}\n`;
            } else if (l.d && Array.isArray(l.d)) {
              const exerciseSpontTag = l.src === "spontaneous" ? " [SPONTANEOUS]" : "";
              const setsStr = l.d.map(s => `${s.k}x${s.r}${s.rpe ? "@"+s.rpe : ""}`).join(", ");
              context += `- ${l.ex}: ${setsStr}${exerciseSpontTag}\n`;
            }
          });
        });

        // Program Structure Summary
        context += `\n**Program Aktif:**\n`;
        const sessionIds = Object.keys(program).filter(id => id !== "spontaneous");
        sessionIds.forEach(id => {
          const session = program[id];
          context += `- ${id}: "${session.title}" (${session.exercises.length} exercises)\n`;
        });

        context += `\n--- END CONTEXT ---\n\n`;

        console.log("[AI-BRIDGE] Context generated successfully");
        return context;

      } catch (e) {
        console.error("[AI-BRIDGE] Context generation error:", e);
        return "\n\n[⚠️ Error generating context data]\n\n";
      }
    },

    /**
     * Retrieves a prompt template by scenario name
     * @param {string} scenario - Prompt scenario ("coach", "codePartner", "recipeProgram", "recipeSpontaneous")
     * @param {string} userDescription - Optional user input to replace {{USER_DESCRIPTION}} placeholder
     * @returns {Object|null} Prompt object with title, description, and content, or null if scenario not found
     */
    getPrompt: function(scenario, userDescription = "") {
      const prompt = this.prompts[scenario];

      if (!prompt) {
        console.error(`[AI-BRIDGE] Unknown scenario: ${scenario}`);
        return null;
      }

      let output = prompt.template;

      // Replace context placeholder if needed
      if (prompt.includeContext) {
        const context = this.getPromptContext(scenario);
        output = output.replace("{{CONTEXT}}", context);
      }

      // Replace user description placeholder
      output = output.replace("{{USER_DESCRIPTION}}", userDescription);

      console.log(`[AI-BRIDGE] Generated prompt for scenario: ${scenario}`);

      return {
        title: prompt.title,
        description: prompt.description,
        content: output
      };
    },

    /**
     * Parses and validates AI-generated recipe JSON
     * @param {string} jsonString - Raw JSON string from AI
     * @returns {Object} Parse result with validation status
     * @returns {boolean} returns.success - Whether parsing succeeded
     * @returns {Object|null} returns.data - Parsed and validated data
     * @returns {string[]} returns.errors - Hard validation errors (blocking)
     * @returns {string[]} returns.warnings - Soft validation warnings (non-blocking)
     * @returns {string|null} returns.schemaType - "program_import" or "spontaneous_import"
     */
    parseRecipe: function(jsonString) {
      const result = {
        success: false,
        data: null,
        errors: [],
        warnings: [],
        schemaType: null
      };

      try {
        // Step 1: Parse JSON
        const parsed = JSON.parse(jsonString);

        // Step 2: Detect schema type
        if (parsed.spontaneous) {
          result.schemaType = "spontaneous_import";
          result.data = parsed;
        } else {
          result.schemaType = "program_import";
          result.data = parsed;
        }

        console.log(`[AI-BRIDGE] Parsing ${result.schemaType}...`);

        // Step 3: Validate structure
        if (result.schemaType === "spontaneous_import") {
          const validateResult = this.validateSpontaneousSchema(parsed);
          result.errors = validateResult.errors;
          result.warnings = validateResult.warnings;
        } else {
          const validateResult = this.validateProgramSchema(parsed);
          result.errors = validateResult.errors;
          result.warnings = validateResult.warnings;
        }

        // Step 4: Auto-correct exercise names (fuzzy matching)
        let autoMappedCount = 0;
        Object.keys(result.data).forEach(sessionId => {
          const session = result.data[sessionId];
          if (!session.exercises) return;

          session.exercises.forEach((ex, exIdx) => {
            if (!ex.options) return;

            ex.options.forEach((opt, optIdx) => {
              if (!opt.n) return;

              // Check against EXERCISE_TARGETS (global variable from exercises-library.js)
              // CRITICAL: Must use window. prefix and defensive check
              if (!window.EXERCISE_TARGETS || !window.EXERCISE_TARGETS[opt.n]) {
                const matched = window.APP.validation.fuzzyMatchExercise(opt.n);

                if (matched && matched !== opt.n) {
                  console.log(`[AI-BRIDGE] 🔄 Auto-mapped: "${opt.n}" → "${matched}"`);
                  opt.n = matched;
                  autoMappedCount++;
                } else {
                  result.warnings.push(
                    `Session ${sessionId}, Exercise ${exIdx+1}, Option ${optIdx+1}: ` +
                    `"${opt.n}" not found in library. Volume tracking may fail.`
                  );
                }
              }
            });
          });
        });

        if (autoMappedCount > 0) {
          result.warnings.unshift(`✅ Auto-corrected ${autoMappedCount} exercise name(s) to match library`);
        }

        // Step 5: Check for duplicate session IDs and add warning (but don't rename)
        // AI import is designed to OVERWRITE existing sessions, not create duplicates
        if (result.schemaType === "program_import") {
          const existingIds = Object.keys(window.APP.state.workoutData);
          const newIds = Object.keys(result.data);

          newIds.forEach(newId => {
            if (existingIds.includes(newId)) {
              console.log(`[AI-BRIDGE] Session "${newId}" will be overwritten`);
              result.warnings.push(
                `⚠️ Session "${newId}" sudah ada dan akan ditimpa.`
              );
            }
          });
        }

        // Step 6: Set success flag
        result.success = result.errors.length === 0;

        console.log(`[AI-BRIDGE] Parse result: ${result.success ? "SUCCESS" : "FAILED"}`);
        console.log(`[AI-BRIDGE] Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`);

      } catch (e) {
        result.errors.push(`JSON Parse Error: ${e.message}`);
        console.error("[AI-BRIDGE] Parse error:", e);
      }

      return result;
    },

    /**
     * Validates program import schema structure
     * @param {Object} data - Parsed program data
     * @returns {Object} Validation result with errors and warnings arrays
     */
    validateProgramSchema: function(data) {
      const errors = [];
      const warnings = [];

      // Check if object
      if (!data || typeof data !== "object") {
        errors.push("Invalid schema: Must be an object");
        return { errors, warnings };
      }

      // Must have at least one session
      const sessionIds = Object.keys(data);
      if (sessionIds.length === 0) {
        errors.push("No sessions found in program");
        return { errors, warnings };
      }

      // Validate each session
      sessionIds.forEach(sessionId => {
        const session = data[sessionId];
        const prefix = `Session "${sessionId}":`;

        // Required fields
        if (!session.label) warnings.push(`${prefix} Missing "label" field`);
        if (!session.title) warnings.push(`${prefix} Missing "title" field`);
        if (!session.exercises) {
          errors.push(`${prefix} Missing "exercises" array`);
          return;
        }
        if (!Array.isArray(session.exercises)) {
          errors.push(`${prefix} "exercises" must be an array`);
          return;
        }

        // Validate each exercise
        session.exercises.forEach((ex, exIdx) => {
          const exPrefix = `${prefix} Exercise ${exIdx + 1}:`;

          if (typeof ex.sets !== "number") errors.push(`${exPrefix} Missing or invalid "sets" field`);
          if (typeof ex.rest !== "number") errors.push(`${exPrefix} Missing or invalid "rest" field`);
          if (!ex.options || !Array.isArray(ex.options)) {
            errors.push(`${exPrefix} Missing "options" array`);
            return;
          }

          if (ex.options.length < 3) {
            warnings.push(`${exPrefix} Only ${ex.options.length} variants (recommended: 3+)`);
          }

          // Validate each option
          ex.options.forEach((opt, optIdx) => {
            const optPrefix = `${exPrefix} Option ${optIdx + 1}:`;

            if (!opt.n) errors.push(`${optPrefix} Missing "n" (name) field`);
            if (!opt.t_r) warnings.push(`${optPrefix} Missing "t_r" (target reps)`);
            if (typeof opt.t_k !== "number") warnings.push(`${optPrefix} Missing "t_k" (target weight)`);
            if (!opt.bio) warnings.push(`${optPrefix} Missing "bio" (biomechanics description)`);
          });
        });
      });

      return { errors, warnings };
    },

    /**
     * Validates spontaneous session import schema structure
     * @param {Object} data - Parsed spontaneous session data (must have "spontaneous" key)
     * @returns {Object} Validation result with errors and warnings arrays
     */
    validateSpontaneousSchema: function(data) {
      const errors = [];
      const warnings = [];

      // Must have "spontaneous" key
      if (!data.spontaneous) {
        errors.push('Missing "spontaneous" key. Schema must be: { "spontaneous": {...} }');
        return { errors, warnings };
      }

      const session = data.spontaneous;
      const prefix = "Spontaneous session:";

      // Required fields
      if (session.label !== "SPONTANEOUS") {
        warnings.push(`${prefix} Label should be "SPONTANEOUS" (found: "${session.label}")`);
      }
      if (!session.title) warnings.push(`${prefix} Missing "title" field`);
      if (!session.exercises) {
        errors.push(`${prefix} Missing "exercises" array`);
        return { errors, warnings };
      }
      if (!Array.isArray(session.exercises)) {
        errors.push(`${prefix} "exercises" must be an array`);
        return { errors, warnings };
      }

      // Validate each exercise
      session.exercises.forEach((ex, exIdx) => {
        const exPrefix = `${prefix} Exercise ${exIdx + 1}:`;

        if (typeof ex.sets !== "number") errors.push(`${exPrefix} Missing or invalid "sets" field`);
        if (typeof ex.rest !== "number") errors.push(`${exPrefix} Missing or invalid "rest" field`);
        if (!ex.options || !Array.isArray(ex.options)) {
          errors.push(`${exPrefix} Missing "options" array`);
          return;
        }

        if (ex.options.length < 2) {
          warnings.push(`${exPrefix} Only ${ex.options.length} variant (recommended: 2+)`);
        }

        // Validate each option
        ex.options.forEach((opt, optIdx) => {
          const optPrefix = `${exPrefix} Option ${optIdx + 1}:`;

          if (!opt.n) errors.push(`${optPrefix} Missing "n" (name) field`);
          if (!opt.t_r) warnings.push(`${optPrefix} Missing "t_r" (target reps)`);
          if (typeof opt.t_k !== "number") warnings.push(`${optPrefix} Missing "t_k" (target weight)`);
          if (!opt.bio) warnings.push(`${optPrefix} Missing "bio" (biomechanics description)`);
        });
      });

      return { errors, warnings };
    },

    /**
     * Generates a unique session ID by appending suffix if duplicate exists
     * @param {string} baseName - Base session ID (e.g., "s1")
     * @returns {string} Unique session ID (e.g., "s1_1" if "s1" exists)
     */
    generateSessionId: function(baseName) {
      const existing = Object.keys(window.APP.state.workoutData);

      // If not duplicate, return as-is
      if (!existing.includes(baseName)) {
        return baseName;
      }

      // Find next available suffix
      let suffix = 1;
      let candidate = `${baseName}_${suffix}`;

      while (existing.includes(candidate)) {
        suffix++;
        candidate = `${baseName}_${suffix}`;
      }

      console.log(`[AI-BRIDGE] Generated unique ID: ${candidate}`);
      return candidate;
    },

    /**
     * Returns example recipe templates for both schema types
     * @returns {Object} Object with programTemplate and spontaneousTemplate keys
     */
    getRecipeTemplates: function() {
      return {
        programTemplate: {
          "s1": {
            "label": "Session 1",
            "title": "Upper A (Back + Shoulders)",
            "exercises": [
              {
                "sets": 3,
                "rest": 120,
                "options": [
                  {
                    "n": "[Cable] Lat Pulldown (wide)",
                    "t_r": "8-12",
                    "t_k": 55,
                    "bio": "Vertical pull utama untuk membangun lebar punggung (V-Taper)"
                  },
                  {
                    "n": "[Machine] Close Neutral Grip Pulldown",
                    "t_r": "8-12",
                    "t_k": 40,
                    "bio": "Close neutral grip maximize lat thickness"
                  },
                  {
                    "n": "[Machine] Reverse Grip Pulldown",
                    "t_r": "8-12",
                    "t_k": 40,
                    "bio": "Underhand grip shift emphasis ke lower lat"
                  }
                ]
              },
              {
                "sets": 3,
                "rest": 90,
                "options": [
                  {
                    "n": "[Cable] Cable Lateral Raise",
                    "t_r": "12-15",
                    "t_k": 5,
                    "bio": "Memberikan tegangan konstan (Constant Tension)"
                  },
                  {
                    "n": "[DB] DB Lateral Raise",
                    "t_r": "12-15",
                    "t_k": 6,
                    "bio": "Target utama Lateral Delt untuk memberikan lebar bahu"
                  },
                  {
                    "n": "[Machine] Lateral Raise Machine",
                    "t_r": "12-15",
                    "t_k": 20,
                    "bio": "Pure medial deltoid isolation dengan arm path yang fixed"
                  }
                ]
              }
            ]
          },
          "s2": {
            "label": "Session 2",
            "title": "Lower A (Quad Focus)",
            "exercises": [
              {
                "sets": 4,
                "rest": 180,
                "options": [
                  {
                    "n": "[Barbell] Barbell Squat",
                    "t_r": "6-10",
                    "t_k": 60,
                    "bio": "Raja dari semua latihan lower body"
                  },
                  {
                    "n": "[Machine] Leg Press (Quad Bias)",
                    "t_r": "8-12",
                    "t_k": 120,
                    "bio": "Isolasi lower body dengan stabilitas maksimal"
                  },
                  {
                    "n": "[Machine] Hack Squat",
                    "t_r": "10-12",
                    "t_k": 100,
                    "bio": "Alat terbaik untuk hipertrofi Quads"
                  }
                ]
              },
              {
                "sets": 3,
                "rest": 120,
                "options": [
                  {
                    "n": "[Machine] Leg Extension",
                    "t_r": "12-15",
                    "t_k": 45,
                    "bio": "Isolasi Rectus Femoris secara maksimal"
                  }
                ]
              }
            ]
          }
        },
        spontaneousTemplate: {
          "spontaneous": {
            "label": "SPONTANEOUS",
            "title": "Express Session",
            "exercises": [
              {
                "sets": 3,
                "rest": 90,
                "options": [
                  {
                    "n": "[Machine] Pec Deck Fly",
                    "t_r": "12-15",
                    "t_k": 35,
                    "bio": "Isolasi dada murni tanpa melibatkan tricep"
                  },
                  {
                    "n": "[Machine] Incline Chest Press",
                    "t_r": "10-12",
                    "t_k": 40,
                    "bio": "Target Clavicular Head (Dada Atas)"
                  }
                ]
              },
              {
                "sets": 3,
                "rest": 90,
                "options": [
                  {
                    "n": "[DB] One Arm DB Row",
                    "t_r": "8-10",
                    "t_k": 22.5,
                    "bio": "Unilateral movement untuk memperbaiki ketimpangan kekuatan"
                  }
                ]
              },
              {
                "sets": 3,
                "rest": 90,
                "options": [
                  {
                    "n": "[Cable] Cable Lateral Raise",
                    "t_r": "15-20",
                    "t_k": 5,
                    "bio": "Memberikan tegangan konstan di seluruh rentang gerak"
                  }
                ]
              }
            ]
          }
        }
      };
    }

  };

  // Module load confirmation
  console.log("[AI-BRIDGE] ✅ Module loaded");

})();
