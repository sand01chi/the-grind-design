const VOLUME_DISTRIBUTION = {
  PRIMARY: 1.0,
  SECONDARY: 0.5,
  TERTIARY: 0.0,
};

const EXERCISE_TARGETS = {
  // ========================================
  // CHEST EXERCISES
  // ========================================
  
  // Barbell Pressing
  "[Barbell] Bench Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Barbell] Incline Bench Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  
  // Dumbbell Pressing
  "[DB] Flat Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[DB] Incline Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[DB] Fly": [{ muscle: "chest", role: "PRIMARY" }],
  
  // Machine Pressing
  "[Machine] Chest Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Machine] Incline Chest Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Machine] Smith Machine Incline Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Machine] Decline Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Machine] Converging Incline Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "shoulders", role: "SECONDARY" },
  ],
  "[Machine] Wide Chest Press": [{ muscle: "chest", role: "PRIMARY" }],
  "[Machine] Close Grip Press Machine": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Machine] Unilateral Chest Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "core", role: "SECONDARY" },
  ],
  "[Machine] Pec Deck Fly": [{ muscle: "chest", role: "PRIMARY" }],
  
  // Cable Chest
  "[Cable] Fly": [{ muscle: "chest", role: "PRIMARY" }],
  "[Cable] Fly (High to Low)": [{ muscle: "chest", role: "PRIMARY" }],
  "[Cable] Crossover (High-to-Low)": [{ muscle: "chest", role: "PRIMARY" }],
  "[Cable] Crossover (Low-to-High)": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "shoulders", role: "SECONDARY" },
  ],
  
  // Bodyweight Chest
  "[Bodyweight] Push Up (Slow Tempo)": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],

  // ========================================
  // BACK EXERCISES
  // ========================================
  
  // Barbell Back
  "[Barbell] Deadlift": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "legs", role: "SECONDARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Barbell] Row": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  
  // Dumbbell Back
  "[DB] One Arm Row": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[DB] Chest Supported Row": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  
  // Machine Rows
  "[Machine] Row": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Machine] High Row (Upper Back Bias)": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "shoulders", role: "SECONDARY" },
  ],
  "[Machine] Low Row (Lat Bias)": [{ muscle: "back", role: "PRIMARY" }],
  "[Machine] Chest Supported T-Bar Row": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Machine] T-Bar Row (Chest Support)": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Machine] Converging Row": [{ muscle: "back", role: "PRIMARY" }],
  "[Machine] Reverse Grip Row": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Machine] Single Arm Row": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "core", role: "SECONDARY" },
  ],
  
  // Machine/Cable Pulldowns
  "[Machine] Converging Lat Pulldown": [{ muscle: "back", role: "PRIMARY" }],
  "[Machine] Wide Grip Pulldown (Lat Width)": [{ muscle: "back", role: "PRIMARY" }],
  "[Machine] Close Neutral Grip Pulldown": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Machine] Reverse Grip Pulldown": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Cable] Lat Pulldown (Wide)": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Cable] Neutral Grip Pulldown": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  
  // Specialized Back Machines
  "[Machine] Pullover Machine (Nautilus)": [{ muscle: "back", role: "PRIMARY" }],
  "[Machine] Assisted Pull-Up": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  
  // Cable Back
  "[Cable] Seated Row": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Cable] Single Arm Row": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Cable] Face Pull": [
    { muscle: "shoulders", role: "PRIMARY" },
    { muscle: "back", role: "SECONDARY" },
  ],

  // ========================================
  // SHOULDER EXERCISES
  // ========================================
  
  // Barbell Shoulders
  "[Barbell] Overhead Press": [
    { muscle: "shoulders", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Barbell] Seated Overhead Press": [
    { muscle: "shoulders", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  
  // Dumbbell Shoulders
  "[DB] Shoulder Press": [
    { muscle: "shoulders", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[DB] Lateral Raise": [{ muscle: "shoulders", role: "PRIMARY" }],
  
  // Machine Shoulders
  "[Machine] Smith Machine Shoulder Press": [
    { muscle: "shoulders", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Machine] Shoulder Press": [
    { muscle: "shoulders", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" },
  ],
  "[Machine] Lateral Raise Machine": [{ muscle: "shoulders", role: "PRIMARY" }],
  "[Machine] Reverse Pec Deck (Rear Delt)": [{ muscle: "shoulders", role: "PRIMARY" }],
  
  // Cable Shoulders
  "[Cable] Lateral Raise": [{ muscle: "shoulders", role: "PRIMARY" }],

  // ========================================
  // ARM EXERCISES
  // ========================================
  
  // Biceps - Barbell
  "[Barbell] Curl": [{ muscle: "arms", role: "PRIMARY" }],
  "[Barbell] Skullcrushers (EZ Bar)": [{ muscle: "arms", role: "PRIMARY" }],
  
  // Biceps/Triceps - Dumbbell
  "[DB] Curl": [{ muscle: "arms", role: "PRIMARY" }],
  "[DB] Incline Curl": [{ muscle: "arms", role: "PRIMARY" }],
  "[DB] Hammer Curl": [{ muscle: "arms", role: "PRIMARY" }],
  "[DB] Skullcrusher": [{ muscle: "arms", role: "PRIMARY" }],
  "[DB] Overhead Tricep Extension": [{ muscle: "arms", role: "PRIMARY" }],
  
  // Arms - Machine
  "[Machine] Bicep Machine": [{ muscle: "arms", role: "PRIMARY" }],
  "[Machine] Preacher Curl Machine": [{ muscle: "arms", role: "PRIMARY" }],
  "[Machine] Tricep Extension Machine": [{ muscle: "arms", role: "PRIMARY" }],
  
  // Arms - Cable
  "[Cable] Curl": [{ muscle: "arms", role: "PRIMARY" }],
  "[Cable] Bayesian Curl": [{ muscle: "arms", role: "PRIMARY" }],
  "[Cable] Overhead Tricep Extension": [{ muscle: "arms", role: "PRIMARY" }],
  "[Cable] Tricep Pushdown (Rope)": [{ muscle: "arms", role: "PRIMARY" }],
  
  // Compound Triceps
  "[Barbell] Close-Grip Bench Press": [
    { muscle: "arms", role: "PRIMARY" },
    { muscle: "chest", role: "SECONDARY" },
  ],

  // ========================================
  // LEG EXERCISES
  // ========================================
  
  // Barbell Legs
  "[Barbell] Squat": [{ muscle: "legs", role: "PRIMARY" }],
  "[Barbell] Front Squat": [{ muscle: "legs", role: "PRIMARY" }],
  "[Barbell] RDL": [
    { muscle: "legs", role: "PRIMARY" },
    { muscle: "back", role: "SECONDARY" },
  ],
  
  // Dumbbell Legs
  "[DB] Goblet Squat": [{ muscle: "legs", role: "PRIMARY" }],
  "[DB] Goblet Squat (Heels Elevated)": [{ muscle: "legs", role: "PRIMARY" }],
  "[DB] Bulgarian Split Squat": [{ muscle: "legs", role: "PRIMARY" }],
  "[DB] Forward Lunge": [{ muscle: "legs", role: "PRIMARY" }],
  "[DB] Walking Lunge": [{ muscle: "legs", role: "PRIMARY" }],
  "[DB] Split Squat (Static)": [{ muscle: "legs", role: "PRIMARY" }],
  "[DB] RDL": [
    { muscle: "legs", role: "PRIMARY" },
    { muscle: "back", role: "SECONDARY" },
  ],
  "[DB] Lying Leg Curl": [{ muscle: "legs", role: "PRIMARY" }],
  "[DB] Single Leg Calf Raise": [{ muscle: "legs", role: "PRIMARY" }],
  "[DB] Seated Calf Raise": [{ muscle: "legs", role: "PRIMARY" }],
  
  // Machine Squat Variations
  "[Machine] Smith Machine Squat": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Hack Squat": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Pendulum Squat": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] V-Squat": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Belt Squat": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Reverse Hack Squat (Glute Bias)": [
    { muscle: "legs", role: "PRIMARY" },
    { muscle: "back", role: "SECONDARY" },
  ],
  
  // Machine Leg Press Variations
  "[Machine] Leg Press (Quad Bias)": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Leg Press (Glute Bias)": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Leg Press (Quad Bias/Low Stance)": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Leg Press (Glute Bias/High Stance)": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Vertical Leg Press": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Single Leg Press": [
    { muscle: "legs", role: "PRIMARY" },
    { muscle: "core", role: "SECONDARY" },
  ],
  
  // Machine Hip/Glute
  "[Machine] Hip Thrust Machine (Glute Drive)": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Hip Abduction Machine": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Hip Adduction Machine": [{ muscle: "legs", role: "PRIMARY" }],
  
  // Machine Hamstrings
  "[Machine] Lying Leg Curl": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Seated Leg Curl": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Standing Single Leg Curl": [{ muscle: "legs", role: "PRIMARY" }],
  
  // Machine Quad Isolation
  "[Machine] Leg Extension": [{ muscle: "legs", role: "PRIMARY" }],
  
  // Machine Calves
  "[Machine] Seated Calf Raise": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Standing Calf Raise": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Leg Press Calf Raise": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Smith Machine Seated Calf": [{ muscle: "legs", role: "PRIMARY" }],
  
  // Cable Legs
  "[Cable] Pull Through": [
    { muscle: "legs", role: "PRIMARY" },
    { muscle: "back", role: "SECONDARY" },
  ],
  "[Cable] Leg Extension": [{ muscle: "legs", role: "PRIMARY" }],
  
  // Bodyweight Legs
  "[Bodyweight] Sissy Squat": [{ muscle: "legs", role: "PRIMARY" }],

  // ========================================
  // MOBILITY, CORE, CARDIO (Non-Resistance)
  // ========================================
  
  "Mobility Cat-Cow Stretch": [],
  "Mobility Thoracic Extension (Foam Roller)": [],
  "Mobility Open Book Stretch": [],
  "Mobility World's Greatest Stretch": [],
  "Mobility Spider-Man Lunge": [],
  "Mobility 90/90 Hip Switch": [],

  // Core Exercises (with resistance tags where applicable)
  "[Bodyweight] Plank": [{ muscle: "core", role: "PRIMARY" }],
  "[Bodyweight] Deadbug": [{ muscle: "core", role: "PRIMARY" }],
  "[Bodyweight] Side Plank": [{ muscle: "core", role: "PRIMARY" }],
  "[Bodyweight] Ab Rollout": [{ muscle: "core", role: "PRIMARY" }],
  "[Cable] Woodchop": [
    { muscle: "core", role: "PRIMARY" },
    { muscle: "shoulders", role: "SECONDARY" },
  ],
  "[Cable] Crunches": [{ muscle: "core", role: "PRIMARY" }],
  
  // Non-resistance exercises (no tags)
  "Core Deadbug": [],
  "Core Bird Dog": [],
  "Core Plank": [],
  "Activation Glute Bridge": [],
  "Activation Single Leg Glute Bridge": [],
  "Activation Clamshell": [],
  "Cardio LISS Session": [],
  "Cardio Warmup Cardio": [],

// ========================================
  // V26.5+ EXPANSION - ADVANCED MACHINE VARIATIONS
  // ========================================
  
  // LEGS - SQUAT MACHINES
  "[Machine] Pendulum Squat": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] V-Squat": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Belt Squat": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Reverse Hack Squat (Glute Bias)": [
    { muscle: "legs", role: "PRIMARY" },
    { muscle: "back", role: "SECONDARY" }
  ],
  
  // LEGS - LEG PRESS VARIATIONS
  "[Machine] Vertical Leg Press": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Single Leg Press": [
    { muscle: "legs", role: "PRIMARY" },
    { muscle: "core", role: "SECONDARY" }
  ],
  
  // LEGS - HIP/GLUTE ISOLATION
  "[Machine] Hip Thrust Machine (Glute Drive)": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Hip Abduction Machine": [{ muscle: "legs", role: "PRIMARY" }],
  "[Machine] Hip Adduction Machine": [{ muscle: "legs", role: "PRIMARY" }],
  
  // LEGS - HAMSTRING MACHINES
  "[Machine] Standing Single Leg Curl": [{ muscle: "legs", role: "PRIMARY" }],
  
  // BACK - ROW VARIATIONS
  "[Machine] High Row (Upper Back Bias)": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "shoulders", role: "SECONDARY" }
  ],
  "[Machine] Low Row (Lat Bias)": [{ muscle: "back", role: "PRIMARY" }],
  "[Machine] Chest Supported T-Bar Row": [{ muscle: "back", role: "PRIMARY" }],
  "[Machine] Converging Row": [{ muscle: "back", role: "PRIMARY" }],
  "[Machine] Reverse Grip Row": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" }
  ],
  "[Machine] Single Arm Row Machine": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "core", role: "SECONDARY" }
  ],
  
  // BACK - PULLDOWN VARIATIONS
  "[Machine] Converging Lat Pulldown": [{ muscle: "back", role: "PRIMARY" }],
  "[Machine] Wide Grip Pulldown (Lat Width)": [{ muscle: "back", role: "PRIMARY" }],
  "[Machine] Close Neutral Grip Pulldown": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" }
  ],
  "[Machine] Reverse Grip Pulldown": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" }
  ],
  
  // BACK - SPECIALIZED MACHINES
  "[Machine] Pullover Machine (Nautilus)": [{ muscle: "back", role: "PRIMARY" }],
  "[Machine] Assisted Pull-Up Machine": [
    { muscle: "back", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" }
  ],
  
  // CHEST - PRESS VARIATIONS
  "[Machine] Decline Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" }
  ],
  "[Machine] Converging Incline Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "shoulders", role: "SECONDARY" }
  ],
  "[Machine] Wide Chest Press": [{ muscle: "chest", role: "PRIMARY" }],
  "[Machine] Close Grip Press Machine": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" }
  ],
  "[Machine] Unilateral Chest Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "core", role: "SECONDARY" }
  ],
  
  // CHEST - FLY VARIATIONS
  "[Machine] Pec Deck Fly": [{ muscle: "chest", role: "PRIMARY" }],
  "[Machine] Cable Crossover (High-to-Low)": [{ muscle: "chest", role: "PRIMARY" }],
  "[Machine] Cable Crossover (Low-to-High)": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "shoulders", role: "SECONDARY" }
  ],
  
  // SHOULDERS - ISOLATION
  "[Machine] Lateral Raise Machine": [{ muscle: "shoulders", role: "PRIMARY" }],
  "[Machine] Reverse Pec Deck (Rear Delt)": [{ muscle: "shoulders", role: "PRIMARY" }],
  "[Machine] Shoulder Press Machine": [
    { muscle: "shoulders", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" }
  ],
  
  // ARMS - ISOLATION
  "[Machine] Preacher Curl Machine": [{ muscle: "arms", role: "PRIMARY" }],
  "[Machine] Tricep Extension Machine": [{ muscle: "arms", role: "PRIMARY" }]

};

if (typeof window !== "undefined") {
  window.VOLUME_DISTRIBUTION = VOLUME_DISTRIBUTION;
  window.EXERCISE_TARGETS = EXERCISE_TARGETS;
}

const EXERCISES_LIBRARY = {
  chest: [
    {
      n: "[Barbell] Bench Press",
      t_r: "5-8",
      t_k: 60,
      vid: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
      bio: "Gold standard untuk total horizontal pressing power dan densitas otot pectoral.",
      note: "Gunakan leg drive (kaki menapak kuat). Turunkan bar ke arah sternum bawah/puting. Jaga siku agar tidak flaring 90 derajat untuk melindungi rotator cuff.",
    },
    {
      n: "[Barbell] Incline Bench Press",
      t_r: "6-8",
      t_k: 50,
      vid: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
      bio: "Target Clavicular Head (Dada Atas). Efektif untuk memperbaiki postur tubuh bagian depan.",
      note: "Set incline pada 30-45 derajat. Fokus pada kontrol bar saat turun (eccentric) hingga menyentuh dada bagian atas. Jangan biarkan bar memantul di dada.",
    },
    {
      n: "[DB] Flat Press",
      t_r: "8-10",
      t_k: 15,
      vid: "https://www.youtube.com/watch?v=VmB1G1K7v94",
      bio: "Optimal untuk stabilisasi bahu dan deteksi muscle imbalance antara sisi dominan dan non-dominan.",
      note: "Turunkan dumbbell selama 3 detik. Stretch dada maksimal di posisi bawah tanpa membiarkan bahu berotasi ke depan. Dorong eksplosif ke arah tengah.",
    },
    {
      n: "[DB] Incline Press",
      t_r: "10-12",
      t_k: 17.5,
      vid: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
      bio: "Memberikan Range of Motion (ROM) lebih dalam dibandingkan barbell press pada dada atas.",
      note: "Genggaman sedikit serong (semi-supinated) untuk kenyamanan sendi bahu. Rasakan tarikan pada otot dada atas sebelum mendorong kembali ke atas.",
    },
    {
      n: "[Machine] Chest Press",
      t_r: "10-12",
      t_k: 50,
      vid: "https://www.youtube.com/watch?v=NwzUje3z0qY",
      bio: "High stability pressing. Mengeliminasi kebutuhan stabilizer saat otot mulai mencapai failure teknis.",
      note: "Atur kursi agar handle sejajar tengah dada. Fokus pada dorongan murni dari dada, hindari penggunaan momentum tubuh. Jangan kunci siku sepenuhnya (soft-lock).",
    },
    {
      n: "[Cable] Fly",
      t_r: "12-15",
      t_k: 10,
      vid: "https://www.youtube.com/watch?v=Iwe6AmxVf7o",
      bio: "Constant tension sepanjang gerakan. Sangat baik untuk metabolic stress dan isolasi serat otot sternal.",
      note: "Buka tangan lebar dengan siku sedikit ditekuk (fixed angle). Bayangkan memeluk pohon besar. Squeeze (tekan) otot dada selama 1 detik di puncak kontraksi.",
    },
    {
      n: "[Machine] Incline Chest Press",
      t_r: "10-12",
      t_k: 40,
      vid: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
      bio: "Target Clavicular Head (Dada Atas). Memberikan stabilitas tinggi untuk overload progresif.",
      note: "Fokus 'squeeze' dada atas di puncak gerakan. Jangan mengunci siku sepenuhnya (soft lock) untuk menjaga tegangan pada otot.",
    },
    {
      n: "[Machine] Pec Deck Fly",
      t_r: "12-15",
      t_k: 35,
      vid: "https://www.youtube.com/watch?v=Z57CtFmRMxA",
      bio: "Isolasi dada murni tanpa melibatkan tricep. Mengoptimalkan serat otot sternal head.",
      note: "Siku sedikit ditekuk dan dikunci sudutnya. Bayangkan ingin mempertemukan kedua siku di depan dada untuk kontraksi maksimal.",
    },
    // ========================================
    // V26.5 EXPANSION - CHEST MACHINES
    // ========================================
    
    // PRESS VARIATIONS
    {
      n: "[Machine] Decline Press",
      t_r: "10-12",
      bio: "Decline angle (15-30°) shift emphasis ke sternal (lower) pectoralis. Reduced anterior deltoid involvement, increased power output potential.",
      note: "Lie pada decline bench, grip handles shoulder-width. Press dengan arc path (slight inward di atas). Lower dengan control ke chest level.<br><br>⚠️ CLINICAL: Shoulder-friendly angle untuk impingement history. May cause head rush jika decline terlalu steep - start moderat.",
      vid: ""
    },
    {
      n: "[Machine] Converging Incline Press",
      t_r: "10-12",
      bio: "Incline angle (30-45°) dengan converging arm path maximize clavicular (upper) pec activation. Natural pressing trajectory reduces shoulder strain.",
      note: "Duduk, back flush, feet flat. Handles start chest-width. Press dengan natural arc yang converge di atas. Control eccentric, no bounce.<br><br>⚠️ CLINICAL: Most shoulder-friendly incline press. Avoid overextension di lockout. Upper pec lagging indicator - prioritize ini.",
      vid: ""
    },
    {
      n: "[Machine] Wide Chest Press",
      t_r: "10-12",
      bio: "Wide grip dan arm path maximize pec stretch di bottom position. Outer pec fibers recruitment tinggi, tricep involvement minimal.",
      note: "Grip wide handles (1.5x shoulder width). Deepen stretch di eccentric tanpa shoulder pain. Press fokus ke pec contraction, not tricep lockout.<br><br>⚠️ CLINICAL: High shoulder stress di deep stretch - reduce ROM jika discomfort. Not for max strength - focus MMC (mind-muscle connection).",
      vid: ""
    },
    {
      n: "[Machine] Close Grip Press Machine",
      t_r: "10-12",
      bio: "Close grip shift emphasis ke inner pec dan significantly increase tricep involvement. Elbow-friendly press variation untuk high-volume work.",
      note: "Grip close (hands touching atau 6 inches apart). Press dengan elbow tucked close. Focus tricep lockout dengan pec squeeze. Control tempo.<br><br>⚠️ CLINICAL: High tricep demand - use sebagai compound arm work. Elbow-friendly alternative untuk skull crushers. Reduce weight vs wide press.",
      vid: ""
    },
    {
      n: "[Machine] Unilateral Chest Press",
      t_r: "12-15",
      bio: "Single arm pressing dengan anti-rotation core demand. Expose strength imbalances dan improve unilateral control.",
      note: "Satu handle per set. Brace core keras untuk prevent rotation. Press strict tanpa torso twist. Match reps/load kedua arm. Start weak side.<br><br>⚠️ CLINICAL: High core demand - proper bracing essential. Excellent untuk sport-specific training (throwing, punching). Start light untuk assess stability.",
      vid: ""
    },
    
    // FLY VARIATIONS
    {
      n: "[Machine] Pec Deck Fly",
      t_r: "12-15",
      bio: "Pure pec isolation dengan fixed elbow angle. Constant tension throughout ROM, minimal tricep atau deltoid involvement.",
      note: "Duduk tegak, back flush. Arm pads di forearms atau elbows. Squeeze handles bersama dengan pec contraction only. Hold peak 1 detik. Control return.<br><br>⚠️ CLINICAL: True isolation - zero tricep. May trigger pec cramps jika dehydrated. Breathe - don't hold breath di contraction. Stretch conservatively if shoulder issues.",
      vid: ""
    },
    {
      n: "[Machine] Cable Crossover (High-to-Low)",
      t_r: "12-15",
      bio: "High cable position dengan downward pull angle emphasize lower (sternal) pec fibers. Standing position allow natural scapular movement.",
      note: "Cables setinggi bahu atau lebih tinggi. Step forward, slight lean. Pull handles down dan together ke lower abdomen. Squeeze pec di midline, control return.<br><br>⚠️ CLINICAL: Excellent untuk lower pec development. Core stability critical - no excessive lean. Can replace decline work jika equipment limited.",
      vid: ""
    },
    {
      n: "[Machine] Cable Crossover (Low-to-High)",
      t_r: "12-15",
      bio: "Low cable position dengan upward pull angle emphasize upper (clavicular) pec fibers. Ideal finisher untuk upper chest lagging development.",
      note: "Cables setinggi lutut atau lebih rendah. Step forward, torso upright. Pull handles up dan together ke face level. Squeeze upper pec, control return.<br><br>⚠️ CLINICAL: Target upper chest yang biasanya undertrained. Light weight - focus contraction quality. Anterior deltoid will assist - normal.",
      vid: ""
    },
  ],

  back: [
    {
      n: "[Barbell] Deadlift",
      t_r: "3-5",
      t_k: 80,
      vid: "https://www.youtube.com/watch?v=op9kVnSso6Q",
      bio: "King of posterior chain. Membangun kekuatan absolut dan stabilitas spinal yang krusial bagi klinisi.",
      note: "Keep lats engaged (bayangkan menjepit ketiak). Drive hips forward eksplosif. Jaga neutral spine; jangan biarkan lower back melengkung (rounding) saat beban meninggalkan lantai.",
    },
    {
      n: "[Barbell] Row",
      t_r: "6-8",
      t_k: 50,
      vid: "https://www.youtube.com/watch?v=9efgcAjQe7E",
      bio: "Compound horizontal pull primer untuk ketebalan mid-back dan stabilitas core.",
      note: "Bent-over posisi 45-60 derajat. Tarik bar ke arah perut bawah (navel). Squeeze scapula di puncak dan kontrol fase eksentrik (saat menurunkan bar).",
    },
    {
      n: "[DB] One Arm Row",
      t_r: "8-10",
      t_k: 22.5,
      vid: "https://www.youtube.com/watch?v=pYcpY20QaE8",
      bio: "Unilateral movement untuk memperbaiki ketimpangan kekuatan dan meningkatkan Range of Motion (ROM).",
      note: "Tarik dumbbell melengkung ke arah pinggul (Hip), bukan lurus ke atas. Ini memastikan aktivasi Lats bawah lebih optimal dan mengurangi dominasi bicep.",
    },
    {
      n: "[Cable] Lat Pulldown (Wide)",
      t_r: "10-12",
      t_k: 55,
      vid: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
      bio: "Vertical pull utama untuk membangun lebar punggung (V-Taper) tanpa beban kompresi pada tulang belakang.",
      note: "Tarik bar ke arah dada atas (clavicula). Bayangkan siku ingin dimasukkan ke saku celana belakang. Hindari menggunakan momentum tubuh yang berlebihan.",
    },
    {
      n: "[Cable] Seated Row",
      t_r: "10-12",
      t_k: 50,
      vid: "https://www.youtube.com/watch?v=GZbfZ033f74",
      bio: "Fokus pada Mid-Trap dan Rhomboids. Memberikan tegangan konstan yang aman untuk sendi bahu.",
      note: "Duduk tegak, lutut sedikit ditekuk. Inisiasi gerakan dengan menarik belikat ke belakang, baru tekuk siku. Rasakan full stretch pada otot punggung saat posisi awal.",
    },
    {
      n: "[Machine] Row",
      t_r: "10-12",
      t_k: 45,
      vid: "https://www.youtube.com/watch?v=NwzUje3z0qY",
      bio: "Isolasi punggung dengan stabilitas maksimal. Mengeliminasi penggunaan lower back (Lumbal) saat kelelahan.",
      note: "Gunakan chest support. Tarik handle dengan siku tetap dekat dengan tubuh. Fokus pada kontraksi punggung tengah tanpa bantuan ayunan badan.",
    },
    {
      n: "[Cable] Face Pull",
      t_r: "15-20",
      t_k: 15,
      vid: "https://www.youtube.com/watch?v=rep-qVOkqgk",
      bio: "Korektif postur. Esensial untuk Rear Delt dan kesehatan Rotator Cuff bagi praktisi medis.",
      note: "Tarik rope ke arah dahi. Di puncak gerakan, pastikan posisi jempol menghadap ke belakang (external rotation). Squeeze otot bahu belakang selama 1 detik.",
    },
    // ========================================
    // V26.5 EXPANSION - BACK MACHINES
    // ========================================
    
    // ROW VARIATIONS
    {
      n: "[Machine] High Row (Upper Back Bias)",
      t_r: "10-12",
      bio: "Pull angle tinggi dengan arm path yang parallel lantai, maximize trap activation dan rhomboid recruitment. Posterior deltoid sebagai synergist kuat.",
      note: "Duduk tegak, chest up. Pull handle ke sternum atas dengan high elbow position. Retract scapula maksimal, squeeze 1 detik di peak contraction.<br><br>⚠️ CLINICAL: Excellent untuk posture correction (kyphosis). Avoid shrugging - depress scapula dulu sebelum row.",
      vid: ""
    },
    {
      n: "[Machine] Low Row (Lat Bias)",
      t_r: "10-12",
      bio: "Pull angle rendah dengan torso slight forward lean, maximize latissimus dorsi stretch dan activation. Teres major dan lower trap sebagai synergist.",
      note: "Duduk, slight forward lean dari hip. Pull handle ke lower abdomen dengan elbow close to body. Focus lat stretch di eccentric, squeeze lat di concentric.<br><br>⚠️ CLINICAL: Jaga neutral spine - no rounding. Reduce weight jika lower back pump excessive. Ideal untuk lat width development.",
      vid: ""
    },
    {
      n: "[Machine] Chest Supported T-Bar Row",
      t_r: "10-12",
      bio: "Chest pad eliminates torso motion dan momentum, forcing strict back contraction. Mid-back thickness builder dengan constant tension.",
      note: "Chest flush di pad, grip handles. Pull dengan scapular retraction first, kemudian elbow pull. Jangan lift chest dari pad.<br><br>⚠️ CLINICAL: Zero spinal load - safe untuk lower back issues. Dapat trigger upper back pump/cramp - hydrate well.",
      vid: ""
    },
    {
      n: "[Machine] Converging Row",
      t_r: "10-12",
      bio: "Independent arm path yang allow natural scapular movement dan unilateral focus. Expose dan correct strength imbalances.",
      note: "Start dengan weak arm. Pull dengan natural arc motion. Each arm moves independently - no compensation. Match ROM dan tempo kedua arm.<br><br>⚠️ CLINICAL: Excellent untuk imbalance correction post-injury. Start bilateral, progress ke alternating reps.",
      vid: ""
    },
    {
      n: "[Machine] Reverse Grip Row",
      t_r: "10-12",
      bio: "Underhand grip mengubah angle of pull ke lower lat dan increase bicep involvement. Lebih comfortable untuk shoulder terbatas ROM.",
      note: "Grip underhand, pull ke lower chest. Elbow stay close. Focus pada lat contraction, biceps adalah bonus. Control eccentric.<br><br>⚠️ CLINICAL: Reduce weight vs standard row - biceps akan fatigue first. Good alternative jika shoulder discomfort dengan pronated grip.",
      vid: ""
    },
    {
      n: "[Machine] Single Arm Row Machine",
      t_r: "12-15",
      bio: "Unilateral row dengan anti-rotation demand on core. Maximum focus dan contraction per side, identify weak links.",
      note: "Satu tangan pada handle, satu tangan brace di frame. Strict pull tanpa torso rotation. Pause di peak contraction. Switch sides, match reps/load.<br><br>⚠️ CLINICAL: High core demand - ensure proper bracing. Excellent untuk rehab rotator cuff (stable environment). Start light.",
      vid: ""
    },
    
    // PULLDOWN VARIATIONS
    {
      n: "[Machine] Converging Lat Pulldown",
      t_r: "10-12",
      bio: "Independent arm path dengan converging trajectory yang mimic natural scapular downward rotation. Superior lat activation vs straight bar.",
      note: "Grip handles, sit dengan thighs secured. Pull dengan lat initiation, bring elbows down dan back. Squeeze lat di bottom, control return.<br><br>⚠️ CLINICAL: More shoulder-friendly than straight bar. Good untuk shoulder impingement history. Focus lat, not arms.",
      vid: ""
    },
    {
      n: "[Machine] Wide Grip Pulldown (Lat Width)",
      t_r: "10-12",
      bio: "Wide grip dengan vertical pull angle maximize lat width activation. Upper lat fibers (near teres) recruit heavily. Bicep involvement minimal.",
      note: "Grip wide (1.5x shoulder width). Pull bar ke upper chest dengan vertical elbow path. Depress scapula, arch upper back slightly. Control eccentric.<br><br>⚠️ CLINICAL: Reduced ROM vs narrow grip - normal. Avoid excessive lean back (>15°). May aggravate shoulder impingement - adjust width if pain.",
      vid: ""
    },
    {
      n: "[Machine] Close Neutral Grip Pulldown",
      t_r: "10-12",
      bio: "Close neutral grip dengan elbows close position maximize lat thickness (mid-back) dan lower lat activation. Bicep assistance lebih tinggi.",
      note: "Grip neutral handle close. Pull ke lower chest dengan elbows tucked. Focus stretch di atas, full contraction di bottom. Squeeze hard.<br><br>⚠️ CLINICAL: Most shoulder-friendly pulldown variant. Ideal untuk building pull-up strength. Heavy bicep involvement - consider arm fatigue.",
      vid: ""
    },
    {
      n: "[Machine] Reverse Grip Pulldown",
      t_r: "10-12",
      bio: "Underhand grip shift emphasis ke lower lat dan significantly increase bicep recruitment. Comfortable alternative untuk shoulder mobility terbatas.",
      note: "Grip underhand shoulder width. Pull ke upper chest. Elbows down dan slightly forward. Lead dengan lat, bicep follows. Pause di contraction.<br><br>⚠️ CLINICAL: High bicep demand - may fatigue before lats. Good preparation untuk chin-ups. Wrist-friendly grip.",
      vid: ""
    },
    
    // SPECIALIZED MACHINES
    {
      n: "[Machine] Pullover Machine (Nautilus)",
      t_r: "12-15",
      bio: "Pure lat isolation tanpa bicep involvement. Fixed elbow position dengan rotational arm path yang maximize lat stretch dan contraction.",
      note: "Duduk, seat adjusted sehingga shoulder axis sejajar pivot. Push arm pad dengan elbow, bukan hands. Full ROM dari stretch ke chest level.<br><br>⚠️ CLINICAL: Zero bicep involvement - true lat isolation. May trigger lat cramps jika dehydrated. Breathe through ROM - don't hold breath.",
      vid: ""
    },
    {
      n: "[Machine] Assisted Pull-Up Machine",
      t_r: "8-12",
      bio: "Counterbalance bodyweight untuk progressive overload path menuju unassisted pull-ups. Maintain natural scapular dan glenohumeral movement patterns.",
      note: "Kneel pada platform, grip pull-up bar. Assistance settings support sebagian bodyweight. Pull dengan lat initiation hingga chin clears bar. Control descent.<br><br>⚠️ CLINICAL: Excellent untuk building pull-up strength progressively. Reduce assistance incrementally. Core bracing critical - avoid swinging.",
      vid: ""
    },
  ],

  shoulders: [
    {
      n: "[Barbell] Overhead Press",
      t_r: "6-8",
      t_k: 30,
      vid: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
      bio: "Membangun kekuatan bahu murni dan stabilitas core. Sangat efektif untuk fungsionalitas tubuh bagian atas.",
      note: "Genggaman sedikit lebih lebar dari bahu. Mundurkan dagu (double chin) saat bar naik agar tidak terbentur. Kunci core dan bokong untuk menjaga stabilitas lumbal.",
    },
    {
      n: "[DB] Shoulder Press",
      t_r: "8-10",
      t_k: 15,
      vid: "https://www.youtube.com/watch?v=qEwKCR5JCog",
      bio: "Melatih stabilizer bahu secara mandiri. Mengurangi risiko kompensasi antar sisi tubuh.",
      note: "Siku masuk 45 derajat (Scapular Plane), jangan melebar 90 derajat (T-Pose) untuk melindungi rotator cuff. Dorong dumbbell hingga hampir bersentuhan di puncak gerakan.",
    },
    {
      n: "[Machine] Smith Machine Shoulder Press",
      t_r: "8-10",
      t_k: 40,
      vid: "https://www.youtube.com/watch?v=WvLMauqrnK8",
      bio: "Fixed path press. Memungkinkan fokus maksimal pada overload beban tanpa hambatan stabilitas.",
      note: "Posisi bangku harus tepat di bawah bar. Fokus pada dorongan eksplosif ke atas dan kontrol penuh saat menurunkan bar ke setinggi dagu.",
    },
    {
      n: "[DB] Lateral Raise",
      t_r: "15-20",
      t_k: 6,
      vid: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
      bio: "Target utama Lateral Delt untuk memberikan lebar bahu (shoulder width).",
      note: "Strict form wajib. Angkat beban sedikit ke depan (Scapular Plane). Pastikan posisi kelengkeng sedikit lebih tinggi dari jempol di puncak gerakan. Jangan mengayun badan.",
    },
    {
      n: "[Cable] Lateral Raise",
      t_r: "15-20",
      t_k: 5,
      vid: "https://www.youtube.com/watch?v=PzmHZSqw4H4",
      bio: "Memberikan tegangan konstan (Constant Tension) di seluruh rentang gerak, terutama di posisi otot memanjang.",
      note: "Kabel setinggi lutut atau bawah. Silangkan kabel di belakang badan untuk stretch maksimal. Kontrol fase negatif (saat tangan turun) secara perlahan.",
    },
    {
      n: "[Machine] Shoulder Press",
      t_r: "10-12",
      t_k: 27.5,
      vid: "https://www.youtube.com/watch?v=WvLMauqrnK8",
      bio: "Isolasi Anterior Delt dengan risiko cedera minimal. Cocok untuk hipertrofi di akhir sesi.",
      note: "Pastikan punggung menempel rapat pada sandaran. Dorong ke atas dan bayangkan kepala sedikit maju 'melalui jendela' tangan di posisi puncak gerakan.",
    },
    {
      n: "[Machine] Reverse Pec Deck",
      t_r: "12-15",
      t_k: 25,
      vid: "https://www.youtube.com/watch?v=rep-qVOkqgk",
      bio: "Target Rear Delt dan Trapezius tengah. Krusial untuk menyeimbangkan postur bahu yang condong ke depan.",
      note: "Jangan menggenggam handle terlalu kuat; gunakan telapak tangan untuk mendorong. Squeeze belikat (scapula) di puncak kontraksi dan tahan selama 1 detik.",
    },
    // ========================================
    // V26.5 EXPANSION - SHOULDER MACHINES
    // ========================================
    
    {
      n: "[Machine] Lateral Raise Machine",
      t_r: "12-15",
      bio: "Pure medial deltoid isolation dengan arm path yang fixed dan resistance curve optimized. Eliminates momentum dan force strict contraction.",
      note: "Duduk, arm pads di forearms tepat bawah elbow. Raise arms ke shoulder level (90°), no higher untuk minimize trap involvement. Control descent, maintain tension.<br><br>⚠️ CLINICAL: True isolation - no cheating possible. Start light - weight feels heavier than dumbbell laterals. May trigger delt cramp - pace sets properly.",
      vid: ""
    },
    {
      n: "[Machine] Reverse Pec Deck (Rear Delt)",
      t_r: "12-15",
      bio: "Isolated posterior deltoid dengan chest support yang eliminate torso motion. Arm path yang optimize rear delt stretch dan contraction.",
      note: "Chest ke pad, grip handles dengan arms extended. Pull elbows back dengan scapular retraction, focus rear delt squeeze. Control return tanpa let pads touch.<br><br>⚠️ CLINICAL: Essential untuk shoulder health dan posture. Undertrained muscle - prioritize ini. Reduce weight untuk feel muscle, not move weight.",
      vid: ""
    },
    {
      n: "[Machine] Shoulder Press Machine",
      t_r: "8-12",
      bio: "Fixed pressing path dengan back support yang stabilize torso. Allow heavier loading dengan reduced injury risk vs free weight overhead press.",
      note: "Duduk tegak, back flush, feet flat. Handles start ear level. Press overhead tanpa overextension lumbar. Control descent, no bounce.<br><br>⚠️ CLINICAL: Safer than standing press untuk shoulder issues. Full ROM jika tolerated - reduce jika impingement symptoms. Core bracing still important.",
      vid: ""
    },
  ],

  arms: [
    {
      n: "[Barbell] Curl",
      t_r: "8-10",
      t_k: 25,
      vid: "https://www.youtube.com/watch?v=lyn7kj8v_XU",
      bio: "Membangun massa bicep keseluruhan. Penggunaan EZ-Bar direkomendasikan untuk mengurangi tekanan pada pergelangan tangan.",
      note: "Kunci siku di samping rusuk. Hindari ayunan pinggang (ego lifting). Fokus pada kontraksi puncak dan turunkan beban secara terkontrol selama 2-3 detik.",
    },
    {
      n: "[DB] Curl",
      t_r: "10-12",
      t_k: 10,
      vid: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
      bio: "Memungkinkan supinasi pergelangan tangan yang optimal untuk aktivasi bicep puncak.",
      note: "Mulai dengan telapak tangan menghadap paha, putar ke arah langit-langit saat mengangkat. Pastikan rentang gerak penuh (Full ROM) dari bawah hingga ke atas.",
    },
    {
      n: "[Cable] Curl",
      t_r: "12-15",
      t_k: 15,
      vid: "https://www.youtube.com/watch?v=AsAVbBko26w",
      bio: "Menjaga tegangan konstan (Constant Tension) bahkan pada posisi tangan di bawah.",
      note: "Berdiri tegak, dada membusung. Tarik handle dengan siku tetap diam. Sangat efektif untuk memicu metabolic stress (pump) di akhir latihan bicep.",
    },
    {
      n: "[Machine] Bicep Machine",
      t_r: "10-12",
      t_k: 20,
      vid: "https://www.youtube.com/watch?v=3-E03p7YhS0",
      bio: "Isolasi bicep murni dengan meniadakan bantuan otot bahu dan core.",
      note: "Pastikan ketiak menempel pada bantalan. Fokus pada 'squeeze' maksimal di puncak gerakan. Jangan biarkan beban membentur tumpukan saat fase turun.",
    },
    {
      n: "[Barbell] Close-Grip Bench Press",
      t_r: "6-8",
      t_k: 40,
      vid: "https://www.youtube.com/watch?v=vX_Xp_6Xm0M",
      bio: "Gerakan compound utama untuk tricep lateral dan medial head.",
      note: "Genggaman setinggi bahu (jangan terlalu sempit untuk menjaga kesehatan pergelangan tangan). Siku tetap rapat ke arah rusuk (tucked) saat bar turun ke dada tengah.",
    },
    {
      n: "[DB] Skullcrusher",
      t_r: "10-12",
      t_k: 8,
      vid: "https://www.youtube.com/watch?v=d_KZxkY_0cM",
      bio: "Menargetkan Long Head Tricep melalui posisi stretch di belakang kepala.",
      note: "Turunkan dumbbell ke arah samping dahi atau sedikit ke belakang kepala. Jaga siku agar tetap menunjuk ke langit-langit, jangan biarkan siku melebar ke samping.",
    },
    {
      n: "[Cable] Overhead Tricep Extension",
      t_r: "12-15",
      t_k: 12.5,
      vid: "https://www.youtube.com/watch?v=nRiJVZDpdL0",
      bio: "Memberikan stretch maksimal pada Long Head Tricep dalam posisi overhead.",
      note: "Condongkan badan sedikit ke depan dan aktifkan core. Ekstensi lengan sepenuhnya di depan dahi. Pastikan siku tidak 'flaring' atau melebar terlalu jauh.",
    },
    {
      n: "[Cable] Tricep Pushdown (Rope)",
      t_r: "12-15",
      t_k: 15,
      vid: "https://www.youtube.com/watch?v=vB5OHsJ3EME",
      bio: "Fokus Metabolic Stress (Burn).",
      note: "Kunci siku di rusuk. Buka tali (spread) di bawah untuk lateral head.",
    },
    {
      n: "[DB] Incline Curl",
      t_r: "12-15",
      t_k: 8,
      vid: "https://www.youtube.com/watch?v=soxrZlIl35U",
      bio: "Posisi stretch untuk Long Head Bicep.",
      note: "Siku tetap di belakang badan saat curl. Jangan mengayun bahu.",
    },
    {
      n: "[Barbell] Skullcrushers (EZ Bar)",
      t_r: "10-12",
      t_k: 15,
      vid: "https://www.youtube.com/watch?v=d_KZxkY_0cM",
      bio: "Target Long Head Tricep.",
      note: "Turunkan bar ke arah ubun-ubun. Siku menunjuk ke langit-langit.",
    },
    {
      n: "[DB] Hammer Curl",
      t_r: "10-12",
      t_k: 10,
      vid: "https://www.youtube.com/watch?v=zC3nLlEvin4",
      bio: "Target Brachialis (Ketebalan samping).",
      note: "Genggaman netral (palu). Curl lurus ke arah bahu.",
    },
    {
      n: "[Cable] Bayesian Curl",
      t_r: "12-15",
      t_k: 10,
      vid: "https://www.youtube.com/watch?v=4sW5W7h_jG0",
      bio: "Tegangan maksimal saat stretch.",
      note: "Membelakangi kabel. Biarkan tangan tertarik ke belakang, lalu curl.",
    },
    // ========================================
    // V26.5 EXPANSION - ARM MACHINES
    // ========================================
    
    {
      n: "[Machine] Preacher Curl Machine",
      t_r: "12-15",
      bio: "Arm pad isolate biceps dengan elimination total body momentum. Fixed elbow position force strict contraction tanpa shoulder involvement.",
      note: "Duduk, upper arm flush di pad dengan armpit di ujung atas pad. Curl dengan bicep contraction only. Lower dengan control, maintain tension di bottom - don't fully extend.<br><br>⚠️ CLINICAL: True isolation - can't cheat. May trigger bicep cramps easily - hydration critical. Elbow-friendly jika form strict.",
      vid: ""
    },
    {
      n: "[Machine] Tricep Extension Machine",
      t_r: "12-15",
      bio: "Overhead position dengan elbow fixed pre-stretch tricep long head. Isolated elbow extension tanpa shoulder movement.",
      note: "Duduk atau berdiri, elbow pads fixed. Extend arms dengan tricep contraction hingga lockout. Control return tanpa let weight stack touch - constant tension.<br><br>⚠️ CLINICAL: Excellent long head developer. Start light - long head stretch intense. Elbow pain indicator untuk reduce ROM atau weight.",
      vid: ""
    },
  ],

  legs: [
    {
      n: "[Barbell] Squat",
      t_r: "6-10",
      t_k: 60,
      vid: "https://www.youtube.com/watch?v=gcNh17Ckjgg",
      bio: "Raja dari semua latihan lower body. Membangun kekuatan sistemik dan stabilitas core.",
      note: "Chest up, knee tracking mengikuti arah jari kaki. Turun sedalam mungkin selama punggung bawah tidak melengkung (butt wink). Inhale di atas, tahan brace saat turun.",
    },
    {
      n: "[Barbell] Front Squat",
      t_r: "6-8",
      t_k: 40,
      vid: "https://www.youtube.com/watch?v=vX_Xp_6Xm0M",
      bio: "Variasi dominan Quadriceps dengan torso yang lebih tegak. Mengurangi beban kompresi pada lumbal.",
      note: "Barbell diletakkan di deltoid depan. Siku harus tetap tinggi sepanjang gerakan agar bar tidak merosot. Fokus pada kedalaman squat (ATG).",
    },
    {
      n: "[Machine] Leg Press (Quad Bias)",
      t_r: "8-12",
      t_k: 120,
      vid: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
      bio: "Isolasi lower body dengan stabilitas maksimal. Posisi kaki rendah pada platform meningkatkan aktivasi Quads.",
      note: "Posisi kaki di bagian bawah platform. Turunkan beban secara perlahan hingga lutut mendekati dada. JANGAN mengunci lutut (hyperextend) di posisi atas.",
    },
    {
      n: "[Machine] Hack Squat",
      t_r: "10-12",
      t_k: 100,
      vid: "https://www.youtube.com/watch?v=0tn5K9NlCfo",
      bio: "Alat terbaik untuk hipertrofi Quads karena stabilitas punggung yang absolut.",
      note: "Turun pelan 3 detik. Pastikan seluruh punggung menempel rapat di sandaran. Fokus pada dorongan melalui mid-foot dan tumit.",
    },
    {
      n: "[DB] Goblet Squat",
      t_r: "10-12",
      t_k: 25,
      vid: "https://www.youtube.com/watch?v=MeIiIdhvXT4",
      bio: "Sangat baik untuk pemanasan atau melatih pola squat yang benar dengan beban di depan (counter-balance).",
      note: "Pegang dumbbell secara vertikal di depan dada. Siku harus masuk di antara lutut saat berada di posisi bawah. Jaga punggung tetap tegak.",
    },
    {
      n: "[Machine] Leg Press (Glute Bias)",
      t_r: "12-15",
      t_k: 130,
      vid: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
      bio: "Variasi untuk menargetkan rantai posterior (Glutes & Hams) menggunakan mesin leg press.",
      note: "Tempatkan kaki di bagian paling ATAS platform dengan jarak lebar. Dorong dengan tumit untuk memaksimalkan aktivasi gluteus.",
    },
    {
      n: "[Barbell] RDL",
      t_r: "8-10",
      t_k: 70,
      vid: "https://www.youtube.com/watch?v=JCXUYuzwNrM",
      bio: "Raja posterior chain. Fokus pada hip-hinge.",
      note: "Lutut 'soft lock'. Dorong pinggul ke belakang. Barbell menempel paha.",
    },
    {
      n: "[Machine] Leg Press (Glute Bias)",
      t_r: "10-12",
      t_k: 120,
      vid: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
      bio: "Kaki tinggi di platform = Dominan Glute/Hams.",
      note: "Dorong dengan tumit. Jangan kunci lutut di posisi atas.",
    },
    {
      n: "[Machine] Lying Leg Curl",
      t_r: "10-12",
      t_k: 40,
      vid: "https://www.youtube.com/watch?v=1Tq3QdYUuHs",
      bio: "Pre-exhaust hamstring. Fokus pada kontraksi puncak.",
      note: "Tekan pinggul ke pad. Kontraksi 1 detik, turun pelan 3 detik.",
    },
    {
      n: "[Machine] Seated Calf Raise",
      t_r: "15-20",
      t_k: 35,
      vid: "https://www.youtube.com/watch?v=JbyjNymZOt0",
      bio: "Target Soleus (otot betis dalam/lebar).",
      note: "Full ROM. Pause di bawah untuk menghilangkan refleks regangan.",
    },
    {
      n: "[DB] Forward Lunge",
      t_r: "10-12",
      t_k: 12.5,
      vid: "https://www.youtube.com/watch?v=c2nRGEpDe6g",
      bio: "Deselerasi beban tubuh. Dominan Quads.",
      note: "Punggung tegak lurus. Dorong balik eksplosif dengan kaki depan.",
    },
    {
      n: "[Machine] Leg Extension",
      t_r: "12-15",
      t_k: 45,
      vid: "https://www.youtube.com/watch?v=YyvSfVjQeL0",
      bio: "Isolasi Rectus Femoris secara maksimal.",
      note: "Wajib pause 1 detik di posisi kaki lurus. No momentum.",
    },
    {
      n: "[Machine] Smith Machine Squat",
      t_r: "10-12",
      t_k: 60,
      vid: "https://www.youtube.com/watch?v=2eAAeT4pYYY",
      bio: "Lintasan vertikal fix. Fokus paha depan.",
      note: "Kaki sedikit di depan bar (menyandar). Matikan glutes.",
    },
    {
      n: "[DB] Bulgarian Split Squat",
      t_r: "8-10",
      t_k: 12.5,
      vid: "https://www.youtube.com/watch?v=2C-uNgKwPLE",
      bio: "Unilateral Glute Builder.",
      note: "Condongkan torso ke depan. Turun dalam. Lutut harus stabil.",
    },
    {
      n: "[Machine] Seated Leg Curl",
      t_r: "12-15",
      t_k: 35,
      vid: "https://www.youtube.com/watch?v=F488k67BTNo",
      bio: "Positioning stretch hamstring lebih baik.",
      note: "Kunci paha seerat mungkin. Pantat jangan terangkat.",
    },

// ========================================
    // V26.5 EXPANSION - LEG MACHINES
    // ========================================
    
    // SQUAT MACHINES
    {
      n: "[Machine] Pendulum Squat",
      t_r: "8-12",
      bio: "Kurva resistensi unik dengan jalur arc yang meminimalisir tekanan pada lumbar spine namun memberikan overload maksimal pada quadriceps. Resistance meningkat seiring depth.",
      note: "Kaki selebar bahu di tengah platform. Turun sedalam mungkin (ATG) dengan kontrol. Dorong melalui mid-foot. Jaga torso tetap upright.<br><br>⚠️ CLINICAL: Ideal untuk lifter dengan riwayat lower back issues. Hindari jika nyeri hip impingement saat squat dalam.",
      vid: ""
    },
    {
      n: "[Machine] V-Squat",
      t_r: "8-12",
      bio: "Fixed path squat dengan shoulder pad yang mendistribusikan load secara vertikal. Memberikan stimulus seimbang antara quadriceps dan glutes dengan tekanan spinal minimal.",
      note: "Posisi kaki natural, sedikit toe-out. Turun hingga femur sejajar lantai atau lebih dalam jika ROM memungkinkan. Dorong dengan tumit.<br><br>⚠️ CLINICAL: Kurangi ROM jika terjadi butt wink atau nyeri SI joint. Alternatif aman untuk back squat.",
      vid: ""
    },
    {
      n: "[Machine] Hack Squat",
      t_r: "10-15",
      bio: "Jalur tetap dengan back support yang mengunci torso, memaksa quadriceps bekerja tanpa kompensasi dari posterior chain. Knee flexion ekstrem pada bottom position.",
      note: "Kaki di bagian tengah-bawah platform, selebar bahu. Turun hingga hamstring menyentuh calf. Jangan lock out sepenuhnya di atas untuk maintain tension.<br><br>⚠️ CLINICAL: High knee stress - hindari jika patellofemoral pain syndrome (PFPS). Start dengan ROM terbatas jika baru pulih dari knee injury.",
      vid: ""
    },
    {
      n: "[Machine] Belt Squat",
      t_r: "10-15",
      bio: "Load digantung pada belt di pinggul, menghilangkan seluruh kompresi aksial pada spine. Pure lower body movement tanpa upper body fatigue atau spinal loading.",
      note: "Belt di ASIS (hip bone). Stance natural. Squat depth sesuai mobility. Cocok untuk high-volume work tanpa CNS fatigue.<br><br>⚠️ CLINICAL: Gold standard untuk training saat upper body injury atau rehab lower back. Tidak ada kontraindikasi spinal.",
      vid: ""
    },
    {
      n: "[Machine] Reverse Hack Squat (Glute Bias)",
      t_r: "10-15",
      bio: "Menghadap mesin dengan torso condong ke depan, mengubah moment arm sehingga hip extension menjadi dominan. Glute dan hamstring activation tinggi, quadriceps sekunder.",
      note: "Kaki sedikit lebih lebar dari bahu, stance tinggi pada platform. Turun dengan hip hinge pattern. Dorong melalui tumit dengan glute squeeze di atas.<br><br>⚠️ CLINICAL: Lebih aman untuk lutut daripada hack squat standard. Bisa trigger lower back pump - jaga netral spine.",
      vid: ""
    },
    
    // LEG PRESS VARIATIONS
    {
      n: "[Machine] Leg Press (Quad Bias/Low Stance)",
      t_r: "10-15",
      bio: "Foot placement rendah pada platform meningkatkan knee flexion angle dan mengurangi hip involvement. Quadriceps overload dengan minimal glute recruitment.",
      note: "Kaki di bagian bawah platform, selebar bahu atau sedikit lebih sempit. Turun hingga lutut hampir menyentuh dada (knee angle <90°). Dorong dengan mid-foot.<br><br>⚠️ CLINICAL: Extreme knee flexion - monitor patella tracking. Hindari jika nyeri anterior knee. Mulai dengan ROM konservatif.",
      vid: ""
    },
    {
      n: "[Machine] Leg Press (Glute Bias/High Stance)",
      t_r: "10-15",
      bio: "Foot placement tinggi pada platform mengurangi knee flexion dan meningkatkan hip extension ROM. Glutes dan hamstrings menjadi prime movers.",
      note: "Kaki di ujung atas platform, stance lebar dengan slight toe-out. Turun dalam hingga stretch maksimal di glutes. Dorong eksplosif dengan tumit.<br><br>⚠️ CLINICAL: Kurangi depth jika butt wink atau SI joint discomfort. Ideal untuk glute hypertrophy tanpa spinal load.",
      vid: ""
    },
    {
      n: "[Machine] Vertical Leg Press",
      t_r: "12-15",
      bio: "Platform bergerak vertikal melawan gravitasi penuh. Resistance curve constant dengan ROM terbatas, cocok untuk metabolic stress dan pump work.",
      note: "Kaki di tengah platform. Kontrol eccentric dengan strict form - jangan bounce di bottom. Maintain constant tension, jangan lock out.<br><br>⚠️ CLINICAL: Lower back harus flat di pad - jika mengangkat, reduce ROM. Tidak cocok untuk low rep strength work.",
      vid: ""
    },
    {
      n: "[Machine] Single Leg Press",
      t_r: "12-15",
      bio: "Unilateral movement yang expose strength imbalances dan meningkatkan core stabilization demand. Quad, glute, dan hamstring activation tergantung foot placement.",
      note: "Mulai dengan leg yang lebih lemah. Kaki di tengah platform. Kontrol strict - no hip shift atau torso rotation. Match reps/load kedua leg.<br><br>⚠️ CLINICAL: Excellent untuk rehab ACL atau muscle imbalance. Start light untuk assess stability. Core bracing penting.",
      vid: ""
    },
    
    // HIP/GLUTE ISOLATION
    {
      n: "[Machine] Hip Thrust Machine (Glute Drive)",
      t_r: "12-15",
      bio: "Isolated hip extension dengan back support dan foot platform yang optimize glute activation. Peak contraction di full hip extension (lockout).",
      note: "Punggung di pad, kaki di platform selebar pinggul. Dorong hingga full hip extension dengan posterior pelvic tilt. Squeeze glutes maksimal di atas, hold 1 detik.<br><br>⚠️ CLINICAL: Tidak ada spinal load. Ideal untuk glute hypertrophy dan rehab. Hindari overextension lumbar di lockout.",
      vid: ""
    },
    {
      n: "[Machine] Hip Abduction Machine",
      t_r: "15-20",
      bio: "Isolated hip abduction menargetkan gluteus medius dan minimus. Stabilizer penting untuk knee health dan hip stability.",
      note: "Duduk tegak, back flush dengan pad. Dorong knee pads keluar melawan resistance dengan kontrol. Pause di peak abduction 1-2 detik.<br><br>⚠️ CLINICAL: Essential untuk knee valgus correction dan IT band syndrome rehab. Avoid momentum - strict controlled reps only.",
      vid: ""
    },
    {
      n: "[Machine] Hip Adduction Machine",
      t_r: "15-20",
      bio: "Isolated hip adduction menargetkan adductor group (magnus, longus, brevis). Penting untuk pelvic stability dan athletic movement.",
      note: "Duduk tegak, buka leg pads maksimal untuk pre-stretch. Squeeze knee pads bersama dengan kontrol. Pause di peak contraction.<br><br>⚠️ CLINICAL: Start light - adductors prone to strain. Excellent untuk groin injury prevention. Warm up properly.",
      vid: ""
    },
    
    // HAMSTRING MACHINES
    {
      n: "[Machine] Lying Leg Curl",
      t_r: "12-15",
      bio: "Prone position dengan hip extended, isolated knee flexion menargetkan hamstrings tanpa gluteal involvement. Standard hamstring isolation movement.",
      note: "Tengkurap, ankle pad di achilles. Curl hingga hamstring fully contracted (heel ke glute). Lower dengan kontrol, jangan lock knee di bottom.<br><br>⚠️ CLINICAL: Monitor lower back - jangan overarch saat curl. Cramp indicator untuk dehydration atau electrolyte imbalance.",
      vid: ""
    },
    {
      n: "[Machine] Seated Leg Curl",
      t_r: "12-15",
      bio: "Hip flexed position pre-stretch hamstrings, increasing peak activation. Lebih sulit dari lying variant karena starting tension lebih tinggi.",
      note: "Duduk, thigh pad di lap, ankle pad di achilles. Curl dengan explosive tapi kontrol. Resist eccentric phase - jangan drop weight.<br><br>⚠️ CLINICAL: Lebih intense stretch - reduce ROM jika hamstring strain history. Excellent untuk eccentric strengthening.",
      vid: ""
    },
    {
      n: "[Machine] Standing Single Leg Curl",
      t_r: "12-15",
      bio: "Unilateral hamstring isolation dengan stability demand. Expose bilateral strength discrepancies dan improve balance.",
      note: "Berdiri satu kaki, pegang handle untuk balance. Curl working leg dengan strict control - no hip flexion atau torso lean. Match reps kedua leg.<br><br>⚠️ CLINICAL: Start light untuk assess stability. Good untuk post-injury return to function. Core bracing critical.",
      vid: ""
    },

  ],

  core: [
    {
      n: "[Bodyweight] Plank",
      t_r: "45-60s",
      bio: "Standard plank hold, brace core seperti akan dipukul, keep hips neutral.",
    },
    {
      n: "[Bodyweight] Deadbug",
      t_r: "12-15",
      bio: "Deadbug supine, lower back melekat lantai, opposite arm-leg extension.",
    },
    {
      n: "[Bodyweight] Side Plank",
      t_r: "30-45s",
      bio: "Side plank, lift hips tinggi, garis lurus dari kepala ke kaki, oblique brace.",
    },
    {
      n: "[Cable] Woodchop",
      t_r: "12-15",
      bio: "Cable anti-rotation woodchop, rotate & extend, core stability dengan dynamic movement.",
    },
    {
      n: "[Bodyweight] Ab Rollout",
      t_r: "8-12",
      bio: "Ab wheel rollout, full ROM stretch, return dengan kontrol, core braced penuh.",
    },
    {
      n: "[Cable] Crunches",
      t_r: "15-20",
      bio: "High-cable crunch, flex di lower abs, squeeze puncak, high reps untuk pump.",
    },
  ],

  cardio: [
    {
      n: "[Cardio] LISS Session",
      t_r: "20-30 min",
      type: "cardio",
      bio: "Low-Intensity Steady State cardio. Jaga heart rate di zona 2(60-70% max HR) untuk pembakaran lemak optimal.",
      note: "Post-workout recommended",
      machines: [
        "Treadmill",
        "Static Bike",
        "Rowing",
        "Elliptical",
        "Outdoor Bike",
        "Outdoor Walk",
      ],
    },
    {
      n: "[Cardio] Warmup Cardio",
      t_r: "5 min",
      type: "cardio",
      bio: "Pre-workout warmup untuk elevasi heart rate.",
      note: "Pre-workout, lanjut ke dynamic stretching",
      machines: [
        "Treadmill",
        "Static Bike",
        "Rowing",
        "Elliptical",
        "Outdoor Bike",
        "Outdoor Walk",
      ],
    },
  ],

  stretching: [
    {
      n: "[Stretch] Cat-Cow",
      t_r: "10-15 reps",
      bio: "Thoracic mobility flow, arch & round spine, mobilize entire spine segment.",
    },
    {
      n: "[Stretch] Band Dislocates",
      t_r: "10 reps",
      bio: "Shoulder mobility with band, jangan dipaksa, improve shoulder ROM gradually.",
    },
    {
      n: "[Stretch] Child Pose",
      t_r: "30-45s",
      bio: "Lats & thoracic stretch, push ketiak ke lantai, relax & breathe deeply.",
    },
    {
      n: "[Stretch] Pigeon Pose",
      t_r: "45-60s",
      bio: "Hip flexor & glute stretch, anterior hip mobility, hold dan breathe deeply.",
    },
    {
      n: "[Stretch] Quad Stretch",
      t_r: "30s each",
      bio: "Standing quad stretch, keep hips neutral, feel stretch di anterior thigh.",
    },
    {
      n: "[Stretch] Hamstring Stretch",
      t_r: "30s each",
      bio: "Seated hamstring stretch, hinge dari hips, keep spine neutral, no momentum.",
    },
  ],

  compound: [
    {
      n: "[Barbell] Bench Press",
      t_r: "5-8",
      t_k: 60,
      vid: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
      bio: "Primary compound chest. Membangun total pressing power dan ketebalan otot pectoral.",
      note: "Gunakan full body tension; tekan kaki ke lantai (leg drive). Turunkan bar terkontrol ke sternum bawah. Dorong secara eksplosif sambil menjaga belikat tetap menempel pada bench.",
    },
    {
      n: "[Barbell] Deadlift",
      t_r: "3-5",
      t_k: 80,
      vid: "https://www.youtube.com/watch?v=op9kVnSso6Q",
      bio: "Ultimate strength movement. Menargetkan seluruh posterior chain dari hamstrings hingga trapezius.",
      note: "Hinge pada pinggul, bukan menekuk punggung. Tarik 'slack' keluar dari bar sebelum angkat. Jaga bar tetap menempel pada tulang kering sepanjang gerakan untuk efisiensi mekanik.",
    },
    {
      n: "[Barbell] Squat",
      t_r: "6-8",
      t_k: 60,
      vid: "https://www.youtube.com/watch?v=gcNh17Ckjgg",
      bio: "Lower body primary. Dominan pada quadriceps dan gluteus dengan rekrutmen core yang masif.",
      note: "Chest up dan brace core seolah akan dipukul di perut. Turun hingga paha minimal sejajar lantai (Parallel). Pastikan tumit tidak terangkat saat posisi bawah.",
    },
    {
      n: "[Barbell] Row",
      t_r: "6-8",
      t_k: 50,
      vid: "https://www.youtube.com/watch?v=9efgcAjQe7E",
      bio: "Back compound utama. Fokus pada ketebalan punggung tengah (mid-back density) dan kekuatan lats.",
      note: "Jaga sudut punggung konstan (bent-over). Tarik bar ke arah pusar dengan menginisiasi gerakan dari siku. Hindari menggunakan momentum tubuh bagian atas (cheating).",
    },
    {
      n: "[Barbell] Overhead Press",
      t_r: "6-8",
      t_k: 30,
      vid: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
      bio: "Shoulder compound primer. Membangun stabilitas bahu overhead dan kekuatan deltoid anterior.",
      note: "Berdiri tegak dengan kaki selebar bahu. Kencangkan bokong untuk melindungi pinggul. Press bar lurus ke atas dan dorong kepala sedikit ke depan saat bar melewati dahi.",
    },
  ],
};

EXERCISES_LIBRARY.getExerciseByCategory = function (category) {
  return this[category] || [];
};

EXERCISES_LIBRARY.searchExercise = function (keyword) {
  const results = [];
  const lowerKeyword = keyword.toLowerCase();

  Object.keys(this).forEach((category) => {
    if (Array.isArray(this[category])) {
      this[category].forEach((exercise) => {
        if (exercise.n && exercise.n.toLowerCase().includes(lowerKeyword)) {
          results.push({
            category: category,
            ...exercise,
          });
        }
      });
    }
  });

  return results;
};

EXERCISES_LIBRARY.getCategories = function () {
  return Object.keys(this).filter((key) => Array.isArray(this[key]));
};

EXERCISES_LIBRARY.createExercise = function (name, targetReps, bio, note = "") {
  const exercise = {
    n: name,
    t_r: targetReps,
    bio: bio,
  };

  if (note) {
    exercise.note = note;
  }

  return exercise;
};
