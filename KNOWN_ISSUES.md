# 🐛 KNOWN ISSUES - THE GRIND DESIGN

**Version:** V27.0  
**Last Updated:** January 1, 2026  
**Purpose:** Active bugs, edge cases, and documented workarounds

---

## 📋 ACTIVE ISSUES

### **ISSUE #1: Console Validation Warning Flood (Cosmetic)**

**Status:** 🟡 Known, Documented  
**Severity:** LOW (cosmetic only, no functional impact)  
**Affected Version:** All versions

**Symptom:**
Console shows repetitive validation warnings during app initialization:
```
[VALIDATION] ⚠️ Exercise not in EXERCISE_TARGETS: "Custom Exercise"
[VALIDATION] ⚠️ Exercise not in EXERCISE_TARGETS: "Another Custom"
...
```

**Root Cause:**
```javascript
// In APP.validation.validateExerciseIntegrity()
// Warns for EVERY exercise not in EXERCISE_TARGETS library
// Including user-defined custom exercises
```

**Impact:**
- 🟢 No functional issues
- 🟡 Console noise (can hide real errors)
- 🟡 May confuse users checking DevTools

**Workaround:**
- Filter console by log level (hide warnings)
- Or ignore warnings (app works correctly)

**Permanent Fix Options:**
```javascript
// Option 1: Suppress warnings for custom exercises
// Check if exercise has "_custom" suffix or similar flag

// Option 2: Add "mute" flag to validation
APP.validation.validateExerciseIntegrity(data, { mute: true });

// Option 3: Only warn once per unique exercise name
const warnedExercises = new Set();
```

**Priority:** P3 (Low - cosmetic)  
**Estimated Effort:** 1-2 hours  
**Owner:** Backlog

---

### **ISSUE #2: Fuzzy Match Ambiguity with Short Queries**

**Status:** 🟡 Known, Documented  
**Severity:** MEDIUM (UX degradation, not critical)  
**Affected Version:** V26.6+

**Symptom:**
User searches "press" in exercise picker:
- Matches "[Barbell] Bench Press" (intended)
- Also matches "[Machine] Leg Press" (unintended)
- Returns first match only (not comprehensive results)

**Root Cause:**
```javascript
// fuzzyMatchExercise() returns FIRST match found
// Doesn't rank by relevance
// Short queries match too broadly

// Example:
"press" matches:
- "Bench Press" ✅
- "Leg Press" ✅  
- "Overhead Press" ✅
- "Chest Press" ✅
// But only returns first found
```

**Impact:**
- 🟡 User may not find desired exercise
- 🟡 Requires longer, more specific search terms
- 🟡 Exercise picker UX could be better

**Workaround:**
- Use more specific search terms: "bench press" instead of "press"
- Use category filters in exercise picker
- Browse by muscle group

**Permanent Fix Options:**
```javascript
// Option 1: Relevance scoring
// 1. Exact match (highest priority)
// 2. Starts with query
// 3. Contains query
// 4. Word match
// 5. Partial match

// Return array of matches with scores instead of first match
```

**Priority:** P2 (Medium - improve UX)  
**Estimated Effort:** 2-3 hours (refactor fuzzy logic)  
**Owner:** Backlog

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
**Owner:** Backlog

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
// 3. Pull request to add permanently

// OR: Keep as custom (works fine)
```

**This is intentional behavior.** Custom exercises are allowed and supported.

---

## 🏗️ V27 ARCHITECTURAL GOTCHAS

### **GOTCHA #1: Arrow Functions Capture Closure Scope** 🚨 CRITICAL

**Status:** ⚠️ **MUST UNDERSTAND** for V27+ development  
**Severity:** **CRITICAL** (breaks core functionality if violated)

**The Problem:**
```javascript
// In any module file (e.g., core.js)
const APP = {
  state: {},
  core: {}
};

APP.core = {
  finishSession: () => {
    // ❌ WRONG - This captures LOCAL APP (no nav property!)
    APP.nav.switchView("dashboard");  // undefined!
  }
};

// Even after merging to window.APP:
Object.assign(window.APP, APP);
// The arrow function STILL references local APP in its closure!
```

**Why This Happens:**
- Arrow functions capture variables from their lexical scope
- `const APP = {...}` creates a LOCAL reference
- This local reference is "frozen" in the closure
- Even after merging to `window.APP`, the closure persists

**The Solution:**
```javascript
APP.core = {
  finishSession: () => {
    // ✅ CORRECT - Explicitly use window.APP
    window.APP.nav.switchView("dashboard");
  }
};

// Or use regular function (binds 'this' differently):
APP.core = {
  finishSession: function() {
    // 'this' approach (less clear)
    this.nav.switchView("dashboard");
  }
};
```

**RULE:** **ALWAYS use `window.APP.*` for cross-module calls in V27+**

**Impact if Violated:**
- Cross-module calls fail with "is not a function"
- Debugging is extremely difficult (console shows property exists!)
- Critical features break (workout completion, navigation, etc.)

**How to Identify:**
```javascript
// Symptom in console:
console.log(APP.nav);  // {switchView: ƒ, ...} ✅ Exists!

// But in code:
APP.nav.switchView();  // ❌ Error: Cannot read property 'switchView' of undefined

// Cause: Code is using local APP, console is showing window.APP
```

---

### **GOTCHA #2: Module Load Order is Non-Negotiable** ⚠️

**Status:** ⚠️ **MUST FOLLOW** exact order  
**Severity:** **HIGH** (app breaks if wrong)

**The Rule:**
```html
<!-- ❌ WRONG ORDER -->
<script src="js/nav.js"></script>      <!-- nav needs debug! -->
<script src="js/debug.js"></script>    <!-- Too late -->

<!-- ✅ CORRECT ORDER -->
<script src="js/debug.js"></script>    <!-- Load first -->
<script src="js/nav.js"></script>      <!-- Can use APP.debug -->
```

**Required Order:**
```
1. exercises-library.js     (data foundation)
2. js/constants.js          (PRESETS, STARTER_PACK)
3. js/core.js              (APP namespace foundation)
4. js/validation.js        (no dependencies beyond core)
5. js/data.js              (uses validation)
6. js/safety.js            (uses core)
7. js/stats.js             (uses core, data)
8. js/session.js           (uses validation, data, safety)
9. js/cardio.js            (uses core)
10. js/ui.js               (uses ALL above)
11. js/debug.js            (standalone, but before nav!)
12. js/nav.js              (uses ALL modules, including debug)
13. js/cloud.js            (standalone)
```

**Why:**
- nav.js calls `APP.debug.showFatalError()` in APP.init()
- ui.js calls `APP.validation.validateSession()`, `APP.data.mergeProgram()`, etc.
- Each module depends on previous modules being loaded

**Impact if Violated:**
- `APP.X is not a function` errors
- `Cannot read property of undefined` errors
- App fails to initialize

**How to Fix:**
- Check script tag order in index.html
- Move dependent modules AFTER their dependencies
- Refer to ARCHITECTURE.md for dependency diagram

---

### **GOTCHA #3: Object.assign Merges, = Overwrites** 🚨

**Status:** ⚠️ **CRITICAL PATTERN** for modules  
**Severity:** **CRITICAL** (destroys namespaces if wrong)

**The Problem:**
```javascript
// In inline script (index.html body):
const APP = {
  init: function() { },
  nav: { },
  cardio: { }
};

// In core.js module:
const APP = {
  state: {},
  core: {}
};

// ❌ WRONG - This OVERWRITES everything!
window.APP = APP;  // Destroys init, nav, cardio!

// Result: APP only has state & core, other namespaces gone!
```

**The Solution:**
```javascript
// In every module:
if (window.APP) {
  Object.assign(window.APP, APP);  // ✅ MERGE
} else {
  window.APP = APP;  // First module can set directly
}
```

**Pattern Explanation:**
- `Object.assign(target, source)` - Copies properties from source to target
- `window.APP = APP` - Replaces entire object (destructive)
- Always check if `window.APP` exists before merging

**Impact if Violated:**
- Previous namespaces destroyed
- `APP.init is not a function` errors
- `APP.nav is undefined` errors
- Multiple initialization failures

---

### **GOTCHA #4: Script Position in HTML** ⚠️

**Status:** ⚠️ **MUST PLACE** at end of body  
**Severity:** **HIGH** (initialization failures)

**The Problem:**
```html
<!-- ❌ WRONG - Scripts in <head> load before <body> inline scripts -->
<head>
  <script src="js/core.js"></script>
</head>
<body>
  <script>
    // This runs AFTER head scripts!
    const APP = {
      init: function() { },
      nav: { }
    };
  </script>
</body>
```

**Execution order (WRONG):**
```
1. js/core.js loads → Creates window.APP = {state, core}
2. Inline script runs → Creates local APP = {init, nav}
3. Modules try to merge → But inline APP not in window.APP yet!
```

**The Solution:**
```html
<body>
  <!-- HTML content -->
  
  <!-- Inline scripts FIRST -->
  <script>
    const APP = {
      init: function() { },
      nav: { }
    };
  </script>
  
  <!-- Module scripts AFTER -->
  <script src="js/core.js"></script>
  <script src="js/validation.js"></script>
  <!-- ... other modules ... -->
</body>
```

**Execution order (CORRECT):**
```
1. Inline script runs → Creates window.APP = {init, nav}  
2. Modules load → Merge their namespaces to existing window.APP
3. All namespaces present in window.APP ✅
```

**Impact if Violated:**
- `APP.init is not a function`
- `APP.nav is undefined`
- Namespaces overwritten or missing

---

### **GOTCHA #5: Defensive Error Handling Required** ⚠️

**Status:** ⚠️ **BEST PRACTICE** in V27  
**Severity:** **MEDIUM** (errors can cascade)

**The Problem:**
```javascript
// In error handler:
catch (e) {
  APP.debug.showFatalError("Error", e);  // ❌ Crashes if APP.debug undefined!
}
```

**Why It Fails:**
- If error occurs before debug.js loads
- Or if debug.js fails to load
- The error handler itself crashes
- Original error is masked

**The Solution:**
```javascript
catch (e) {
  // ✅ ALWAYS log raw error first
  console.error("[ERROR]", e);
  
  // ✅ Then try to use error UI (with fallback)
  if (window.APP && window.APP.debug && window.APP.debug.showFatalError) {
    window.APP.debug.showFatalError("Error", e);
  } else {
    alert("Error: " + (e.message || e));
  }
}
```

**Pattern:**
1. Log error to console (always works)
2. Check if error handler exists (defensive)
3. Use error handler if available
4. Fall back to basic alert

**Impact if Violated:**
- Error handler crashes
- Original error hidden
- Debugging becomes extremely difficult

---

## 🔧 WORKAROUNDS & SOLUTIONS

### **How to Debug "X is not a function" in V27**

**Step 1: Verify module loaded**
```javascript
console.log(window.APP);  // Check which namespaces exist
console.log(window.APP.moduleName);  // Check specific module
```

**Step 2: Check console for module load confirmations**
```
[CORE] ✅ Core module loaded
[VALIDATION] ✅ Validation module loaded
...
```

**Step 3: Verify script order in index.html**
- Check if dependent module loaded AFTER dependency
- Refer to ARCHITECTURE.md for correct order

**Step 4: Check if using window.APP**
```javascript
// Search your code for:
APP.otherModule.method()  // ❌ Might be closure issue

// Replace with:
window.APP.otherModule.method()  // ✅ Always works
```

---

### **How to Add New Module Safely**

**Checklist:**
- [ ] Create file in `js/` folder
- [ ] Use IIFE wrapper: `(function() { ... })()`
- [ ] Add namespace guard: `if (!window.APP) window.APP = {};`
- [ ] Define module: `APP.moduleName = { ... }`
- [ ] Use `window.APP.*` for cross-module calls
- [ ] Add load confirmation: `console.log("[MODULE] ✅ Loaded")`
- [ ] Add script tag to index.html in CORRECT position
- [ ] Update ARCHITECTURE.md with dependencies
- [ ] Test load order (check console for errors)

---

## 📝 BUG REPORTING TEMPLATE

When reporting bugs, include:

**Environment:**
- Browser: [Chrome/Safari/Firefox] + version
- Device: [Desktop/Mobile/Tablet]
- OS: [Windows/Mac/Linux/iOS/Android]

**Reproduction Steps:**
1. Open app
2. Navigate to...
3. Click...
4. Observe error

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Console Errors:**
```
[Copy/paste console errors here]
```

**LocalStorage Export (if relevant):**
```json
{
  "cscs_program_v10": { ... }
}
```

**Screenshots:**
[If applicable]

---

## 📚 RELATED DOCUMENTATION

- **ARCHITECTURE.md** - V27 module structure
- **CODING_GUIDELINES.md** - V27 development rules
- **DEBUGGING_PLAYBOOK.md** - Step-by-step troubleshooting
- **HANDOVER_V27.md** - Complete V27 story

---

**END OF KNOWN_ISSUES.md**
