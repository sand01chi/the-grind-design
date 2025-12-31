# 🔍 DEBUGGING PLAYBOOK - THE GRIND DESIGN

**Version:** V26.6  
**Last Updated:** December 31, 2025  
**Purpose:** Quick reference for diagnosing and fixing common issues

---

## 🚨 EMERGENCY FIXES (Data Loss Prevention)

### **CRITICAL: App Won't Load (Black Screen)**

**Symptoms:**
- Browser shows blank/black screen
- Console has errors (check F12 → Console)

**Immediate Action:**
```javascript
// 1. Open browser console (F12)
// 2. Check for error messages

// 3. If localStorage corrupt:
localStorage.clear();
location.reload();
// ⚠️ WARNING: This deletes all data! Only if no other option.

// 4. If specific key corrupt:
localStorage.removeItem("cscs_program_v10");
location.reload();
```

**Better Approach (If Backup Exists):**
```javascript
// List backups:
const backups = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.startsWith("backup_")) {
    backups.push(key);
  }
}
console.table(backups);

// Restore latest:
// (Copy backup key from console, e.g., "backup_1234567890_operation")
const backup = JSON.parse(localStorage.getItem("backup_1234567890_operation"));
localStorage.setItem("cscs_program_v10", JSON.stringify(backup.workoutData));
localStorage.setItem("gym_hist", JSON.stringify(backup.gym_hist));
location.reload();
```

---

### **CRITICAL: Data Seems Wrong After Update**

**Symptoms:**
- Exercises missing
- Volume numbers incorrect
- Sessions disappeared

**Diagnosis:**
```javascript
// 1. Check if backup exists:
APP.safety.listBackups();

// 2. If backup exists, restore:
APP.safety.restore("backup_id_here");

// 3. If no backup, export current state first:
const allData = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  allData[key] = localStorage.getItem(key);
}
console.log(JSON.stringify(allData, null, 2));
// Copy to text file, save externally
```

---

## 🔧 COMMON ISSUES & SOLUTIONS

### **Issue #1: Exercise Not Found in Library**

**Symptoms:**
- Error: "Exercise not found in library"
- Exercise picker shows empty
- Analytics missing exercise

**Diagnosis:**
```javascript
// Check if exercise exists:
console.log(EXERCISE_TARGETS);
console.log(EXERCISE_TARGETS["[Barbell] Bench Press"]);

// If undefined, exercise name is wrong
```

**Solutions:**

**Solution A: Fix Exercise Name**
```javascript
// 1. Get canonical name:
const canonical = APP.validation.fuzzyMatchExercise("bench press");
console.log("Canonical:", canonical);

// 2. If found, update logs:
const logs = LS_SAFE.getJSON("gym_hist", []);
logs.forEach(log => {
  if (log.ex === "wrong name") {
    log.ex = canonical;
  }
});
LS_SAFE.setJSON("gym_hist", logs);
location.reload();
```

**Solution B: Add to Library**
```javascript
// If exercise truly missing, add to exercises-library.js:

// 1. Open exercises-library.js
// 2. Add to EXERCISE_TARGETS:
"[Barbell] New Exercise": [{ muscle: "chest", role: "PRIMARY" }]

// 3. Add to EXERCISES_LIBRARY.chest:
{
  n: "[Barbell] New Exercise",
  t_r: "8-12",
  bio: "Movement description...",
  note: "Execution tips...",
  vid: ""
}

// 4. Save and reload
```

---

### **Issue #2: Volume Analytics Fragmented (Same Exercise, Multiple IDs)**

**Symptoms:**
- "Bench Press" shows 3 separate entries in analytics
- Volume looks lower than expected
- Same exercise name appears multiple times

**Diagnosis:**
```javascript
// Check gym_hist for name variations:
const logs = LS_SAFE.getJSON("gym_hist", []);
const exerciseNames = [...new Set(logs.map(l => l.ex))];
console.log("Unique exercises:", exerciseNames);

// Look for duplicates:
const benchVariations = exerciseNames.filter(n => 
  n.toLowerCase().includes("bench")
);
console.log("Bench variations:", benchVariations);
```

**Solution: Run Normalization**
```javascript
// V26.6 auto-runs this at init, but can force re-run:
APP.data.normalizeExerciseNames();

// Check report in console:
// "✅ Normalized X exercise names"
```

**Manual Fix (If Auto-Fix Fails):**
```javascript
// 1. Backup first:
APP.safety.createBackup("manual_name_fix");

// 2. Load and fix:
const logs = LS_SAFE.getJSON("gym_hist", []);
logs.forEach(log => {
  // Find and replace specific variations:
  if (log.ex === "bench press") {
    log.ex = "[Barbell] Bench Press";
  }
  if (log.ex === "Bench Press") {
    log.ex = "[Barbell] Bench Press";
  }
});

// 3. Save:
LS_SAFE.setJSON("gym_hist", logs);
location.reload();
```

---

### **Issue #3: Exercise Picker Modal Stuck/Won't Open**

**Symptoms:**
- Click "Add Exercise" → nothing happens
- Modal appears but content blank
- Can't select exercise

**Diagnosis:**
```javascript
// Check if EXERCISES_LIBRARY loaded:
console.log("Library loaded:", typeof EXERCISES_LIBRARY);
console.log("Exercises count:", Object.keys(EXERCISES_LIBRARY).length);

// Check for JS errors:
// F12 → Console → Look for red errors
```

**Solutions:**

**Solution A: Reload Page**
```javascript
// Hard refresh:
// Windows: Ctrl + Shift + R
// Mac: Cmd + Shift + R
```

**Solution B: Check exercises-library.js**
```javascript
// 1. Open browser DevTools → Network tab
// 2. Reload page
// 3. Look for "exercises-library.js" - should be Status 200
// 4. If 404, file not found - check path in index.html:
<script src="exercises-library.js"></script>
```

**Solution C: Console Manual Check**
```javascript
// Try opening picker manually:
APP.ui.openExercisePicker("new", null, null);

// If error appears, read error message for clues
```

---

### **Issue #4: Workout Log Won't Save (Quota Exceeded)**

**Symptoms:**
- Click "Complete Workout" → toast error
- Data not in history
- Alert: "Memori Penuh!"

**Diagnosis:**
```javascript
// Check localStorage size:
let totalSize = 0;
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const size = (localStorage.getItem(key).length * 2) / 1024; // KB
  totalSize += size;
  console.log(`${key}: ${size.toFixed(2)} KB`);
}
console.log(`TOTAL: ${totalSize.toFixed(2)} KB`);

// If > 5000 KB → quota issue
```

**Solutions:**

**Solution A: Delete Old Backups**
```javascript
// List all backups:
const backups = APP.safety.listBackups();
console.table(backups);

// Keep last 2, delete rest:
backups.slice(2).forEach(backup => {
  localStorage.removeItem(backup.id);
  console.log("Deleted:", backup.id);
});

// Try saving again
```

**Solution B: Archive Old Logs**
```javascript
// 1. Backup to Google Drive first:
syncToCloud(); // Use UI button or console

// 2. Delete logs older than 1 year:
const logs = LS_SAFE.getJSON("gym_hist", []);
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

const recentLogs = logs.filter(log => {
  const logDate = new Date(log.date);
  return logDate > oneYearAgo;
});

console.log(`Keeping ${recentLogs.length} of ${logs.length} logs`);
LS_SAFE.setJSON("gym_hist", recentLogs);

// 3. Try saving workout again
```

**Solution C: Export and Clear**
```javascript
// Nuclear option: Export all, clear, re-import essentials

// 1. Export everything:
const allData = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  allData[key] = localStorage.getItem(key);
}
const blob = new Blob([JSON.stringify(allData, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `full_backup_${Date.now()}.json`;
a.click();

// 2. Clear localStorage:
localStorage.clear();

// 3. Reload and start fresh
```

---

### **Issue #5: Chart Not Rendering**

**Symptoms:**
- Analytics tab shows empty space
- Console error: "Cannot read property 'getContext' of null"

**Diagnosis:**
```javascript
// Check if canvas element exists:
const canvas = document.getElementById("progressChart");
console.log("Canvas exists:", !!canvas);

// Check if Chart.js loaded:
console.log("Chart.js loaded:", typeof Chart);

// Check if data available:
const logs = LS_SAFE.getJSON("gym_hist", []);
console.log("Logs count:", logs.length);
```

**Solutions:**

**Solution A: Reload Chart.js**
```javascript
// If Chart.js failed to load:
// 1. Check internet connection
// 2. Hard refresh page (Ctrl+Shift+R)
// 3. Check browser console for CDN errors
```

**Solution B: Force Re-render**
```javascript
// Switch to different view and back:
APP.nav.switchView('dashboard');
setTimeout(() => APP.nav.switchView('stats'), 100);
```

**Solution C: Destroy and Recreate**
```javascript
// If chart exists but broken:
if (APP.stats.chart) {
  APP.stats.chart.destroy();
  APP.stats.chart = null;
}

// Then switch to stats view to trigger re-render:
APP.nav.switchView('stats');
```

---

### **Issue #6: Session Won't Delete**

**Symptoms:**
- Click delete → nothing happens
- Session still appears after confirm
- Error in console

**Diagnosis:**
```javascript
// Check if session exists:
const sessionId = "s1"; // Replace with actual ID
console.log("Session data:", APP.state.workoutData[sessionId]);

// Check localStorage keys:
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.includes(sessionId)) {
    console.log("Found key:", key);
  }
}
```

**Solution: Manual Delete**
```javascript
// 1. Backup first:
APP.safety.createBackup("manual_delete_session");

// 2. Delete from workoutData:
delete APP.state.workoutData["s1"]; // Replace s1 with session ID

// 3. Save:
APP.core.saveProgram();

// 4. Clean up localStorage keys:
for (let i = localStorage.length - 1; i >= 0; i--) {
  const key = localStorage.key(i);
  if (key && key.startsWith("s1_")) { // Replace s1
    localStorage.removeItem(key);
    console.log("Removed:", key);
  }
}

// 5. Reload:
location.reload();
```

---

### **Issue #7: Exercise Variant Won't Switch**

**Symptoms:**
- Select different variant → still shows old exercise
- Variant preference not saving

**Diagnosis:**
```javascript
// Check saved preference:
const sessionId = "s1";
const exerciseIdx = 0;
const prefKey = `pref_${sessionId}_${exerciseIdx}`;
console.log("Saved variant:", LS_SAFE.get(prefKey));

// Check available variants:
const session = APP.state.workoutData[sessionId];
console.log("Available variants:", session.exercises[exerciseIdx].options);
```

**Solution:**
```javascript
// Force set variant:
LS_SAFE.set("pref_s1_0", "1"); // Sets to variant index 1

// Reload workout view:
APP.nav.loadWorkout("s1");
```

---

## 🐛 DEBUGGING TECHNIQUES

### **Technique #1: Console Breadcrumbs**

Add strategic logs to trace execution:

```javascript
// At function start:
console.log("[DEBUG] Function called:", functionName, arguments);

// At decision points:
console.log("[DEBUG] Condition check:", condition, "Result:", result);

// At function end:
console.log("[DEBUG] Function completed:", functionName);
```

**Example:**
```javascript
function saveWorkout(sessionId) {
  console.log("[DEBUG] saveWorkout called with:", sessionId);
  
  const session = APP.state.workoutData[sessionId];
  console.log("[DEBUG] Session data:", session);
  
  if (!session) {
    console.error("[DEBUG] Session not found!");
    return false;
  }
  
  console.log("[DEBUG] saveWorkout completed successfully");
  return true;
}
```

---

### **Technique #2: Inspect State**

Check app state at any time:

```javascript
// View all state:
console.log("APP.state:", APP.state);

// View specific session:
console.log("Session s1:", APP.state.workoutData.s1);

// View workout logs:
console.log("Logs:", LS_SAFE.getJSON("gym_hist"));

// View profile:
console.log("Profile:", LS_SAFE.getJSON("profile"));
```

---

### **Technique #3: Time Operations**

Find performance bottlenecks:

```javascript
console.time("Operation");
// ... expensive operation
console.timeEnd("Operation");
// Logs: "Operation: 123.45ms"
```

**Example:**
```javascript
console.time("Load History");
const logs = LS_SAFE.getJSON("gym_hist", []);
const processed = logs.map(log => {
  // ... processing
});
console.timeEnd("Load History");
```

---

### **Technique #4: Breakpoint Debugging**

Use browser DevTools:

```javascript
// 1. Open DevTools (F12)
// 2. Go to Sources tab
// 3. Find index.html
// 4. Click line number to set breakpoint
// 5. Trigger action in app
// 6. Execution pauses at breakpoint
// 7. Inspect variables, step through code
```

---

### **Technique #5: Assert Assumptions**

Validate assumptions with assertions:

```javascript
console.assert(condition, "Error message if false");

// Example:
console.assert(
  Array.isArray(logs),
  "gym_hist should be an array, got:", typeof logs
);

console.assert(
  logs.length > 0,
  "Expected logs to have data, got empty array"
);
```

---

## 📊 DATA INSPECTION TOOLS

### **Tool #1: Inspect Exercise Library**

```javascript
// Count exercises:
console.log("Total exercises:", Object.keys(EXERCISE_TARGETS).length);

// List by category:
const byCategory = {};
Object.keys(EXERCISE_TARGETS).forEach(ex => {
  const targets = EXERCISE_TARGETS[ex];
  const muscle = targets[0].muscle;
  
  if (!byCategory[muscle]) byCategory[muscle] = [];
  byCategory[muscle].push(ex);
});
console.table(byCategory);

// Find exercises by keyword:
const keyword = "press";
const matches = Object.keys(EXERCISE_TARGETS).filter(ex => 
  ex.toLowerCase().includes(keyword)
);
console.log(`Exercises with "${keyword}":`, matches);
```

---

### **Tool #2: Analyze Workout History**

```javascript
// Total volume all-time:
const logs = LS_SAFE.getJSON("gym_hist", []);
const totalVolume = logs.reduce((sum, log) => sum + (log.vol || 0), 0);
console.log("Total volume:", totalVolume.toLocaleString(), "kg");

// Volume by exercise:
const byExercise = {};
logs.forEach(log => {
  if (!byExercise[log.ex]) byExercise[log.ex] = 0;
  byExercise[log.ex] += log.vol || 0;
});
console.table(
  Object.entries(byExercise)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) // Top 10
);

// Workout frequency:
const dates = [...new Set(logs.map(l => l.date))];
console.log("Total workout days:", dates.length);
console.log("First workout:", dates[0]);
console.log("Last workout:", dates[dates.length - 1]);
```

---

### **Tool #3: Check LocalStorage Health**

```javascript
// List all keys:
const keys = [];
for (let i = 0; i < localStorage.length; i++) {
  keys.push(localStorage.key(i));
}
console.log("LocalStorage keys:", keys);

// Check for orphaned keys:
const orphaned = keys.filter(key => {
  return key.includes("_ex") && !key.includes("backup");
});
console.log("Orphaned workout keys:", orphaned);

// Storage size by key:
const sizes = {};
keys.forEach(key => {
  const value = localStorage.getItem(key);
  sizes[key] = ((value.length * 2) / 1024).toFixed(2) + " KB";
});
console.table(sizes);
```

---

## 🔬 ADVANCED DIAGNOSTICS

### **Diagnostic #1: Fuzzy Match Test Suite**

```javascript
// Test canonical name matching:
const testCases = [
  "bench press",
  "Bench Press",
  "[Barbell] Bench Press",
  "BENCH PRESS",
  "bench",
  "press"
];

console.log("Fuzzy Match Tests:");
testCases.forEach(input => {
  const result = APP.validation.fuzzyMatchExercise(input);
  console.log(`"${input}" →`, result || "NO MATCH");
});
```

---

### **Diagnostic #2: Validate All Sessions**

```javascript
// Check integrity of all sessions:
const sessions = Object.keys(APP.state.workoutData);
const results = {};

sessions.forEach(sessionId => {
  const session = APP.state.workoutData[sessionId];
  
  results[sessionId] = {
    valid: true,
    issues: []
  };
  
  if (!session.exercises || !Array.isArray(session.exercises)) {
    results[sessionId].valid = false;
    results[sessionId].issues.push("Missing exercises array");
  }
  
  session.exercises?.forEach((ex, idx) => {
    if (!ex.options || ex.options.length === 0) {
      results[sessionId].valid = false;
      results[sessionId].issues.push(`Exercise ${idx} has no options`);
    }
    
    ex.options?.forEach(opt => {
      if (!EXERCISE_TARGETS[opt.n]) {
        results[sessionId].issues.push(`Exercise "${opt.n}" not in library`);
      }
    });
  });
});

console.table(results);
```

---

### **Diagnostic #3: Find Duplicate Logs**

```javascript
// Find potential duplicate workout logs:
const logs = LS_SAFE.getJSON("gym_hist", []);
const byDate = {};

logs.forEach((log, idx) => {
  const key = `${log.date}_${log.ex}_${log.vol}`;
  
  if (!byDate[key]) byDate[key] = [];
  byDate[key].push(idx);
});

const duplicates = Object.entries(byDate).filter(([_, indices]) => 
  indices.length > 1
);

if (duplicates.length > 0) {
  console.warn("Potential duplicates found:");
  duplicates.forEach(([key, indices]) => {
    console.log(`${key}: log indices ${indices.join(", ")}`);
  });
} else {
  console.log("✅ No duplicates found");
}
```

---

## 💡 PREVENTIVE MEASURES

### **1. Regular Backups**

```javascript
// Create backup before major operations:
APP.safety.createBackup("description_of_what_youre_doing");

// Schedule weekly manual backups:
// Use Google Drive sync feature or export to file
```

### **2. Data Validation**

```javascript
// Before importing data:
const data = JSON.parse(userInput);
const report = APP.validation.validateExerciseIntegrity(data);

if (!report.valid) {
  console.error("Validation failed:", report.errors);
  return;
}
```

### **3. Console Monitoring**

```javascript
// Watch for warnings:
// Yellow = warnings (investigate)
// Red = errors (fix immediately)
// Blue = info (informational)
```

---

## 📞 WHEN TO ESCALATE

**Contact developer/create GitHub issue if:**

1. Data loss despite backups
2. Repeated crashes after following playbook
3. New bug not covered in KNOWN_ISSUES.md
4. Security vulnerability discovered
5. Feature request for better debugging tools

**Include in report:**
- Browser version
- Console logs (screenshot or copy/paste)
- Steps to reproduce
- LocalStorage export (if safe to share)

---

**END OF DEBUGGING_PLAYBOOK.md**
