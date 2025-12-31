# 🐛 KNOWN ISSUES & WORKAROUNDS - THE GRIND DESIGN

**Version:** V26.6  
**Last Updated:** December 31, 2025  
**Purpose:** Document active bugs, edge cases, and their workarounds

---

## 🔴 ACTIVE ISSUES

### **ISSUE #1: Console Validation Warning Flood (Minor - Cosmetic)**

**Status:** ⚠️ Known, Non-blocking  
**Severity:** LOW (cosmetic only)  
**Affected Version:** V26.6+  
**Discovered:** December 31, 2025

**Symptom:**
During app initialization, console shows many individual validation warnings:
```
[FUZZY] ❌ No canonical match for: "Custom Exercise 1"
[FUZZY] ❌ No canonical match for: "Custom Exercise 2"
[FUZZY] ❌ No canonical match for: "Custom Exercise 3"
...
```

**Root Cause:**
- `APP.data.normalizeExerciseNames()` runs at init
- Logs every non-matching exercise individually
- Custom user exercises (not in library) trigger warnings
- NOT an error - working as designed

**Impact:**
- ❌ Console clutter (hard to see other important logs)
- ✅ App functionality: UNAFFECTED
- ✅ Data integrity: UNAFFECTED

**Workaround (Temporary):**
```javascript
// User can ignore these warnings - they're informational only
// Or: Open DevTools → Console → Filter by "warn" and hide
```

**Planned Fix:**
```javascript
// Location: index.html, search for "normalizeExerciseNames"
// Current (lines ~3100-3200):
console.log(`✅ ${changeLog}`);

// Proposed Fix:
console.groupCollapsed(`[V26.6] 🔍 Found ${unmatchedCount} custom exercises`);
unmatchedExercises.forEach(ex => console.log(`  - ${ex}`));
console.groupEnd();
```

**Priority:** P3 (Low - cosmetic improvement)  
**Estimated Effort:** 5 minutes  
**Owner:** Pending

---

### **ISSUE #2: Fuzzy Match Ambiguity with Short Queries**

**Status:** ⚠️ Known, Edge Case  
**Severity:** MEDIUM (usability issue)  
**Affected Version:** V26.6+

**Symptom:**
User types short generic term (e.g., "press") → Could match multiple exercises:
- "Bench Press"
- "Shoulder Press"
- "Leg Press"
- "[Machine] Chest Press"

**Root Cause:**
```javascript
// fuzzyMatchExercise() returns FIRST match found
// No ranking/scoring system
// Order depends on EXERCISE_TARGETS key order
```

**Impact:**
- User gets unexpected exercise selected
- Must type more specific name to disambiguate

**Workaround:**
```javascript
// User should be more specific:
"press" → "bench press" or "shoulder press"

// Or: Use exercise picker UI (shows all matches)
```

**Potential Fix (Not Implemented):**
```javascript
// Add ranking system:
// 1. Exact match (highest priority)
// 2. Starts with query
// 3. Contains query
// 4. Word match
// 5. Partial match

// Return array of matches with scores instead of first match
```

**Priority:** P2 (Medium - improve UX)  
**Estimated Effort:** 2-3 hours (refactor fuzzy logic)  
**Owner:** Pending

---

### **ISSUE #3: LocalStorage Quota Exceeded (Edge Case)**

**Status:** ⚠️ Known, Documented  
**Severity:** HIGH (data loss risk)  
**Affected Version:** All versions

**Symptom:**
User with extensive workout history (3+ years, daily logs):
- LocalStorage reaches ~5MB limit
- `LS_SAFE.setJSON()` fails silently
- Data not saved (user loses workout log)

**Root Cause:**
```javascript
// Browser localStorage limit: ~5-10MB
// Current backup strategy: keeps last 5 backups (can be large)
// No automatic pruning of old workout logs
```

**Impact:**
- ⚠️ Data loss on next save operation
- ⚠️ User may not notice until restart (no persistent alert)

**Current Mitigation (LS_SAFE wrapper):**
```javascript
// LS_SAFE.setJSON() shows alert if QuotaExceededError
if (e.name === 'QuotaExceededError') {
  alert('⚠️ Memori Penuh! Hapus beberapa data di Profil.');
}

// Also warns if data >1MB
if (sizeKB > 1024) {
  console.warn(`⚠️ Large data (${sizeKB.toFixed(2)}KB): ${k}`);
}
```

**Workaround:**
1. User manually deletes old workout logs
2. User exports data to Google Drive
3. User clears old backups
4. User uses browser incognito (temporary)

**Permanent Fix Options:**
```javascript
// Option 1: Auto-prune old logs (>1 year old)
// Pro: Automatic, user doesn't need to think
// Con: Data loss (but archived to cloud first)

// Option 2: Compress logs using LZ-string
// Pro: ~60% size reduction
// Con: Adds dependency, CPU overhead

// Option 3: Migrate to IndexedDB
// Pro: 50MB+ storage, better for large datasets
// Con: Async API complexity, refactor required

// Option 4: Paginate logs (load recent only)
// Pro: Lower memory footprint
// Con: Complex implementation for analytics
```

**Priority:** P1 (High - data loss risk)  
**Estimated Effort:** 1-2 days (depends on approach)  
**Owner:** Pending

---

### **ISSUE #4: Custom User Exercises Not Normalized**

**Status:** ✅ Working as Intended  
**Severity:** N/A (feature, not bug)

**Symptom:**
User adds custom exercise "My Special Press":
- Not in EXERCISE_TARGETS library
- `fuzzyMatchExercise()` returns `null`
- Name stays as "My Special Press" (not normalized)

**Root Cause:**
```javascript
// fuzzyMatchExercise() only matches against EXERCISE_TARGETS
// Custom exercises = user-defined, no canonical name exists
```

**Impact:**
- Custom exercises maintain user's original naming
- Analytics work correctly (no fragmentation per exercise)
- BUT: No muscle targeting data (not in library)

**Workaround:**
```javascript
// If user wants exercise in library:
// 1. Add to exercises-library.js
// 2. Commit to GitHub
// 3. Refresh app

// For immediate use:
// Keep custom name, accept no auto-targeting
```

**This is NOT a bug** - custom exercises are supported by design.

---

## ⚠️ EDGE CASES & GOTCHAS

### **EDGE CASE #1: Empty Exercise Options Array**

**Scenario:**
```javascript
// User somehow creates exercise with no options
{
  sets: 3,
  rest: 90,
  note: "Chest",
  options: []  // ❌ Empty!
}
```

**Impact:**
- App crashes when trying to render exercise
- `exercise.options[0].n` → Cannot read property 'n' of undefined

**Current Protection:**
```javascript
// Validation exists in:
APP.validation.validateExerciseIntegrity()

// But not enforced everywhere
```

**Mitigation:**
```javascript
// Always check before access:
if (!exercise.options || exercise.options.length === 0) {
  console.error("Exercise has no options");
  return;
}
```

**Fix Needed:** Add validation to all exercise rendering functions

---

### **EDGE CASE #2: Corrupted JSON in LocalStorage**

**Scenario:**
User edits localStorage manually or browser corruption:
```javascript
// Stored value is invalid JSON
localStorage.setItem("cscs_program_v10", "{invalid json]");
```

**Impact:**
- `JSON.parse()` throws error
- App fails to load

**Current Protection:**
```javascript
// LS_SAFE.getJSON() auto-handles:
try {
  const parsed = JSON.parse(v);
  return parsed;
} catch (e) {
  console.error("LS Parse Error:", k, e);
  localStorage.removeItem(k); // Auto-fix: delete corrupt data
  return def; // Return default value
}
```

**Result:**
- ✅ App loads with empty/default data
- ⚠️ User's data lost (but was already corrupt)

**Prevention:** Always use `LS_SAFE` wrapper (never direct access)

---

### **EDGE CASE #3: Exercise Name with Special Characters**

**Scenario:**
```javascript
// Exercise name contains problematic characters
"Bench Press (45° Angle) - Smith Machine"
```

**Impact:**
- Search/filtering may not work correctly
- HTML attribute injection risk
- Fuzzy matching may fail

**Current Handling:**
```javascript
// fuzzyMatchExercise() strips all non-alphanumeric:
const strip = (str) => str.replace(/[^a-z0-9]/g, "");

// "Bench Press (45° Angle)" → "benchpress45angle"
```

**Result:**
- ✅ Matching works
- ✅ Storage safe
- ⚠️ Original formatting preserved in display

**Best Practice:** Use library exercises (already sanitized)

---

### **EDGE CASE #4: Extremely Large Workout Session (50+ Exercises)**

**Scenario:**
User creates mega-session with 50 exercises × 5 sets = 250 sets

**Impact:**
- Slow rendering (DOM manipulation)
- Large localStorage write (performance hit)
- Potential quota issues

**Current Behavior:**
- No limit enforced
- App will slow down but function

**Workaround:**
```javascript
// Split into multiple sessions
// Session 1: 20 exercises
// Session 2: 20 exercises
// Session 3: 10 exercises
```

**Potential Fix:**
```javascript
// Add soft limit warning:
if (session.exercises.length > 30) {
  console.warn("Large session detected, consider splitting");
  APP.ui.showToast("⚠️ Large session - may impact performance", "warning");
}
```

---

### **EDGE CASE #5: Workout Log with No Sets Logged**

**Scenario:**
User opens workout, doesn't log any sets, clicks "Complete"

**Impact:**
- Empty log created in gym_hist
- Volume = 0
- Analytics include zero-volume session

**Current Behavior:**
```javascript
// Log is created even if volume = 0
// This is intentional (user did open session)
```

**Debate:**
- Should we save zero-volume logs? (attendance tracking)
- Or skip empty logs? (analytics cleaner)

**Current Decision:** Save all logs (even zero-volume) for attendance tracking

---

## 🔧 HISTORICAL BUGS (FIXED)

### **BUG #1: `\n` Causing "Invalid token" Crash (FIXED in V26.5)**

**Status:** ✅ RESOLVED  
**Fixed In:** V26.5  
**Date Fixed:** December 2025

**Original Issue:**
```javascript
// Used \n for line breaks in exercise notes
note: "Line 1\nLine 2\nLine 3"

// Rendered to HTML attribute:
<div note="Line 1
Line 2
Line 3">

// Browser error: "Uncaught SyntaxError: Invalid or unexpected token"
```

**Fix:**
```javascript
// Replace all \n with <br>
note: "Line 1<br>Line 2<br>Line 3"

// Renders safely:
<div note="Line 1<br>Line 2<br>Line 3">
```

**Lesson Learned:** Never use `\n` in data that may be rendered to HTML attributes

---

### **BUG #2: Exercise Name Fragmentation (FIXED in V26.6)**

**Status:** ✅ RESOLVED  
**Fixed In:** V26.6  
**Date Fixed:** December 31, 2025

**Original Issue:**
```javascript
// User types: "machine pendulum squat"
// Saved as: "machine pendulum squat"

// User types: "pendulum squat"
// Saved as: "pendulum squat"

// Library canonical: "[Machine] Pendulum Squat"

// Result: THREE different IDs in analytics → fragmented volume data
```

**Fix (V26.6):**
```javascript
// fuzzyMatchExercise() now returns canonical string
const canonicalName = APP.validation.fuzzyMatchExercise(userInput);
if (canonicalName) {
  exercise.name = canonicalName; // Enforce canonical
}

// + Auto-migration on init:
APP.data.normalizeExerciseNames(); // Unifies historical data
```

**Result:**
- ✅ All exercise names → canonical
- ✅ Unified analytics
- ✅ Backward compatible (auto-migration)

---

### **BUG #3: Variant Index Out of Bounds (FIXED in V25)**

**Status:** ✅ RESOLVED  
**Fixed In:** V25  
**Date Fixed:** November 2025

**Original Issue:**
```javascript
// Exercise had 3 variants (indices 0, 1, 2)
// User deleted variant #2
// Saved preference was still "2"
// App crashed: exercise.options[2] → undefined
```

**Fix:**
```javascript
// Added safety check:
let savedVar = parseInt(LS_SAFE.get(`pref_${sessionId}_${exerciseIdx}`) || 0);

if (savedVar >= exercise.options.length) {
  console.warn(`Invalid variant ${savedVar}, reset to 0`);
  savedVar = 0;
  LS_SAFE.set(`pref_${sessionId}_${exerciseIdx}`, 0);
}
```

**Lesson Learned:** Always validate array indices from storage

---

## 📋 WORKAROUND LIBRARY

### **Workaround #1: Clear Corrupt LocalStorage**

**When to Use:** App won't load, console shows parse errors

**Steps:**
```javascript
// In browser console:
localStorage.clear();
location.reload();

// ⚠️ WARNING: This deletes ALL data!
// Better: Clear specific key:
localStorage.removeItem("cscs_program_v10");
```

---

### **Workaround #2: Force Backup Restore**

**When to Use:** App is working but data seems wrong

**Steps:**
```javascript
// In browser console:
const backups = APP.safety.listBackups();
console.table(backups); // See available backups

// Restore specific backup:
APP.safety.restore("backup_1234567890_operation");
```

---

### **Workaround #3: Manually Fix Exercise Name**

**When to Use:** Exercise not matching, analytics fragmented

**Steps:**
```javascript
// 1. Load data
const logs = LS_SAFE.getJSON("gym_hist", []);

// 2. Find problematic exercise
const badLogs = logs.filter(log => log.ex === "wrong name");

// 3. Fix name
badLogs.forEach(log => {
  log.ex = "[Machine] Correct Name";
});

// 4. Save
LS_SAFE.setJSON("gym_hist", logs);

// 5. Reload
location.reload();
```

---

### **Workaround #4: Export Data Before Experimenting**

**When to Use:** Before trying new features or debugging

**Steps:**
```javascript
// Export to JSON file:
const allData = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  allData[key] = localStorage.getItem(key);
}

const blob = new Blob([JSON.stringify(allData, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `backup_manual_${Date.now()}.json`;
a.click();
```

---

## 🎯 TESTING SCENARIOS (For Future Features)

### **Scenario #1: Test with Empty Database**

```javascript
// Clear all data
localStorage.clear();

// Test app initialization:
// - Should show starter pack
// - Should not crash
// - Should allow creating new session
```

### **Scenario #2: Test with Large Dataset**

```javascript
// Generate 1000 workout logs
const logs = [];
for (let i = 0; i < 1000; i++) {
  logs.push({
    date: `2025-01-${(i % 30) + 1}`,
    ex: "Bench Press",
    vol: 1200,
    top: 60,
    d: [{k: 60, r: 5, rpe: 8}]
  });
}
LS_SAFE.setJSON("gym_hist", logs);

// Test:
// - Chart rendering performance
// - Analytics calculation speed
// - LocalStorage size warning
```

### **Scenario #3: Test with Invalid Data**

```javascript
// Corrupt session data
const program = LS_SAFE.getJSON("cscs_program_v10");
program.s1.exercises[0].options = []; // Empty options

LS_SAFE.setJSON("cscs_program_v10", program);

// Test:
// - Should validation catch this?
// - Does app crash or degrade gracefully?
```

---

## 📞 REPORTING NEW ISSUES

When reporting a bug, please include:

1. **Version:** (e.g., V26.6)
2. **Browser:** (e.g., Chrome 120, Safari 17)
3. **Steps to Reproduce:**
   ```
   1. Open app
   2. Click X
   3. Error appears
   ```
4. **Expected Behavior:** "Should do X"
5. **Actual Behavior:** "Does Y instead"
6. **Console Errors:** (screenshot or copy/paste)
7. **LocalStorage Data:** (if relevant, export and attach)

**Where to Report:**
- GitHub Issues (if repository has issues enabled)
- Or: Document in this file with `[REPORTED: date]` tag

---

## 🔮 POTENTIAL FUTURE ISSUES

### **Concern #1: Browser LocalStorage Deprecation**

**Risk:** Browsers may deprecate/change localStorage API  
**Probability:** LOW (but possible in 5+ years)  
**Mitigation:** Service Worker can intercept and migrate if needed

### **Concern #2: Chart.js Breaking Changes**

**Risk:** CDN version updates, breaking API changes  
**Probability:** MEDIUM  
**Mitigation:** Pin to specific version in CDN URL

### **Concern #3: Tailwind CSS Changes**

**Risk:** Utility class names change in major versions  
**Probability:** MEDIUM  
**Mitigation:** Pin to v3.x in CDN URL, test before upgrading

---

**END OF KNOWN_ISSUES.md**
