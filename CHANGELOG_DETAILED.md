# 📜 CHANGELOG (DETAILED) - THE GRIND DESIGN

**Purpose:** Comprehensive version history with technical details and reasoning  
**Format:** Most recent first, with context for future developers

---

## V26.6 - DATA INTEGRITY HOTFIX (December 31, 2025)

### 🎯 **Problem Statement**
Analytics showed fragmented volume data because exercise names in workout logs didn't match canonical library names.

**Example:**
```
User input: "machine pendulum squat"
Stored as: "machine pendulum squat"

User input: "pendulum squat"  
Stored as: "pendulum squat"

Library canonical: "[Machine] Pendulum Squat"

Result: THREE separate exercise IDs → volume split across 3 records
```

### ✅ **Solution Implemented**

#### **Change 1: fuzzyMatchExercise() Returns String**
**Location:** `index.html` lines ~2847-2950

**Before (V26.5):**
```javascript
fuzzyMatchExercise: function(exerciseName) {
  // ... matching logic
  return true;  // ❌ Boolean only (validation)
}
```

**After (V26.6):**
```javascript
fuzzyMatchExercise: function(exerciseName) {
  // ... matching logic
  return "[Machine] Pendulum Squat";  // ✅ Canonical string
  // OR
  return null;  // No match
}
```

**Rationale:**
- Not just validation anymore → also name normalization
- Callers can now enforce canonical names immediately
- Backward compatible (truthy/falsy logic still works)

#### **Change 2: normalizeExerciseNames() Function**
**Location:** `index.html` lines ~3100-3200

**Purpose:** One-time migration to fix historical data

**Logic:**
```javascript
1. Create backup ("v26_6_integrity_fix")
2. Load all workout logs (gym_hist)
3. For each exercise.name:
   a. Run fuzzyMatchExercise(name)
   b. If canonical name found AND different:
      - Overwrite exercise.name with canonical
      - Log the change
      - Increment counter
4. Save updated logs back to localStorage
5. Show toast with stats
```

**Safety Measures:**
- ✅ Mandatory backup before any changes
- ✅ Non-destructive (only updates names, preserves all data)
- ✅ Transparent (console logs all changes)
- ✅ Auto-run at `APP.init()` (background migration)
- ✅ Non-blocking (app loads even if migration fails)

### 📊 **Impact**

**Before V26.6:**
```
Bench Press history:
- "bench press" (50 logs, 60,000kg volume)
- "Bench Press" (30 logs, 36,000kg volume)  
- "[Barbell] Bench Press" (20 logs, 24,000kg volume)

Total shown in analytics: 24,000kg (❌ missing 72,000kg!)
```

**After V26.6:**
```
Bench Press history:
- "[Barbell] Bench Press" (100 logs, 120,000kg volume)

Total shown in analytics: 120,000kg (✅ unified!)
```

### 🧪 **Testing Done**

1. ✅ Tested with 3 exercise name variants → unified to canonical
2. ✅ Verified backup created before migration
3. ✅ Confirmed logs preserved (no data loss)
4. ✅ Analytics charts show unified volume
5. ✅ Custom user exercises (not in library) preserved as-is

### 📝 **Files Modified**
- `index.html` (fuzzyMatchExercise + normalizeExerciseNames)

### 🔗 **Related Issues**
- Fixes: Data fragmentation in analytics
- Enables: More accurate progress tracking
- Prevents: Future fragmentation (enforced at input)

---

## V26.5 - LIBRARY EXPANSION (December 2025)

### 🎯 **Objective**
Expand exercise library with machine variations that have clinical differentiation.

### ✅ **Changes**

#### **Added 40 New Exercises**
**Location:** `exercises-library.js`

**Breakdown by Category:**
- **Legs (15 exercises):**
  - Squat machines: Pendulum, V-Squat, Hack, Belt, Reverse Hack
  - Leg Press variations: Quad Bias, Glute Bias, Vertical, Single Leg
  - Hip/Glute: Hip Thrust Machine, Abduction, Adduction
  - Hamstrings: Lying Curl, Seated Curl, Standing Single Leg Curl

- **Back (12 exercises):**
  - Rows: High Row, Low Row, T-Bar, Converging, Reverse Grip, Single Arm
  - Pulldowns: Converging, Wide Grip, Close Neutral, Reverse Grip
  - Specialized: Pullover Machine, Assisted Pull-Up

- **Chest (8 exercises):**
  - Press angles: Decline, Converging Incline, Wide, Close Grip, Unilateral
  - Flys: Pec Deck, Cable High-to-Low, Cable Low-to-High

- **Shoulders (3 exercises):**
  - Lateral Raise Machine
  - Reverse Pec Deck (Rear Delt)
  - Shoulder Press Machine

- **Arms (2 exercises):**
  - Preacher Curl Machine
  - Tricep Extension Machine

#### **Naming Convention Established**
```javascript
Format: "[Machine] Exercise Name (Focus/Bias if applicable)"

Examples:
✅ "[Machine] Pendulum Squat"
✅ "[Machine] Leg Press (Quad Bias/Low Stance)"
✅ "[Machine] High Row (Upper Back Bias)"
✅ "[Machine] Reverse Hack Squat (Glute Bias)"
```

**Rationale:**
- `[Machine]` prefix → auto-detected by plate calculator
- Focus/Bias → clinical differentiation (e.g., Quad vs Glute emphasis)
- Consistent format → easier fuzzy matching

#### **Clinical Notes Added**
Each exercise includes:
```javascript
{
  n: "Exercise name",
  t_r: "8-12",              // Target reps
  bio: "Biomechanics...",   // Movement mechanics
  note: "Instructions<br>⚠️ CLINICAL: Safety notes",
  vid: ""                   // Placeholder for video
}
```

**Example:**
```javascript
{
  n: "[Machine] Pendulum Squat",
  t_r: "8-12",
  bio: "Kurva resistensi unik dengan jalur arc yang meminimalisir tekanan pada lumbar spine...",
  note: "Kaki selebar bahu... Dorong melalui mid-foot.<br><br>⚠️ CLINICAL: Ideal untuk lifter dengan riwayat lower back issues.",
  vid: ""
}
```

### 🐛 **Critical Bug Discovered & Fixed**

**Issue:** Initial implementation used `\n` for line breaks in `note` field

**Impact:**
```javascript
// Caused "Invalid token" crash when rendered to HTML
note: "Line 1\nLine 2"

// Browser error: Uncaught SyntaxError
```

**Fix:**
```javascript
// Replace all \n with <br>
note: "Line 1<br>Line 2"
```

**Lesson Learned:** Data may be rendered to HTML attributes → never use `\n`

### 📝 **Files Modified**
- `exercises-library.js` (EXERCISE_TARGETS + EXERCISES_LIBRARY)

### 🎓 **Design Decisions**

**Why machines with clinical notes?**
- Many lifters have injuries/limitations
- Machines offer alternatives with lower risk
- Clinical notes guide safe exercise selection

**Why such specific variations?**
- Different machines = different biomechanics
- Example: "Quad Bias Leg Press" ≠ "Glute Bias Leg Press"
- Specificity helps users pick the RIGHT tool for their goal

---

## V26.0-V26.4 - STABILITY IMPROVEMENTS (November-December 2025)

### 🔧 **Bug Fixes & Refinements**

#### **V26.4: Variant Index Safety**
- Added bounds checking for exercise variant selection
- Fixed crash when saved variant index > available options

#### **V26.3: Smart Merge Enhancements**
- Auto-mapping for exercise name variations
- Conflict detection with user prompt
- Backup before merge (safety)

#### **V26.2: LocalStorage Quota Warnings**
- Added size monitoring for large datasets
- Alert user when approaching 5MB limit
- Suggest data cleanup options

#### **V26.1: Exercise Picker Search**
- Improved search algorithm (partial matching)
- Category filters working correctly
- Fixed modal close button alignment

#### **V26.0: Session Rotation Logic**
- "Next Workout" suggestion based on `last_{sessionId}`
- Manual rotation reset capability
- Visual indicators for stale sessions

---

## V25.0 - SMART MERGE ENGINE (October 2025)

### 🎯 **Objective**
Enable AI (Gemini/GPT) to update training programs directly via JSON.

### ✅ **Implementation**

#### **Smart Merge Function**
**Location:** `index.html` → `APP.data.mergeProgram()`

**Features:**
1. **Auto-Exercise Mapping**
   ```javascript
   // AI returns: "pendulum squat"
   // App auto-maps to: "[Machine] Pendulum Squat"
   ```

2. **Conflict Detection**
   ```javascript
   // If sessionId exists in both old and new:
   // Prompt user: Overwrite or Skip?
   ```

3. **Partial Updates Supported**
   ```javascript
   // AI can update just one session:
   { "s1": { ...newData } }
   // Other sessions (s2, s3) remain unchanged
   ```

4. **Safety**
   ```javascript
   // Always backup before merge:
   APP.safety.createBackup("emergency_pre_merge");
   ```

### 🎓 **Use Case**

**Workflow:**
1. User logs workout → Export JSON
2. Send to AI: "Analyze and update my program"
3. AI returns updated JSON with new target weights
4. User pastes → Smart Merge applies changes
5. Next workout uses new targets

**Example AI Response:**
```json
{
  "s1": {
    "title": "Upper Push A",
    "exercises": [{
      "sets": 4,
      "options": [{
        "n": "Bench Press",
        "t_k": 65  // Increased from 60 (progressive overload)
      }]
    }]
  }
}
```

### 📝 **Files Modified**
- `index.html` (APP.data.mergeProgram)

---

## V24.0 - PWA OPTIMIZATION (September 2025)

### 🎯 **Objective**
Transform into installable Progressive Web App with offline capability.

### ✅ **Changes**

#### **Service Worker (sw.js)**
```javascript
// Cache strategy: Network-first with fallback
1. Try network fetch
2. Cache successful responses
3. Fallback to cache if offline

// Assets cached:
- index.html
- manifest.json
- app-logo.png
- External libraries (Tailwind, Chart.js, etc.)
```

#### **Manifest.json**
```json
{
  "name": "THE GRIND DESIGN",
  "short_name": "TheGrind",
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#0f172a"
}
```

#### **Offline Capability**
- ✅ All core features work offline
- ✅ Analytics render from cached data
- ✅ Exercise library pre-cached
- ❌ Cloud sync requires internet (expected)

### 📝 **Files Added**
- `sw.js`
- `manifest.json`

---

## V23.0 - CLINICAL ANALYTICS (August 2025)

### 🎯 **Objective**
Add fatigue monitoring and progressive overload tracking.

### ✅ **Features Added**

#### **1. RPE/RIR Tracking**
```javascript
// Per-set intensity tracking:
rpe: 8,  // Rate of Perceived Exertion (6-10)
e: 2     // RIR - Reps in Reserve (0-4)
```

**Use Case:**
- Detect systemic fatigue (average RPE trend)
- Identify overreaching (consistent RPE 9-10)
- Guide deload timing

#### **2. Volume Progression Chart**
- Line chart: Top Set (kg) over time
- Bar chart: Total Volume (kg) per session
- Dual Y-axis for clarity

#### **3. Fatigue Audit**
```javascript
// Auto-detect fatigue:
if (avgWeeklyRPE > 8.5) {
  alert("High fatigue detected. Consider deload or rest day.");
}
```

#### **4. Weekly Summary Dashboard**
- This week vs last week comparison
- Volume, RPE, Sessions count
- Top gainers (exercises with most volume increase)

### 📝 **Files Modified**
- `index.html` (APP.stats namespace)

---

## V22.0 - GOOGLE DRIVE BACKUP (July 2025)

### 🎯 **Objective**
Cloud backup/restore capability for data safety.

### ✅ **Implementation**

**OAuth 2.0 Flow:**
```javascript
1. User clicks "Sync to Cloud"
2. Google OAuth popup
3. Request appDataFolder scope
4. Upload JSON to Drive
5. Success toast
```

**Restore Flow:**
```javascript
1. User clicks "Restore from Cloud"
2. Fetch JSON from Drive
3. Download local copy (manual backup)
4. Overwrite localStorage
5. Reload app
```

**Safety:**
- Always download backup file before overwrite
- Confirm dialog before restore
- Stored in appDataFolder (hidden from user's Drive UI)

### 📝 **Files Modified**
- `index.html` (Google Drive API integration)

---

## V21.0 - EXERCISE LIBRARY FOUNDATION (June 2025)

### 🎯 **Objective**
Create comprehensive exercise database with biomechanics notes.

### ✅ **Implementation**

#### **Data Structure**
```javascript
// EXERCISE_TARGETS (muscle mapping)
{
  "Bench Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" }
  ]
}

// EXERCISES_LIBRARY (full details)
{
  chest: [
    {
      n: "Bench Press",
      t_r: "6-8",
      bio: "Gold standard for chest...",
      note: "Use leg drive...",
      vid: "https://youtube.com/..."
    }
  ]
}
```

#### **Features**
- 100+ exercises across 6 muscle groups
- Biomechanics explanations
- Technique notes
- Video links (YouTube)
- Target rep ranges

### 📝 **Files Added**
- `exercises-library.js`

---

## V20.0 - SPONTANEOUS MODE (May 2025)

### 🎯 **Objective**
Allow logging workouts without affecting rotation schedule.

### ✅ **Use Cases**
- Active recovery sessions
- Extra cardio
- Experimental training
- Gym partner requests

### ✅ **Implementation**
```javascript
// Special session ID:
APP.state.workoutData.spontaneous = {
  label: "SPONTAN",
  title: "Active Recovery / Cardio",
  exercises: []
};

// Logging spontaneous session:
// Does NOT update last_{sessionId}
// Does NOT affect "Next Workout" suggestion
// Still saves to gym_hist for tracking
```

### 📝 **Files Modified**
- `index.html` (APP.state.spontaneousMode flag)

---

## V19.0 - BACKUP SYSTEM (April 2025)

### 🎯 **Objective**
Protect user data from destructive operations.

### ✅ **Implementation**

#### **Auto-Backup Triggers**
- Before session deletion
- Before program merge
- Before bulk operations
- Before restore from cloud

#### **Backup Management**
```javascript
APP.safety = {
  createBackup(operation),   // Create timestamped backup
  listBackups(),             // Show all available backups
  restore(backupId),         // Restore from backup
  pruneOldBackups(maxCount)  // Keep last N backups
};
```

#### **Storage**
```javascript
// Format:
"backup_1234567890_operation_name"

// Contains:
{
  workoutData,
  gym_hist,
  profile,
  weights,
  blueprints,
  timestamp,
  operation
}
```

### 📝 **Files Modified**
- `index.html` (APP.safety namespace)

---

## V18.0 - PLATE CALCULATOR (March 2025)

### 🎯 **Objective**
Auto-calculate plates needed for barbell exercises.

### ✅ **Logic**
```javascript
// Detect exercise type from tag:
"[Barbell] Bench Press" → Show barbell calculator
"[Machine] Leg Press"   → Show stack/pin selector
"[DB] Bicep Curl"       → Show dumbbell selector
"[Cable] Tricep Pushd"  → Show cable stack

// Barbell calculation:
Target: 100kg
- Bar: 20kg
- Remaining: 80kg (40kg per side)
- Plates: 1×20kg, 1×15kg, 1×5kg per side
```

### 📝 **Files Modified**
- `index.html` (plate calculator logic)

---

## V17.0 - SESSION EDITOR (February 2025)

### 🎯 **Objective**
Allow in-app editing of workout sessions.

### ✅ **Features**
- Edit session metadata (title, label, warmup)
- Add/remove exercises
- Modify sets/rest periods
- Reorder exercises (drag or buttons)
- Add exercise variants
- Delete sessions with confirmation

### 📝 **Files Modified**
- `index.html` (APP.session namespace)

---

## V16.0 - LS_SAFE WRAPPER (January 2025)

### 🎯 **Objective**
Robust localStorage access with error handling.

### ✅ **Implementation**
```javascript
const LS_SAFE = {
  get(key),              // Returns string or null
  set(key, value),       // Returns boolean (success)
  getJSON(key, default), // Parses JSON, returns default if error
  setJSON(key, value),   // Stringifies and saves
  remove(key)            // Delete key
};
```

**Error Handling:**
- QuotaExceededError → Alert user
- Parse errors → Auto-delete corrupt data, return default
- Invalid keys → Log error, return null
- Large data → Console warning

### 📝 **Files Modified**
- `index.html` (LS_SAFE global object)

---

## V15.0 - VALIDATION FRAMEWORK (December 2024)

### 🎯 **Objective**
Prevent corrupt data from entering system.

### ✅ **Validators**
```javascript
APP.validation = {
  validateSession(sessionId),
  validateExercise(sessionId, exerciseIdx),
  validateExerciseIntegrity(sessionData),
  sanitizeNumber(value, min, max, default),
  isValidSetKey(key),
  cleanCorruptData()
};
```

**Applied At:**
- User input (before save)
- LocalStorage reads (after load)
- JSON imports (before merge)
- Session operations (before mutation)

### 📝 **Files Modified**
- `index.html` (APP.validation namespace)

---

## V14.0 - CHART.JS INTEGRATION (November 2024)

### 🎯 **Objective**
Visual progress tracking with interactive charts.

### ✅ **Charts Added**
1. **Progress Chart** (line + bar combo)
   - Top Set (kg) - line
   - Volume (kg) - bars

2. **Volume Distribution** (horizontal bars)
   - Volume by muscle group
   - Color-coded

3. **Cardio Chart** (dual-axis line)
   - Duration (min)
   - Heart Rate (bpm)

### 📝 **Files Modified**
- `index.html` (APP.stats.renderChart functions)
- Added Chart.js CDN

---

## V13.0 - CARDIO TRACKING (October 2024)

### 🎯 **Objective**
Support cardio/conditioning sessions (non-resistance training).

### ✅ **Implementation**
```javascript
// Cardio log structure:
{
  type: "cardio",        // vs "strength"
  duration: 45,          // minutes
  avgHR: 135,            // bpm
  zoneTarget: [120,140], // Zone 2 target
  distance: 8.5,         // km (optional)
  calories: 420          // optional
}
```

### 📝 **Files Modified**
- `index.html` (cardio logging logic)

---

## V12.0 - CALENDAR VIEW (September 2024)

### 🎯 **Objective**
Monthly overview of workout history.

### ✅ **Features**
- Month grid with workout indicators
- Click date → See session details
- Color-coded by volume/intensity
- Navigation (prev/next month)

### 📝 **Files Modified**
- `index.html` (calendar rendering)
- Added Day.js for date manipulation

---

## V11.0 - WEIGHT TRACKING (August 2024)

### 🎯 **Objective**
Track bodyweight for TDEE accuracy.

### ✅ **Implementation**
```javascript
// Storage:
"weights": [
  { d: "2024-08-15", v: 75.5 },
  { d: "2024-08-22", v: 76.0 }
]

// TDEE Calculation:
BMR = 10×kg + 6.25×height - 5×age + sex_offset
TDEE = BMR × activity_factor
```

### 📝 **Files Modified**
- `index.html` (weight tracking UI)

---

## V10.0 - PROFILE SYSTEM (July 2024)

### 🎯 **Objective**
Store user anthropometrics for calculations.

### ✅ **Data Stored**
```javascript
{
  name: "Dok",
  h: 175,      // height (cm)
  a: 30,       // age
  g: "male",   // gender
  act: 1.55    // activity factor
}
```

### 📝 **Files Modified**
- `index.html` (profile management)

---

## V9.0 - SESSION ROTATION LOGIC (June 2024)

### 🎯 **Objective**
Auto-suggest next workout based on least recent.

### ✅ **Implementation**
```javascript
// Track last performed:
LS_SAFE.set("last_s1", Date.now());

// Next workout = session with oldest timestamp
// or session never performed (no timestamp)
```

### 📝 **Files Modified**
- `index.html` (rotation suggestion)

---

## V8.0 - WORKOUT LOGGING (May 2024)

### 🎯 **Objective**
Record actual performance during workout.

### ✅ **Storage Format**
```javascript
// Per-set data stored as:
"{sessionId}_ex{idx}_s{setIdx}_k" = weight (kg)
"{sessionId}_ex{idx}_s{setIdx}_r" = reps
"{sessionId}_ex{idx}_s{setIdx}_rpe" = RPE
"{sessionId}_ex{idx}_s{setIdx}_e" = RIR

// On complete → consolidated to gym_hist
```

### 📝 **Files Modified**
- `index.html` (logging workflow)

---

## V7.0 - EXERCISE VARIANTS (April 2024)

### 🎯 **Objective**
Allow multiple exercise options per slot.

### ✅ **Use Case**
```javascript
// Session has:
"Chest Press" with 3 variants:
- [Barbell] Bench Press
- [DB] Dumbbell Press
- [Machine] Chest Press

// User picks based on:
- Equipment availability
- Preference
- Injury considerations
```

### 📝 **Files Modified**
- `index.html` (variant selection UI)

---

## V6.0 - MODAL SYSTEM (March 2024)

### 🎯 **Objective**
Centralized modal management for clean UI.

### ✅ **Modals**
- Exercise Picker
- Session Editor
- Session Creator
- Library Info
- Calendar
- RPE Guide

### 📝 **Files Modified**
- `index.html` (APP.ui.openModal/closeModal)

---

## V5.0 - NAVIGATION SYSTEM (February 2024)

### 🎯 **Objective**
Multi-view architecture (Dashboard, Workout, Stats).

### ✅ **Views**
```javascript
APP.nav.switchView('dashboard'); // Home
APP.nav.switchView('workout');   // Active session
APP.nav.switchView('stats');     // Analytics
```

### 📝 **Files Modified**
- `index.html` (view management)

---

## V4.0 - TAILWIND CSS INTEGRATION (January 2024)

### 🎯 **Objective**
Rapid UI development with utility-first CSS.

### ✅ **Approach**
- CDN-based (no build step)
- Dark theme (slate-900 base)
- Responsive (mobile-first)

### 📝 **Files Modified**
- `index.html` (Tailwind CDN added)

---

## V3.0 - CORE DATA STRUCTURE (December 2023)

### 🎯 **Objective**
Define program schema for workouts.

### ✅ **Schema**
```javascript
{
  "s1": {
    label: "SESI 1",
    title: "Upper Push",
    exercises: [
      {
        sets: 4,
        rest: 120,
        note: "Chest compound",
        options: [{
          n: "Bench Press",
          t_r: "6-8",
          t_k: 60
        }]
      }
    ]
  }
}
```

### 📝 **Files Modified**
- `index.html` (APP.state.workoutData)

---

## V2.0 - LOCALSTORAGE FOUNDATION (November 2023)

### 🎯 **Objective**
Offline-first data persistence.

### ✅ **Keys Established**
- `cscs_program_v10` (main program)
- `gym_hist` (workout logs)
- `profile` (user data)

### 📝 **Files Modified**
- `index.html` (localStorage integration)

---

## V1.0 - INITIAL MVP (October 2023)

### 🎯 **Objective**
Proof of concept for gym tracking app.

### ✅ **Features**
- Single HTML file
- Vanilla JavaScript
- Basic workout logging
- No external dependencies

### 📝 **Files Created**
- `index.html`

---

## 🎓 VERSION NAMING CONVENTION

```
V{MAJOR}.{MINOR}

MAJOR: Significant architectural changes or breaking features
MINOR: Incremental improvements, bug fixes

Examples:
V26.6 = V26 (major stability/features) + .6 (6th iteration)
V25.0 = V25 (new major feature: Smart Merge)
```

---

## 📊 VERSION STATISTICS

**Total Versions:** 27 (V1 → V26.6)  
**Development Duration:** ~15 months (Oct 2023 - Dec 2025)  
**Major Milestones:**
- V1: MVP
- V10: Profile system complete
- V20: Spontaneous mode
- V25: AI integration
- V26: Library expansion + data integrity

**Files Created:**
- `index.html` (V1)
- `exercises-library.js` (V21)
- `sw.js` (V24)
- `manifest.json` (V24)

**Total Lines of Code:** ~17,000 (index.html) + ~2,500 (exercises-library.js)

---

**END OF CHANGELOG_DETAILED.md**
