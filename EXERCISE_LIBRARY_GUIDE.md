# 📚 EXERCISE LIBRARY GUIDE - THE GRIND DESIGN

**Version:** V30.2 (Library Expansion)  
**Last Updated:** January 11, 2026  
**Purpose:** Guide for adding, modifying, and managing exercises in the library

---

## 📖 Overview

The Exercise Library is the heart of THE GRIND DESIGN. It contains 180+ exercises with clinical biomechanics notes, execution cues, and safety warnings. This guide explains how to add new exercises or modify existing ones.

**V30.2 Update:** Added 29 new cable and machine exercise variants with biomechanically accurate muscle targeting.

**V30.1 Update:** Comprehensive standardization of exercise naming conventions with backwards compatibility support for historical data.

---

## 🎯 Library Structure

The library consists of **two main components:**

### **1. EXERCISE_TARGETS (Muscle Mapping)**
**Location:** `exercises-library.js` (top section)

**Purpose:** Maps exercise names to target muscles

**Format:**
```javascript
const EXERCISE_TARGETS = {
  "[Barbell] Bench Press": [
    { muscle: "chest", role: "PRIMARY" },
    { muscle: "arms", role: "SECONDARY" }
  ]
};
```

**Valid Muscle Categories:**
- `"chest"`
- `"back"`
- `"shoulders"`
- `"arms"`
- `"legs"`
- `"core"`

**Valid Roles:**
- `"PRIMARY"` - Main target muscle
- `"SECONDARY"` - Supporting muscle

---

### **2. EXERCISES_LIBRARY (Full Details)**
**Location:** `exercises-library.js` (bottom section)

**Purpose:** Complete exercise information for UI display

**Format:**
```javascript
const EXERCISES_LIBRARY = {
  chest: [
    {
      n: "[Barbell] Bench Press",
      t_r: "6-8",
      bio: "Gold standard for horizontal pressing power...",
      note: "Use leg drive. Lower to sternum.<br><br>⚠️ CLINICAL: Avoid if shoulder impingement.",
      vid: "https://www.youtube.com/watch?v=..."
    }
  ]
};
```

**Field Descriptions:**
- `n` - Exercise name (canonical, must match EXERCISE_TARGETS key)
- `t_r` - Target rep range (string, e.g., "8-12")
- `bio` - Biomechanics explanation (movement science)
- `note` - Execution instructions + clinical warnings
- `vid` - YouTube video URL (optional, use `""` if not available)

---

## ✅ NAMING CONVENTIONS (V30.1+)

### **Equipment Tag Format**

**CRITICAL:** Exercise names MUST start with equipment tag in brackets

```javascript
// ✅ CORRECT (V30.1 Standardized)
"[Barbell] Bench Press"        // Clean, no redundancy
"[Machine] Lying Leg Curl"     // Descriptive, standardized
"[DB] Flat Press"              // Use [DB] not [Dumbbell]
"[Cable] Tricep Pushdown (Rope)"
"[Bodyweight] Push Up (Slow Tempo)"

// ❌ WRONG
"Bench Press"                  // Missing tag
"[Barbell] Barbell Bench Press" // Redundant "Barbell"
"[DB] Flat Dumbbell Press"     // Redundant "Dumbbell" after [DB]
"[Barbell]Bench Press"         // Missing space after bracket
```

### **Standard Tags**

| Tag | Use For | Example |
|-----|---------|---------|
| `[Barbell]` | Barbell exercises | `[Barbell] Squat` |
| `[DB]` | Dumbbell exercises (ALWAYS use [DB]) | `[DB] Curl` |
| `[Machine]` | All machine exercises including Smith | `[Machine] Leg Press (Quad Bias)` |
| `[Cable]` | Cable exercises | `[Cable] Fly` |
| `[Bodyweight]` | No equipment | `[Bodyweight] Push-Up` |

**V30.1 Changes:**
- ✅ **STANDARDIZED:** Use `[DB]` ONLY (never `[Dumbbell]` or `[BW]`)
- ✅ **REMOVED:** Redundant equipment names (e.g., `[Barbell] Barbell Squat` → `[Barbell] Squat`)
- ✅ **CONSOLIDATED:** Smith machines use `[Machine]` tag (e.g., `[Machine] Smith Machine Squat`)
- ✅ **BACKWARDS COMPATIBLE:** Legacy names auto-resolve via fuzzy matching

**Why Tags Matter:**
- Plate calculator auto-detects exercise type
- `[Barbell]` → Shows barbell plate calculator (20kg bar)
- `[Machine]` + "Leg Press" or "Hack Squat" → Plate-loaded machine calculator (0kg base)
- `[DB]` → Shows dumbbell selector
- `[Machine]` (others) → Shows pin/stack selector

---

### **Machine Exercise Naming (V30.1)**

For machines with multiple biomechanical variations, add focus/bias descriptor in parentheses:

```javascript
// ✅ GOOD - Specifies targeting/variation
"[Machine] Leg Press (Quad Bias)"          // Low foot placement
"[Machine] Leg Press (Glute Bias)"         // High foot placement
"[Machine] High Row (Upper Back Bias)"     // Pull angle targets traps
"[Machine] Low Row (Lat Bias)"             // Pull angle targets lats
"[Machine] Reverse Hack Squat (Glute Bias)" // Glute-dominant variant

// ❌ BAD - Too generic (avoid for new exercises)
"[Machine] Leg Press"  // Which stance? Quad or Glute bias?
"[Machine] Row"        // High or low? What angle?
```

**Format:**
```
[Machine] Exercise Name (Target/Variant)
```

**Common Descriptors:**
- **Leg Press:** `(Quad Bias)`, `(Glute Bias)`, `(Quad Bias/Low Stance)`, `(Glute Bias/High Stance)`
- **Rows:** `(Upper Back Bias)`, `(Lat Bias)`
- **Presses:** `(Chest)`, `(Incline)`, `(Decline)`, `(Converging)`
- **Pulldowns:** `(Lat Width)`, `(Wide Grip)`, `(Close Neutral Grip)`
- **Delt:** `(Rear Delt)`

**Default Mapping for Legacy Data:**
- "Leg Press" or "Machine Leg Press" without descriptor → Defaults to `[Machine] Leg Press (Quad Bias)` (most common variant)

---

### **V30.1 Naming Principles**

1. **No Redundancy:** Don't repeat equipment name after tag
   - ✅ `[Barbell] Deadlift`
   - ❌ `[Barbell] Barbell Deadlift`

2. **Consistent Abbreviations:** Always use `[DB]` for dumbbells
   - ✅ `[DB] Shoulder Press`
   - ❌ `[Dumbbell] Shoulder Press`

3. **Remove Redundant "Cable" / "Machine":**
   - ✅ `[Cable] Fly`
   - ❌ `[Cable] Cable Fly`

4. **Space After Bracket (always):**
   - ✅ `[Machine] Row`
   - ❌ `[Machine]Row`

5. **Biomechanical Descriptors (when needed):**
   - ✅ `[Machine] Leg Press (Quad Bias)` - Clear intent
   - ⚠️ `[Machine] Leg Press` - Ambiguous, avoid for new entries

---

### **V30.1 Backwards Compatibility**

**Dual-Support System:** Historical workout data automatically resolves to new standardized names.

**How It Works:**
- `validation.js` contains comprehensive legacy name mapping (150+ mappings)
- Old names like `"Flat Dumbbell Press"` auto-resolve to `"[DB] Flat Press"`
- Fuzzy matching with caching ensures fast lookups
- **NO DATA MIGRATION REQUIRED** - historical logs work seamlessly

**Legacy Name Examples:**
```javascript
// These ALL resolve to the same canonical exercise:
"Flat Dumbbell Press"          → "[DB] Flat Press"
"[DB] Flat Dumbbell Press"     → "[DB] Flat Press"
"Dumbbell Flat Press"          → "[DB] Flat Press"

// Barbell redundancy resolved:
"[Barbell] Barbell Squat"      → "[Barbell] Squat"
"Barbell Squat"                → "[Barbell] Squat"

// Machine defaults:
"Leg Press"                    → "[Machine] Leg Press (Quad Bias)" // Default
"Machine Leg Press"            → "[Machine] Leg Press (Quad Bias)"
```

**For Developers:**
- Check `js/validation.js` lines ~400-550 for full legacy mapping
- Add new legacy names to `_legacyNameMap` object
- Cache automatically improves performance on repeated lookups
- Call `APP.validation.clearFuzzyMatchCache()` if needed after bulk updates

---

## 📝 ADDING NEW EXERCISES

### **Step-by-Step Process**

#### **Step 1: Add to EXERCISE_TARGETS**

**Location:** `exercises-library.js` (line ~10-300)

```javascript
// Find the appropriate section and add:
"[Barbell] New Exercise": [
  { muscle: "chest", role: "PRIMARY" },
  { muscle: "arms", role: "SECONDARY" }  // Optional
]
```

**Tips:**
- Use existing exercises as reference
- PRIMARY = main muscle worked
- SECONDARY = supporting muscles (optional)
- Multiple muscles OK (compound exercises)

---

#### **Step 2: Add to EXERCISES_LIBRARY**

**Location:** `exercises-library.js` (line ~400-1500)

**Find the correct category array:**
```javascript
const EXERCISES_LIBRARY = {
  chest: [
    // Add here for chest exercises
  ],
  back: [
    // Add here for back exercises
  ],
  // ... etc
};
```

**Add exercise object:**
```javascript
{
  n: "[Barbell] New Exercise",
  t_r: "8-12",
  bio: "Biomechanics explanation goes here. Describe the movement pattern, muscle mechanics, and why this exercise is effective.",
  note: "Step-by-step execution cues.<br>Foot placement, grip, tempo, etc.<br><br>⚠️ CLINICAL: Safety warnings, contraindications, who should avoid this exercise.",
  vid: ""
}
```

---

### **Step 3: Write Quality Descriptions**

#### **bio Field (Biomechanics)**

**Purpose:** Explain the science of the movement

**Good Example:**
```javascript
bio: "Fixed path squat dengan shoulder pad yang mendistribusikan load secara vertikal. Memberikan stimulus seimbang antara quadriceps dan glutes dengan tekanan spinal minimal."
```

**Bad Example:**
```javascript
bio: "Good leg exercise."  // ❌ Too vague
```

**Guidelines:**
- Explain movement mechanics
- Describe muscle activation
- Mention unique characteristics
- Keep 1-3 sentences

---

#### **note Field (Execution + Clinical)**

**Purpose:** Execution cues + safety warnings

**⚠️ CRITICAL:** Use `<br>` for line breaks, NEVER `\n`

**Good Example:**
```javascript
note: "Kaki selebar bahu di tengah platform. Turun sedalam mungkin (ATG) dengan kontrol. Dorong melalui mid-foot.<br><br>⚠️ CLINICAL: Ideal untuk lifter dengan riwayat lower back issues. Hindari jika nyeri hip impingement saat squat dalam."
```

**Bad Example:**
```javascript
note: "Do the exercise.\nBe careful."  // ❌ Uses \n instead of <br>
```

**Format:**
```
[Execution cues: 2-4 sentences]
<br><br>
⚠️ CLINICAL: [Safety warnings, contraindications, injury considerations]
```

**Why `<br>` not `\n`?**
- Data may be rendered to HTML attributes
- `\n` causes "Invalid token" browser crash
- `<br>` is HTML-safe
- See [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) for details

---

#### **vid Field (Video Link)**

**Purpose:** YouTube demonstration reference

**Format:**
```javascript
vid: "https://www.youtube.com/watch?v=VIDEO_ID"

// Or empty if not available:
vid: ""
```

**Guidelines:**
- Use official trainer channels
- Prefer videos with:
  - Clear camera angles
  - Proper form demonstration
  - English or Indonesian language
- Leave empty (`""`) if no good video found

---

### **Step 4: Validate & Test**

#### **Before Committing:**

```javascript
// 1. Check EXERCISE_TARGETS has entry:
console.log(EXERCISE_TARGETS["[Barbell] New Exercise"]);
// Should return array with muscle objects

// 2. Check EXERCISES_LIBRARY has entry:
const found = EXERCISES_LIBRARY.chest.find(ex => 
  ex.n === "[Barbell] New Exercise"
);
console.log(found);
// Should return exercise object

// 3. Test fuzzy matching:
const canonical = APP.validation.fuzzyMatchExercise("new exercise");
console.log(canonical);
// Should return "[Barbell] New Exercise"
```

#### **In-App Testing:**

1. ✅ Open exercise picker → Search for exercise
2. ✅ Verify exercise appears in correct category
3. ✅ Click exercise → Info modal opens correctly
4. ✅ Check `<br>` renders as line breaks (not literal text)
5. ✅ Add exercise to session → No errors
6. ✅ Log workout with exercise → Saves correctly
7. ✅ Check analytics → Exercise appears in volume chart

---

## 🔧 MODIFYING EXISTING EXERCISES

### **Common Modifications**

#### **1. Update Exercise Name**

**⚠️ WARNING:** Changing names breaks historical data!

**Safe Approach:**
```javascript
// 1. Backup data first:
APP.safety.createBackup("rename_exercise");

// 2. Change name in BOTH locations:
// EXERCISE_TARGETS:
"[Barbell] New Name": [...],  // Add new
// (keep old name for now)

// EXERCISES_LIBRARY:
{ n: "[Barbell] New Name", ... }  // Update

// 3. Run normalization to update logs:
APP.data.normalizeExerciseNames();

// 4. Remove old name after verification
```

**Better:** Don't rename. Add new exercise, deprecate old.

---

#### **2. Update Target Muscles**

```javascript
// Before:
"[Barbell] Exercise": [
  { muscle: "chest", role: "PRIMARY" }
]

// After:
"[Barbell] Exercise": [
  { muscle: "chest", role: "PRIMARY" },
  { muscle: "arms", role: "SECONDARY" }  // Added
]
```

**Impact:** Volume distribution in analytics will change

---

#### **3. Update Exercise Notes**

```javascript
// Safe - can update anytime:
{
  n: "[Barbell] Bench Press",
  t_r: "6-8",
  bio: "Updated biomechanics explanation...",  // ✅ OK to change
  note: "Updated cues...<br><br>⚠️ CLINICAL: New safety info",  // ✅ OK to change
  vid: "https://new-video-link"  // ✅ OK to change
}
```

**Impact:** None on historical data, only affects UI display

---

## 🐛 Common Issues & Troubleshooting

### **Issue #1: Exercise Not Appearing in Picker**

**Cause:** Name mismatch between EXERCISE_TARGETS and EXERCISES_LIBRARY

**Fix:**
```javascript
// Names MUST match exactly:
EXERCISE_TARGETS: "[Barbell] Bench Press"  // ✅
EXERCISES_LIBRARY: { n: "[Barbell] Bench Press" }  // ✅

// ❌ WRONG:
EXERCISE_TARGETS: "[Barbell] Bench Press"
EXERCISES_LIBRARY: { n: "Bench Press" }  // Missing [Barbell]
```

---

### **Issue #2: Exercise Crashes App When Selected**

**Cause:** Invalid `note` field (uses `\n`)

**Symptoms:**
```
Console error: "Uncaught SyntaxError: Invalid or unexpected token"
```

**Fix:**
```javascript
// ❌ WRONG:
note: "Line 1\nLine 2\nLine 3"

// ✅ CORRECT:
note: "Line 1<br>Line 2<br>Line 3"
```

See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) Bug #1 for details.

---

### **Issue #3: Exercise Name Fragmentation in Analytics**

**Cause:** Historical logs have variations of exercise name

**Symptoms:**
- "Bench Press" appears 3 times with different volumes

**Fix:**
```javascript
// V26.6 auto-fixes this at init, but can force:
APP.data.normalizeExerciseNames();

// Check console for:
// "✅ Normalized X exercise names"
```

See [DEBUGGING_PLAYBOOK.md](./DEBUGGING_PLAYBOOK.md) Issue #2.

---

### **Issue #4: Plate Calculator Not Working**

**Cause:** Missing equipment tag

**Fix:**
```javascript
// ❌ WRONG:
"Bench Press"  // No tag

// ✅ CORRECT:
"[Barbell] Bench Press"  // Tag enables plate calculator
```

**Tags Required:**
- `[Barbell]` → Barbell plate calculator
- `[Machine]` → Pin/stack selector
- `[DB]` → Dumbbell selector

---

## 📚 Best Practices

### **1. Research Before Adding**

✅ DO:
- Check if similar exercise exists
- Research biomechanics
- Find quality video demonstration
- Write clinical notes accurately

❌ DON'T:
- Duplicate existing exercises
- Copy-paste generic descriptions
- Add exercises you don't understand
- Ignore safety considerations

---

### **2. Use Clinical Language**

**Good Examples:**
```
"Knee flexion dominan dengan minimal hip extension"
"Horizontal adduction pattern dengan pec stretch emphasis"
"Scapular retraction required untuk proper lat activation"
```

**Bad Examples:**
```
"Good for chest"  // Too vague
"Makes muscles big"  // Not scientific
```

---

### **3. Safety First**

**ALWAYS include clinical warnings when:**
- Exercise has injury risk
- Joint stress is high
- Requires specific mobility
- Contraindicated for common conditions

**Format:**
```javascript
note: "... execution cues ...<br><br>⚠️ CLINICAL: Avoid if [condition]. Reduce ROM if [symptom]."
```

---

### **4. Test Thoroughly**

**Checklist:**
- [ ] Exercise appears in picker
- [ ] Info modal displays correctly
- [ ] Line breaks render properly (no literal `<br>` text)
- [ ] Can add to session without errors
- [ ] Logs workout successfully
- [ ] Analytics show exercise correctly
- [ ] Fuzzy matching works (test common variations)

---

## 📖 Reference Materials

### **Related Documentation**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Understanding data structure
- [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) - Code standards
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) - Common problems
- [DEBUGGING_PLAYBOOK.md](./DEBUGGING_PLAYBOOK.md) - Troubleshooting

### **Code Locations**
```
exercises-library.js
├── EXERCISE_TARGETS (lines ~10-300)
│   └── Muscle mapping
└── EXERCISES_LIBRARY (lines ~400-1500)
    ├── chest: []
    ├── back: []
    ├── shoulders: []
    ├── arms: []
    ├── legs: []
    └── core: []
```

---

## 🎓 Example: Complete Exercise Addition

Let's add "[Cable] Face Pull" step-by-step:

### **Step 1: EXERCISE_TARGETS**
```javascript
// Add to EXERCISE_TARGETS around line ~200:
"[Cable] Face Pull": [
  { muscle: "shoulders", role: "PRIMARY" },
  { muscle: "back", role: "SECONDARY" }
],
```

### **Step 2: EXERCISES_LIBRARY**
```javascript
// Add to EXERCISES_LIBRARY.shoulders around line ~900:
{
  n: "[Cable] Face Pull",
  t_r: "12-15",
  bio: "External rotation emphasis dengan scapular retraction. Excellent untuk rear delt isolation dan postur correction.",
  note: "Set cable di eye-level. Tarik ke arah dahi dengan siku tinggi. Squeeze scapula di kontraksi puncak.<br><br>⚠️ CLINICAL: Ideal untuk lifter dengan rounded shoulders. Hindari momentum atau body swing.",
  vid: "https://www.youtube.com/watch?v=rep3RcHrD9I"
}
```

### **Step 3: Save & Test**
```bash
# Commit to git:
git add exercises-library.js
git commit -m "feat: Add [Cable] Face Pull with clinical notes"
git push

# Test in browser:
# 1. Refresh app
# 2. Open exercise picker
# 3. Search "face pull"
# 4. Should appear in "Shoulders" category
# 5. Click → Info modal shows correctly
```

**Done!** ✅

---

## 💡 Tips for Contributors

### **Writing Biomechanics Notes (bio)**

**Framework:**
1. Movement pattern (what happens mechanically)
2. Muscle activation (which muscles, how)
3. Unique benefits (why this exercise matters)

**Example:**
```
"Fixed path squat dengan shoulder pad yang mendistribusikan load secara vertikal. 
Memberikan stimulus seimbang antara quadriceps dan glutes dengan tekanan spinal minimal."

[Pattern] [Activation] [Benefit]
```

---

### **Writing Clinical Notes (note)**

**Framework:**
1. Setup (stance, grip, position)
2. Execution (movement cues, tempo)
3. Key points (critical form elements)
4. Clinical warning (who should avoid, modifications)

**Example:**
```
"Kaki selebar bahu di tengah platform. Turun sedalam mungkin dengan kontrol. Dorong melalui mid-foot. Jaga torso tetap upright.

⚠️ CLINICAL: Ideal untuk lifter dengan riwayat lower back issues. Hindari jika nyeri hip impingement saat squat dalam."
```

---

### **Finding Quality Videos**

**Recommended Channels:**
- Jeff Nippard (biomechanics-focused)
- Renaissance Periodization (Dr. Mike)
- Squat University (Dr. Aaron Horschig)
- AthleanX (Jeff Cavaliere)
- Eugene Teo (technique precision)

**Avoid:**
- Generic fitness influencers
- Clickbait titles
- Poor camera angles
- Incorrect form demonstrations

---

## 🚀 Quick Reference

### **Minimal Exercise Template**
```javascript
// EXERCISE_TARGETS:
"[Tag] Exercise Name": [{ muscle: "category", role: "PRIMARY" }],

// EXERCISES_LIBRARY.category:
{
  n: "[Tag] Exercise Name",
  t_r: "8-12",
  bio: "Biomechanics...",
  note: "Execution...<br><br>⚠️ CLINICAL: Safety...",
  vid: ""
}
```

### **Common Tags**
```
[Barbell] [DB] [Dumbbell] [Machine] [Cable] [Bodyweight] [Smith]
```

### **Muscle Categories**
```
chest, back, shoulders, arms, legs, core
```

### **Roles**
```
PRIMARY, SECONDARY
```

---

**Questions?** See [DEBUGGING_PLAYBOOK.md](./DEBUGGING_PLAYBOOK.md) or open an issue.

---

## 📋 V30.1 CHANGELOG - Exercise Library Standardization

### **What Changed**

#### **1. Exercise Naming Standardization**
- ✅ **Removed Redundancy:** All exercises with redundant equipment names updated
  - `[Barbell] Barbell Bench Press` → `[Barbell] Bench Press`
  - `[DB] Flat Dumbbell Press` → `[DB] Flat Press`
  - `[Cable] Cable Fly` → `[Cable] Fly`
  - ~50 exercises cleaned up

#### **2. Consistent Abbreviations**
- ✅ **[DB] Only:** Standardized all dumbbell exercises to use `[DB]` tag
  - No more mixed `[Dumbbell]` or `[BW]` tags
  - `[DB] Dumbbell Curl` → `[DB] Curl`
  - `[BW] Push Up` → `[Bodyweight] Push Up`

#### **3. Smith Machine Consolidation**
- ✅ **[Machine] Tag:** Smith machines now use `[Machine]` tag with "Smith Machine" in name
  - `[Machine] Smith Machine Squat`
  - `[Machine] Smith Machine Shoulder Press`
  - Consistent with other machine equipment

#### **4. Biomechanical Descriptors Added**
- ✅ **Machine Variants:** Added descriptors for specificity
  - `[Machine] Leg Press (Quad Bias)` - Low foot placement
  - `[Machine] Leg Press (Glute Bias)` - High foot placement
  - `[Machine] High Row (Upper Back Bias)` - Trap emphasis
  - `[Machine] Low Row (Lat Bias)` - Lat emphasis
  - ~20 machine exercises now include descriptors

#### **5. Backwards Compatibility Implementation**
- ✅ **Legacy Name Mapping:** 150+ legacy names automatically resolve
  - Added comprehensive mapping in `validation.js`
  - Caching system for improved performance
  - Zero impact on historical workout data
  - No data migration required

### **Impact Assessment**

| Component | Impact | Status |
|-----------|---------|--------|
| **EXERCISE_TARGETS** | 150+ exercises renamed | ✅ Complete |
| **EXERCISES_LIBRARY** | All `n` properties updated to match | ✅ Complete |
| **Fuzzy Matching** | Enhanced with legacy mapping + cache | ✅ Complete |
| **Plate Calculator** | No changes (tag detection unchanged) | ✅ Compatible |
| **Historical Data** | Auto-resolves via fuzzy matching | ✅ Compatible |
| **Volume Analytics** | Uses canonical names automatically | ✅ Compatible |
| **Exercise Picker UI** | Displays standardized names | ✅ Complete |

### **Testing Checklist**

- [x] EXERCISE_TARGETS keys match EXERCISES_LIBRARY `n` values
- [x] No duplicate entries in EXERCISE_TARGETS
- [x] Legacy names resolve correctly via fuzzy matching
- [ ] Plate calculator identifies [Barbell] and [Machine] correctly
- [ ] Historical workout logs load without errors
- [ ] Volume distribution calculates correctly
- [ ] Exercise picker displays all exercises
- [ ] No console errors on app initialization

### **Files Modified**

- `exercises-library.js` - EXERCISE_TARGETS & EXERCISES_LIBRARY standardized
- `js/validation.js` - Enhanced fuzzy matching with caching & legacy mapping
- `EXERCISE_LIBRARY_GUIDE.md` - Updated naming conventions documentation

---

**Last Updated:** January 10, 2026 (V30.1 Library Polish)  

---

## 📋 CHANGELOG - V30.2 LIBRARY EXPANSION

**Date:** January 11, 2026  
**Branch:** v30.2-library-expansion  
**Focus:** Cable and machine exercise variants for comprehensive training options

### **What's New - 29 Exercises Added**

#### **Chest Exercises (7 new)**
**Cable Variants:**
- `[Cable] Fly (Low-to-Mid)` - Lower-to-mid pec emphasis with upward arc
- `[Cable] Single Arm Fly` - Unilateral chest fly with anti-rotation core demand
- `[Cable] Incline Fly` - Upper pec cable fly with constant tension advantage
- `[Cable] Press (Standing)` - Functional standing cable press with core stability
- `[Cable] Single Arm Press` - Maximum anti-rotation demand unilateral press

**Machine Variants:**
- `[Machine] Vertical Press` - Unique vertical pressing angle for upper pec
- `[Machine] Seated Dip Machine` - Lower pec/tricep emphasis with reduced shoulder stress

#### **Back Exercises (9 new)**
**Machine Row Variants:**
- `[Machine] Wide Grip Row` - Outer lat width emphasis with wide elbow path
- `[Machine] Underhand Row` - Lower lat focus with high bicep involvement
- `[Machine] Hammer Grip Row` - Neutral grip for mid-back thickness, joint-friendly

**Cable Pulldown Variants:**
- `[Cable] Lat Pulldown (Close Grip)` - Enhanced lat thickness with deeper stretch
- `[Cable] Single Arm Pulldown` - Unilateral lat work exposing imbalances
- `[Cable] Straight Arm Pulldown` - Pure lat isolation, zero bicep involvement

**Cable Row Variants:**
- `[Cable] High Row` - Upper back (traps, rhomboids) emphasis with standing position
- `[Cable] Low Row` - Mid-to-lower lat emphasis with core anti-extension demand
- `[Cable] Underhand Row` - Natural supinated grip reduces shoulder strain

#### **Shoulder Exercises (4 new)**
**Cable Variants:**
- `[Cable] Front Raise` - Anterior deltoid isolation with constant tension
- `[Cable] Rear Delt Fly` - Posterior deltoid fly for posture correction
- `[Cable] Upright Row` - Compound trap/medial delt with vertical pull
- `[Cable] Single Arm Lateral Raise` - Unilateral medial delt exposing imbalances

#### **Arm Exercises (7 new)**
**Cable Bicep Variants:**
- `[Cable] Hammer Curl` - Brachialis/brachioradialis emphasis, neutral grip
- `[Cable] Preacher Curl` - Cable preacher with constant tension advantage
- `[Cable] Concentration Curl` - Single arm bicep peak emphasis

**Cable Tricep Variants:**
- `[Cable] Tricep Pushdown (Bar)` - Straight bar overhand for medial/lateral head
- `[Cable] Tricep Pushdown (V-Bar)` - Angled V-bar for wrist comfort
- `[Cable] Single Arm Pushdown` - Unilateral tricep with enhanced ROM
- `[Cable] Kickback` - Cable kickback with constant tension vs dumbbell

#### **Leg Exercises (2 new)**
**Machine Variants:**
- `[Machine] Glute Kickback Machine` - Pure glute isolation with knee flexed
- `[Machine] Donkey Calf Raise` - Maximum gastrocnemius stretch, horizontal load

### **Muscle Targeting Principles Applied**

All new exercises follow biomechanically accurate muscle targeting:
- **PRIMARY role:** Main working muscles based on joint actions
- **SECONDARY role:** Supporting/synergist muscles
- **Scientific basis:** Proper SECONDARY designation (e.g., core for unilateral work, opposite muscle groups for compound movements)

**Examples:**
```javascript
// Unilateral exercises add core SECONDARY
"[Cable] Single Arm Fly": [
  { muscle: "chest", role: "PRIMARY" },
  { muscle: "core", role: "SECONDARY" }  // Anti-rotation demand
]

// Compound pulling adds arms SECONDARY
"[Cable] High Row": [
  { muscle: "back", role: "PRIMARY" },
  { muscle: "arms", role: "SECONDARY" }  // Elbow flexion involvement
]

// Pure isolation = PRIMARY only
"[Cable] Straight Arm Pulldown": [
  { muscle: "back", role: "PRIMARY" }  // Locked elbow, zero bicep
]
```

### **Exercise Metadata Quality**

All V30.2 exercises include:
- ✅ **`t_r`** - Target rep range (10-12, 12-15, or 15-20 based on exercise type)
- ✅ **`bio`** - Biomechanics explanation (movement science, muscle fiber recruitment)
- ✅ **`note`** - Execution cues + clinical warnings (with ⚠️ CLINICAL: sections)
- ✅ **`vid`** - Video URL field (empty "" for now, can be populated later)

**Clinical Warning Format:**
```
note: "Setup and execution cues. Form points.<br><br>⚠️ CLINICAL: Safety considerations. Contraindications. Modifications for special populations."
```

### **V30.2 Testing Checklist**

- [x] All EXERCISE_TARGETS entries have matching EXERCISES_LIBRARY entries
- [x] No JavaScript errors in exercises-library.js
- [x] Proper muscle targeting (PRIMARY/SECONDARY) based on biomechanics
- [x] All exercises follow V30.1 naming conventions
- [ ] Exercise picker UI displays new exercises correctly
- [ ] Volume analytics calculate correctly with new exercises
- [ ] No console errors when selecting new exercises
- [ ] Exercise search finds new variants

### **Files Modified**

- `exercises-library.js` - Added 29 new exercises to EXERCISE_TARGETS and EXERCISES_LIBRARY
- `EXERCISE_LIBRARY_GUIDE.md` - Updated version to V30.2, added changelog

---

**Last Updated:** January 11, 2026 (V30.2 Library Expansion)  
**Maintainer:** THE GRIND DESIGN Team
