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
      t_r: "5-8",
      t_k: 60,
      vid: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
      bio: "Gold standard untuk total horizontal pressing power dan densitas otot pectoral.",
      note: "Gunakan leg drive (kaki menapak kuat). Turunkan bar ke arah sternum bawah/puting. Jaga siku agar tidak flaring 90 derajat untuk melindungi rotator cuff."
    },
    {
      n: "[Barbell] Incline Bench Press",
      t_r: "6-8",
      t_k: 50,
      vid: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
      bio: "Target Clavicular Head (Dada Atas). Efektif untuk memperbaiki postur tubuh bagian depan.",
      note: "Set incline pada 30-45 derajat. Fokus pada kontrol bar saat turun (eccentric) hingga menyentuh dada bagian atas. Jangan biarkan bar memantul di dada."
    },
    {
      n: "[DB] Flat Dumbbell Press",
      t_r: "8-10",
      t_k: 15,
      vid: "https://www.youtube.com/watch?v=VmB1G1K7v94",
      bio: "Optimal untuk stabilisasi bahu dan deteksi muscle imbalance antara sisi dominan dan non-dominan.",
      note: "Turunkan dumbbell selama 3 detik. Stretch dada maksimal di posisi bawah tanpa membiarkan bahu berotasi ke depan. Dorong eksplosif ke arah tengah."
    },
    {
      n: "[DB] Incline Dumbbell Press",
      t_r: "10-12",
      t_k: 17.5,
      vid: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
      bio: "Memberikan Range of Motion (ROM) lebih dalam dibandingkan barbell press pada dada atas.",
      note: "Genggaman sedikit serong (semi-supinated) untuk kenyamanan sendi bahu. Rasakan tarikan pada otot dada atas sebelum mendorong kembali ke atas."
    },
    {
      n: "[Machine] Chest Press",
      t_r: "10-12",
      t_k: 50,
      vid: "https://www.youtube.com/watch?v=NwzUje3z0qY",
      bio: "High stability pressing. Mengeliminasi kebutuhan stabilizer saat otot mulai mencapai failure teknis.",
      note: "Atur kursi agar handle sejajar tengah dada. Fokus pada dorongan murni dari dada, hindari penggunaan momentum tubuh. Jangan kunci siku sepenuhnya (soft-lock)."
    },
    {
      n: "[Cable] Cable Fly",
      t_r: "12-15",
      t_k: 10,
      vid: "https://www.youtube.com/watch?v=Iwe6AmxVf7o",
      bio: "Constant tension sepanjang gerakan. Sangat baik untuk metabolic stress dan isolasi serat otot sternal.",
      note: "Buka tangan lebar dengan siku sedikit ditekuk (fixed angle). Bayangkan memeluk pohon besar. Squeeze (tekan) otot dada selama 1 detik di puncak kontraksi."
    },
    {
      n: "[Machine] Incline Chest Press",
      t_r: "10-12",
      t_k: 40,
      vid: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
      bio: "Target Clavicular Head (Dada Atas). Memberikan stabilitas tinggi untuk overload progresif.",
      note: "Fokus 'squeeze' dada atas di puncak gerakan. Jangan mengunci siku sepenuhnya (soft lock) untuk menjaga tegangan pada otot."
    },
    {
      n: "[Machine] Pec Deck Fly",
      t_r: "12-15",
      t_k: 35,
      vid: "https://www.youtube.com/watch?v=Z57CtFmRMxA",
      bio: "Isolasi dada murni tanpa melibatkan tricep. Mengoptimalkan serat otot sternal head.",
      note: "Siku sedikit ditekuk dan dikunci sudutnya. Bayangkan ingin mempertemukan kedua siku di depan dada untuk kontraksi maksimal."
    }
  ],

  // 🔙 BACK - PUNGGUNG
back: [
    {
      n: "[Barbell] Barbell Deadlift",
      t_r: "3-5",
      t_k: 80,
      vid: "https://www.youtube.com/watch?v=op9kVnSso6Q",
      bio: "King of posterior chain. Membangun kekuatan absolut dan stabilitas spinal yang krusial bagi klinisi.",
      note: "Keep lats engaged (bayangkan menjepit ketiak). Drive hips forward eksplosif. Jaga neutral spine; jangan biarkan lower back melengkung (rounding) saat beban meninggalkan lantai."
    },
    {
      n: "[Barbell] Barbell Row",
      t_r: "6-8",
      t_k: 50,
      vid: "https://www.youtube.com/watch?v=9efgcAjQe7E",
      bio: "Compound horizontal pull primer untuk ketebalan mid-back dan stabilitas core.",
      note: "Bent-over posisi 45-60 derajat. Tarik bar ke arah perut bawah (navel). Squeeze scapula di puncak dan kontrol fase eksentrik (saat menurunkan bar)."
    },
    {
      n: "[DB] One Arm DB Row",
      t_r: "8-10",
      t_k: 22.5,
      vid: "https://www.youtube.com/watch?v=pYcpY20QaE8",
      bio: "Unilateral movement untuk memperbaiki ketimpangan kekuatan dan meningkatkan Range of Motion (ROM).",
      note: "Tarik dumbbell melengkung ke arah pinggul (Hip), bukan lurus ke atas. Ini memastikan aktivasi Lats bawah lebih optimal dan mengurangi dominasi bicep."
    },
    {
      n: "[Cable] Lat Pulldown (wide)",
      t_r: "10-12",
      t_k: 55,
      vid: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
      bio: "Vertical pull utama untuk membangun lebar punggung (V-Taper) tanpa beban kompresi pada tulang belakang.",
      note: "Tarik bar ke arah dada atas (clavicula). Bayangkan siku ingin dimasukkan ke saku celana belakang. Hindari menggunakan momentum tubuh yang berlebihan."
    },
    {
      n: "[Cable] Seated Cable Row",
      t_r: "10-12",
      t_k: 50,
      vid: "https://www.youtube.com/watch?v=GZbfZ033f74",
      bio: "Fokus pada Mid-Trap dan Rhomboids. Memberikan tegangan konstan yang aman untuk sendi bahu.",
      note: "Duduk tegak, lutut sedikit ditekuk. Inisiasi gerakan dengan menarik belikat ke belakang, baru tekuk siku. Rasakan full stretch pada otot punggung saat posisi awal."
    },
    {
      n: "[Machine] Machine Row",
      t_r: "10-12",
      t_k: 45,
      vid: "https://www.youtube.com/watch?v=NwzUje3z0qY",
      bio: "Isolasi punggung dengan stabilitas maksimal. Mengeliminasi penggunaan lower back (Lumbal) saat kelelahan.",
      note: "Gunakan chest support. Tarik handle dengan siku tetap dekat dengan tubuh. Fokus pada kontraksi punggung tengah tanpa bantuan ayunan badan."
    },
    {
      n: "[Cable] Face Pull",
      t_r: "15-20",
      t_k: 15,
      vid: "https://www.youtube.com/watch?v=rep-qVOkqgk",
      bio: "Korektif postur. Esensial untuk Rear Delt dan kesehatan Rotator Cuff bagi praktisi medis.",
      note: "Tarik rope ke arah dahi. Di puncak gerakan, pastikan posisi jempol menghadap ke belakang (external rotation). Squeeze otot bahu belakang selama 1 detik."
    }
  ],

  // 💪 SHOULDERS - BAHU
shoulders: [
    {
      n: "[Barbell] Overhead Press",
      t_r: "6-8",
      t_k: 30,
      vid: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
      bio: "Membangun kekuatan bahu murni dan stabilitas core. Sangat efektif untuk fungsionalitas tubuh bagian atas.",
      note: "Genggaman sedikit lebih lebar dari bahu. Mundurkan dagu (double chin) saat bar naik agar tidak terbentur. Kunci core dan bokong untuk menjaga stabilitas lumbal."
    },
    {
      n: "[DB] Dumbbell Shoulder Press",
      t_r: "8-10",
      t_k: 15,
      vid: "https://www.youtube.com/watch?v=qEwKCR5JCog",
      bio: "Melatih stabilizer bahu secara mandiri. Mengurangi risiko kompensasi antar sisi tubuh.",
      note: "Siku masuk 45 derajat (Scapular Plane), jangan melebar 90 derajat (T-Pose) untuk melindungi rotator cuff. Dorong dumbbell hingga hampir bersentuhan di puncak gerakan."
    },
    {
      n: "[Machine] Smith Machine Shoulder Press",
      t_r: "8-10",
      t_k: 40,
      vid: "https://www.youtube.com/watch?v=WvLMauqrnK8",
      bio: "Fixed path press. Memungkinkan fokus maksimal pada overload beban tanpa hambatan stabilitas.",
      note: "Posisi bangku harus tepat di bawah bar. Fokus pada dorongan eksplosif ke atas dan kontrol penuh saat menurunkan bar ke setinggi dagu."
    },
    {
      n: "[DB] DB Lateral Raise",
      t_r: "15-20",
      t_k: 6,
      vid: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
      bio: "Target utama Lateral Delt untuk memberikan lebar bahu (shoulder width).",
      note: "Strict form wajib. Angkat beban sedikit ke depan (Scapular Plane). Pastikan posisi kelengkeng sedikit lebih tinggi dari jempol di puncak gerakan. Jangan mengayun badan."
    },
    {
      n: "[Cable] Cable Lateral Raise",
      t_r: "15-20",
      t_k: 5,
      vid: "https://www.youtube.com/watch?v=PzmHZSqw4H4",
      bio: "Memberikan tegangan konstan (Constant Tension) di seluruh rentang gerak, terutama di posisi otot memanjang.",
      note: "Kabel setinggi lutut atau bawah. Silangkan kabel di belakang badan untuk stretch maksimal. Kontrol fase negatif (saat tangan turun) secara perlahan."
    },
    {
      n: "[Machine] Machine Shoulder Press",
      t_r: "10-12",
      t_k: 27.5,
      vid: "https://www.youtube.com/watch?v=WvLMauqrnK8",
      bio: "Isolasi Anterior Delt dengan risiko cedera minimal. Cocok untuk hipertrofi di akhir sesi.",
      note: "Pastikan punggung menempel rapat pada sandaran. Dorong ke atas dan bayangkan kepala sedikit maju 'melalui jendela' tangan di posisi puncak gerakan."
    },
    {
      n: "[Machine] Reverse Pec Deck",
      t_r: "12-15",
      t_k: 25,
      vid: "https://www.youtube.com/watch?v=rep-qVOkqgk",
      bio: "Target Rear Delt dan Trapezius tengah. Krusial untuk menyeimbangkan postur bahu yang condong ke depan.",
      note: "Jangan menggenggam handle terlalu kuat; gunakan telapak tangan untuk mendorong. Squeeze belikat (scapula) di puncak kontraksi dan tahan selama 1 detik."
    }
  ],

  // 💪 ARMS - LENGAN
arms: [
    {
      n: "[Barbell] Barbell Curl",
      t_r: "8-10",
      t_k: 25,
      vid: "https://www.youtube.com/watch?v=lyn7kj8v_XU",
      bio: "Membangun massa bicep keseluruhan. Penggunaan EZ-Bar direkomendasikan untuk mengurangi tekanan pada pergelangan tangan.",
      note: "Kunci siku di samping rusuk. Hindari ayunan pinggang (ego lifting). Fokus pada kontraksi puncak dan turunkan beban secara terkontrol selama 2-3 detik."
    },
    {
      n: "[DB] Dumbbell Curl",
      t_r: "10-12",
      t_k: 10,
      vid: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
      bio: "Memungkinkan supinasi pergelangan tangan yang optimal untuk aktivasi bicep puncak.",
      note: "Mulai dengan telapak tangan menghadap paha, putar ke arah langit-langit saat mengangkat. Pastikan rentang gerak penuh (Full ROM) dari bawah hingga ke atas."
    },
    {
      n: "[Cable] Cable Curl",
      t_r: "12-15",
      t_k: 15,
      vid: "https://www.youtube.com/watch?v=AsAVbBko26w",
      bio: "Menjaga tegangan konstan (Constant Tension) bahkan pada posisi tangan di bawah.",
      note: "Berdiri tegak, dada membusung. Tarik handle dengan siku tetap diam. Sangat efektif untuk memicu metabolic stress (pump) di akhir latihan bicep."
    },
    {
      n: "[Machine] Bicep Machine",
      t_r: "10-12",
      t_k: 20,
      vid: "https://www.youtube.com/watch?v=3-E03p7YhS0",
      bio: "Isolasi bicep murni dengan meniadakan bantuan otot bahu dan core.",
      note: "Pastikan ketiak menempel pada bantalan. Fokus pada 'squeeze' maksimal di puncak gerakan. Jangan biarkan beban membentur tumpukan saat fase turun."
    },
    {
      n: "[Barbell] Close-Grip Bench Press",
      t_r: "6-8",
      t_k: 40,
      vid: "https://www.youtube.com/watch?v=vX_Xp_6Xm0M",
      bio: "Gerakan compound utama untuk tricep lateral dan medial head.",
      note: "Genggaman setinggi bahu (jangan terlalu sempit untuk menjaga kesehatan pergelangan tangan). Siku tetap rapat ke arah rusuk (tucked) saat bar turun ke dada tengah."
    },
    {
      n: "[DB] Dumbbell Skullcrusher",
      t_r: "10-12",
      t_k: 8,
      vid: "https://www.youtube.com/watch?v=d_KZxkY_0cM",
      bio: "Menargetkan Long Head Tricep melalui posisi stretch di belakang kepala.",
      note: "Turunkan dumbbell ke arah samping dahi atau sedikit ke belakang kepala. Jaga siku agar tetap menunjuk ke langit-langit, jangan biarkan siku melebar ke samping."
    },
    {
      n: "[Cable] Overhead Tricep Extension",
      t_r: "12-15",
      t_k: 12.5,
      vid: "https://www.youtube.com/watch?v=nRiJVZDpdL0",
      bio: "Memberikan stretch maksimal pada Long Head Tricep dalam posisi overhead.",
      note: "Condongkan badan sedikit ke depan dan aktifkan core. Ekstensi lengan sepenuhnya di depan dahi. Pastikan siku tidak 'flaring' atau melebar terlalu jauh."
    },
    { 
      n: "[Cable] Tricep Pushdown (Rope)", 
      t_r: "12-15", 
      t_k: 15, 
      vid: "https://www.youtube.com/watch?v=vB5OHsJ3EME", 
      bio: "Fokus Metabolic Stress (Burn).", 
      note: "Kunci siku di rusuk. Buka tali (spread) di bawah untuk lateral head." 
    },
    { 
      n: "[DB] Incline DB Curl", 
      t_r: "12-15", 
      t_k: 8, 
      vid: "https://www.youtube.com/watch?v=soxrZlIl35U", 
      bio: "Posisi stretch untuk Long Head Bicep.", 
      note: "Siku tetap di belakang badan saat curl. Jangan mengayun bahu." 
    },
    { 
      n: "[Barbell] Skullcrushers (EZ Bar)", 
      t_r: "10-12", 
      t_k: 15, 
      vid: "https://www.youtube.com/watch?v=d_KZxkY_0cM", 
      bio: "Target Long Head Tricep.", 
      note: "Turunkan bar ke arah ubun-ubun. Siku menunjuk ke langit-langit." 
    },
    { 
      n: "[DB] Hammer Curl", 
      t_r: "10-12", 
      t_k: 10, 
      vid: "https://www.youtube.com/watch?v=zC3nLlEvin4", 
      bio: "Target Brachialis (Ketebalan samping).", 
      note: "Genggaman netral (palu). Curl lurus ke arah bahu." 
    },
    { 
      n: "[Cable] Bayesian Curl", 
      t_r: "12-15", 
      t_k: 10, 
      vid: "https://www.youtube.com/watch?v=4sW5W7h_jG0", 
      bio: "Tegangan maksimal saat stretch.", 
      note: "Membelakangi kabel. Biarkan tangan tertarik ke belakang, lalu curl." 
    }
  ],

  // 🦵 LEGS - KAKI
legs: [
    {
      n: "[Barbell] Barbell Squat",
      t_r: "6-10",
      t_k: 60,
      vid: "https://www.youtube.com/watch?v=gcNh17Ckjgg",
      bio: "Raja dari semua latihan lower body. Membangun kekuatan sistemik dan stabilitas core.",
      note: "Chest up, knee tracking mengikuti arah jari kaki. Turun sedalam mungkin selama punggung bawah tidak melengkung (butt wink). Inhale di atas, tahan brace saat turun."
    },
    {
      n: "[Barbell] Barbell Front Squat",
      t_r: "6-8",
      t_k: 40,
      vid: "https://www.youtube.com/watch?v=vX_Xp_6Xm0M",
      bio: "Variasi dominan Quadriceps dengan torso yang lebih tegak. Mengurangi beban kompresi pada lumbal.",
      note: "Barbell diletakkan di deltoid depan. Siku harus tetap tinggi sepanjang gerakan agar bar tidak merosot. Fokus pada kedalaman squat (ATG)."
    },
    {
      n: "[Machine] Leg Press (Quad Bias)",
      t_r: "8-12",
      t_k: 120,
      vid: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
      bio: "Isolasi lower body dengan stabilitas maksimal. Posisi kaki rendah pada platform meningkatkan aktivasi Quads.",
      note: "Posisi kaki di bagian bawah platform. Turunkan beban secara perlahan hingga lutut mendekati dada. JANGAN mengunci lutut (hyperextend) di posisi atas."
    },
    {
      n: "[Machine] Hack Squat",
      t_r: "10-12",
      t_k: 100,
      vid: "https://www.youtube.com/watch?v=0tn5K9NlCfo",
      bio: "Alat terbaik untuk hipertrofi Quads karena stabilitas punggung yang absolut.",
      note: "Turun pelan 3 detik. Pastikan seluruh punggung menempel rapat di sandaran. Fokus pada dorongan melalui mid-foot dan tumit."
    },
    {
      n: "[DB] Dumbbell Goblet Squat",
      t_r: "10-12",
      t_k: 25,
      vid: "https://www.youtube.com/watch?v=MeIiIdhvXT4",
      bio: "Sangat baik untuk pemanasan atau melatih pola squat yang benar dengan beban di depan (counter-balance).",
      note: "Pegang dumbbell secara vertikal di depan dada. Siku harus masuk di antara lutut saat berada di posisi bawah. Jaga punggung tetap tegak."
    },
    {
      n: "[Machine] Leg Press (Glute Bias)",
      t_r: "12-15",
      t_k: 130,
      vid: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
      bio: "Variasi untuk menargetkan rantai posterior (Glutes & Hams) menggunakan mesin leg press.",
      note: "Tempatkan kaki di bagian paling ATAS platform dengan jarak lebar. Dorong dengan tumit untuk memaksimalkan aktivasi gluteus."
    },
    { 
      n: "[Barbell] RDL (Barbell)", 
      t_r: "8-10", t_k: 70, 
      vid: "https://www.youtube.com/watch?v=JCXUYuzwNrM", 
      bio: "Raja posterior chain. Fokus pada hip-hinge.", 
      note: "Lutut 'soft lock'. Dorong pinggul ke belakang. Barbell menempel paha." 
    },
    { 
      n: "[Machine] Leg Press (Glute Bias)", 
      t_r: "10-12", 
      t_k: 120, 
      vid: "https://www.youtube.com/watch?v=IZxyjW7MPJQ", 
      bio: "Kaki tinggi di platform = Dominan Glute/Hams.", 
      note: "Dorong dengan tumit. Jangan kunci lutut di posisi atas." 
    },
    { 
      n: "[Machine] Lying Leg Curl", 
      t_r: "10-12", 
      t_k: 40, 
      vid: "https://www.youtube.com/watch?v=1Tq3QdYUuHs", 
      bio: "Pre-exhaust hamstring. Fokus pada kontraksi puncak.", 
      note: "Tekan pinggul ke pad. Kontraksi 1 detik, turun pelan 3 detik." 
    },
    { 
      n: "[Machine] Seated Calf Raise", 
      t_r: "15-20", 
      t_k: 35, 
      vid: "https://www.youtube.com/watch?v=JbyjNymZOt0", 
      bio: "Target Soleus (otot betis dalam/lebar).", 
      note: "Full ROM. Pause di bawah untuk menghilangkan refleks regangan." 
    },
    { 
      n: "[DB] Forward Lunge", 
      t_r: "10-12", 
      t_k: 12.5, 
      vid: "https://www.youtube.com/watch?v=c2nRGEpDe6g", 
      bio: "Deselerasi beban tubuh. Dominan Quads.", 
      note: "Punggung tegak lurus. Dorong balik eksplosif dengan kaki depan." 
    },
    { 
      n: "[Machine] Leg Extension", 
      t_r: "12-15", 
      t_k: 45, 
      vid: "https://www.youtube.com/watch?v=YyvSfVjQeL0", 
      bio: "Isolasi Rectus Femoris secara maksimal.", 
      note: "Wajib pause 1 detik di posisi kaki lurus. No momentum." 
    },
    { 
      n: "[Machine] Smith Machine Squat", 
      t_r: "10-12", 
      t_k: 60, 
      vid: "https://www.youtube.com/watch?v=2eAAeT4pYYY", 
      bio: "Lintasan vertikal fix. Fokus paha depan.", 
      note: "Kaki sedikit di depan bar (menyandar). Matikan glutes." 
    },
    { 
      n: "[DB] Bulgarian Split Squat", 
      t_r: "8-10", 
      t_k: 12.5, 
      vid: "https://www.youtube.com/watch?v=2C-uNgKwPLE", 
      bio: "Unilateral Glute Builder.", 
      note: "Condongkan torso ke depan. Turun dalam. Lutut harus stabil." 
    },
    { 
      n: "[Machine] Seated Leg Curl", 
      t_r: "12-15", 
      t_k: 35, 
      vid: "https://www.youtube.com/watch?v=F488k67BTNo", 
      bio: "Positioning stretch hamstring lebih baik.", 
      note: "Kunci paha seerat mungkin. Pantat jangan terangkat." 
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

 // 🏃 CARDIO & CONDITIONING (EXPANDED LIBRARY)
cardio: [
  {
    n: "[Cardio] LISS Session",
    t_r: "20-30 min",
    bio: "Low-Intensity Steady State cardio. Maintain Zone 2 heart rate (60-70% max HR) for optimal fat oxidation and recovery.",
    note: "Post-workout recommended",
    target_hr_zone: "Zone 2",
    machines: ["Treadmill", "Static Bike", "Rowing", "Elliptical"]  // Multi-machine support
  },
  {
    n: "[Cardio] Recovery Walk",
    t_r: "15-20 min",
    bio: "Light intensity walking for active recovery. Very low HR (50-60% max).",
    target_hr_zone: "Zone 1",
    machines: ["Treadmill"]
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
      t_r: "5-8",
      t_k: 60,
      vid: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
      bio: "Primary compound chest. Membangun total pressing power dan ketebalan otot pectoral.",
      note: "Gunakan full body tension; tekan kaki ke lantai (leg drive). Turunkan bar terkontrol ke sternum bawah. Dorong secara eksplosif sambil menjaga belikat tetap menempel pada bench."
    },
    {
      n: "[Barbell] Barbell Deadlift",
      t_r: "3-5",
      t_k: 80,
      vid: "https://www.youtube.com/watch?v=op9kVnSso6Q",
      bio: "Ultimate strength movement. Menargetkan seluruh posterior chain dari hamstrings hingga trapezius.",
      note: "Hinge pada pinggul, bukan menekuk punggung. Tarik 'slack' keluar dari bar sebelum angkat. Jaga bar tetap menempel pada tulang kering sepanjang gerakan untuk efisiensi mekanik."
    },
    {
      n: "[Barbell] Barbell Squat",
      t_r: "6-8",
      t_k: 60,
      vid: "https://www.youtube.com/watch?v=gcNh17Ckjgg",
      bio: "Lower body primary. Dominan pada quadriceps dan gluteus dengan rekrutmen core yang masif.",
      note: "Chest up dan brace core seolah akan dipukul di perut. Turun hingga paha minimal sejajar lantai (Parallel). Pastikan tumit tidak terangkat saat posisi bawah."
    },
    {
      n: "[Barbell] Barbell Row",
      t_r: "6-8",
      t_k: 50,
      vid: "https://www.youtube.com/watch?v=9efgcAjQe7E",
      bio: "Back compound utama. Fokus pada ketebalan punggung tengah (mid-back density) dan kekuatan lats.",
      note: "Jaga sudut punggung konstan (bent-over). Tarik bar ke arah pusar dengan menginisiasi gerakan dari siku. Hindari menggunakan momentum tubuh bagian atas (cheating)."
    },
    {
      n: "[Barbell] Overhead Press",
      t_r: "6-8",
      t_k: 30,
      vid: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
      bio: "Shoulder compound primer. Membangun stabilitas bahu overhead dan kekuatan deltoid anterior.",
      note: "Berdiri tegak dengan kaki selebar bahu. Kencangkan bokong untuk melindungi pinggul. Press bar lurus ke atas dan dorong kepala sedikit ke depan saat bar melewati dahi."
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
// End of exercises-library.js