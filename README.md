# 🏗️ THE GRIND DESIGN

**Version:** V26.6 Stable  
**Status:** Production Ready ✅  
**Type:** Progressive Web App (PWA)  
**License:** Private Use

---

## 📖 Overview

**THE GRIND DESIGN** is a clinical-grade Progressive Web App for gym training management, designed with a precision-first approach for high-performance athletes and serious lifters. Built with vanilla JavaScript and zero backend dependencies, it delivers professional-level workout programming, analytics, and fatigue management — all while working completely offline.

### **Core Philosophy**

- **Clinical Approach:** Training data treated with medical precision (RPE/RIR tracking, fatigue monitoring, progressive overload analysis)
- **Offline-First:** Your data lives on your device, accessible anywhere, anytime
- **AI-Ready:** Smart Merge Engine enables direct program updates from AI coaches (Gemini/GPT)
- **Data Integrity First:** Multi-layer validation, automatic backups, canonical exercise naming
- **Zero Lock-In:** Export to JSON, backup to Google Drive, or run completely offline

---

## ✨ Key Features

### **🎯 Smart Program Management**
- **Smart Merge Engine** - Paste JSON from AI (Gemini/GPT) to auto-update your program
- **Exercise Variants** - Multiple alternatives per exercise slot (equipment flexibility)
- **Session Rotation** - Auto-suggests next workout based on recovery time
- **Spontaneous Mode** - Log off-script workouts without affecting rotation
- **Blueprint System** - Save and clone program templates

### **📊 Clinical Analytics**
- **RPE/RIR Tracking** - Rate of Perceived Exertion & Reps in Reserve per set
- **Volume Progression** - Track total volume (kg) over time with interactive charts
- **Top Set Analysis** - Monitor peak strength progression
- **Fatigue Monitoring** - Auto-detect overreaching via RPE trends
- **Weekly Comparisons** - This week vs last week analytics dashboard
- **Muscle Group Distribution** - Volume breakdown by body part

### **📚 Exercise Library (100+ Exercises)**
- **Clinical Biomechanics Notes** - Movement mechanics explained scientifically
- **Execution Cues** - Step-by-step technique instructions
- **Safety Warnings** - Clinical contraindications for injury prevention
- **Machine Variations** - 40+ machine exercises with specific targeting (V26.5)
- **Search & Filter** - Find exercises by category or keyword
- **Video Links** - YouTube demonstration references

### **⚙️ Training Tools**
- **Plate Calculator** - Auto-calculates barbell plates needed (detects exercise type via tags)
- **Warmup Protocol** - Custom warmup routines per session
- **Rest Timer** - Configurable rest periods per exercise
- **Set History** - Previous performance shown during workout
- **PR Detection** - Automatic personal record identification

### **🔒 Data Safety**
- **Auto-Backup System** - Creates backups before destructive operations
- **Google Drive Sync** - Cloud backup/restore capability
- **Export/Import** - Full data export to JSON
- **Backup History** - Keeps last 5 safety backups
- **Data Validation** - Multi-layer integrity checks

### **📱 PWA Features**
- **Installable** - Add to home screen (iOS/Android)
- **Offline Capable** - Works without internet (Service Worker)
- **Fast Load Times** - Single HTML file architecture
- **Mobile Optimized** - Touch-friendly UI with responsive design
- **No App Store** - Install directly from browser

---

## 🛠️ Technical Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Vanilla JavaScript | Zero build complexity, instant debugging |
| **Styling** | Tailwind CSS (CDN) | Rapid UI development, mobile-first |
| **Icons** | Font Awesome 6.4 | Comprehensive icon library |
| **Charts** | Chart.js | Interactive analytics visualization |
| **Dates** | Day.js | Lightweight date manipulation |
| **Storage** | LocalStorage | 5-10MB client-side persistence |
| **PWA** | Service Worker | Offline capability, cache management |
| **Cloud Sync** | Google Drive API | Optional cloud backup |

**Dependencies:** All loaded via CDN (no npm, no build step)

---

## 🚀 Quick Start

### **1. Installation**

**Option A: Install as PWA**
```
1. Open https://your-app-url.com in browser
2. Click browser menu → "Install App" or "Add to Home Screen"
3. App icon appears on device home screen
4. Launch like native app
```

**Option B: Use in Browser**
```
1. Navigate to https://your-app-url.com
2. Bookmark for quick access
3. Works offline after first load
```

### **2. Setup Profile**
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
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System design, data flows, architectural decisions | Developers, Contributors |
| **[CODING_GUIDELINES.md](./CODING_GUIDELINES.md)** | Code standards, best practices, conventions | Developers, AI Assistants |
| **[KNOWN_ISSUES.md](./KNOWN_ISSUES.md)** | Active bugs, edge cases, workarounds | Users, Developers |
| **[CHANGELOG_DETAILED.md](./CHANGELOG_DETAILED.md)** | Version history with technical context | All |
| **[DEBUGGING_PLAYBOOK.md](./DEBUGGING_PLAYBOOK.md)** | Step-by-step troubleshooting guide | Users, Support |
| **[EXERCISE_LIBRARY_GUIDE.md](./EXERCISE_LIBRARY_GUIDE.md)** | How to add/modify exercises | Contributors |
| **[HANDOVER_PACKAGE_V26.6.md](./HANDOVER_PACKAGE_V26.6.md)** | Onboarding guide for new developers/AI | Developers, AI Assistants |

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

### **Code Contributions**

1. Read [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) first
2. Follow architectural patterns in [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Test edge cases (empty data, invalid input, offline mode)
4. Create backup before data mutations: `APP.safety.createBackup("operation")`
5. Submit pull request with clear description

### **Bug Reports**

Include:
- Browser version (Chrome, Safari, Firefox, etc.)
- Steps to reproduce
- Console errors (screenshot or copy/paste)
- LocalStorage export (if relevant)

---

## ⚠️ Important Rules (For Developers/AI)

**NEVER:**
- ❌ Use `localStorage` directly → Always use `LS_SAFE` wrapper
- ❌ Use `\n` for line breaks → Always use `<br>` (HTML-safe)
- ❌ Delete data without backup → Always `APP.safety.createBackup()`
- ❌ Skip input validation → Always use `APP.validation` methods

**ALWAYS:**
- ✅ Validate user inputs before processing
- ✅ Use canonical exercise names (fuzzy matching)
- ✅ Preserve backward compatibility
- ✅ Test localStorage edge cases

See [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) for complete rules.

---

## 📞 Support

**For Users:**
- Check [DEBUGGING_PLAYBOOK.md](./DEBUGGING_PLAYBOOK.md) for common issues
- Review [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) for active bugs
- Export data regularly to prevent loss

**For Developers:**
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand design
- Follow [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) for consistency
- Check [HANDOVER_PACKAGE_V26.6.md](./HANDOVER_PACKAGE_V26.6.md) for onboarding

---

## 📜 License

Private use only. Not licensed for public distribution.

---

## 🙏 Acknowledgments

Built with:
- Vanilla JavaScript (no frameworks needed)
- Tailwind CSS (utility-first styling)
- Chart.js (beautiful charts)
- Day.js (lightweight dates)
- Love for lifting heavy things 💪

Developed for clinical & athletic performance. Maintained with strict code integrity.

---

**Version:** V26.6 Stable (December 31, 2025)  
**Status:** Production Ready ✅  
**Next Version:** V27.0 (planned features TBD)

---

*"Manage intensity, reach peak volume."* 🏋️‍♂️
