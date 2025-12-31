# 🏗️ ARCHITECTURE DOCUMENTATION - THE GRIND DESIGN

**Version:** V26.6  
**Last Updated:** December 31, 2025  
**Purpose:** System design decisions, patterns, and architectural principles

---

## 📐 HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                     │
│  (Tailwind CSS, Font Awesome, Modal System, Toast Alerts)   │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LOGIC LAYER                     │
│                      (APP Namespace)                         │
├─────────────────────────────────────────────────────────────┤
│  APP.validation  │  APP.data    │  APP.session  │  APP.ui   │
│  APP.stats       │  APP.safety  │  APP.nav      │  APP.core │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                         │
│                    (LS_SAFE Wrapper)                         │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                   PERSISTENCE LAYER                          │
│              (Browser LocalStorage API)                      │
└─────────────────────────────────────────────────────────────┘

EXTERNAL:
├── EXERCISE_TARGETS (exercises-library.js)
├── EXERCISES_LIBRARY (exercises-library.js)
├── Service Worker (sw.js - PWA offline capability)
└── Google Drive API (Cloud Backup/Restore)
```

---

## 🎯 CORE DESIGN PRINCIPLES

### 1. **OFFLINE-FIRST PWA**
**Decision:** Browser LocalStorage as primary database  
**Rationale:**
- No backend → zero server costs
- Works offline (critical for gym environment)
- Data privacy (stays on device)
- Instant load times

**Trade-offs:**
- ✅ Simplicity, speed, privacy
- ❌ Storage limit (~5-10MB), no multi-device sync (without manual cloud backup)

---

### 2. **MODULE-BASED NAMESPACE**
**Decision:** Single global `APP` object with sub-namespaces  
**Rationale:**
- Avoid global scope pollution
- Logical code organization
- Easy debugging (console.log(APP))

**Pattern:**
```javascript
const APP = {
  state: {},        // Application state
  validation: {},   // Input validation & fuzzy matching
  data: {},         // CRUD operations
  session: {},      // Session management
  stats: {},        // Analytics & charts
  safety: {},       // Backup/restore
  ui: {},          // UI rendering
  nav: {},         // Navigation
  core: {}         // Core utilities
};
```

**Why NOT classes/modules?**
- Vanilla JS requirement (no build step)
- Single HTML file deployment
- Performance (no module loading overhead)

---

### 3. **DATA INTEGRITY FIRST**
**Decision:** Mandatory validation + backup before mutations  
**Rationale:** User's workout history is irreplaceable

**Implementation:**
```javascript
// ALWAYS:
APP.safety.createBackup("operation_name");  // Backup first
APP.validation.validateSession(sessionId);  // Validate
// ... perform mutation
APP.core.saveProgram();                     // Persist
```

**Key Rules:**
- ❌ NEVER use `localStorage` directly → use `LS_SAFE` wrapper
- ✅ ALWAYS validate inputs → use `APP.validation` methods
- ✅ ALWAYS backup before destructive operations
- ✅ ALWAYS use try-catch for critical operations

---

### 4. **CANONICAL EXERCISE NAMES**
**Decision:** Fuzzy matching with canonical name enforcement  
**Rationale:** Prevent data fragmentation in analytics

**Problem Solved:**
```
Before V26.6:
- User input: "machine pendulum squat" → ID: "machine_pendulum_squat"
- User input: "pendulum squat" → ID: "pendulum_squat"
- Library: "[Machine] Pendulum Squat" → ID: "machine_pendulum_squat"
→ Result: 3 separate IDs, fragmented volume data

After V26.6:
- ANY input → fuzzyMatchExercise() → "[Machine] Pendulum Squat"
→ Result: Single canonical ID, unified analytics
```

**Implementation:**
```javascript
// V26.6 Hotfix
APP.validation.fuzzyMatchExercise(userInput)
// Returns: canonical string or null (not boolean)
```

---

### 5. **AI-READY JSON STRUCTURE**
**Decision:** Smart Merge Engine for program updates  
**Rationale:** Enable AI (Gemini/GPT) to update training programs

**Use Case:**
1. User logs workout
2. Export JSON → Send to AI for analysis
3. AI returns updated program JSON
4. User pastes → Smart Merge applies updates

**Merge Logic:**
- Auto-map exercise names (fuzzy matching)
- Conflict detection (prompt user)
- Preserve existing data integrity
- Backup before merge

---

## 📊 DATA SCHEMA

### **Primary Keys (LocalStorage)**

| Key | Type | Description | Schema |
|-----|------|-------------|--------|
| `cscs_program_v10` | Object | Main workout program | `{sessionId: {label, title, exercises[]}}` |
| `gym_hist` | Array | Workout history logs | `[{ex, vol, top, date, src, d[]}]` |
| `profile` | Object | User profile | `{name, h, a, g, act}` |
| `weights` | Array | Bodyweight tracking | `[{d, v}]` |
| `blueprints` | Array | Saved program templates | `[{name, data}]` |
| `backup_*` | Object | Safety backups | `{workoutData, gym_hist, timestamp}` |
| `last_{sessionId}` | Timestamp | Last performed date | `1735689600000` |
| `pref_{sessionId}_{exIdx}` | Number | Variant preference | `0` |

---

### **Data Structures**

#### **Workout Session (in cscs_program_v10)**
```javascript
{
  "s1": {
    label: "SESI 1",               // Display label
    title: "Upper Push A",         // Session name
    dynamic: "Arm Circles, ...",   // Warmup protocol
    exercises: [
      {
        sets: 4,                   // Number of sets
        rest: 120,                 // Rest seconds
        note: "Chest compound",    // Exercise category note
        options: [                 // Exercise variants
          {
            n: "[Barbell] Bench Press",  // Exercise name (canonical)
            t_r: "6-8",                  // Target reps
            t_k: 60,                     // Target weight (kg)
            bio: "Gold standard...",     // Biomechanics note
            note: "Use leg drive...",    // Execution note
            vid: "https://..."           // Video URL
          }
        ]
      }
    ]
  }
}
```

#### **Workout Log (in gym_hist)**
```javascript
{
  date: "2025-12-31",           // Date performed
  src: "s1",                    // Source session ID
  title: "Upper Push A",        // Session title
  ex: "[Barbell] Bench Press",  // Exercise name (canonical)
  type: "strength",             // "strength" or "cardio"
  vol: 1200,                    // Total volume (kg)
  top: 60,                      // Top set weight (kg)
  d: [                          // Set data
    {
      k: 60,                    // Weight (kg)
      r: 5,                     // Reps
      rpe: 8,                   // RPE (6-10)
      e: 2                      // RIR (0-4)
    }
  ]
}
```

---

## 🔄 CRITICAL DATA FLOWS

### **Flow 1: Exercise Picker → Session Update**
```
1. User clicks "Add Exercise"
   → APP.ui.openExercisePicker(mode, sessionId, exerciseIdx)

2. User searches/selects exercise
   → APP.ui.filterExercises()
   → Display from EXERCISES_LIBRARY

3. User confirms selection
   → APP.ui.confirmExercisePicker()
   → Validate: APP.validation.fuzzyMatchExercise(exerciseName)
   → Get canonical name

4. Update session data
   → If mode="new": Add to session.exercises[]
   → If mode="variant": Add to exercise.options[]
   → APP.core.saveProgram()

5. Re-render UI
   → APP.nav.loadWorkout(sessionId)
```

---

### **Flow 2: Log Workout → History Update**
```
1. User completes workout
   → Collect all set data from localStorage keys
   → Format: {sessionId}_ex{idx}_s{setIdx}_{k|r|rpe|e}

2. Validate data
   → Check all required fields exist
   → Validate RPE/RIR ranges
   → Calculate volume (Σ k×r)

3. Create log entry
   → Build workout log object
   → Enforce canonical exercise name
   → Add to gym_hist array

4. Update rotation
   → Set last_{sessionId} = timestamp
   → Clear localStorage workout keys
   → APP.nav.renderDashboard()
```

---

### **Flow 3: Smart Merge (AI Program Update)**
```
1. User pastes JSON from AI
   → APP.data.mergeProgram(newData)

2. Backup current state
   → APP.safety.createBackup("emergency_pre_merge")

3. Exercise name auto-mapping
   → Loop all exercises in newData
   → Run fuzzyMatchExercise() on each
   → Replace with canonical names
   → Count auto-corrections

4. Conflict detection
   → Check if sessionId exists
   → Prompt user: overwrite or skip

5. Merge & save
   → Update APP.state.workoutData
   → APP.core.saveProgram()
   → Show toast with stats
```

---

## 🛡️ ERROR HANDLING STRATEGY

### **Layer 1: Input Validation (Prevention)**
```javascript
// Validate BEFORE processing
APP.validation.validateSession(sessionId);
APP.validation.validateExercise(sessionId, exerciseIdx);
APP.validation.sanitizeNumber(value, min, max, defaultVal);
```

### **Layer 2: LS_SAFE Wrapper (Protection)**
```javascript
// Auto-handles localStorage errors
LS_SAFE.setJSON(key, value);  // Returns boolean
LS_SAFE.getJSON(key, default); // Returns default if error
```

### **Layer 3: Try-Catch (Recovery)**
```javascript
// Critical operations wrapped
try {
  APP.safety.createBackup("operation");
  // ... mutation
} catch (e) {
  console.error("Operation failed:", e);
  APP.ui.showToast("⚠️ Operation failed", "error");
}
```

### **Layer 4: Backup System (Undo)**
```javascript
// Always create backup before mutations
APP.safety.createBackup("operation_name");
// User can manually restore if needed
```

---

## 🎨 UI ARCHITECTURE

### **Modal System**
```javascript
// Centralized modal management
APP.ui.openModal('exercise-picker');
APP.ui.closeModal('exercise-picker');

// Available modals:
- 'exercise-picker'
- 'session-editor'
- 'session-creator'
- 'library'
- 'calendar'
- 'rpe'
```

### **Toast Notifications**
```javascript
APP.ui.showToast(message, type);
// Types: 'success', 'error', 'warning'
```

### **View Management**
```javascript
APP.nav.switchView('dashboard');
// Views: 'dashboard', 'workout', 'stats'
```

---

## ⚡ PERFORMANCE CONSIDERATIONS

### **1. LocalStorage Size Optimization**
- JSON.stringify with no formatting (compact)
- Prune old backups (keep last 5 only)
- Warning if data >1MB

### **2. Chart Rendering**
- Destroy previous Chart.js instance before creating new
- Limit data points displayed (performance threshold)
- Lazy load chart data

### **3. Exercise Library**
- Loaded once from external .js file
- Cached in window.EXERCISE_TARGETS
- No runtime fetching needed

---

## 🔐 SECURITY CONSIDERATIONS

### **Data Privacy**
- All data stored locally (no server transmission)
- Google Drive backup requires explicit user auth
- No analytics/tracking

### **Input Sanitization**
- HTML injection prevented (use textContent, not innerHTML for user input)
- JSON parsing with try-catch
- Number validation before arithmetic operations

---

## 🚀 PWA ARCHITECTURE

### **Service Worker Strategy (sw.js)**
```javascript
// Cache-first with network fallback
1. Try fetch from network
2. Cache successful responses
3. Fallback to cache if offline
```

### **Offline Capability**
- All core features work offline
- Charts render from cached data
- Exercise library pre-cached

### **Installation**
- Manifest.json enables "Add to Home Screen"
- App logo, theme color configured
- Standalone display mode

---

## 📦 DEPENDENCY STRATEGY

### **External Libraries (CDN)**
- Tailwind CSS (styling)
- Font Awesome (icons)
- Chart.js (analytics charts)
- Day.js (date handling)
- Google Drive API (cloud sync)

**Why CDN?**
- No build step required
- Auto-updates (cache busting)
- Reduced bundle size

**Risk Mitigation:**
- Service Worker caches CDN assets
- App works offline after first load

---

## 🔄 VERSION MIGRATION STRATEGY

### **Backwards Compatibility**
- Never delete localStorage keys without backup
- Add new keys, don't rename existing
- Data from V1 should work in V26.6

### **Migration Functions**
```javascript
// V26.6 Example
APP.data.normalizeExerciseNames()
// Runs at APP.init() automatically
// Non-destructive (backup first)
```

---

## 🎯 DESIGN DECISIONS RATIONALE

### **Why Vanilla JS?**
- ✅ No build complexity
- ✅ Single file deployment
- ✅ Easy debugging
- ✅ Fast load times
- ❌ No framework goodies (but not needed for this scope)

### **Why LocalStorage instead of IndexedDB?**
- ✅ Simpler API
- ✅ Synchronous access (no async complexity)
- ✅ Sufficient for data size (<5MB typical)
- ❌ Lower storage limit (but adequate for use case)

### **Why Module Pattern instead of Classes?**
- ✅ No transpilation needed
- ✅ Better console debugging (single global object)
- ✅ Simpler mental model
- ✅ All code in one place

### **Why Smart Merge instead of Full Replace?**
- ✅ Preserve user customizations
- ✅ Allow partial updates (one session only)
- ✅ Conflict resolution (user control)
- ❌ More complex code (but worth it)

---

## 📝 NAMING CONVENTIONS

### **Functions**
- camelCase: `loadWorkout()`, `renderDashboard()`
- Verb-first: `validateSession()`, `createBackup()`

### **Variables**
- camelCase: `sessionId`, `exerciseIdx`
- Descriptive: `workoutLogs` not `wl`

### **Constants**
- SCREAMING_SNAKE_CASE: `EXERCISE_TARGETS`, `LS_SAFE`

### **LocalStorage Keys**
- Descriptive: `cscs_program_v10`, `gym_hist`
- Prefixed for grouping: `backup_*`, `pref_*`, `last_*`

---

## 🧩 EXTENSIBILITY POINTS

### **Adding New Exercise**
Location: `exercises-library.js`
```javascript
// 1. Add to EXERCISE_TARGETS
"[Barbell] New Exercise": [{ muscle: "chest", role: "PRIMARY" }]

// 2. Add to EXERCISES_LIBRARY.chest
{ n: "[Barbell] New Exercise", t_r: "8-12", bio: "...", note: "..." }
```

### **Adding New Session Type**
Location: `index.html` → `APP.state.workoutData`
```javascript
APP.state.workoutData.newSession = {
  label: "SESI X",
  title: "Custom Session",
  exercises: []
};
```

### **Adding New Analytics Chart**
Location: `index.html` → `APP.stats`
```javascript
APP.stats.renderNewChart = (data) => {
  // Chart.js implementation
};
```

---

## 🎓 LEARNING RESOURCES

**For understanding the codebase:**
1. Read `index.html` → `APP` object structure
2. Read `exercises-library.js` → Data schema
3. Read `HANDOVER_PACKAGE_V26.6.md` → Context & rules
4. Read this file → Architecture decisions

**Critical sections to understand:**
- Lines 150-300: LS_SAFE wrapper (data safety)
- Lines 2800-3100: fuzzyMatchExercise (canonical names)
- Lines 3100-3200: normalizeExerciseNames (data integrity)
- Lines 5500-6000: Smart Merge Engine (AI integration)

---

**END OF ARCHITECTURE.md**
