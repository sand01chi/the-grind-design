# 🏋️ THE GRIND DESIGN

**Version:** V27.0 (Modular Architecture)  
**Status:** Production Ready  
**Last Updated:** January 1, 2026

A clinical-grade Progressive Web App for evidence-based strength training management. Built with vanilla JavaScript, designed for both personal training and professional analytics.

---

## ✨ Key Features

### **Core Training Management**
- 📅 **Smart Session Rotation** - Auto-suggests next workout based on recovery time
- 🎯 **Exercise Variants** - Multiple equipment options per movement pattern
- 💪 **Progressive Overload Tracking** - Volume, intensity, RPE/RIR metrics
- ⚡ **Plate Calculator** - Auto-calculates barbell loading for target weights
- 🔄 **Spontaneous Mode** - Log off-program workouts without disrupting rotation

### **Clinical Analytics**
- 📊 **Volume Progression Charts** - Track hypertrophy stimulus over time
- 🎨 **Muscle Distribution Analysis** - Identify training imbalances
- 📈 **RPE/RIR Tracking** - Monitor fatigue accumulation
- 🔬 **Half-Set Rule** - PRIMARY (1.0x) vs SECONDARY (0.5x) muscle contribution

### **AI Integration**
- 🤖 **Smart Merge Engine** - AI (Gemini/GPT) can update programs via JSON
- 🔍 **Fuzzy Exercise Matching** - Auto-maps exercise name variations
- 📋 **Conflict Detection** - User control over AI-suggested changes
- 🛡️ **Auto-Backup** - Safety layer before AI merges

### **Data Integrity**
- 💾 **Offline-First** - Works completely offline (PWA)
- ☁️ **Google Drive Sync** - Optional cloud backup/restore
- 🔐 **LocalStorage Safety** - LS_SAFE wrapper with error handling
- 📦 **Backup System** - Timestamped backups before destructive operations
- ✅ **Canonical Exercise Names** - Prevents fragmented analytics (V26.6+)

### **Exercise Library**
- 📚 **100+ Exercises** - Comprehensive database with biomechanics notes
- 🏋️ **Equipment Tags** - [Barbell], [Machine], [DB], [Cable], [Bodyweight]
- 🔬 **Clinical Notes** - Safety warnings, contraindications, form cues
- 🎥 **Video Links** - YouTube demonstrations
- 🎯 **Target Rep Ranges** - Evidence-based recommendations

---

## 🏗️ Architecture (V27.0)

**Modular Structure (12 files, 9,656 lines total):**

```
project-root/
├── index.html              (2,203 lines) - HTML skeleton
├── exercises-library.js    (1,817 lines) - Exercise database
├── js/
│   ├── constants.js        (430 lines)   - PRESETS, STARTER_PACK
│   ├── core.js            (344 lines)   - LS_SAFE, APP.state, APP.core
│   ├── validation.js      (491 lines)   - APP.validation
│   ├── data.js            (1,218 lines)  - APP.data, CRUD operations
│   ├── safety.js          (325 lines)   - APP.safety, backup/restore
│   ├── stats.js           (1,665 lines)  - APP.stats, charts, analytics
│   ├── session.js         (750 lines)   - APP.session management
│   ├── cardio.js          (111 lines)   - APP.cardio, APP.timer
│   ├── ui.js              (1,051 lines)  - APP.ui, rendering, modals
│   ├── debug.js           (46 lines)    - APP.debug, error handling
│   ├── nav.js             (827 lines)   - APP.nav, APP.init
│   └── cloud.js           (195 lines)   - Google Drive integration
└── sw.js, manifest.json    - PWA configuration
```

**Key Improvement (V27):**
- ✅ 58% reduction in index.html size (9,000 → 2,203 lines)
- ✅ Clear separation of concerns (module per namespace)
- ✅ Easier maintenance and AI context efficiency
- ✅ Git-friendly (cleaner diffs, parallel development)

---

## 🚀 Quick Start

### **1. Install as PWA**
```
1. Open https://your-app-url.com in Chrome/Edge
2. Click "Install" button (or browser menu → Install)
3. App appears on home screen/desktop
4. Works offline after first load
```

### **2. Configure Profile**
```
1. Open app → Click profile icon
2. Enter name, height, age, gender
3. Set activity factor (sedentary to very active)
4. Save → TDEE auto-calculated
```

### **3. Log First Workout**
```
1. Dashboard → Click suggested "Next Workout"
2. Fill in weight, reps, RPE for each set
3. Use plate calculator (barbell exercises)
4. Click "Complete Workout"
5. View analytics in Stats tab
```

### **4. AI-Powered Program Updates (Optional)**
```
1. Library → Copy workout JSON
2. Send to Gemini/GPT: "Analyze and update my program"
3. AI returns optimized JSON
4. Paste into "Apply AI Program"
5. Smart Merge auto-updates targets
```

---

## 📚 Documentation

Comprehensive documentation suite for developers and contributors:

| Document | Purpose | Audience |
|----------|---------|----------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System design, data flows, V27 module structure | Developers, Contributors |
| **[CODING_GUIDELINES.md](./CODING_GUIDELINES.md)** | Code standards, V27 module development rules | Developers, AI Assistants |
| **[KNOWN_ISSUES.md](./KNOWN_ISSUES.md)** | Active bugs, V27 gotchas, workarounds | Users, Developers |
| **[CHANGELOG_DETAILED.md](./CHANGELOG_DETAILED.md)** | Version history with technical context | All |
| **[DEBUGGING_PLAYBOOK.md](./DEBUGGING_PLAYBOOK.md)** | Step-by-step troubleshooting guide | Users, Support |
| **[EXERCISE_LIBRARY_GUIDE.md](./EXERCISE_LIBRARY_GUIDE.md)** | How to add/modify exercises | Contributors |
| **[HANDOVER_V27.md](./HANDOVER_V27.md)** | V27 complete story (phases, bugs, solutions) | Developers, AI Assistants |

---

## 🧪 Use Cases

### **For Athletes**
- Track progressive overload scientifically
- Monitor fatigue to prevent overtraining
- Optimize volume distribution across muscle groups
- Log spontaneous workouts without disrupting program

### **For Coaches**
- AI-assisted program updates via JSON
- Client progress tracking with clinical metrics
- Export data for analysis in external tools
- Template programs for multiple clients

### **For Researchers**
- Export workout data to CSV/JSON
- Analyze volume-fatigue relationships
- Study RPE-RIR correlations
- Long-term strength progression analysis

---

## 🔐 Privacy & Data

### **Data Storage**
- **Primary:** Browser LocalStorage (5-10MB limit)
- **Location:** Your device only (no server transmission)
- **Backup:** Optional Google Drive sync (requires manual auth)

### **Privacy Guarantees**
- ✅ No analytics tracking
- ✅ No user accounts required
- ✅ No data sent to servers
- ✅ No cookies (except localStorage)
- ✅ Works completely offline

### **Data Portability**
- Export full backup to JSON file
- Import from JSON (migration support)
- Google Drive backup/restore
- No vendor lock-in

---

## 📊 Version History Highlights

| Version | Date | Major Changes |
|---------|------|---------------|
| **V27.0** | Jan 2026 | Modular architecture - 12 modules, 8-phase refactoring, 11 bugs fixed |
| **V26.6** | Dec 2025 | Data integrity hotfix - canonical exercise naming enforcement |
| **V26.5** | Dec 2025 | Library expansion - 40+ machine variations with clinical notes |
| **V25.0** | Oct 2025 | Smart Merge Engine - AI program integration |
| **V24.0** | Sep 2025 | PWA optimization - installable, offline-capable |
| **V23.0** | Aug 2025 | Clinical analytics - RPE/RIR tracking, fatigue monitoring |
| **V22.0** | Jul 2025 | Google Drive backup/restore |
| **V21.0** | Jun 2025 | Exercise library foundation (100+ exercises) |
| **V20.0** | May 2025 | Spontaneous mode |

**Full changelog:** See [CHANGELOG_DETAILED.md](./CHANGELOG_DETAILED.md)

---

## 🐛 Known Issues

**Active Issues:**
- Console validation warning flood (cosmetic) - See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md#issue-1)
- Fuzzy match ambiguity with short queries - See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md#issue-2)
- LocalStorage quota limit on 3+ years of data - See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md#issue-3)

**V27 Architectural Gotchas:**
- Arrow functions capture closure scope - See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md#gotcha-1)
- Module load order is non-negotiable - See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md#gotcha-2)
- Object.assign vs direct assignment - See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md#gotcha-3)

**For troubleshooting:** See [DEBUGGING_PLAYBOOK.md](./DEBUGGING_PLAYBOOK.md)

---

## 🤝 Contributing

### **Adding Exercises**

See [EXERCISE_LIBRARY_GUIDE.md](./EXERCISE_LIBRARY_GUIDE.md) for detailed instructions.

**Quick guide:**
```javascript
// 1. Add to EXERCISE_TARGETS (exercises-library.js)
"[Machine] New Exercise": [{ muscle: "chest", role: "PRIMARY" }]

// 2. Add to EXERCISES_LIBRARY.chest
{
  n: "[Machine] New Exercise",
  t_r: "8-12",
  bio: "Biomechanics explanation...",
  note: "Execution tips<br><br>⚠️ CLINICAL: Safety notes",
  vid: ""
}
```

### **Code Contributions (V27+)**

1. Read [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) first
2. Follow V27 module development rules
3. Test edge cases (empty data, invalid input, offline mode)
4. Create backup before data mutations: `APP.safety.createBackup("operation")`
5. Submit pull request with clear description

**V27 Module Requirements:**
- ✅ Use IIFE pattern: `(function() { ... })()`
- ✅ Add namespace guard: `if (!window.APP) window.APP = {};`
- ✅ Use `window.APP.*` for cross-module calls
- ✅ Add load confirmation: `console.log("[MODULE] ✅ Loaded")`
- ✅ Update ARCHITECTURE.md with dependencies

### **Bug Reports**

Include:
- Browser version (Chrome, Safari, Firefox, etc.)
- Steps to reproduce
- Console errors (screenshot or copy/paste)
- LocalStorage export (if relevant)
- Check [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) first

---

## ⚠️ Important Rules (For Developers/AI)

**NEVER:**
- ❌ Use `localStorage` directly → Always use `LS_SAFE` wrapper
- ❌ Use `\n` for line breaks → Always use `<br>` (HTML-safe)
- ❌ Delete data without backup → Always `APP.safety.createBackup()`
- ❌ Skip input validation → Always use `APP.validation` methods
- ❌ Use `window.APP = APP` → Always use `Object.assign(window.APP, APP)` (V27+)
- ❌ Use local APP in closures → Always use `window.APP.*` for cross-module (V27+)

**ALWAYS:**
- ✅ Validate user inputs before processing
- ✅ Use canonical exercise names (fuzzy matching)
- ✅ Preserve backward compatibility
- ✅ Test localStorage edge cases
- ✅ Follow module load order (V27+)
- ✅ Add defensive error handling (V27+)

See [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) for complete rules.

---

## 🎓 Learning Resources

**For New Developers:**
1. Read [HANDOVER_V27.md](./HANDOVER_V27.md) - V27 complete story
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
3. Read [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) - Code patterns
4. Study modules in order (core → validation → data → ui → nav)

**Critical Concepts:**
- IIFE module pattern (V27)
- Closure scoping (window.APP vs local APP)
- Object.assign merge pattern
- Module load order dependencies
- LS_SAFE wrapper pattern

---

## 📝 License

[Not yet]

---

## 👥 Credits

**Lead Developer:** sand01chi  
**Architecture & Refactoring:** Collaborative (sand01chi + Claude AI)  
**V27 Refactoring:** 8 phases, 3 days, 11 critical bugs solved  

---

**Built with ❤️ for evidence-based strength training**

---

**END OF README.md**
