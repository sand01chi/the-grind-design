# 💻 CODING GUIDELINES - THE GRIND DESIGN

**Version:** V26.6  
**Last Updated:** December 31, 2025  
**Purpose:** Code style, conventions, and best practices for consistency

---

## 🎯 GOLDEN RULES (NON-NEGOTIABLE)

### ❌ **NEVER DO:**

1. **NEVER use `localStorage` directly**
   ```javascript
   // ❌ WRONG
   localStorage.setItem("key", value);
   const data = JSON.parse(localStorage.getItem("key"));
   
   // ✅ CORRECT
   LS_SAFE.set("key", value);
   const data = LS_SAFE.getJSON("key", defaultValue);
   ```

2. **NEVER use `\n` in multi-line text**
   ```javascript
   // ❌ WRONG (causes "Invalid token" crash in HTML attributes)
   note: "Line 1\nLine 2\nLine 3"
   
   // ✅ CORRECT (HTML-safe line breaks)
   note: "Line 1<br>Line 2<br>Line 3"
   ```

3. **NEVER delete data without backup**
   ```javascript
   // ❌ WRONG
   delete APP.state.workoutData[sessionId];
   APP.core.saveProgram();
   
   // ✅ CORRECT
   APP.safety.createBackup("delete_session_" + sessionId);
   delete APP.state.workoutData[sessionId];
   APP.core.saveProgram();
   ```

4. **NEVER mutate EXERCISE_TARGETS structure**
   ```javascript
   // ❌ WRONG (breaks muscle categorization)
   "legs-quads": [...]  // Sub-categories not supported
   
   // ✅ CORRECT (flat structure)
   "legs": [{ muscle: "legs", role: "PRIMARY" }]
   ```

5. **NEVER skip input validation**
   ```javascript
   // ❌ WRONG
   const session = APP.state.workoutData[sessionId];
   session.exercises.push(newExercise);
   
   // ✅ CORRECT
   const session = APP.validation.validateSession(sessionId);
   if (!session) return;
   session.exercises.push(newExercise);
   ```

---

## ✅ **ALWAYS DO:**

1. **ALWAYS backup before destructive operations**
   ```javascript
   APP.safety.createBackup("operation_name");
   ```

2. **ALWAYS validate user inputs**
   ```javascript
   const weight = APP.validation.sanitizeNumber(input, 0, 999, 0);
   ```

3. **ALWAYS use canonical exercise names**
   ```javascript
   const canonicalName = APP.validation.fuzzyMatchExercise(userInput);
   if (canonicalName) {
     exercise.name = canonicalName; // Enforce canonical
   }
   ```

4. **ALWAYS check DOM element existence**
   ```javascript
   const element = document.getElementById("myElement");
   if (!element) {
     console.error("Element not found: myElement");
     return;
   }
   element.textContent = "Safe to use";
   ```

5. **ALWAYS use try-catch for critical operations**
   ```javascript
   try {
     const data = JSON.parse(userInput);
     // ... process data
   } catch (e) {
     console.error("Parse error:", e);
     APP.ui.showToast("Invalid data format", "error");
   }
   ```

---

## 📝 NAMING CONVENTIONS

### **Functions**
```javascript
// ✅ Verb-first, camelCase, descriptive
loadWorkout(sessionId)
validateSession(sessionId)
renderDashboard()
createBackup(operation)

// ❌ Avoid
workout()          // What does this do?
validate()         // Validate what?
render()           // Render what?
backup(op)         // Not descriptive
```

### **Variables**
```javascript
// ✅ Descriptive, camelCase
const sessionId = "s1";
const exerciseIdx = 0;
const workoutLogs = LS_SAFE.getJSON("gym_hist", []);
const canonicalName = APP.validation.fuzzyMatchExercise(input);

// ❌ Avoid
const s = "s1";           // Too short
const i = 0;              // Ambiguous
const logs = [];          // What kind of logs?
const name = "";          // What name?
```

### **Constants**
```javascript
// ✅ SCREAMING_SNAKE_CASE for true constants
const EXERCISE_TARGETS = { ... };
const LS_SAFE = { ... };
const MAX_BACKUPS = 5;

// ✅ camelCase for configuration
const defaultSession = { ... };
const userPreferences = { ... };
```

### **LocalStorage Keys**
```javascript
// ✅ Descriptive, versioned where applicable
"cscs_program_v10"         // Versioned main data
"gym_hist"                 // Clear purpose
"backup_1234567890_merge"  // Timestamp + operation
"last_s1"                  // Prefixed for grouping
"pref_s1_ex2"              // Hierarchical structure

// ❌ Avoid
"data"                     // Too generic
"program"                  // No version
"backup"                   // No timestamp/context
"s1"                       // Ambiguous prefix
```

---

## 🏗️ CODE STRUCTURE

### **Function Organization (inside APP namespace)**

```javascript
const APP = {
  // 1. STATE (data that changes)
  state: {
    currentSessionId: "",
    workoutData: {}
  },

  // 2. VALIDATION (input checking)
  validation: {
    validateSession: function() { ... },
    fuzzyMatchExercise: function() { ... }
  },

  // 3. DATA (CRUD operations)
  data: {
    mergeProgram: function() { ... },
    normalizeExerciseNames: function() { ... }
  },

  // 4. SAFETY (backup/restore)
  safety: {
    createBackup: function() { ... },
    restore: function() { ... }
  },

  // 5. SESSION (session management)
  session: {
    openEditor: function() { ... },
    confirmDelete: function() { ... }
  },

  // 6. STATS (analytics)
  stats: {
    renderVolumeChart: function() { ... },
    calculateTopGainers: function() { ... }
  },

  // 7. UI (rendering)
  ui: {
    openModal: function() { ... },
    showToast: function() { ... }
  },

  // 8. NAV (navigation)
  nav: {
    switchView: function() { ... },
    loadWorkout: function() { ... }
  },

  // 9. CORE (utilities)
  core: {
    saveProgram: function() { ... },
    init: function() { ... }
  }
};
```

### **Function Length Guidelines**

```javascript
// ✅ GOOD - Single responsibility, focused
function calculateVolume(sets) {
  return sets.reduce((sum, set) => {
    return sum + (parseFloat(set.k) || 0) * (parseFloat(set.r) || 0);
  }, 0);
}

// ⚠️ ACCEPTABLE - Multiple steps but logical grouping
function saveWorkoutLog(sessionId) {
  // 1. Validate
  const session = APP.validation.validateSession(sessionId);
  if (!session) return false;
  
  // 2. Collect data
  const logData = collectSetData(sessionId);
  
  // 3. Create log entry
  const log = formatLogEntry(logData);
  
  // 4. Save
  const logs = LS_SAFE.getJSON("gym_hist", []);
  logs.push(log);
  LS_SAFE.setJSON("gym_hist", logs);
  
  return true;
}

// ❌ TOO LONG - Break into smaller functions
function massiveFunction() {
  // 200+ lines doing validation, data processing,
  // rendering, analytics, saving, etc.
  // REFACTOR: Split into focused functions
}
```

---

## 🔍 ERROR HANDLING PATTERNS

### **Pattern 1: Validation Early Return**
```javascript
function processWorkout(sessionId) {
  // Validate early, fail fast
  if (!sessionId) {
    console.error("No sessionId provided");
    return false;
  }
  
  const session = APP.state.workoutData[sessionId];
  if (!session) {
    console.error("Session not found:", sessionId);
    return false;
  }
  
  // Main logic here...
  return true;
}
```

### **Pattern 2: Try-Catch with User Feedback**
```javascript
function parseUserJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    return data;
  } catch (e) {
    console.error("JSON parse error:", e);
    APP.ui.showToast("Invalid JSON format", "error");
    return null;
  }
}
```

### **Pattern 3: Default Values**
```javascript
// ✅ GOOD - Provide sensible defaults
const profile = LS_SAFE.getJSON("profile", { name: "Dok" });
const logs = LS_SAFE.getJSON("gym_hist", []);
const weight = parseFloat(input) || 0;

// ❌ BAD - No fallback
const profile = LS_SAFE.getJSON("profile");  // Could be null
const weight = parseFloat(input);             // Could be NaN
```

### **Pattern 4: Graceful Degradation**
```javascript
function renderChart(data) {
  const canvas = document.getElementById("chart");
  
  if (!canvas) {
    console.warn("Chart canvas not found, skipping render");
    return; // Degrade gracefully, don't crash app
  }
  
  if (!window.Chart) {
    console.warn("Chart.js not loaded, skipping render");
    return;
  }
  
  // Render chart...
}
```

---

## 📊 DATA HANDLING BEST PRACTICES

### **Working with LocalStorage**

```javascript
// ✅ GOOD - Always use LS_SAFE wrapper
const program = LS_SAFE.getJSON("cscs_program_v10", {});
const success = LS_SAFE.setJSON("cscs_program_v10", updatedProgram);

if (!success) {
  console.error("Failed to save program");
  APP.ui.showToast("Save failed - storage may be full", "error");
}

// ❌ BAD - Direct access, no error handling
const program = JSON.parse(localStorage.getItem("cscs_program_v10"));
localStorage.setItem("cscs_program_v10", JSON.stringify(program));
```

### **Immutability for Safety**

```javascript
// ✅ GOOD - Create new object, don't mutate parameter
function updateSessionTitle(session, newTitle) {
  return {
    ...session,
    title: newTitle
  };
}

// ✅ GOOD - Deep clone before mutation
const sessionCopy = JSON.parse(JSON.stringify(originalSession));
sessionCopy.exercises.push(newExercise);

// ❌ BAD - Direct mutation of shared state
function updateSessionTitle(session, newTitle) {
  session.title = newTitle; // Mutates original object
  return session;
}
```

### **Array Operations**

```javascript
// ✅ GOOD - Safe array access with validation
const logs = LS_SAFE.getJSON("gym_hist", []);
if (Array.isArray(logs) && logs.length > 0) {
  const lastLog = logs[logs.length - 1];
  // ... process lastLog
}

// ❌ BAD - Assume array exists and has items
const logs = LS_SAFE.getJSON("gym_hist");
const lastLog = logs[logs.length - 1]; // Could crash
```

---

## 🎨 UI DEVELOPMENT PATTERNS

### **DOM Manipulation Safety**

```javascript
// ✅ GOOD - Check existence before manipulation
function updateElement(id, content) {
  const element = document.getElementById(id);
  
  if (!element) {
    console.warn(`Element not found: ${id}`);
    return false;
  }
  
  element.textContent = content; // Use textContent to prevent XSS
  return true;
}

// ❌ BAD - Assume element exists
function updateElement(id, content) {
  document.getElementById(id).textContent = content; // Could crash
}
```

### **Event Handling**

```javascript
// ✅ GOOD - Inline onclick for simple actions (this app's pattern)
<button onclick="APP.ui.openModal('library')">Open</button>

// ✅ GOOD - Programmatic for complex logic
element.addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  // Complex logic here...
});

// ❌ AVOID - Mixing patterns inconsistently
```

### **Modal Management**

```javascript
// ✅ GOOD - Centralized modal control
APP.ui.openModal('exercise-picker');
APP.ui.closeModal('exercise-picker');

// ❌ BAD - Direct DOM manipulation scattered everywhere
document.getElementById('exercise-picker').classList.remove('hidden');
```

---

## 🧪 CONSOLE LOGGING BEST PRACTICES

### **Logging Levels**

```javascript
// ✅ Development info - use console.log
console.log("[INIT] Starting application...");
console.log("[MERGE] Auto-mapped:", count, "exercises");

// ✅ Warnings - use console.warn
console.warn("[FUZZY] No canonical match for:", exerciseName);
console.warn("[SAFETY] Backup created with empty workoutData");

// ✅ Errors - use console.error
console.error("[LS] Parse error:", key, error);
console.error("[SESSION] Reorder error:", error);

// ✅ Grouped logs for clarity
console.groupCollapsed("[INIT] 🔄 Normalizing exercise names...");
// ... many logs here
console.groupEnd();
```

### **Informative Logging**

```javascript
// ✅ GOOD - Context-rich logs
console.log(`[FUZZY] ✅ Canonical Match: "${userInput}" → "${canonicalName}"`);
console.log(`[SAFETY] Backup created: ${backupId}`);
console.log(`[MERGE] ✅ Successfully merged ${count} session(s)`);

// ❌ BAD - Cryptic logs
console.log("Match found");
console.log("Backup done");
console.log("Merged");
```

---

## 🔄 ASYNC OPERATIONS (Minimal in this app)

### **LocalStorage is Synchronous (Our Pattern)**

```javascript
// ✅ This app uses synchronous localStorage (LS_SAFE)
const data = LS_SAFE.getJSON("key", default);
LS_SAFE.setJSON("key", data);
// No async/await needed for core operations
```

### **Async for External APIs Only**

```javascript
// ✅ GOOD - Async for Google Drive API
async function syncToCloud() {
  try {
    const response = await fetch(uploadUrl, options);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Cloud sync failed:", error);
    return null;
  }
}

// ✅ GOOD - Async for Chart.js (if needed for large datasets)
async function renderHeavyChart(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Render chart with large dataset
      resolve();
    }, 0); // Allow UI thread to breathe
  });
}
```

---

## 📦 ADDING NEW FEATURES

### **Checklist for New Features**

1. **Plan Architecture**
   - Which APP namespace? (validation, data, ui, etc.)
   - New localStorage keys needed?
   - Breaking changes to schema?

2. **Implement with Safety**
   ```javascript
   // Add to appropriate namespace
   APP.newNamespace = {
     newFeature: function() {
       // Implementation
     }
   };
   ```

3. **Add Validation**
   ```javascript
   // If dealing with user input or data
   APP.validation.validateNewFeature = function() { ... };
   ```

4. **Document in Code**
   ```javascript
   // Clear comments explaining WHY
   // Example:
   // V27.0 - Added newFeature to solve X problem
   // Rationale: Y was causing Z issue
   ```

5. **Test Edge Cases**
   - Empty data
   - Invalid input
   - Large datasets
   - Offline mode
   - localStorage quota exceeded

6. **Update Documentation**
   - Add to CHANGELOG_DETAILED.md
   - Update ARCHITECTURE.md if needed

---

## 🐛 DEBUGGING GUIDELINES

### **Debugging Workflow**

```javascript
// 1. Add strategic console logs
console.log("[DEBUG] Variable state:", variableName);
console.log("[DEBUG] Function called with:", arguments);

// 2. Check LocalStorage data
console.log("Program data:", LS_SAFE.getJSON("cscs_program_v10"));
console.log("Workout logs:", LS_SAFE.getJSON("gym_hist"));

// 3. Validate assumptions
console.assert(condition, "Assumption failed: expected X but got Y");

// 4. Use browser DevTools
// - Breakpoints in sources tab
// - Application → Local Storage
// - Console for live testing
```

### **Common Debugging Patterns**

```javascript
// ✅ Trace function calls
function criticalFunction(param) {
  console.log("[TRACE] criticalFunction called with:", param);
  
  try {
    // ... logic
    console.log("[TRACE] criticalFunction completed successfully");
  } catch (e) {
    console.error("[TRACE] criticalFunction failed:", e);
    throw e;
  }
}

// ✅ Inspect object structures
console.log("Session structure:", JSON.stringify(session, null, 2));

// ✅ Time performance
console.time("Operation");
// ... expensive operation
console.timeEnd("Operation"); // Logs: "Operation: 123ms"
```

---

## 🎯 CODE REVIEW CHECKLIST

Before committing code, verify:

- [ ] No direct `localStorage` usage (use `LS_SAFE`)
- [ ] No `\n` in text fields (use `<br>`)
- [ ] Backup created before destructive operations
- [ ] Input validation for user data
- [ ] DOM element null checks
- [ ] Try-catch for JSON parsing
- [ ] Descriptive variable/function names
- [ ] Console logs are informative
- [ ] No commented-out code (remove or document why it's kept)
- [ ] Functions follow single responsibility principle
- [ ] Error messages are user-friendly
- [ ] Changes are backwards compatible (or migration added)

---

## 📚 COMMENT STYLE

### **When to Comment**

```javascript
// ✅ GOOD - Explain WHY, not WHAT
// V26.6 HOTFIX - Using <br> instead of \n to prevent "Invalid token" crash
// when rendering exercise notes in HTML attributes
note: "Line 1<br>Line 2"

// V26.5 - Changed from boolean to string return to enforce canonical names
// This prevents data fragmentation in analytics (see issue #26)
return canonicalName || null;

// ❌ BAD - Obvious comments
// Set the title
session.title = newTitle;

// Loop through exercises
exercises.forEach(ex => { ... });
```

### **Section Headers**

```javascript
// ========================================
// V26.5 EXPANSION - MACHINE VARIATIONS
// ========================================

// LEGS - SQUAT MACHINES
"[Machine] Pendulum Squat": [...],
"[Machine] V-Squat": [...],

// LEGS - LEG PRESS VARIATIONS
"[Machine] Leg Press (Quad Bias)": [...],
```

### **TODO Comments**

```javascript
// TODO: Optimize volume calculation for large datasets (>1000 logs)
// TODO: Add exercise video validation (check URL accessibility)
// FIXME: Console warning flood needs grouping (see KNOWN_ISSUES.md)
```

---

## 🚀 PERFORMANCE TIPS

### **LocalStorage Access**

```javascript
// ✅ GOOD - Load once, work in memory
const logs = LS_SAFE.getJSON("gym_hist", []);
logs.forEach(log => {
  // Process logs in memory
});
LS_SAFE.setJSON("gym_hist", logs); // Save once

// ❌ BAD - Multiple reads/writes
for (let i = 0; i < count; i++) {
  const logs = LS_SAFE.getJSON("gym_hist", []); // Read every iteration
  logs.push(newLog);
  LS_SAFE.setJSON("gym_hist", logs); // Write every iteration
}
```

### **DOM Updates**

```javascript
// ✅ GOOD - Batch DOM updates
const html = exercises.map(ex => `<div>${ex.name}</div>`).join('');
container.innerHTML = html; // Single reflow

// ❌ BAD - Multiple reflows
exercises.forEach(ex => {
  const div = document.createElement('div');
  div.textContent = ex.name;
  container.appendChild(div); // Reflow on each append
});
```

### **Chart.js**

```javascript
// ✅ GOOD - Destroy previous instance
if (APP.stats.chart) {
  APP.stats.chart.destroy();
}
APP.stats.chart = new Chart(ctx, config);

// ❌ BAD - Memory leak
APP.stats.chart = new Chart(ctx, config); // Old instance not destroyed
```

---

## 🔐 SECURITY BEST PRACTICES

### **Input Sanitization**

```javascript
// ✅ GOOD - Use textContent (auto-escapes HTML)
element.textContent = userInput;

// ⚠️ CAUTION - innerHTML only for trusted content
element.innerHTML = sanitizedHTML;

// ❌ DANGEROUS - Direct user input to innerHTML
element.innerHTML = userInput; // XSS vulnerability
```

### **JSON Parsing**

```javascript
// ✅ GOOD - Always try-catch user JSON
try {
  const data = JSON.parse(userInput);
  // ... validate structure
} catch (e) {
  console.error("Invalid JSON:", e);
  return null;
}

// ❌ BAD - Assume valid JSON
const data = JSON.parse(userInput); // Could crash
```

---

## 📖 ADDITIONAL RESOURCES

**Key Files to Study:**
1. `index.html` (lines 150-300) - LS_SAFE wrapper
2. `index.html` (lines 2800-3100) - Fuzzy matching logic
3. `exercises-library.js` - Data schema examples
4. `ARCHITECTURE.md` - System design
5. `HANDOVER_PACKAGE_V26.6.md` - Historical context

**Before Making Changes:**
1. Read relevant sections in ARCHITECTURE.md
2. Check KNOWN_ISSUES.md for gotchas
3. Search codebase for similar patterns
4. Test with edge cases (empty, invalid, large data)

---

**END OF CODING_GUIDELINES.md**
