# 🏗️ ARCHITECTURE DOCUMENTATION - THE GRIND DESIGN

**Version:** V28.0
**Last Updated:** January 2, 2026
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
│  APP.cardio      │  APP.timer   │  APP.debug    │  APP.init │
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
├── PRESETS & STARTER_PACK (js/constants.js)
├── Service Worker (sw.js - PWA offline capability)
└── Google Drive API (js/cloud.js - Cloud Backup/Restore)
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

### 2. **MODULAR ARCHITECTURE (V27+)**
**Decision:** Separate JavaScript modules with IIFE pattern  
**Rationale:**
- Maintainability (9000 lines → organized modules)
- AI context efficiency (load specific modules only)
- Git-friendly (cleaner diffs, parallel development)
- Testing-friendly (isolated module testing)

**Module Pattern:**
```javascript
(function() {
  'use strict';
  
  if (!window.APP) window.APP = {};
  
  APP.moduleName = {
    method: function() {
      // ⚠️ CRITICAL: Use window.APP for cross-module access!
      window.APP.otherModule.method();
    }
  };
  
  console.log("[MODULE] ✅ Module loaded");
})();
```

**Why NOT ES6 modules or frameworks?**
- Vanilla JS requirement (no build step)
- Browser compatibility (no transpilation)
- Deployment simplicity (multiple .js files, no bundling)
- Performance (no module loading overhead beyond script tags)

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
// V26.6+ Hotfix
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

## 📦 V28 MODULAR FILE STRUCTURE

**Complete Module Breakdown (13 files, ~12,000 lines total):**

```
project-root/
├── index.html              (2,206 lines) - HTML skeleton + minimal init
├── exercises-library.js    (1,817 lines) - Exercise database
├── js/
│   ├── constants.js        (455 lines)   - PRESETS, STARTER_PACK, version metadata
│   ├── core.js            (344 lines)   - LS_SAFE, DT, APP.state, APP.core
│   ├── validation.js      (491 lines)   - APP.validation, fuzzy matching
│   ├── data.js            (1,218 lines)  - APP.data, CRUD operations
│   ├── safety.js          (325 lines)   - APP.safety, backup/restore
│   ├── stats.js           (1,665 lines)  - APP.stats, charts, analytics
│   ├── session.js         (750 lines)   - APP.session, session management
│   ├── cardio.js          (111 lines)   - APP.cardio, APP.timer, storage stats
│   ├── ai-bridge.js       (1,060 lines)  - APP.aiBridge, prompt library (V28+)
│   ├── ui.js              (1,901 lines)  - APP.ui, rendering, modals, toasts
│   ├── debug.js           (46 lines)    - APP.debug, window.onerror
│   ├── nav.js             (827 lines)   - APP.nav, APP.init
│   └── cloud.js           (195 lines)   - Google Drive integration
├── sw.js                   - Service Worker (PWA)
└── manifest.json           - PWA manifest
```

**Evolution:**
- V27: 9,000+ lines (monolithic) → 2,203 lines (index.html) + 7,453 lines (12 modules)
- V28: Added ai-bridge.js (1,060 lines) + enhanced ui.js (+850 lines) = ~12,000 lines total (13 modules)

---

## 🔄 CRITICAL MODULE LOAD ORDER

**MUST maintain this exact order in index.html:**

```html
<!-- 1. Data layer -->
<script src="exercises-library.js"></script>
<script src="js/constants.js"></script>

<!-- 2. Foundation -->
<script src="js/core.js"></script>

<!-- 3. Business logic (no interdependencies) -->
<script src="js/validation.js"></script>
<script src="js/data.js"></script>
<script src="js/safety.js"></script>
<script src="js/stats.js"></script>
<script src="js/session.js"></script>
<script src="js/cardio.js"></script>

<!-- 4. AI integration (depends on core, validation, constants) -->
<script src="js/ai-bridge.js"></script>

<!-- 5. UI layer (depends on all above) -->
<script src="js/ui.js"></script>

<!-- 6. Error handling (must load before nav) -->
<script src="js/debug.js"></script>

<!-- 7. Initialization (depends on ALL modules) -->
<script src="js/nav.js"></script>

<!-- 8. Cloud (standalone) -->
<script src="js/cloud.js"></script>
```

**Why this order matters:**
- `constants.js` must load before modules that use PRESETS/STARTER_PACK and version metadata
- `core.js` initializes APP namespace (merge pattern, not overwrite)
- `ai-bridge.js` must load after validation, constants (uses APP.version, fuzzyMatchExercise)
- `ui.js` must load after ai-bridge (uses APP.aiBridge for prompt manager UI)
- `debug.js` must load before `nav.js` (APP.init uses APP.debug)
- `nav.js` loads last because APP.init() references ALL other modules
- `cloud.js` is standalone and can load anytime after core

**⚠️ CRITICAL:** Never reorder these scripts! Breaks module dependencies.

---

## 🧩 MODULE RESPONSIBILITIES

### **constants.js (430 lines)**
**Exports:**
- `window.PRESETS` - Quick workout templates (Blood Flow, Mini Pump, Core, Mobility, Home)
- `window.STARTER_PACK` - Default program with UPPER/LOWER splits
- Exercise validation against EXERCISE_TARGETS

**Dependencies:** exercises-library.js
**Used by:** data.js, session.js, nav.js

---

### **core.js (344 lines)**
**Exports:**
- `LS_SAFE` - LocalStorage wrapper with error handling
- `DT` - Day.js wrapper for date manipulation
- `APP.state` - Global application state
- `APP.core` - Core utilities (saveProgram, finishSession, etc.)

**Dependencies:** None
**Used by:** ALL modules (foundation layer)

**Critical Pattern:**
```javascript
// Merge instead of overwrite!
if (window.APP) {
  Object.assign(window.APP, APP);  // ✅ Add to existing
} else {
  window.APP = APP;
}
```

---

### **validation.js (491 lines)**
**Exports:**
- `APP.validation.fuzzyMatchExercise()` - Canonical name matching
- `APP.validation.validateSession()` - Session structure validation
- `APP.validation.validateExercise()` - Exercise validation
- `APP.validation.sanitizeNumber()` - Number input sanitization

**Dependencies:** core.js, exercises-library.js
**Used by:** data.js, session.js, ui.js, nav.js

---

### **data.js (1,218 lines)**
**Exports:**
- `APP.data.addNewExerciseCard()` - Add exercise to session
- `APP.data.saveSet()` - Save set data
- `APP.data.mergeProgram()` - Smart Merge Engine (AI integration)
- `APP.data.normalizeExerciseNames()` - Data integrity migration
- `APP.data.copyProgramToClipboard()` - Export JSON
- All CRUD operations

**Dependencies:** core.js, validation.js, safety.js
**Used by:** session.js, nav.js, ui.js

---

### **safety.js (325 lines)**
**Exports:**
- `APP.safety.createBackup()` - Create timestamped backup
- `APP.safety.listBackups()` - List all backups
- `APP.safety.restore()` - Restore from backup
- `APP.safety.deleteBackup()` - Delete specific backup

**Dependencies:** core.js
**Used by:** data.js, session.js, nav.js

---

### **stats.js (1,665 lines)**
**Exports:**
- `APP.stats.renderVolumeChart()` - Volume progression chart
- `APP.stats.renderProgressionChart()` - Top set progression
- `APP.stats.renderMuscleDistribution()` - Volume by muscle group
- `APP.stats.calculateVolume()` - Volume calculation utilities
- All analytics functions

**Dependencies:** core.js, Chart.js (CDN)
**Used by:** ui.js, nav.js

---

### **session.js (750 lines)**
**Exports:**
- `APP.session.openEditor()` - Session edit modal
- `APP.session.confirmDelete()` - Delete session with confirmation
- `APP.session.spontaneous.*` - Spontaneous workout methods
  - `startEmpty()` - Create empty spontaneous session
  - `loadFromJSON()` - Load from JSON paste
  - `saveToPresets()` - Save as preset template

**Dependencies:** core.js, validation.js, data.js, safety.js
**Used by:** nav.js, ui.js

---

### **cardio.js (111 lines)**
**Exports:**
- `APP.cardio.setDuration()` - Set cardio duration
- `APP.cardio.validateHR()` - Validate heart rate zones
- `APP.cardio.toggleComplete()` - Mark cardio complete
- `APP.timer` - Timer utilities (future expansion)
- `APP.showStorageStats()` - Display localStorage usage

**Dependencies:** core.js
**Used by:** nav.js, ui.js

---

### **ai-bridge.js (1,060 lines) - AI INTEGRATION MODULE**
**Exports:**
- `APP.aiBridge._builtInPrompts` - 12 immutable AI prompt templates
- `APP.aiBridge._customPrompts` - User-created prompts (from LocalStorage)
- `APP.aiBridge.prompts` (getter) - Merged built-in + custom
- `APP.aiBridge.library.*` - CRUD API for custom prompt management
  - `add()`, `edit()`, `delete()`, `export()`, `import()`, `list()`
- `APP.aiBridge.getPrompt()` - Smart placeholder replacement engine
- `APP.aiBridge.getPromptContext()` - Workout data context generator

**Dependencies:** core.js, constants.js, validation.js, exercises-library.js
**Used by:** ui.js (prompt manager UI)

**Critical Note:** Must load AFTER constants.js (uses APP.version) and validation.js (uses fuzzyMatchExercise).

---

### **ui.js (1,901 lines) - LARGEST UI MODULE**
**Exports:**
- Modal system: `openModal()`, `closeModal()`
- Exercise picker: `openExercisePicker()`, `renderExerciseList()`, `confirmExercisePicker()`
- Rendering: `renderProgram()`, `renderHistory()`, `renderCalendar()`
- Prompt Manager: `renderPromptManagerMode()`, `showGeneratePromptModal()` (V28+)
- Toasts: `showToast()`
- All UI rendering logic

**Dependencies:** ALL previous modules (uses everything, including ai-bridge)
**Used by:** ALL modules (UI entry points)

**Critical Note:** Must load AFTER all business logic modules including ai-bridge.

---

### **debug.js (46 lines)**
**Exports:**
- `APP.debug.showFatalError()` - Display error modal
- `APP.debug.copyErrorLog()` - Copy error to clipboard
- `window.onerror` - Global error handler

**Dependencies:** None (standalone error handling)
**Used by:** nav.js (APP.init uses APP.debug)

**Critical Note:** Must load BEFORE nav.js!

---

### **nav.js (827 lines) - INITIALIZATION MODULE**
**Exports:**
- `APP.init()` - Main application initialization (294 lines)
  - Day.js locale setup
  - Data validation and normalization
  - Backup/restore logic
  - Spontaneous session auto-fix
  - Initial data loading
- `APP.nav.switchView()` - View switching
- `APP.nav.renderDashboard()` - Dashboard rendering
- `APP.nav.loadWorkout()` - Load workout session (526 lines)

**Dependencies:** ALL other modules (loaded last for this reason)
**Used by:** index.html DOMContentLoaded listener

**Critical Pattern:**
```javascript
// Always use window.APP for cross-module access!
APP.core.finishSession = () => {
  // ❌ WRONG: APP.nav.switchView() (captures local APP in closure)
  // ✅ CORRECT:
  window.APP.nav.switchView("dashboard");
};
```

---

### **cloud.js (195 lines)**
**Exports:**
- `window.syncToCloud()` - Backup to Google Drive
- `window.restoreFromCloud()` - Restore from Google Drive
- `window.gapiLoaded()`, `window.gsiLoaded()` - Google API init

**Dependencies:** Google APIs (CDN)
**Used by:** Standalone (manual trigger by user)

---

## AI Bridge System (V28+)

### Overview
The AI Bridge system provides seamless AI consultation integration with smart context generation and prompt management capabilities.

### Module: js/ai-bridge.js

**Purpose:** AI integration, prompt management, and context generation

**Exports:**
- `APP.aiBridge._builtInPrompts` - Immutable prompt library (12 templates)
- `APP.aiBridge._customPrompts` - User-created prompts (from LocalStorage)
- `APP.aiBridge.prompts` (getter) - Computed merge of built-in + custom
- `APP.aiBridge.library.*` - CRUD API for custom prompt management
- `APP.aiBridge.getPrompt()` - Smart placeholder replacement engine
- `APP.aiBridge.getPromptContext()` - Workout data context generator

**Dependencies:**
- `js/core.js` - LS_SAFE wrapper for storage operations
- `js/constants.js` - APP.version and APP.architecture metadata
- `js/validation.js` - fuzzyMatchExercise() for exercise name validation
- `exercises-library.js` - EXERCISE_TARGETS for exercise validation

**Used By:**
- `js/ui.js` - Prompt Manager UI (renderPromptManagerMode, showGeneratePromptModal)

**Load Order Position:** 11 of 13
```
Must load after: exercises-library.js, constants.js, core.js, validation.js, data.js
Must load before: debug.js, nav.js, cloud.js
```

---

### Architecture

#### Data Structure
```javascript
APP.aiBridge = {
  // Immutable built-in prompts (12 total)
  _builtInPrompts: {
    coach: { title, description, category, includeContext, template },
    deloadProtocol: { ... },
    // ... 10 more
  },

  // User-created prompts (loaded from LocalStorage)
  _customPrompts: {
    // Dynamic - populated from LS key "ai_custom_prompts"
  },

  // Computed getter - merges built-in + custom
  get prompts() {
    return { ...this._builtInPrompts, ...this._customPrompts };
  },

  // CRUD API
  library: {
    add: function(id, promptData) { },
    edit: function(id, updates) { },
    delete: function(id) { },
    export: function() { },
    import: function(jsonString) { },
    list: function() { },
    _loadFromStorage: function() { },
    _saveToStorage: function() { }
  },

  // Core functions
  getPrompt: function(scenario, userInputs) { },
  getPromptContext: function(scenario) { }
}
```

#### Prompt Schema
```javascript
{
  title: string,           // Display title
  description: string,     // Short description (1 sentence)
  category: "coaching" | "development" | "schema",
  includeContext: boolean, // Auto-inject workout data?
  template: string         // Multi-line prompt text with placeholders
}
```

#### Categories
- **Coaching (6):** Fitness programming, periodization, recovery
- **Development (4):** Code debugging, feature ideation, team handovers
- **Schema (2):** JSON import format specifications

---

### Placeholder System

{% raw %}
#### Auto-Replaced (System)
- `{{VERSION}}` → `APP.version.number` + `APP.version.name`
- `{{ARCHITECTURE}}` → `APP.architecture.pattern`
- `{{STACK}}` → `APP.architecture.stack.join(", ")`
- `{{FILES}}` → `APP.architecture.files.join(", ")`
- `{{CONTEXT}}` → Full workout context (if includeContext: true)

#### User-Provided (Dynamic)
- `{{USER_DESCRIPTION}}` - Generic input
- `{{TOPIC}}` - Conversation topic
- `{{PROPOSAL}}` - Design proposal
- `{{DECISIONS}}` - Key decisions
- `{{FEEDBACK}}` - Audit feedback
- `{{NEXT_STEP}}` - Next action
- And 4 more handover-specific placeholders
{% endraw %}

**Replacement Logic:**
{% raw %}
```javascript
getPrompt(scenario, userInputs = {}) {
  // 1. Get template
  // 2. Replace {{CONTEXT}} if includeContext: true
  // 3. Replace system placeholders (VERSION, ARCHITECTURE, etc.)
  // 4. Replace user-provided placeholders (USER_DESCRIPTION, etc.)
  // 5. Return { title, description, content }
}
```
{% endraw %}

---

### LocalStorage Integration

**Key:** `"ai_custom_prompts"`

**Format:**
{% raw %}
```javascript
{
  "myCustomPrompt": {
    title: "My Custom Prompt",
    description: "Description",
    category: "coaching",
    includeContext: false,
    template: "Template text with {{VERSION}}",
    isCustom: true,
    createdAt: "2026-01-01T12:00:00.000Z",
    updatedAt: "2026-01-01T12:30:00.000Z"
  }
}
```
{% endraw %}

**Protection Rules:**
1. Built-in IDs are reserved (cannot be overridden)
2. Custom prompts cannot use built-in IDs
3. Only custom prompts can be edited/deleted
4. Export includes version metadata for compatibility checking

---

### CRUD Operations

#### Add Custom Prompt
{% raw %}
```javascript
APP.aiBridge.library.add("myPrompt", {
  title: "My Custom Prompt",
  description: "Description",
  category: "coaching",
  includeContext: false,
  template: "Template {{VERSION}}"
});
// Returns: true/false (success)
// Side effect: Saves to LocalStorage
```
{% endraw %}

#### Edit Custom Prompt
```javascript
APP.aiBridge.library.edit("myPrompt", {
  title: "Updated Title"
});
// Only works for custom prompts
// Returns: true/false
```

#### Delete Custom Prompt
```javascript
APP.aiBridge.library.delete("myPrompt");
// Only works for custom prompts
// Returns: true/false
```

#### Export Custom Prompts
```javascript
const json = APP.aiBridge.library.export();
// Returns: JSON string with metadata
// Format: { version, exportedAt, customPrompts }
```

#### Import Custom Prompts
```javascript
const result = APP.aiBridge.library.import(jsonString);
// Returns: { success, imported, skipped, errors }
// Skips IDs that conflict with built-in prompts
```

#### List Prompts
```javascript
const { builtIn, custom } = APP.aiBridge.library.list();
// Returns: { builtIn: ["coach", ...], custom: ["myPrompt", ...] }
```

---

### Context Generation

**Function:** `getPromptContext(scenario)`

**Output Format:**
```
**App Version:**
- Version: 28.0
- Architecture: IIFE Modular
- Modules: 13

**User Profile:**
- Height: [X] cm
- Weight: [X] kg
- TDEE: [X] kcal

**5 Latihan Terakhir:**

1. [Date] - [Session Title]
   - [Exercise]: [Sets]×[Reps] @ [Weight]kg (RPE [X])
   - Total Volume: [X] kg

[... 4 more workouts]

**Program Structure:**
- Total Sessions: X
- Session IDs: s1, s2, s3, ...
```

**Data Sources:**
- `LS_SAFE.getJSON("profile")` - User profile
- `LS_SAFE.getJSON("gym_hist")` - Workout history
- `LS_SAFE.getJSON("cscs_program_v10")` - Current program

---

### UI Integration

#### Prompt Manager Mode
**File:** `js/ui.js` → `renderPromptManagerMode()`

**Features:**
- Categorized display (Coaching/Development/Schema)
- Color-coded cards (gray=built-in, purple=custom)
- Preview, Add, Edit, Delete, Export, Import buttons
- Responsive grid (2-col desktop, 1-col mobile)

#### Generate Prompt Modal
**File:** `js/ui.js` → `showGeneratePromptModal()`

**Features:**
- Smart placeholder detection
- Dynamic form generation
- Validation warnings
- Copy functionality

**Flow:**
{% raw %}
```
User clicks "Generate Prompt"
  ↓
Detect used placeholders in template
  ↓
Generate input fields for user-provided placeholders
  ↓
User fills inputs and clicks "Generate"
  ↓
Call APP.aiBridge.getPrompt(scenario, userInputs)
  ↓
Validate output (check for unreplaced {{...}})
  ↓
Display generated prompt with copy button
```
{% endraw %}

---

### Error Handling

**Defensive Checks:**
```javascript
// Module availability
if (!window.APP?.aiBridge?.getPrompt) {
  showToast("AI Bridge not available", "error");
  return;
}

// Invalid scenario
if (!this.prompts[scenario]) {
  console.error(`[AI-BRIDGE] Unknown scenario: ${scenario}`);
  return null;
}

// Built-in protection
if (this._builtInPrompts[id]) {
  console.error(`Cannot override built-in prompt: ${id}`);
  return false;
}
```

**Validation:**
{% raw %}
```javascript
// Incomplete replacement warning
if (generated.content.includes('{{')) {
  showToast("⚠️ Some placeholders not replaced", "warning");
}
```
{% endraw %}

---

### Performance Considerations

**Optimization Strategies:**
1. **Lazy Loading:** Custom prompts loaded once on module init
2. **Computed Getter:** Prompts merged on-access (no duplication)
3. **Efficient Regex:** Placeholder detection uses compiled regex
4. **Minimal DOM:** Generate modal creates elements only when opened

**Memory Management:**
- No global event listeners (cleaned up on modal close)
- Templates stored as strings (no DOM parsing until render)
- LocalStorage quota checked via LS_SAFE wrapper

---

### Testing

**Unit Tests (Console):**
{% raw %}
```javascript
// Test 1: Version placeholder
const p = APP.aiBridge.getPrompt("codePartner");
console.assert(!p.content.includes("{{VERSION}}"));

// Test 2: Custom prompt CRUD
APP.aiBridge.library.add("test", {...});
APP.aiBridge.library.edit("test", {...});
APP.aiBridge.library.delete("test");

// Test 3: Export/Import
const json = APP.aiBridge.library.export();
APP.aiBridge.library.import(json);
```
{% endraw %}

**Integration Tests (UI):**
1. Preview prompt → Generate → Verify placeholders replaced
2. Add custom prompt → Refresh page → Verify persistence
3. Export → Import → Verify prompts restored

---

### Future Enhancements

**V28.1+ Roadmap:**
- Prompt versioning (track template changes over time)
- Collaborative prompt sharing (community marketplace)
- Multi-language support (English, Indonesian, Spanish)
- AI model selection (ChatGPT, Claude, Gemini)
- Prompt analytics (usage tracking, effectiveness metrics)

---

### Troubleshooting

**Issue:** Placeholders not replaced
{% raw %}
**Solution:** Check that prompt includes `{{PLACEHOLDER}}` exactly (case-sensitive)
{% endraw %}

**Issue:** Custom prompt not saving
**Solution:** Verify ID doesn't conflict with built-in prompts, check localStorage quota

**Issue:** Import fails
**Solution:** Validate JSON format, ensure exported from same or compatible version

**Issue:** Context generation empty
**Solution:** Verify LocalStorage keys exist (profile, gym_hist, cscs_program_v10)

---

### API Reference

**Full API Documentation:** See [AI_COMMAND_CENTER_GUIDE.md](./AI_COMMAND_CENTER_GUIDE.md) *(to be created)*

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
| `ai_custom_prompts` | Object | Custom AI prompts (V28+) | `{promptId: {title, category, template, ...}}` |
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

### **3. Module Loading**
- Scripts load sequentially (browser default)
- No async/defer (maintain load order)
- Total load time: <2s on 3G

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
- Data from V1 should work in V27

### **Migration Functions**
```javascript
// V26.6 Example
APP.data.normalizeExerciseNames()
// Runs at APP.init() automatically
// Non-destructive (backup first)
```

---

## 🎯 V27 ARCHITECTURAL GOTCHAS

### **GOTCHA #1: Arrow Functions Capture Closure Scope**
```javascript
// ❌ WRONG - Captures local APP in closure
const APP = {local: true};
APP.core = {
  method: () => APP.nav.switchView()  // undefined! (local APP has no nav)
};

// ✅ CORRECT - Access global APP
APP.core = {
  method: () => window.APP.nav.switchView()  // ✅ Global APP
};
```

**Why this happens:**
- Each module creates local `const APP = {...}`
- Arrow functions capture this LOCAL reference
- When merged to `window.APP`, the local reference persists in closure
- Solution: ALWAYS use `window.APP` for cross-module access

---

### **GOTCHA #2: Module Load Order is Critical**
```javascript
// ❌ WRONG ORDER
<script src="js/nav.js"></script>     // nav.js needs debug.js!
<script src="js/debug.js"></script>   // Loaded too late

// ✅ CORRECT ORDER
<script src="js/debug.js"></script>   // Load first
<script src="js/nav.js"></script>     // Can use APP.debug
```

**Dependencies:**
- nav.js → requires ALL modules (load last)
- ui.js → requires validation, data, session, stats
- debug.js → required by nav.js (load before nav)

---

### **GOTCHA #3: Object.assign vs Direct Assignment**
```javascript
// ❌ WRONG - Destroys existing namespaces
window.APP = APP;  // Overwrites existing APP.ui, APP.data, etc.

// ✅ CORRECT - Merges namespaces
if (window.APP) {
  Object.assign(window.APP, APP);  // Add to existing
} else {
  window.APP = APP;
}
```

---

### **GOTCHA #4: Script Position in HTML**
```javascript
// ❌ WRONG - Scripts in <head> load before inline scripts in <body>
<head>
  <script src="js/core.js"></script>
</head>
<body>
  <script>
    APP.init();  // Fails! core.js loaded, but inline APP not yet defined
  </script>
</body>

// ✅ CORRECT - All scripts at end of <body>
<body>
  <!-- HTML content -->
  <script>
    // Inline scripts extend APP
  </script>
  <script src="js/core.js"></script>  // Merges with inline APP
  <script>
    APP.init();  // Success!
  </script>
</body>
```

---

## 🎯 DESIGN DECISIONS RATIONALE

### **Why Vanilla JS?**
- ✅ No build complexity
- ✅ Easy debugging (source maps = actual code)
- ✅ Fast load times
- ✅ Deployable anywhere (drag & drop HTML)
- ❌ No framework goodies (but not needed for this scope)

### **Why LocalStorage instead of IndexedDB?**
- ✅ Simpler API (synchronous)
- ✅ Sufficient for data size (<5MB typical)
- ✅ No async complexity
- ❌ Lower storage limit (but adequate for use case)

### **Why Modular Pattern (V27) instead of Classes?**
- ✅ No transpilation needed
- ✅ Better console debugging (single global object)
- ✅ Simpler mental model
- ✅ No build step (just script tags)
- ❌ Manual dependency management (load order critical)

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

### **Module Files**
- kebab-case: `data.js`, `session.js`, `nav.js`
- Namespace match: `data.js` exports `APP.data`

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

### **Adding New Module**
Location: `js/new-module.js`
```javascript
(function() {
  'use strict';
  
  if (!window.APP) window.APP = {};
  
  APP.newModule = {
    method: function() {
      // Use window.APP for cross-module access!
      window.APP.otherModule.method();
    }
  };
  
  console.log("[NEW-MODULE] ✅ Module loaded");
})();
```

Then add to `index.html`:
```html
<script src="js/new-module.js"></script>
```

### **Adding New Analytics Chart**
Location: `js/stats.js` → `APP.stats`
```javascript
APP.stats.renderNewChart = (data) => {
  // Chart.js implementation
};
```

---

## 🎓 LEARNING RESOURCES

**For understanding the codebase:**
1. Read `HANDOVER_V27.md` → Complete V27 story
2. Read this file → Architecture decisions
3. Read `CODING_GUIDELINES.md` → Code patterns
4. Read module files in order:
   - `js/core.js` → Foundation
   - `js/validation.js` → Data validation
   - `js/data.js` → Business logic
   - `js/ui.js` → Rendering patterns
   - `js/nav.js` → Initialization flow

**Critical concepts to understand:**
- IIFE module pattern
- Closure scoping (window.APP vs local APP)
- Object.assign merge pattern
- Module load order dependencies
- LS_SAFE wrapper pattern

---

**END OF ARCHITECTURE.md**
