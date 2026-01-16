(function() {
  'use strict';

  // ============================================
  // VERSION & ARCHITECTURE INFO
  // ============================================

  if (!window.APP) window.APP = {};

  window.APP.version = {
    number: "30.8",
    name: "HISTORICAL DATA MIGRATION",
    date: "January 2026",
    previous: "30.7"
  };

  window.APP.architecture = {
    pattern: "IIFE Modular",
    modules: 13,
    stack: ["Vanilla JavaScript", "Tailwind CSS", "Chart.js", "Day.js"],
    storage: "LocalStorage (LS_SAFE wrapper)",
    files: [
      "js/core.js",
      "js/validation.js",
      "js/data.js",
      "js/safety.js",
      "js/stats.js",
      "js/session.js",
      "js/cardio.js",
      "js/ui.js",
      "js/ai-bridge.js",
      "js/debug.js",
      "js/nav.js",
      "js/cloud.js"
    ]
  };

  console.log(`[VERSION] The Grind Design v${window.APP.version.number} - ${window.APP.version.name}`);

  // ============================================
  // GOOGLE SHEETS CONFIGURATION (V31 Phase 2 - REVISED 13-Column Schema)
  // ============================================

  const SHEET_NAME = "THE GRIND - Workout Data Warehouse";
  const SHEET_HEADERS = [
    "Date",             // A: YYYY-MM-DD
    "Day",              // B: Monday, Tuesday, etc.
    "Session Name",     // C: Push Day A, Pull Day B, etc.
    "Exercise",         // D: Barbell Bench Press, etc.
    "Exercise Type",    // E: Compound/Isolation (NEW)
    "Movement Pattern", // F: Unilateral/Bilateral/N/A (NEW)
    "Equipment",        // G: Barbell/Dumbbell/Bodyweight/Cable/Machine (NEW)
    "Sets",             // H: 4
    "Reps",             // I: "10,10,8,8" (CSV)
    "Weight",           // J: "100,100,105,105" (CSV in kg)
    "Duration (s)",     // K: 0 or seconds for time-based exercises (NEW)
    "Total Volume",     // L: 4020.0 (kg)
    "Notes"             // M: RPE, comments, etc.
  ];

  // Make globally accessible
  window.SHEET_NAME = SHEET_NAME;
  window.SHEET_HEADERS = SHEET_HEADERS;

  // ============================================
  // PRESETS - Quick Workout Templates
  // ============================================

  window.PRESETS = {
    p1: {
      label: "Blood Flow",
      title: "The Blood Flow (Active Recovery)",
      dynamic: "Arm Circles, Leg Swings",
      exercises: [
        {
          sets: 3,
          rest: 60,
          note: "Constant Tension (No Lockout)",
          options: [
            {
              n: "[Machine] Chest Press",
              t_r: "15-20",
              bio: "Lakukan gerakan memompa, jangan kunci siku.",
              note: "Fokus Pompa Darah",
            },
            {
              n: "[Cable] Face Pull",
              t_r: "15-20",
              bio: "Tarik ke arah dahi, fokus rear delt.",
            },
          ],
        },
        {
          sets: 3,
          rest: 60,
          note: "Slow Eccentric",
          options: [
            {
              n: "[Machine] Leg Extension",
              t_r: "15-20",
              bio: "Tahan 1 detik di puncak kontraksi.",
              note: "Tahan Puncak",
            },
            {
              n: "[Machine] Lying Leg Curl",
              t_r: "15-20",
              bio: "Jaga pinggul tetap menempel di pad.",
            },
          ],
        },
      ],
    },
    p2: {
      label: "Mini Pump",
      title: "Minimalist Pump",
      dynamic: "Arm Circles",
      exercises: [
        {
          sets: 3,
          rest: 90,
          note: "Squeeze at Top",
          options: [
            {
              n: "[DB] Incline Press",
              t_r: "10-12",
              bio: "Tekan dada atas, sudut bangku 30 derajat.",
            },
          ],
        },
        {
          sets: 3,
          rest: 90,
          note: "Full Stretch",
          options: [
            {
              n: "[Cable] Lat Pulldown (Wide)",
              t_r: "10-12",
              bio: "Biarkan lats terulur maksimal di atas.",
            },
          ],
        },
        {
          sets: 3,
          rest: 90,
          note: "Control Weight",
          options: [
            {
              n: "[Machine] Leg Press (Quad Bias)",
              t_r: "10-12",
              bio: "Jangan biarkan lutut goyang (valgus).",
            },
          ],
        },
      ],
    },
    p3: {
      label: "Core",
      title: "Core Stability",
      dynamic: "Cat-Cow",
      exercises: [
        {
          sets: 3,
          rest: 60,
          note: "Bracing Focus",
          options: [
            {
              n: "[Bodyweight] Plank",
              t_r: "45s",
              bio: "Kencangkan perut seperti akan dipukul.",
            },
          ],
        },
        {
          sets: 3,
          rest: 60,
          note: "Control",
          options: [
            {
              n: "[Bodyweight] Deadbug",
              t_r: "12 reps",
              bio: "Punggung bawah harus menempel lantai.",
            },
          ],
        },
        {
          sets: 3,
          rest: 60,
          note: "Obliques",
          options: [
            {
              n: "[Bodyweight] Side Plank",
              t_r: "30s",
              bio: "Angkat pinggul tinggi, garis lurus.",
            },
          ],
        },
      ],
    },
    p4: {
      label: "Mobility",
      title: "Upper Mobility Flow",
      dynamic: "Arm Swings",
      exercises: [
        {
          sets: 2,
          rest: 30,
          note: "Thoracic Ext.",
          options: [
            {
              n: "[Stretch] Cat-Cow",
              t_r: "10 reps",
              bio: "Fokus lengkungan di punggung atas.",
            },
          ],
        },
        {
          sets: 2,
          rest: 30,
          note: "Shoulder ROM",
          options: [
            {
              n: "[Stretch] Band Dislocates",
              t_r: "10 reps",
              bio: "Gunakan band elastis, jangan dipaksa.",
            },
          ],
        },
        {
          sets: 2,
          rest: 30,
          note: "Lats Stretch",
          options: [
            {
              n: "[Stretch] Child Pose",
              t_r: "30s",
              bio: "Dorong ketiak ke arah lantai.",
            },
          ],
        },
      ],
    },
    p5: {
      label: "Home",
      title: "Home Flow (No Gear)",
      dynamic: "Jumping Jacks",
      exercises: [
        {
          sets: 3,
          rest: 60,
          note: "Chest Focus",
          options: [
            {
              n: "[Bodyweight] Push Up",
              t_r: "Failure",
              bio: "Siku 45 derajat dari badan, jangan lebar.",
            },
          ],
        },
        {
          sets: 3,
          rest: 60,
          note: "Quads",
          options: [
            {
              n: "[Bodyweight] Squat",
              t_r: "20 reps",
              bio: "Lutut mengikuti arah jari kaki.",
            },
          ],
        },
        {
          sets: 3,
          rest: 60,
          note: "Glutes",
          options: [
            {
              n: "[Bodyweight] Glute Bridge",
              t_r: "15 reps",
              bio: "Kunci pantat di atas, jangan over-arch.",
            },
          ],
        },
      ],
    },
  };

  // ============================================
  // STARTER_PACK - Default Program Template
  // ============================================

  window.STARTER_PACK = {
    1704067200000: {
      label: "UPPER",
      title: "Upper Body Foundation",
      dynamic: "Arm Circles, Band Pull-Aparts, Shoulder Dislocates",
      exercises: [
        {
          sets: 3,
          rest: 150,
          note: "Primary compound push - chest focus",
          options: [
            {
              n: "[Barbell] Bench Press",
              t_r: "6-8",
              t_k: 60,
              vid: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
              bio: "Gold standard untuk total horizontal pressing power dan densitas otot pectoral.",
              note: "Gunakan leg drive. Turunkan bar ke sternum bawah. Siku tidak flaring 90 derajat.",
            },
          ],
        },
        {
          sets: 3,
          rest: 120,
          note: "Primary compound pull - back thickness",
          options: [
            {
              n: "[Barbell] Row",
              t_r: "8-10",
              t_k: 50,
              vid: "https://www.youtube.com/watch?v=9efgcAjQe7E",
              bio: "Compound horizontal pull primer untuk ketebalan mid-back dan stabilitas core.",
              note: "Bent-over 45-60 derajat. Tarik bar ke perut bawah. Squeeze scapula di puncak.",
            },
          ],
        },
        {
          sets: 3,
          rest: 90,
          note: "Vertical press - shoulder development",
          options: [
            {
              n: "[Barbell] Overhead Press",
              t_r: "8-10",
              t_k: 30,
              vid: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
              bio: "Membangun kekuatan bahu murni dan stabilitas core.",
              note: "Mundurkan dagu saat bar naik. Kunci core dan bokong untuk stabilitas lumbal.",
            },
          ],
        },
        {
          sets: 3,
          rest: 90,
          note: "Vertical pull - back width",
          options: [
            {
              n: "[Cable] Lat Pulldown (Wide)",
              t_r: "10-12",
              t_k: 55,
              vid: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
              bio: "Vertical pull utama untuk membangun lebar punggung (V-Taper).",
              note: "Tarik bar ke dada atas. Bayangkan siku masuk ke saku celana belakang.",
            },
          ],
        },
        {
          sets: 3,
          rest: 60,
          note: "Arm isolation - biceps",
          options: [
            {
              n: "[Barbell] Curl",
              t_r: "10-12",
              t_k: 25,
              vid: "https://www.youtube.com/watch?v=lyn7kj8v_XU",
              bio: "Membangun massa bicep keseluruhan.",
              note: "Kunci siku di samping rusuk. Hindari ayunan pinggang. Kontraksi puncak dan turun terkontrol.",
            },
          ],
        },
      ],
    },

    1704067201000: {
      label: "LOWER",
      title: "Lower Body Foundation",
      dynamic: "Leg Swings, Hip Circles, Ankle Mobility",
      exercises: [
        {
          sets: 3,
          rest: 180,
          note: "Primary compound - quad dominant",
          options: [
            {
              n: "[Barbell] Squat",
              t_r: "6-8",
              t_k: 80,
              vid: "https://www.youtube.com/watch?v=gcNh17Ckjgg",
              bio: "Raja dari semua latihan lower body. Membangun kekuatan sistemik dan stabilitas core.",
              note: "Chest up, knee tracking mengikuti jari kaki. Turun sedalam mungkin tanpa butt wink.",
            },
          ],
        },
        {
          sets: 3,
          rest: 120,
          note: "Hip hinge - posterior chain",
          options: [
            {
              n: "[Barbell] RDL",
              t_r: "8-10",
              t_k: 70,
              vid: "https://www.youtube.com/watch?v=JCXUYuzwNrM",
              bio: "Raja posterior chain. Fokus pada hip-hinge.",
              note: "Lutut soft lock. Dorong pinggul ke belakang. Barbell menempel paha.",
            },
          ],
        },
        {
          sets: 3,
          rest: 120,
          note: "Quad isolation - knee extension",
          options: [
            {
              n: "[Machine] Leg Extension",
              t_r: "10-12",
              t_k: 45,
              vid: "https://www.youtube.com/watch?v=YyvSfVjQeL0",
              bio: "Isolasi Rectus Femoris secara maksimal.",
              note: "Wajib pause 1 detik di posisi kaki lurus. No momentum.",
            },
          ],
        },
        {
          sets: 3,
          rest: 90,
          note: "Hamstring isolation - knee flexion",
          options: [
            {
              n: "[Machine] Lying Leg Curl",
              t_r: "10-12",
              t_k: 40,
              vid: "https://www.youtube.com/watch?v=1Tq3QdYUuHs",
              bio: "Pre-exhaust hamstring. Fokus pada kontraksi puncak.",
              note: "Tekan pinggul ke pad. Kontraksi 1 detik, turun pelan 3 detik.",
            },
          ],
        },
        {
          sets: 3,
          rest: 60,
          note: "Calf isolation - ankle plantarflexion",
          options: [
            {
              n: "[Machine] Seated Calf Raise",
              t_r: "15-20",
              t_k: 35,
              vid: "https://www.youtube.com/watch?v=JbyjNymZOt0",
              bio: "Target Soleus (otot betis dalam/lebar).",
              note: "Full ROM. Pause di bawah untuk menghilangkan refleks regangan.",
            },
          ],
        },
      ],
    },
  };

  // ============================================
  // VALIDATION - Validate STARTER_PACK exercises
  // ============================================

  if (typeof EXERCISE_TARGETS !== "undefined") {
    console.log("[STARTER_PACK] Validating exercises against library...");

    let invalidCount = 0;
    Object.keys(window.STARTER_PACK).forEach((sessionId) => {
      const session = window.STARTER_PACK[sessionId];
      session.exercises.forEach((ex) => {
        ex.options.forEach((opt) => {
          if (!EXERCISE_TARGETS[opt.n]) {
            console.error(
              `[STARTER_PACK] Invalid exercise: "${opt.n}" not in EXERCISE_TARGETS`
            );
            invalidCount++;
          }
        });
      });
    });

    if (invalidCount === 0) {
      console.log("[STARTER_PACK] ✅ All exercises validated successfully");
    } else {
      console.error(
        `[STARTER_PACK] ❌ ${invalidCount} invalid exercises found!`
      );
    }
  }

  console.log("[CONSTANTS] ✅ Constants loaded");
})();
