# 📚 EXERCISE LIBRARY GUIDE - THE GRIND DESIGN

**Version:** V26.6  
**Last Updated:** December 31, 2025  
**Purpose:** Guide for adding, modifying, and managing exercises in the library

---

## 📖 Overview

The Exercise Library is the heart of THE GRIND DESIGN. It contains 100+ exercises with clinical biomechanics notes, execution cues, and safety warnings. This guide explains how to add new exercises or modify existing ones.

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

## ✅ NAMING CONVENTIONS (V26.5+)

### **Equipment Tag Format**

**CRITICAL:** Exercise names MUST start with equipment tag in brackets

```javascript
// ✅ CORRECT
"[Barbell] Bench Press"
"[Machine] Leg Press"
"[DB] Dumbbell Curl"
"[Cable] Tricep Pushdown"
"[Bodyweight] Pull-Up"

// ❌ WRONG
"Bench Press"              // Missing tag
"Barbell Bench Press"      // Tag not in brackets
"[Barbell]Bench Press"     // Missing space after bracket
```

### **Standard Tags**

| Tag | Use For | Example |
|-----|---------|---------|
| `[Barbell]` | Barbell exercises | `[Barbell] Squat` |
| `[DB]` | Dumbbell exercises | `[DB] Bicep Curl` |
| `[Dumbbell]` | Alternative to [DB] | `[Dumbbell] Row` |
| `[Machine]` | All machine exercises | `[Machine] Leg Press` |
| `[Cable]` | Cable exercises | `[Cable] Fly` |
| `[Bodyweight]` | No equipment | `[Bodyweight] Push-Up` |
| `[Smith]` | Smith machine | `[Smith] Squat` |

**Why Tags Matter:**
- Plate calculator auto-detects exercise type
- `[Barbell]` → Shows barbell plate calculator
- `[Machine]` → Shows pin/stack selector
- `[DB]` → Shows dumbbell selector

---

### **Machine Exercise Naming (V26.5)**

For machines with multiple biomechanical variations, add focus/bias descriptor:

```javascript
// ✅ GOOD - Specifies targeting
"[Machine] Leg Press (Quad Bias/Low Stance)"
"[Machine] Leg Press (Glute Bias/High Stance)"
"[Machine] High Row (Upper Back Bias)"
"[Machine] Low Row (Lat Bias)"

// ❌ BAD - Too generic
"[Machine] Leg Press"  // Which stance? What target?
"[Machine] Row"        // High or low? What angle?
```

**Format:**
```
[Machine] Exercise Name (Target/Variant)
```

**Examples:**
- `[Machine] Reverse Hack Squat (Glute Bias)`
- `[Machine] Converging Row`
- `[Machine] Decline Press`

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

**Last Updated:** December 31, 2025 (V26.6)  
**Maintainer:** THE GRIND DESIGN Team
