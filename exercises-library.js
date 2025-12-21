/**
 * 📚 EXERCISES LIBRARY
 * Exercise template library untuk THE GRIND DESIGN
 * Dapat diakses dari index.html
 * 
 * Format Exercise:
 * {
 *   n: "[TAG] Exercise Name",        // n = name dengan tag: [DB/Barbell/Machine/Cable/Bodyweight/Stretch]
 *   t_r: "10-12",                    // t_r = target reps/waktu (misal: "10-12", "45s", "12 reps")
 *   bio: "Deskripsi teknik",         // bio = biomechanic/keterangan teknik
 *   note: "Fokus area" (optional)    // note = catatan tambahan
 * }
 */

const EXERCISES_LIBRARY = {
  // 💪 CHEST - DADA
  chest: [
    {
      n: "[Barbell] Bench Press",
      t_r: "8-10",
      bio: "Barbell press horizontal, dorso mid-back touching bench, elbows 75 deg angle."
    },
    {
      n: "[Barbell] Incline Bench Press",
      t_r: "8-10",
      bio: "Barbell press pada bangku incline 30-45 deg, fokus chest atas (clavicle head)."
    },
    {
      n: "[DB] Dumbbell Bench Press",
      t_r: "8-12",
      bio: "DB press dengan range of motion lebih dalam, squeeze puncak gerakan."
    },
    {
      n: "[DB] Incline Dumbbell Press",
      t_r: "10-12",
      bio: "DB press pada incline bench, optimal untuk upper chest development."
    },
    {
      n: "[Machine] Chest Press",
      t_r: "10-15",
      bio: "Machine press controlled, jangan lock out siku, constant tension pada chest."
    },
    {
      n: "[Cable] Cable Fly",
      t_r: "12-15",
      bio: "Cable fly dengan slight bend siku, squeeze di tengah, full stretch di opening."
    },
    {
      n: "[Machine] Pec Deck",
      t_r: "12-15",
      bio: "Machine isolation, squeeze puncak, feel the pump pada sternal head."
    }
  ],

  // 🔙 BACK - PUNGGUNG
  back: [
    {
      n: "[Barbell] Barbell Deadlift",
      t_r: "3-6",
      bio: "Barbell DL dari lantai, keep lats engaged, drive hips forward, jangan round lower back."
    },
    {
      n: "[Barbell] Barbell Row",
      t_r: "6-8",
      bio: "Barbell bent-over row, pull ke abdomen, squeeze scapula, maintain neutral spine."
    },
    {
      n: "[DB] Dumbbell Row",
      t_r: "8-10",
      bio: "Single arm DB row, ROM lebih dalam, squeeze lats di puncak."
    },
    {
      n: "[Cable] Lat Pulldown",
      t_r: "10-12",
      bio: "Cable pulldown, pull ke chest, engage lats fully, lean sedikit back (15 deg)."
    },
    {
      n: "[Cable] Cable Row",
      t_r: "10-12",
      bio: "Seated cable row, pull ke abs, squeeze, full stretch di start position."
    },
    {
      n: "[Machine] Leg Press",
      t_r: "10-12",
      bio: "Machine isolation row dengan constant tension, controlled tempo, no momentum."
    },
    {
      n: "[Cable] Face Pull",
      t_r: "15-20",
      bio: "Pull rope ke arah dahi, fokus rear delt & upper back, high reps untuk shoulder health."
    }
  ],

  // 💪 SHOULDERS - BAHU
  shoulders: [
    {
      n: "[Barbell] Overhead Press",
      t_r: "6-8",
      bio: "Barbell OHP seated atau standing, press straight up, keep core braced."
    },
    {
      n: "[DB] Dumbbell Shoulder Press",
      t_r: "8-10",
      bio: "DB shoulder press, full ROM, squeeze puncak, controlled eccentric."
    },
    {
      n: "[Machine] Smith Machine Shoulder Press",
      t_r: "8-10",
      bio: "Smith machine OHP, fixed path, dapat handle beban lebih heavy dengan safety."
    },
    {
      n: "[DB] Lateral Raise",
      t_r: "12-15",
      bio: "Lateral raise dumbbells, elbows lead movement, squeeze di puncak, minimal body English."
    },
    {
      n: "[Cable] Cable Lateral Raise",
      t_r: "12-15",
      bio: "Cable lateral raise, constant tension throughout ROM, controlled negative."
    },
    {
      n: "[Machine] Shoulder Press Machine",
      t_r: "10-12",
      bio: "Machine shoulder press, isolated movement, jangan kunci siku sepenuhnya."
    },
    {
      n: "[DB] Reverse Pec Deck",
      t_r: "12-15",
      bio: "Machine rear delt fly, fokus rear shoulder, squeeze scapula di puncak."
    }
  ],

  // 💪 ARMS - LENGAN
  arms: [
    {
      n: "[Barbell] Barbell Curl",
      t_r: "8-10",
      bio: "EZ-bar atau straight barbell curl, keep elbows fixed, squeeze bi di puncak."
    },
    {
      n: "[DB] Dumbbell Curl",
      t_r: "8-12",
      bio: "DB curl, supinate wrist, ROM penuh, mind-muscle connection pada bicep."
    },
    {
      n: "[Cable] Cable Curl",
      t_r: "12-15",
      bio: "Cable curl, constant tension, squeeze puncak, controlled eccentric."
    },
    {
      n: "[Machine] Bicep Machine",
      t_r: "10-12",
      bio: "Machine curl, isolated, perfect untuk pump & high reps."
    },
    {
      n: "[Barbell] Barbell Close-Grip Bench",
      t_r: "8-10",
      bio: "Close-grip bench press, grip shoulder-width, elbows tucked, fokus tricep."
    },
    {
      n: "[DB] Dumbbell Skullcrusher",
      t_r: "10-12",
      bio: "DB skullcrusher lying, lower DBs ke belakang kepala, ROM penuh, elbow tucked."
    },
    {
      n: "[Cable] Cable Tricep Pushdown",
      t_r: "12-15",
      bio: "Cable pushdown rope, lock elbows, push down ke bawah, squeeze tricep."
    },
    {
      n: "[Cable] Overhead Tricep Extension",
      t_r: "12-15",
      bio: "Cable OHE rope atau bar, extend fully, feel stretch di tricep."
    }
  ],

  // 🦵 LEGS - KAKI
  legs: [
    {
      n: "[Barbell] Barbell Squat",
      t_r: "6-10",
      bio: "Barbell back squat, ROM penuh, chest up, knee tracking jari kaki, ATG jika mobility allow."
    },
    {
      n: "[Barbell] Barbell Front Squat",
      t_r: "6-8",
      bio: "Front squat, barbell on shoulders, upright torso, quad focus, ATG recommended."
    },
    {
      n: "[Machine] Leg Press",
      t_r: "8-12",
      bio: "Plate-loaded leg press, focus quad & glute, jangan hyperextend knees, full ROM."
    },
    {
      n: "[Machine] Hack Squat",
      t_r: "10-12",
      bio: "Hack squat machine, ISO leg development, knee goes forward, quad emphasis."
    },
    {
      n: "[Machine] Leg Extension",
      t_r: "10-15",
      bio: "Machine leg ext, isolate quadriceps, squeeze puncak, slow eccentric control."
    },
    {
      n: "[Machine] Leg Curl",
      t_r: "10-15",
      bio: "Machine leg curl, lying atau seated, hamstring focus, keep hip down."
    },
    {
      n: "[Barbell] Barbell Deadlift",
      t_r: "3-6",
      bio: "Full ROM deadlift, pull dari lantai, hip hinge pattern, posterior chain dominant."
    },
    {
      n: "[Barbell] Romanian Deadlift",
      t_r: "8-10",
      bio: "RDL, hinge di hips, keep knees slight bend, hamstring & glute focus."
    },
    {
      n: "[DB] Dumbbell Goblet Squat",
      t_r: "10-12",
      bio: "Hold DB vertical di chest, squat deep, excellent untuk form & quad activation."
    },
    {
      n: "[Machine] Leg Press",
      t_r: "12-15",
      bio: "High reps leg press untuk pump & glute activation, controlled motion."
    }
  ],

  // 🫀 CORE & STABILITY
  core: [
    {
      n: "[Bodyweight] Plank",
      t_r: "45-60s",
      bio: "Standard plank hold, brace core seperti akan dipukul, keep hips neutral."
    },
    {
      n: "[Bodyweight] Deadbug",
      t_r: "12-15",
      bio: "Deadbug supine, lower back melekat lantai, opposite arm-leg extension."
    },
    {
      n: "[Bodyweight] Side Plank",
      t_r: "30-45s",
      bio: "Side plank, lift hips tinggi, garis lurus dari kepala ke kaki, oblique brace."
    },
    {
      n: "[Cable] Cable Woodchop",
      t_r: "12-15",
      bio: "Cable anti-rotation woodchop, rotate & extend, core stability dengan dynamic movement."
    },
    {
      n: "[Bodyweight] Ab Rollout",
      t_r: "8-12",
      bio: "Ab wheel rollout, full ROM stretch, return dengan kontrol, core braced penuh."
    },
    {
      n: "[Cable] Cable Crunches",
      t_r: "15-20",
      bio: "High-cable crunch, flex di lower abs, squeeze puncak, high reps untuk pump."
    }
  ],

  // 🏃 CARDIO & CONDITIONING
  cardio: [
    {
      n: "[Bodyweight] Jumping Jacks",
      t_r: "30s",
      bio: "Jump explosive, full body movement, elevate heart rate untuk warm-up."
    },
    {
      n: "[Bodyweight] Burpees",
      t_r: "12-15",
      bio: "Full body burpee, plank + jump, explosive movement, full body activation."
    },
    {
      n: "[Machine] Treadmill",
      t_r: "15-20 min",
      bio: "Steady-state cardio, maintain consistent pace, incline untuk glute & hamstring activation."
    },
    {
      n: "[Machine] Stationary Bike",
      t_r: "15-20 min",
      bio: "Low impact cardio, adjust resistance, good untuk lower body endurance."
    },
    {
      n: "[Bodyweight] Rope Skipping",
      t_r: "30s-1min",
      bio: "Jump rope explosive, ankle & wrist coordination, full body engagement."
    }
  ],

  // 🧘 MOBILITY & STRETCHING
  stretching: [
    {
      n: "[Stretch] Cat-Cow",
      t_r: "10-15 reps",
      bio: "Thoracic mobility flow, arch & round spine, mobilize entire spine segment."
    },
    {
      n: "[Stretch] Band Dislocates",
      t_r: "10 reps",
      bio: "Shoulder mobility with band, jangan dipaksa, improve shoulder ROM gradually."
    },
    {
      n: "[Stretch] Child Pose",
      t_r: "30-45s",
      bio: "Lats & thoracic stretch, push ketiak ke lantai, relax & breathe deeply."
    },
    {
      n: "[Stretch] Pigeon Pose",
      t_r: "45-60s",
      bio: "Hip flexor & glute stretch, anterior hip mobility, hold dan breathe deeply."
    },
    {
      n: "[Stretch] Quad Stretch",
      t_r: "30s each",
      bio: "Standing quad stretch, keep hips neutral, feel stretch di anterior thigh."
    },
    {
      n: "[Stretch] Hamstring Stretch",
      t_r: "30s each",
      bio: "Seated hamstring stretch, hinge dari hips, keep spine neutral, no momentum."
    }
  ],

  // 🏋️ COMPOUND MOVEMENTS
  compound: [
    {
      n: "[Barbell] Barbell Bench Press",
      t_r: "6-8",
      bio: "Primary compound chest, full body tension, explosive concentrics."
    },
    {
      n: "[Barbell] Barbell Deadlift",
      t_r: "3-5",
      bio: "Ultimate strength movement, posterior chain, maximal tension."
    },
    {
      n: "[Barbell] Barbell Squat",
      t_r: "6-8",
      bio: "Lower body primary, quad & glute dominant, full ROM ATG."
    },
    {
      n: "[Barbell] Barbell Row",
      t_r: "6-8",
      bio: "Back compound, horizontal pull, lats & back width development."
    },
    {
      n: "[Barbell] Overhead Press",
      t_r: "6-8",
      bio: "Shoulder compound, vertical press, complete shoulder development."
    }
  ]
};

/**
 * Helper function untuk mendapatkan exercise dari library
 * Usage: EXERCISES_LIBRARY.getExerciseByCategory('chest')
 */
EXERCISES_LIBRARY.getExerciseByCategory = function(category) {
  return this[category] || [];
};

/**
 * Helper function untuk search exercise berdasarkan nama
 * Usage: EXERCISES_LIBRARY.searchExercise('press')
 */
EXERCISES_LIBRARY.searchExercise = function(keyword) {
  const results = [];
  const lowerKeyword = keyword.toLowerCase();
  
  Object.keys(this).forEach(category => {
    if (Array.isArray(this[category])) {
      this[category].forEach(exercise => {
        if (exercise.n && exercise.n.toLowerCase().includes(lowerKeyword)) {
          results.push({
            category: category,
            ...exercise
          });
        }
      });
    }
  });
  
  return results;
};

/**
 * Helper function untuk mendapatkan kategori tersedia
 * Usage: EXERCISES_LIBRARY.getCategories()
 */
EXERCISES_LIBRARY.getCategories = function() {
  return Object.keys(this).filter(key => Array.isArray(this[key]));
};

/**
 * Helper function untuk create exercise baru dengan template
 * Usage: EXERCISES_LIBRARY.createExercise("[DB] New Exercise", "10-12", "Deskripsi", "Optional Note")
 */
EXERCISES_LIBRARY.createExercise = function(name, targetReps, bio, note = "") {
  const exercise = {
    n: name,
    t_r: targetReps,
    bio: bio
  };
  
  if (note) {
    exercise.note = note;
  }
  
  return exercise;
};

// Export untuk use di index.html: <script src="exercises-library.js"></script>

/**
 * 🔗 INTEGRATION WITH INDEX.HTML
 * 
 * Library ini terintegrasi dengan Exercise Picker Modal yang memungkinkan:
 * 
 * 1. Menambah Exercise Baru:
 *    - Klik "Tambah Gerakan Baru" di workout view
 *    - Modal Exercise Library terbuka
 *    - Pilih exercise dari library atau cari dengan keyword
 *    - Exercise langsung ditambahkan dengan template lengkap (nama, target reps, bio)
 * 
 * 2. Menambah Exercise Variant:
 *    - Klik tombol "+" pada exercise card
 *    - Modal Exercise Library terbuka
 *    - Pilih exercise untuk ditambahkan sebagai alternatif
 *    - Variant baru tersimpan otomatis
 * 
 * 3. Filter & Search:
 *    - Kategori: chest, back, shoulders, arms, legs, core, cardio, stretching, compound
 *    - Search: cari exercise berdasarkan nama/keyword
 * 
 * 4. Auto-Detection Plate Calculator:
 *    - Library menggunakan tag [DB], [Barbell], [Machine], [Cable], [Bodyweight], [Stretch]
 *    - Plate calculator otomatis detect tipe beban dari tag
 *    - Contoh: "[Barbell] Squat" → barbell protocol (bar 20kg)
 *             "[Machine] Leg Press" → plate loaded protocol (no bar)
 *             "[DB] Dumbbell Curl" → standard machine/DB (no plate calc)
 */
