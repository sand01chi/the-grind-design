# 💻 CODING GUIDELINES - THE GRIND DESIGN

**Version:** V30.8  
**Last Updated:** January 15, 2026  
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

6. **NEVER use `window.APP = APP` to merge namespaces (V27+)**
   ```javascript
   // ❌ WRONG - Overwrites existing namespaces
   window.APP = APP;  // Destroys APP.ui, APP.data, etc.
   
   // ✅ CORRECT - Merge pattern
   if (window.APP) {
     Object.assign(window.APP, APP);  // Add to existing
   } else {
     window.APP = APP;
   }
   ```

7. **NEVER use local APP reference in cross-module calls (V27+)**
   ```javascript
   // ❌ WRONG - Captures local APP in closure
   const APP = {myModule: {}};
   APP.myModule = {
     method: () => APP.otherModule.doSomething()  // undefined!
   };
   
   // ✅ CORRECT - Use window.APP
   const APP = {myModule: {}};
   APP.myModule = {
     method: () => window.APP.otherModule.doSomething()  // ✅
   };
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

6. **ALWAYS use window.APP for cross-module access (V27+)**
   ```javascript
   // In any module file:
   APP.myModule = {
     method: function() {
       // ✅ ALWAYS use window.APP
       window.APP.otherModule.doSomething();
       window.APP.ui.showToast("Success", "success");
     }
   };
   ```

7. **ALWAYS add namespace guards in modules (V27+)**
   ```javascript
   (function() {
     'use strict';
     
     // ✅ ALWAYS guard namespace
     if (!window.APP) window.APP = {};
     
     APP.myModule = {
       // module code
     };
   })();
   ```

---

## 🆕 V28-V30 CRITICAL PATTERNS

### **V28: AI Bridge Prompt System**

**Placeholder Convention:**
```javascript
// ✅ CORRECT: System placeholders (auto-replaced)
{{VERSION}}     // → APP.version.number + APP.version.name
{{CONTEXT}}     // → Full workout context
{{ARCHITECTURE}} // → APP.architecture.pattern

// ✅ CORRECT: User-provided placeholders
{{USER_DESCRIPTION}} // → User must provide input
{{TOPIC}}            // → User must provide input
```

**Prompt Template Rules:**
```javascript
// ❌ WRONG: Mixed placeholder styles
template: "Version: ${APP.version}"  // Don't use template literals

// ✅ CORRECT: Use double curly braces
template: "Version: {{VERSION}}"     // Consistent with system
```

---

### **V29: Analytics Validation**

**Clinical Threshold Constants:**
```javascript
// ✅ ALWAYS use constants from stats.js
const CLINICAL_THRESHOLDS = {
  VOLUME_SPIKE_THRESHOLD: 1.3,  // 30% increase
  IMBALANCE_WARNING: 0.6,        // 60% ratio
  IMBALANCE_DANGER: 0.4,         // 40% ratio
  MIN_WEEKLY_SETS_PER_MUSCLE: 10
};

// ❌ NEVER hardcode thresholds
if (volumeRatio < 0.6) { }  // Magic number - no scientific basis

// ✅ CORRECT: Use named constants
if (volumeRatio < CLINICAL_THRESHOLDS.IMBALANCE_WARNING) { }
```

**Bodyweight Exercise Volume (V30.6+):**
```javascript
// ✅ ALWAYS calculate bodyweight volume with multipliers
const BODYWEIGHT_MULTIPLIERS = {
  "[Bodyweight] Pull Up": 1.0,
  "[Bodyweight] Chin Up": 1.0,
  "[Bodyweight] Dip": 1.0,
  "[Bodyweight] Push Up": 0.64,
  "[Bodyweight] Inverted Row": 0.6,
  "[Bodyweight] Pike Push Up": 0.7
};

function calculateBodyweightVolume(exercise, reps, userWeight) {
  const multiplier = BODYWEIGHT_MULTIPLIERS[exercise.name] || 1.0;
  return userWeight * multiplier * reps;
}

// ❌ WRONG: Don't log bodyweight exercises with 0kg
set.weight = 0;  // Analytics will be broken

// ✅ CORRECT: Always calculate effective weight
set.weight = userWeight * multiplier;
```

---

### **V30: View-Based Navigation**

**switchView() Pattern:**
```javascript
// ✅ CORRECT: Use switchView() for main navigation
window.APP.nav.switchView("dashboard");
window.APP.nav.switchView("analytics-view");
window.APP.nav.switchView("ai-command-center");

// ❌ WRONG: Don't use modals for main views
APP.ui.openModal("dashboard");  // Modals are for overlays only

// View ID Convention:
// - Main views: "dashboard", "analytics-view", "ai-command-center", "profile-view"
// - Must have data-view="{name}" attribute in HTML
// - Must have corresponding nav item with data-nav="{name}"
```

**Mobile-First UI Rules:**
```javascript
// ✅ ALWAYS use Tailwind responsive classes
<button class="px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4">

// ✅ ALWAYS provide touch targets (min 44px)
.glass-btn { min-height: 44px; }

// ❌ NEVER use fixed pixel widths on mobile
width: 320px;  // Breaks on small screens

// ✅ CORRECT: Use responsive widths
class="w-full sm:w-auto"
```

**Toast Notification Line Breaks (V30.5):**
```javascript
// ✅ CORRECT: Use \n for line breaks in toasts
APP.ui.showToast("Set saved\nVolume: 2400kg", "success");

// ❌ WRONG: HTML breaks in string (XSS risk)
APP.ui.showToast("Set saved<br>Volume: 2400kg", "success");

// Note: showToast() automatically converts \n to <br> with XSS protection
```

**Color Coding Standards (V30.4):**
```javascript
// Analytics Severity Colors (Clinical Standard)
const SEVERITY_COLORS = {
  optimal: "#10B981",    // Green - Safe, healthy
  monitor: "#EAB308",    // Yellow - Watch closely
  imbalance: "#EF4444",  // Red - Action required
  info: "#3B82F6"        // Blue - Informational
};

// Primary Theme Colors
const THEME_COLORS = {
  accent: "#4FD1C5",     // Teal - Primary actions
  bg: "#000000",         // Pure black - Background
  card: "#1C1C1E",       // Dark gray - Cards
  text: "#FFFFFF",       // White - Primary text
  subtext: "#9CA3AF"     // Gray - Secondary text
};

// ❌ NEVER hardcode colors in JavaScript
if (status === "warning") {
  element.style.color = "#EAB308"; // ❌ Magic color
}

// ✅ ALWAYS use named constants or Tailwind classes
if (status === "warning") {
  element.classList.add("text-yellow-500"); // ✅ Semantic
}
```

---

## 📐 V30 UI/UX PATTERNS

### **View Navigation (V30.0+)**

```javascript
// ✅ CORRECT: Use switchView() for main navigation
window.APP.nav.switchView("dashboard");
window.APP.nav.switchView("analytics-view");
window.APP.nav.switchView("ai-command-center");

// ❌ WRONG: Don't use modals for main views
APP.ui.openModal("analytics");  // Modals are for overlays only!

// ✅ CORRECT: Modals for temporary overlays
APP.ui.openModal("exercise-picker");
APP.ui.openModal("session-editor");
```

**View Naming Convention:**
```html
<!-- HTML: Use data-view attribute (no -view suffix) -->
<div data-view="dashboard" class="hidden">
  <!-- Dashboard content -->
</div>

<!-- Bottom Nav: Must match view name -->
<button data-nav="dashboard">
  <i class="fa-solid fa-home"></i>
</button>
```

**Critical Rule:**
- `data-view` in HTML = view name
- `switchView("viewName")` parameter must match `data-view` attribute exactly
- Bottom nav `data-nav` must match view name

---

### **Responsive Design (Mobile-First)**

```html
<!-- ✅ CORRECT: Mobile-first Tailwind classes -->
<button class="
  px-4 py-3           <!-- Mobile: 16px h-padding, 12px v-padding -->
  sm:px-6 sm:py-4     <!-- Tablet: 24px h-padding, 16px v-padding -->
  text-sm sm:text-base <!-- Mobile: 14px, Tablet: 16px -->
">
  Action
</button>

<!-- ✅ CORRECT: Touch target compliance (min 44px) -->
<button class="min-h-[44px] py-3">Touch Me</button>

<!-- ❌ WRONG: Fixed pixel widths -->
<button style="width: 320px;">  <!-- Breaks on small screens -->

<!-- ✅ CORRECT: Responsive widths -->
<button class="w-full sm:w-auto">
```

**Tailwind Breakpoints:**
```
Default: < 640px (mobile)
sm:     >= 640px (tablet)
md:     >= 768px (tablet landscape)
lg:     >= 1024px (desktop)
xl:     >= 1280px (large desktop)
```

**Grid Responsive Pattern:**
```html
<!-- ✅ 1 column mobile, 2 tablet, 3 desktop -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="glass-card">Card 1</div>
  <div class="glass-card">Card 2</div>
  <div class="glass-card">Card 3</div>
</div>
```

---

### **Glass Morphism UI (V30.0+)**

```html
<!-- ✅ CORRECT: Use predefined glass utilities -->
<div class="glass-panel">  <!-- Main containers -->
  <div class="glass-card">  <!-- Interactive cards -->
    <input class="glass-input" />  <!-- Form inputs -->
    <button class="glass-btn">Action</button>
  </div>
</div>

<!-- ❌ WRONG: Custom glass styles (inconsistent) -->
<div style="background: rgba(255,255,255,0.1);">
```

**Glass Utility Classes:**
```css
.glass-panel  /* Main containers, heavy blur */
.glass-card   /* Cards, light blur, hover effect */
.glass-input  /* Form inputs, min 44px height */
.glass-btn    /* Buttons, min 44px height */
```

---

### **Toast Notifications (V30.5)**

```javascript
// ✅ CORRECT: Multi-line toasts with \n
APP.ui.showToast("Operation successful\nVolume: 2400kg\nSets: 4", "success");

// ✅ CORRECT: Single line
APP.ui.showToast("Set saved", "success");

// ✅ CORRECT: Warning/error types
APP.ui.showToast("Check form inputs", "warning");

// ❌ WRONG: HTML injection (XSS risk)
APP.ui.showToast("<b>Bold text</b>", "success");  // Will be escaped

// ❌ WRONG: Manual <br> tags
APP.ui.showToast("Line 1<br>Line 2", "success");  // Use \n instead
```

**Toast Types:**
- `"success"` - Green border, check icon (default)
- `"warning"` - Yellow border, exclamation icon
- `"error"` - Red border, X icon (use sparingly)

---

### **Safe Area Handling (iOS)**

```css
/* ✅ CORRECT: iOS notch/home indicator safety */
body {
  padding-bottom: env(safe-area-inset-bottom);
}

#bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}

/* ❌ WRONG: Fixed padding (cuts off on iPhone) */
body {
  padding-bottom: 20px;
}
```

---

## 📁 V27 MODULE DEVELOPMENT RULES

### **Module File Structure**

**Standard Template:**
```javascript
(function() {
  'use strict';
  
  // 1. Namespace guard
  if (!window.APP) window.APP = {};
  
  // 2. Define module
  APP.moduleName = {
    property: value,
    
    method: function() {
      // Use window.APP for all cross-module access!
      window.APP.otherModule.method();
    }
  };
  
  // 3. Load confirmation (production-ready logging)
  console.log("[MODULE-NAME] ✅ Module loaded");
})();
```

---

### **Cross-Module Communication**

**❌ WRONG - Closure Scoping Bug:**
```javascript
// In core.js
const APP = {
  state: {},
  core: {}
};

APP.core = {
  finishSession: () => {
    // ❌ This looks at LOCAL APP (no nav property!)
    APP.nav.switchView("dashboard");  // Error!
  }
};

window.APP = APP;  // Local APP merged to global
```

**✅ CORRECT - Always Use window.APP:**
```javascript
// In core.js
const APP = {
  state: {},
  core: {}
};

APP.core = {
  finishSession: () => {
    // ✅ This looks at GLOBAL window.APP (has nav!)
    window.APP.nav.switchView("dashboard");  // Success!
  }
};

// Merge pattern
if (window.APP) {
  Object.assign(window.APP, APP);
} else {
  window.APP = APP;
}
```

---

### **Module Merge Pattern**

**Every module MUST use this pattern:**
```javascript
(function() {
  'use strict';
  
  if (!window.APP) window.APP = {};
  
  // Create local APP object
  const localModule = {
    method1: function() {
      window.APP.otherModule.method();
    },
    method2: function() {
      window.APP.validation.validate();
    }
  };
  
  // Merge to global (don't overwrite!)
  APP.moduleName = localModule;
  
  // Or directly:
  // APP.moduleName = { ... };
  
  console.log("[MODULE] ✅ Loaded");
})();
```

---

### **Defensive Error Handling in Modules**

```javascript
APP.core = {
  finishSession: function() {
    try {
      // Main logic
      const result = processWorkout();
      
      // Cross-module call with defensive check
      if (window.APP && window.APP.nav && window.APP.nav.switchView) {
        window.APP.nav.switchView("dashboard");
      } else {
        console.error("Navigation not available");
      }
    } catch (e) {
      // Log real error first
      console.error("[FINISH SESSION ERROR]", e);
      
      // Then try to show error UI (with fallback)
      if (window.APP?.debug?.showFatalError) {
        window.APP.debug.showFatalError("Finish Session", e);
      } else {
        alert("Error: " + (e.message || e));
      }
    }
  }
};
```

---

### **Module Load Order Guidelines**

**Dependencies Must Load First:**
```html
<!-- ❌ WRONG ORDER - ui.js needs validation, data, etc. -->
<script src="js/ui.js"></script>
<script src="js/validation.js"></script>
<script src="js/data.js"></script>

<!-- ✅ CORRECT ORDER -->
<script src="exercises-library.js"></script>
<script src="js/constants.js"></script>
<script src="js/core.js"></script>
<script src="js/validation.js"></script>  <!-- ui.js depends on this -->
<script src="js/data.js"></script>        <!-- ui.js depends on this -->
<!-- ... other modules ... -->
<script src="js/ui.js"></script>          <!-- Load after dependencies -->
```

**Complete Load Order:**
```
1. exercises-library.js     (data)
2. js/constants.js          (PRESETS, STARTER_PACK)
3. js/core.js              (foundation)
4. js/validation.js        (business logic)
5. js/data.js
6. js/safety.js
7. js/stats.js
8. js/session.js
9. js/cardio.js
10. js/ui.js               (uses all above)
11. js/debug.js            (before nav!)
12. js/nav.js              (uses ALL modules)
13. js/cloud.js            (standalone)
```

---

### **Adding a New Module**

**Step 1: Create File (`js/new-module.js`)**
```javascript
(function() {
  'use strict';
  
  if (!window.APP) window.APP = {};
  
  APP.newModule = {
    init: function() {
      console.log("[NEW-MODULE] Initializing...");
    },
    
    processData: function(data) {
      // Use window.APP for cross-module
      const validated = window.APP.validation.validate(data);
      window.APP.ui.showToast("Processed", "success");
      return validated;
    }
  };
  
  console.log("[NEW-MODULE] ✅ Loaded");
})();
```

**Step 2: Add to index.html Load Order**
```html
<!-- Add in correct position based on dependencies -->
<script src="js/validation.js"></script>
<script src="js/data.js"></script>
<script src="js/new-module.js"></script>  <!-- After dependencies -->
<script src="js/ui.js"></script>
```

**Step 3: Update ARCHITECTURE.md**
- Add module to file structure diagram
- Document module responsibility
- List dependencies

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
process()          // Process what?
```

### **Variables**
```javascript
// ✅ camelCase, descriptive
const sessionId = "s1";
const exerciseIdx = 0;
const workoutLogs = LS_SAFE.getJSON("gym_hist", []);

// ❌ Avoid
const id = "s1";           // ID of what?
const idx = 0;             // Index of what?
const wl = [];             // What's "wl"?
```

### **Constants**
```javascript
// ✅ SCREAMING_SNAKE_CASE
const LS_SAFE = {...};
const EXERCISE_TARGETS = {...};
const MAX_BACKUP_COUNT = 5;

// ❌ Avoid
const lsSafe = {...};      // Should be SCREAMING_SNAKE_CASE
const exerciseTargets = {...};
```

### **Module Files (V27+)**
```javascript
// ✅ kebab-case, matches namespace
data.js        → APP.data
session.js     → APP.session
nav.js         → APP.nav

// ❌ Avoid
Data.js        // Not camelCase
session_mgmt.js // Not kebab-case
```

---

## 🏗️ CODE ORGANIZATION

### **Function Length**
```javascript
// ✅ GOOD - Single responsibility, <50 lines
function validateAndSaveWorkout(sessionId) {
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
    window.APP.ui.showToast("Invalid JSON format", "error");
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

## 📊 CONSOLE LOGGING STANDARDS

### **Production Logging (V27+)**
```javascript
// ✅ KEEP - Production-ready logs
console.log("[MODULE] ✅ Module loaded");
console.log("[INIT] Starting application...");
console.error("[ERROR] Critical failure:", error);
console.warn("[WARNING] Large data detected");

// ❌ REMOVE - Debug-only logs
console.log("[DEBUG] Variable value:", variable);
console.log("checking if X exists...");
console.log("value:", someValue);
```

### **Module Load Confirmation**
```javascript
// Every module should log when loaded
(function() {
  'use strict';
  
  if (!window.APP) window.APP = {};
  
  APP.moduleName = { /* ... */ };
  
  // ✅ Standard format
  console.log("[MODULE-NAME] ✅ Module loaded");
})();
```

---

## 🧪 TESTING APPROACH

### **Manual Testing Checklist**
After code changes, verify:
- [ ] App loads without console errors
- [ ] Target functionality works as expected
- [ ] No regressions in other features
- [ ] LocalStorage data integrity maintained
- [ ] Works offline (if PWA feature)
- [ ] Mobile responsive (if UI change)

### **Edge Case Testing**
```javascript
// Test with:
- Empty data (fresh install)
- Large data (3+ years of logs)
- Invalid input (null, undefined, malformed)
- Missing DOM elements
- LocalStorage quota exceeded
- Offline mode
```

---

## 📝 COMMENT STYLE

### **When to Comment**

```javascript
// ✅ GOOD - Explain WHY, not WHAT
// V26.6: Changed to return string instead of boolean
// to support canonical name enforcement
return canonicalName;

// ✅ GOOD - Explain complex logic
// Calculate half-set contribution for SECONDARY muscles
// to prevent noise from stabilizers
const contribution = role === "PRIMARY" ? 1.0 : 0.5;

// ❌ BAD - Obvious comments
// Get session by ID
const session = APP.state.workoutData[sessionId];

// ❌ BAD - Commented-out code (delete or explain)
// const oldImplementation = () => { ... };
```

### **When to Use TODOs**
```javascript
// ✅ GOOD - Actionable TODO with context
// TODO: Add input validation for negative weights
// TODO: Refactor this to data.js (currently in ui.js)
// TODO: [V28] Implement auto-deload suggestion

// ❌ BAD - Vague TODO
// TODO: Fix this
// TODO: Improve
```

---

## 🚀 DEPLOYMENT CHECKLIST

### **Before Committing**

**Code Quality:**
- [ ] No direct `localStorage` usage (use `LS_SAFE`)
- [ ] No `\n` in text fields (use `<br>`)
- [ ] Backup created before destructive operations
- [ ] Input validation for user data
- [ ] DOM element null checks
- [ ] Try-catch for JSON parsing
- [ ] Descriptive variable/function names
- [ ] Console logs are production-ready (no debug logs)
- [ ] No commented-out code (remove or document why kept)
- [ ] Functions follow single responsibility principle

**V27 Module Specific:**
- [ ] Uses `window.APP` for all cross-module calls
- [ ] Namespace guard: `if (!window.APP) window.APP = {};`
- [ ] Module merge pattern (Object.assign or direct assignment)
- [ ] Load order documented (if adding new module)
- [ ] Module load confirmation log added

**Documentation:**
- [ ] Update CHANGELOG_DETAILED.md
- [ ] Update ARCHITECTURE.md (if structure changed)
- [ ] Update this file (if new pattern introduced)

---

## 🎓 LEARNING PATH

**For new developers/AI:**
1. Read `ARCHITECTURE.md` → System design
2. Read this file → Code patterns
3. Read `HANDOVER_V27.md` → V27 refactoring context
4. Study module files in order:
   - `js/core.js` → Foundation patterns
   - `js/validation.js` → Validation patterns
   - `js/ui.js` → UI rendering patterns
5. Read `DEBUGGING_PLAYBOOK.md` → Troubleshooting

**Critical sections to understand:**
- `js/core.js` lines 1-50: LS_SAFE wrapper
- `js/validation.js` lines 100-200: fuzzyMatchExercise
- `js/data.js` lines 500-700: Smart Merge Engine
- `js/nav.js` lines 1-300: APP.init() flow

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

## 🔐 SECURITY CONSIDERATIONS

### **Input Sanitization**
```javascript
// ✅ Always sanitize numbers
const weight = APP.validation.sanitizeNumber(input, 0, 999, 0);

// ✅ Always sanitize strings
const sessionName = input.trim().substring(0, 100);

// ✅ Never use innerHTML for user input
element.textContent = userInput;  // ✅ Safe
element.innerHTML = userInput;     // ❌ XSS risk
```

---

## 📚 ADDITIONAL RESOURCES

**Related Documentation:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) - Active bugs & gotchas
- [DEBUGGING_PLAYBOOK.md](./DEBUGGING_PLAYBOOK.md) - Troubleshooting steps
- [HANDOVER_V27.md](./HANDOVER_V27.md) - V27 refactoring complete story

---

**END OF CODING_GUIDELINES.md**
