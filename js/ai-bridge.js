/**
 * The Grind Design - AI Bridge Module
 * V28 Implementation - Phase 1: Logic Layer
 *
 * Handles AI prompt generation, JSON parsing, and schema validation
 * for AI-assisted program updates and coaching.
 *
 * Dependencies: core.js, validation.js, exercises-library.js
 * Load Position: After ui.js, before debug.js
 */

(function() {
  'use strict';

  // Namespace guard
  if (!window.APP) window.APP = {};

  /**
   * AI Bridge Module
   * Pure logic layer for AI Command Center integration
   */
  APP.aiBridge = {

    /**
     * Built-In Prompt Library (Immutable)
     * Contains core prompt templates - cannot be edited or deleted by users
     */
    _builtInPrompts: {
      deloadProtocol: {
  title: "😴 Protokol Deload Week",
  description: "Generate program deload 1 minggu untuk recovery dan regenerasi",
  category: "coaching",
  includeContext: true,
  template: `[PROTOKOL DELOAD WEEK GENERATOR]

**Peran Anda:** Recovery & Fatigue Management Specialist

**Konteks Latihan Saya:**
{{CONTEXT}}

**Tugas:**
Buat program deload 1 minggu berdasarkan data di atas.

**Prinsip Deload:**
1. **Volume Reduction:** Kurangi total sets 40-50% dari normal
2. **Intensity Maintenance:** Pertahankan beban 70-80% (weight tetap, volume turun)
3. **Movement Quality Focus:** Prioritas teknik dan mobility work
4. **Fatigue Elimination:** Hilangkan exercise high-fatigue:
   - Heavy deadlift variants
   - Barbell overhead pressing >80% 1RM
   - High-volume leg compounds

**Program Structure:**
- Frequency: 3-4 sesi per minggu (turun dari 5-6)
- Sets per exercise: 2-3 sets (turun dari 4-5)
- Rep range: 6-8 reps (lebih rendah dari normal 8-12)
- Rest periods: 2-3 menit (lebih panjang untuk full recovery)
- Exercise selection: Ganti compound berat dengan machine/DB variants

**Contoh Swap:**
- [Barbell] Bench Press 5×8 → [Machine] Chest Press 3×6
- [Barbell] Squat 4×10 → [Machine] Leg Press 2×8
- [Barbell] Deadlift 5×5 → Hyperextension 3×12

**Output Format:**
Berikan JSON dengan schema "program_import" yang berisi:
- 3-4 sesi deload (reduced frequency)
- Setiap exercise: 2-3 sets maksimal
- Min 3 exercise alternates per movement
- Include bio notes tentang benefit deload
- Clinical notes tentang recovery markers

**PENTING:**
- Jangan tambahkan exercise baru - fokus pada exercise existing dengan volume rendah
- Deload bukan "rest week" - tetap latihan tapi dengan stimulus minimal
- Durasi ideal: 5-7 hari sebelum kembali ke program normal

Silakan generate deload program.`
},
      muscleImbalance: {
  title: "⚖️ Analisis Volume Imbalance",
  description: "Deteksi ketimpangan distribusi volume antar muscle group",
  category: "coaching",
  includeContext: true,
  template: `[MUSCLE VOLUME IMBALANCE ANALYSIS]

**Peran Anda:** Biomechanics Analyst & Program Design Specialist

**Data Volume Saya:**
{{CONTEXT}}

**Tugas Analisis:**

**1. Hitung Total Volume per Muscle Group** (dari log 4 minggu terakhir):
Breakdown per kategori:
- **Chest:** Total sets, total volume (kg)
- **Back:** Total sets, total volume (kg)
- **Shoulders:** Total sets, total volume (kg)
- **Arms:** Total sets, total volume (kg)
- **Legs:** Total sets, total volume (kg)
- **Core:** Total sets, total volume (kg)

**2. Identifikasi Imbalance Patterns:**

**A. Push:Pull Ratio**
- Optimal: 1:1 hingga 1:1.2 (pull sedikit lebih tinggi)
- Warning: Push > 1.3× Pull (berisiko shoulder impingement)
- Critical: Pull < 70% Push (imbalance severe)

**B. Upper:Lower Ratio**
- Physique focus: 1.5:1 - 2:1 (upper lebih tinggi, acceptable)
- Balanced development: 1:1 - 1.2:1
- Athletic focus: 0.8:1 - 1:1 (lower dominance, acceptable)

**C. Volume Landmarks (sets per week):**
- Underworked: <10 sets/week per muscle group
- Optimal (MEV-MAV): 12-20 sets/week
- Overworked (>MRV): >25 sets/week

**3. Root Cause Analysis:**
- **Intentional Specialization:** Apakah imbalance disengaja? (e.g., "chest focus block")
- **Exercise Skip Pattern:** Apakah ada exercise yang konsisten di-skip?
- **Movement Bias:** Apakah ada preferensi ke certain movements? (e.g., horizontal press > vertical press)
- **Recovery Limitation:** Apakah muscle tertentu slow recovery (selalu sore)?

**4. Rekomendasi Koreksi:**

**Untuk Muscle yang Underworked:**
- Tambahkan 1-2 exercise dedicated untuk muscle tersebut
- Target: Tambah 6-8 sets per minggu (bertahap dalam 2-3 minggu)
- Contoh: Back underworked → Tambah Lat Pulldown 3×12 + Cable Row 3×12

**Untuk Muscle yang Overworked:**
- Reduce sets per session (4 sets → 3 sets)
- Atau reduce frequency (2× per week → 1× per week)
- Target: Turunkan ke MAV range (15-20 sets)

**Timeline untuk Balance Restoration:**
- Minor imbalance (10-20% difference): 2-3 minggu
- Moderate imbalance (20-40% difference): 4-6 minggu
- Severe imbalance (>40% difference): 8-12 minggu

**Output:**
1. Tabel volume distribution dengan persentase
2. List of imbalances dengan severity level (minor/moderate/severe)
3. Actionable recommendations (TIDAK PERLU JSON - cukup text guidance)
4. Suggested exercise additions/reductions
5. Estimated timeline untuk mencapai balance

Silakan mulai analisis.`
},
      injuryPrevention: {
  title: "🩺 Injury Prevention Audit",
  description: "Deteksi red flags dan pola latihan berisiko cedera",
  category: "coaching",
  includeContext: true,
  template: `[INJURY PREVENTION & MOVEMENT HEALTH AUDIT]

**Peran Anda:** Sports Medicine Consultant & Movement Specialist

**Data Latihan Saya:**
{{CONTEXT}}

**RED FLAGS YANG HARUS DICEK:**

**1. Volume Spike Detection (Overtraining Risk)**
- ⚠️ Warning: Peningkatan volume >10% week-to-week
- 🚨 Critical: Peningkatan volume >20% dalam 1 minggu
- 🚨 Critical: Exercise baru dengan volume tinggi langsung (>15 sets/week)

**Formula Volume:**
\`\`\`
Week-to-Week Change = ((Current Week - Previous Week) / Previous Week) × 100%
\`\`\`

**2. High-Risk Movement Patterns:**

**A. Shoulder Risk:**
- Heavy barbell overhead work >85% 1RM tanpa warmup progresif
- Behind-the-neck press (high impingement risk)
- Upright rows dengan grip sempit
- Excessive internal rotation under load

**B. Lower Back Risk:**
- Deadlift/squat >85% 1RM dengan frequency >2×/week
- Loaded spinal flexion (e.g., rounded back deadlift)
- Good mornings dengan beban excessive
- Leg press dengan butt lift-off

**C. Knee Risk:**
- Deep squat dengan knee valgus (knees caving in)
- Leg extension dengan lockout explosive
- Jumping/plyometric tanpa adequate preparation

**3. Recovery Indicators (Fatigue Accumulation):**

**RPE Trend Analysis:**
- ✅ Optimal: RPE konsisten atau turun slight week-to-week
- ⚠️ Warning: RPE naik 1-2 poin untuk same weight/reps
- 🚨 Critical: RPE naik >2 poin (sign of systemic fatigue)

**Exercise Skip Pattern:**
- Apakah ada exercise yang sering di-skip? (mungkin nyeri/discomfort)
- Apakah skip pattern konsisten per muscle group? (e.g., selalu skip leg day)

**Rest Day Adequacy:**
- Minimum: 1-2 full rest days per week
- Warning: <1 rest day per week (overtraining risk)
- Critical: 7+ consecutive training days

**4. Exercise Selection Risk Assessment:**

**Blacklist Movements (High Injury Risk):**
- Behind-the-neck press/pulldown
- Upright rows (shoulder impingement)
- Smith machine squats dengan foot placement forward (knee shear)
- Leg press dengan extreme ROM (butt tuck)

**Caution Movements (Require Perfect Technique):**
- Heavy barbell squats (>80% 1RM)
- Conventional deadlift (>85% 1RM)
- Overhead press dengan excessive arch

**5. Unilateral Imbalance Detection:**
- Apakah ada asymmetry left vs right? (e.g., DB press 30kg left, 35kg right)
- Warning: >10% difference antar sisi
- Critical: >20% difference (injury risk + compensation pattern)

**OUTPUT:**

**1. Risk Summary:**
\`\`\`
Overall Risk Level: Low / Medium / High
Critical Issues: [count]
Warning Issues: [count]
\`\`\`

**2. Detailed Findings:**
List semua potensi injury risks dengan:
- Severity: Low / Medium / High
- Specific issue (e.g., "Volume spike: Chest +25% this week")
- Affected muscle/joint

**3. Specific Recommendations:**
- Exercise swaps (high-risk → safer alternatives)
- Volume adjustments (reduce sets/frequency)
- Technique cues (form corrections)
- Recovery protocol (deload timing, rest day placement)

**4. Immediate Action Items:**
Prioritized list (top 3 most urgent fixes)

**TIDAK PERLU JSON** - Cukup text guidance yang actionable.

Silakan audit program saya dan identifikasi semua red flags.`
},
peaking: {
  title: "🎯 Peaking Phase Generator",
  description: "Program 3-4 minggu untuk persiapan strength testing / 1RM attempt",
  category: "coaching",
  includeContext: true,
  template: `[PEAKING PHASE PROTOCOL - STRENGTH TESTING PREP]

**Peran Anda:** Strength & Conditioning Specialist (Powerlifting Focus)

**Base Program Saya:**
{{CONTEXT}}

**Tujuan:**
Generate program peaking 3-4 minggu untuk persiapan strength testing atau 1RM attempt.

**Target Lifts untuk Peak:**
- [Barbell] Bench Press
- [Barbell] Squat
- [Barbell] Deadlift
(Plus optional: Overhead Press, Olympic lifts)

**PEAKING PRINCIPLES:**

**Week 1-2: Intensification Phase**
- Volume: Maintain baseline (100% normal sets)
- Intensity: Increase to 85-90% 1RM
- Rep range: 3-5 reps per set
- Frequency: 3-4× per week (maintain)
- Rest: 3-5 minutes between sets (full recovery)

**Week 3: Taper Phase**
- Volume: Reduce 30-40% (turunkan sets, bukan intensity)
- Intensity: Maintain or increase to 90-95% 1RM
- Rep range: 1-3 reps (heavy singles/doubles)
- Frequency: 2-3× per week
- Rest: 5+ minutes (prioritas CNS recovery)

**Week 4: Testing Week**
- Volume: Reduce 60-70% (deload drastic)
- Intensity: Light technical work 60-70% 1RM + Testing Day
- Testing protocol: Warmup progresif → 1RM attempt
- Frequency: 1-2 light sessions + 1 test day

**PROGRAM STRUCTURE:**

**Session Types:**
- **Main Lift Focus:** Primary compound (squat/bench/dead) dengan progression scheme
- **Accessory Work:** Minimal - hanya yang directly support main lifts
- **Drop:** Semua isolation work, pump work, conditioning

**Example Weekly Split:**
- Day 1: Squat Focus (heavy)
- Day 2: Bench Focus (heavy)
- Day 3: Deadlift Focus (heavy)
- Day 4: Optional light technique day

**Accessory Selection (Minimal):**
- Squat support: Pause squats, front squats
- Bench support: Close-grip bench, spoto press
- Deadlift support: Deficit pulls, Romanian deadlift
- Max 2-3 accessories per session, 2-3 sets each

**Progression Scheme (Week 1-2):**
\`\`\`
Week 1: 85% × 5 sets × 3 reps
Week 2: 90% × 4 sets × 2 reps
Week 3: 95% × 3 sets × 1 rep
Week 4: 60-70% technical work + Test
\`\`\`

**OUTPUT FORMAT:**

Berikan JSON schema "program_import" dengan:
- 4 weekly phases (clearly labeled: Week 1 Intensification, Week 2 Intensification, Week 3 Taper, Week 4 Test)
- Focus on 3 main lifts (squat, bench, deadlift)
- Minimal accessories (2-3 per session max)
- Clear intensity progression (%1RM noted in bio/notes)
- Rest periods specified (3-5 minutes for main lifts)
- Each main lift: Min 2 variants (competition style + variation)

**Metadata yang Diperlukan:**
- Mesocycle: "Peaking Phase - Week [1-4]"
- Focus: "Strength Maximization - [Lift] Focus"
- Progression model: "Linear Peaking - Intensity Up, Volume Down"

**CATATAN PENTING:**
- Deload drastic di Week 4 adalah WAJIB (jangan overtrain menjelang test)
- Prioritas: CNS freshness > muscle fatigue
- Nutrition & sleep quality critical during peaking
- Jika merasa overtrained, skip Week 2 dan langsung taper

Silakan generate 4-week peaking program.`
},

hypertrophy: {
  title: "💪 Hypertrophy Block Generator",
  description: "Program 8-12 minggu fokus muscle growth dengan RP principles",
  category: "coaching",
  includeContext: true,
  template: `[HYPERTROPHY BLOCK PROTOCOL - RENAISSANCE PERIODIZATION]

**Peran Anda:** Hypertrophy Coach (Dr. Mike Israetel Methodology)

**Current Program:**
{{CONTEXT}}

**Goal:** Generate 8-12 week hypertrophy-focused mesocycle

**HYPERTROPHY PRINCIPLES (Renaissance Periodization):**

**Volume Landmarks per Muscle per Week:**
- **MV (Maintenance Volume):** ~10 sets/week
  - Cukup untuk maintain muscle mass, tidak tumbuh
- **MEV (Minimum Effective Volume):** ~12-15 sets/week
  - Starting point untuk muscle growth
- **MAV (Maximum Adaptive Volume):** ~15-20 sets/week
  - Sweet spot untuk optimal growth + recovery
- **MRV (Maximum Recoverable Volume):** ~20-25 sets/week
  - Upper limit sebelum overtraining, not sustainable

**Rep Ranges untuk Hypertrophy:**
- Optimal: 10-15 reps per set
- Acceptable: 8-20 reps
- Avoid: <6 reps (strength bias) atau >25 reps (endurance bias)

**Intensity (Load):**
- Target: 60-80% 1RM
- Focus: Muscle tension, NOT load maximization
- Failure proximity: 1-3 RIR (Reps In Reserve), occasional 0 RIR

**Frequency:**
- Optimal: 2-3× per muscle group per week
- Example: Chest trained Monday (Push) + Thursday (Push) = 2× per week

**Rest Periods:**
- Compounds: 90-120 seconds (balance fatigue + performance)
- Isolations: 60-90 seconds (metabolic stress accumulation)

**PROGRESSION STRATEGY (Mesocycle Waves):**

**Week 1-3: Accumulation (MEV)**
- Start: 12-15 sets per muscle per week
- Add: +1-2 sets per week
- Intensity: 60-70% 1RM, RIR 2-3
- Goal: Build work capacity

**Week 4-6: Intensification (MAV)**
- Volume: 15-20 sets per muscle per week
- Intensity: 70-75% 1RM, RIR 1-2
- Goal: Push towards adaptive ceiling

**Week 7-8: Overreaching (MRV)**
- Volume: 20-25 sets per muscle per week
- Intensity: 75-80% 1RM, RIR 0-1 (occasional failure)
- Goal: Maximize stimulus sebelum deload

**Week 9: Deload**
- Volume: Reduce to MV (~10 sets)
- Intensity: 60% 1RM, RIR 3-4
- Goal: Dissipate fatigue, resensitize to volume

**Repeat:** Start Week 10 at MEV lagi (mesocycle 2)

**PROGRAM STRUCTURE:**

**Split Options:**
- Push/Pull/Legs (3-6× per week)
- Upper/Lower (4× per week)
- Full Body (3× per week)

**Exercise Selection per Muscle:**
- Primary compound: 1-2 exercises (e.g., Barbell Bench Press)
- Secondary compounds: 1-2 exercises (e.g., Incline DB Press)
- Isolation: 1-2 exercises (e.g., Cable Fly)

**Exercise Variation:**
- Provide 3-4 variants per exercise slot
- Mix: Barbell, Dumbbell, Machine, Cable
- Different angles: Flat, Incline, Decline

**OUTPUT FORMAT:**

Berikan JSON "program_import" dengan:
- 5-6 sessions per week (Push/Pull/Legs atau Upper/Lower split)
- Volume built-in progression (start MEV, progress to MRV)
- Mix of compounds (60%) & isolations (40%)
- Each exercise: 3-4 variants dengan bio notes
- Rep ranges: 10-15 reps default (some 8-12, some 12-20 untuk variety)
- Rest periods specified per exercise type

**Metadata:**
- Mesocycle: "Hypertrophy Block - Week [1-9]"
- Focus: "Muscle Growth - [Upper/Lower/Full] Emphasis"
- Progression model: "Volume Progression - MEV to MRV"

**Bio Notes harus include:**
- Muscle activation cues (e.g., "Squeeze pecs at top")
- ROM emphasis (e.g., "Full stretch at bottom")
- Tempo recommendation (e.g., "2-1-2 eccentric-pause-concentric")

**Clinical Notes harus include:**
- Injury prevention cues
- Common form mistakes
- When to use straps/belt/spotter

**PENTING:**
- Hypertrophy ≠ strength - jangan chase heavy weight, chase pump
- Volume progression harus gradual (jangan spike >10% per week)
- Deload setiap 8-9 minggu adalah WAJIB (growth happens during recovery)
- Nutrition surplus diperlukan (TDEE + 200-300 kkal)

Silakan generate hypertrophy program dengan progression wave yang jelas.`
},

brainstorm: {
  title: "💡 Feature Brainstorm (Team Session)",
  description: "Ideate features dengan team context - untuk PM/Architect/Auditor discussion",
  category: "development",
  includeContext: false,
  template: `[FEATURE BRAINSTORM SESSION - TEAM COLLABORATION]

**Session Context**

This is a collaborative brainstorm between:
- **sand01chi** (Lead PM) - Defines problem, validates solutions
- **Claude.ai** (Architect) - Technical feasibility, design approach
- **Gemini** (Auditor) - Risk assessment, alternative perspectives

---

**App Context:**
- **Name:** THE GRIND DESIGN
- **Version:** {{VERSION}}
- **Architecture:** {{ARCHITECTURE}}
- **Tech Stack:** {{STACK}}
- **Purpose:** Clinical gym training management PWA
- **Users:** Evidence-based lifters, trainers, coaches

---

**DESIGN CONSTRAINTS (NON-NEGOTIABLE):**

✅ **Must Have:**
- Vanilla JavaScript only (no frameworks)
- Offline-first (LocalStorage primary)
- No backend server required
- Mobile-first responsive
- V27+ modular patterns
- Backward compatibility

❌ **Cannot Have:**
- Framework dependencies (React/Vue/Angular)
- Server-side processing
- Database requirements
- Real-time sync features
- Native-only mobile features

---

**CURRENT FEATURES:**
- Workout logging (sets/reps/weight/RPE)
- Program management (routine templates)
- Spontaneous workouts (off-rotation sessions)
- Analytics (volume charts, progression, 1RM calculator)
- AI Command Center (prompt library, recipe import/export)
- Exercise library (100+ exercises with biomechanics)
- Cloud backup (Google Drive)
- Smart Merge Engine (AI program integration)

---

**FEATURE IDEA:**
{{USER_DESCRIPTION}}

---

**BRAINSTORM FRAMEWORK:**

**For Claude.ai (Architect):**
Provide technical feasibility analysis:
- Can it be built with current stack? (Yes/No + reasoning)
- Which modules affected? (js/data.js, js/ui.js, etc.)
- Data schema implications? (new LS keys needed?)
- UI/UX approach? (modal, dashboard widget, new view?)
- Complexity estimate? (1-5 scale)
- Implementation time? (hours/days/weeks)

**For Gemini (Auditor):**
Provide risk and quality perspective:
- What could go wrong? (performance, UX, data)
- Alternative approaches? (simpler/safer variants)
- User value vs complexity tradeoff?
- Maintenance burden concerns?
- Edge cases to consider?

**For sand01chi (PM):**
Decide based on team input:
- Does benefit justify complexity?
- Priority vs other features?
- Timeline realistic?
- GO / NO-GO / MODIFY decision

---

**COLLABORATIVE OUTPUT:**

**Phase 1: Claude.ai (Technical Feasibility)**
\`\`\`
FEASIBILITY: ✅ GO / ⚠️ RISKY / ❌ NO-GO

Technical Analysis:
- Vanilla JS compatible: [Yes/No + notes]
- Offline-first compatible: [Yes/No + notes]
- PWA limitations: [Any blockers?]

Architecture:
- Affected modules: [list]
- New modules needed: [if any]
- Dependencies: [libraries]

Data Schema:
[Proposed LS structure]

UI/UX Flow:
[User interaction steps]

Complexity: [1-5] - [reasoning]
Estimated Effort: [X hours/days]
\`\`\`

**Phase 2: Gemini (Risk Assessment)**
\`\`\`
AUDIT PERSPECTIVE:

Risks Identified:
1. [Risk #1 + severity]
2. [Risk #2 + severity]

Alternative Approaches:
- Option A: [simpler variant]
- Option B: [different angle]

Value vs Complexity:
- User benefit: [High/Medium/Low]
- Implementation cost: [High/Medium/Low]
- Maintenance burden: [High/Medium/Low]

Recommendation: [Proceed / Modify / Skip + reasoning]
\`\`\`

**Phase 3: sand01chi (Decision)**
Based on technical + audit input → Make call

---

Let's brainstorm this feature together!`
},
      
      handoverClaude: {
  title: "🔄 Handover to Claude.ai (Architect)",
  description: "Onboard fresh Claude.ai instance untuk design architect role",
  category: "development",
  includeContext: true,
  template: `[HANDOVER PROTOCOL - CLAUDE.AI DESIGN ARCHITECT]

**Team Context Transfer**

You are **Claude.ai**, the **Design Architect** for THE GRIND DESIGN project.

---

**TEAM STRUCTURE:**

Your role in 4-person development team:
- **sand01chi** - Lead Project Manager (your client, decides scope)
- **Gemini** - Design Auditor (reviews your designs, validates decisions)
- **You (Claude.ai)** - Design Architect (create specs, instruct coder)
- **Claude Code** - Lead Coder (implements your instructions via VS Code)

**Your Responsibilities as Architect:**
✅ Create architectural designs and technical specifications
✅ Write implementation prompts for Claude Code (Lead Coder)
✅ Design data schemas, module structures, UI/UX flows
✅ Respond to Gemini's audit feedback (iterate on designs)
✅ Ensure V27+ compliance and best practices

**You DO NOT:**
❌ Write implementation code directly (delegate to Claude Code)
❌ Make final project scope decisions (that's sand01chi's call)
❌ Bypass audit process (Gemini must review your designs)

---

**PROJECT SNAPSHOT:**

**App:** THE GRIND DESIGN
- Version: {{VERSION}}
- Architecture: {{ARCHITECTURE}}
- Tech Stack: {{STACK}}
- Purpose: Clinical gym training management PWA

**User Context:**
{{USER_DESCRIPTION}}

---

**PREVIOUS CONVERSATION:**

**Feature Request:**
{{FEATURE_REQUEST}}

**Design Progress So Far:**
{{DESIGN_PROGRESS}}

**Gemini's Latest Feedback:**
{{AUDIT_FEEDBACK}}

**Next Deliverable:**
{{NEXT_DELIVERABLE}}

*(sand01chi will fill placeholders above)*

---

**YOUR DESIGN WORKFLOW:**

**Step 1: Understand Requirements**
- Review feature request from sand01chi
- Ask clarifying questions if needed
- Confirm scope and constraints

**Step 2: Create Architectural Design**
- Design data schema (LS keys, structure)
- Plan module changes (which files affected)
- Design UI/UX flow (user interaction)
- Estimate complexity and risks

**Step 3: Submit for Audit**
- Present design document to sand01chi & Gemini
- Format: Clear specifications with examples
- Include: Architecture, data schema, UI mockup, risks

**Step 4: Respond to Audit**
- Gemini reviews and provides feedback
- You iterate based on concerns
- Re-submit until approved

**Step 5: Instruct Claude Code**
- Once approved, create implementation prompt
- Format: @files, clear tasks, V27 patterns, testing checklist
- Claude Code executes in VS Code

**Step 6: Review Implementation**
- Claude Code reports completion
- You verify against original design
- Sign off or request adjustments

---

**DESIGN DOCUMENT TEMPLATE:**

\`\`\`markdown
# [FEATURE NAME] - ARCHITECTURAL DESIGN

## Requirements
[What sand01chi requested]

## Solution Overview
[High-level approach]

## Data Schema
[LS keys, structure, migration if needed]

## Module Changes
- js/module1.js: [changes]
- js/module2.js: [changes]

## UI/UX Flow
[Step-by-step user interaction]

## Complexity Estimate
[1-5 scale with reasoning]

## Risk Assessment
[Performance, compatibility, UX concerns]

## Testing Strategy
[How to verify implementation]
\`\`\`

---

**CRITICAL PATTERNS (Always Follow):**

**V27+ Architecture:**
\`\`\`javascript
// ALWAYS use window.APP for cross-module
✅ window.APP.module.method()
❌ APP.module.method()  // Closure bug

// ALWAYS merge namespace
✅ Object.assign(window.APP, APP)
❌ window.APP = APP  // Overwrites existing

// ALWAYS use LS_SAFE wrapper
✅ window.APP.core.LS_SAFE.setJSON(key, data)
❌ localStorage.setItem(key, JSON.stringify(data))
\`\`\`

**Design Constraints:**
- ✅ Vanilla JavaScript only (no frameworks)
- ✅ No backend (pure PWA)
- ✅ Offline-first (LocalStorage primary)
- ✅ Mobile-first responsive
- ✅ Backward compatible

---

**AVAILABLE DOCUMENTATION:**

- **ARCHITECTURE.md** - System design, module map
- **CODING_GUIDELINES.md** - V27+ patterns, templates
- **HANDOVER_V27.md** - Complete V27 refactoring story
- **KNOWN_ISSUES.md** - Active bugs, workarounds

Reference with: @ARCHITECTURE.md, etc.

---

**COLLABORATION PATTERN:**

\`\`\`
sand01chi: "Feature request: [description]"
    ↓
You (Claude.ai): Create architectural design
    ↓
Gemini: Audit design, provide feedback
    ↓
You: Iterate based on feedback
    ↓
sand01chi: Final approval
    ↓
You: Create implementation prompt for Claude Code
    ↓
Claude Code: Execute implementation (via VS Code)
    ↓
You: Review completion, sign off
\`\`\`

---

**READY TO ARCHITECT?**

Confirm you understand:
1. ✅ Your role: Design Architect (design specs, instruct coder)
2. ✅ Team workflow: PM → You → Auditor → Coder
3. ✅ Current feature: {{FEATURE_REQUEST}}
4. ✅ Next deliverable: {{NEXT_DELIVERABLE}}
5. ✅ Constraints: V27+ patterns, no frameworks, offline-first

Let's design the solution!`
},

handoverGemini: {
  title: "🔄 Handover to Gemini (Auditor)",
  description: "Onboard fresh Gemini instance untuk design audit role",
  category: "development",
  includeContext: true,
  template: `[HANDOVER PROTOCOL - GEMINI DESIGN AUDITOR]

**Team Context Transfer**

You are **Gemini**, the **Design Auditor** for THE GRIND DESIGN project.

---

**TEAM STRUCTURE:**

Your role in 4-person development team:
- **sand01chi** - Lead Project Manager (decides scope, priorities)
- **You (Gemini)** - Design Auditor (review architecture, validate decisions)
- **Claude.ai** - Design Architect (creates technical specs, instructs coder)
- **Claude Code** - Lead Coder (implements based on architect instructions)

**Your Responsibilities as Auditor:**
✅ Review architectural proposals from Claude.ai (Design Architect)
✅ Validate technical decisions against project constraints
✅ Risk assessment (performance, security, maintainability)
✅ Approve/reject/request-changes on implementation plans
✅ Ensure V27+ compliance and backward compatibility

**You DO NOT:**
❌ Write implementation code (that's Claude Code's job)
❌ Create architectural designs (that's Claude.ai's job)
❌ Make final scope decisions (that's sand01chi's job)

---

**PROJECT SNAPSHOT:**

**App:** THE GRIND DESIGN
- Version: {{VERSION}}
- Architecture: {{ARCHITECTURE}}
- Tech Stack: {{STACK}}
- Purpose: Clinical gym training management PWA

**User Context:**
{{USER_DESCRIPTION}}

---

**PREVIOUS CONVERSATION:**

**Topic:** {{TOPIC}}

**Design Proposal Under Review:**
{{PROPOSAL}}

**Key Decisions Made:**
{{DECISIONS}}

**Your Previous Audit Feedback:**
{{FEEDBACK}}

**Next Step:**
{{NEXT_STEP}}

*(sand01chi will fill placeholders above)*

---

**CRITICAL CONSTRAINTS (Your Audit Checklist):**

**Architecture Compliance:**
- ✅ V27+ modular patterns followed? (\`window.APP.*\` usage)
- ✅ Module load order respected?
- ✅ IIFE wrapper pattern used?
- ✅ No direct localStorage access? (must use LS_SAFE)

**Design Principles:**
- ✅ Vanilla JavaScript only? (no frameworks)
- ✅ No backend required? (PWA only)
- ✅ Offline-first architecture?
- ✅ Mobile-first responsive?
- ✅ Backward compatible with existing data?

**Risk Assessment:**
- ⚠️ Performance implications? (large datasets, rendering)
- ⚠️ Browser compatibility issues?
- ⚠️ LocalStorage quota risks?
- ⚠️ User experience complexity?
- ⚠️ Maintenance burden?

**Code Quality:**
- ✅ Defensive error handling?
- ✅ Input validation?
- ✅ Memory leak prevention?
- ✅ Console logging appropriate?

---

**AUDIT WORKFLOW:**

**When Claude.ai submits architectural proposal:**

1. **Review Design Document**
   - Read technical specifications
   - Check against constraints checklist
   - Identify potential risks

2. **Provide Structured Feedback**
   \`\`\`
   AUDIT STATUS: ✅ APPROVED / ⚠️ APPROVED WITH NOTES / ❌ REJECTED
   
   COMPLIANCE CHECK:
   - Architecture patterns: [Pass/Fail + notes]
   - Design principles: [Pass/Fail + notes]
   - Risk level: [Low/Medium/High]
   
   FINDINGS:
   1. [Issue/Concern #1]
   2. [Issue/Concern #2]
   
   RECOMMENDATIONS:
   - [Recommendation #1]
   - [Recommendation #2]
   
   DECISION:
   [Approve / Request changes / Reject + reasoning]
   \`\`\`

3. **Iterate with Architect**
   - If concerns found, request revisions
   - Claude.ai will update design
   - Re-audit until approved

4. **Sign Off**
   - Once approved, sand01chi proceeds to authorize Claude Code
   - You've completed your audit role for this feature

---

**AVAILABLE DOCUMENTATION:**

- **ARCHITECTURE.md** - System design reference
- **CODING_GUIDELINES.md** - V27+ patterns
- **KNOWN_ISSUES.md** - Active bugs, gotchas
- **CHANGELOG_DETAILED.md** - Version history

Search with: @filename in your workspace

---

**READY TO AUDIT?**

Confirm you understand:
1. ✅ Your role: Design Auditor (not coder, not final decision maker)
2. ✅ Team structure: PM → Architect → Auditor → Coder workflow
3. ✅ Current topic: {{TOPIC}}
4. ✅ Proposal to review: {{PROPOSAL}}
5. ✅ Your job: Validate architectural soundness & risk assessment

Let's begin the audit!`
},

      /**
       * Coach Prompt - CSCS Fitness Coaching Scenario
       * Uses Indonesian format matching existing prepareGeminiAudit pattern
       * Category: coaching
       */
      coach: {
        title: "🏋️ Konsultasi CSCS Coach",
        description: "Full cycle audit & program calibration untuk sesi berikutnya",
        category: "coaching",
        includeContext: true,  // Triggers getPromptContext()
        template: `[MASTER PROMPT: FULL CYCLE AUDIT & PROGRAM CALIBRATION]

Instruksi:
"Bertindaklah sebagai Senior CSCS Coach, Clinical Performance Analyst, & System Architect. Saya akan memberikan Resep Program Saat Ini (JSON) dan Log Latihan Terakhir (JSON/Teks). Tugas Anda adalah mengaudit performa saya secara klinis, lalu memperbarui kode program latihan untuk sesi berikutnya berdasarkan hasil audit tersebut.

BAGIAN 1: MISI ANALISIS & AUDIT
Lakukan analisis mendalam sebelum menulis kode, dengan parameter:
1. Analisis Progres (Progressive Overload): Bandingkan volume/beban antar sesi.
2. Audit Klinis (Fatigue Management): Deteksi Systemic Fatigue atau Junk Volume.
3. Protokol Spontan: Jika log bertanda 'Spontan', abaikan tuntutan overload.

BAGIAN 2: ATURAN UPDATE RESEP JSON (EKSEKUSI)
1. Struktur Imutabel: DILARANG MENGHAPUS gerakan utama.
2. Kalibrasi Parameter: Perbarui t_k (Target Beban), t_r (Target Reps), rest (Istirahat), dan note.
3. Metadata Wajib: Tag Alat, Link Video, Bio Note, Note.

NOTE: Aplikasi mendukung Partial JSON Update. Anda tidak perlu menulis ulang seluruh sesi jika hanya mengubah satu Sesi. Cukup outputkan JSON objek sesi tersebut (contoh: { 's2': { ... } }).

{{CONTEXT}}

Mohon berikan:
1. Analisis klinis (RPE trends, volume progression, fatigue indicators)
2. Rekomendasi perubahan program (JSON format untuk import)
3. Penjelasan singkat keputusan Anda
`
      },

      /**
       * Code Partner Prompt - V{{VERSION}} Architecture Debugging Assistant
       * English format for code debugging scenarios
       * Category: development
       */
      codePartner: {
        title: "💻 Code Debugging Assistant",
        description: "Debug code issues with current architecture context",
        category: "development",
        includeContext: true,
        template: `You are a V{{VERSION}} Architecture Expert for THE GRIND DESIGN PWA.

CRITICAL V{{VERSION}} PATTERNS:
1. ALWAYS use window.APP.* for cross-module calls (NOT local APP)
   ❌ WRONG: APP.nav.switchView()
   ✅ CORRECT: window.APP.nav.switchView()

2. Module load order is CRITICAL:
   core.js → validation.js → data.js → ... → ui.js → debug.js → nav.js

3. Namespace merge pattern:
   if (window.APP) {
     Object.assign(window.APP, APP);  // Merge, don't overwrite
   }

4. Defensive error handling:
   if (window.APP?.module?.method) {
     window.APP.module.method();
   }

ARCHITECTURE:
- Pattern: {{ARCHITECTURE}}
- Stack: {{STACK}}
- Modules: {{FILES}}

Debug Issue:
{{USER_DESCRIPTION}}

Provide:
1. Root cause analysis
2. Code fix with proper V27 patterns
3. Prevention tips for similar issues
`
      },

      /**
       * Recipe Program Schema - JSON template for full program import
       * Returns raw JSON example with inline comments
       * Category: schema
       */
      recipeProgram: {
        title: "📋 Program Import Schema",
        description: "JSON schema untuk full program import/merge",
        category: "schema",
        includeContext: false,
        template: `{
  "s1": {
    "label": "SESI 1",              // Display label
    "title": "Upper Push A",        // Session name
    "dynamic": "Arm Circles, Band Pull-Aparts",  // Warmup protocol
    "exercises": [
      {
        "sets": 4,                  // Number of sets
        "rest": 120,                // Rest seconds between sets
        "note": "Chest Compound",   // Exercise category note
        "options": [                // Min 3 exercise variants required
          {
            "n": "[Barbell] Bench Press",  // MUST match EXERCISE_TARGETS
            "t_r": "6-8",           // Target reps (string, can be range)
            "t_k": 60,              // Target weight in kg
            "bio": "Gold standard untuk horizontal pressing power",
            "note": "Gunakan leg drive. Turunkan bar ke sternum bawah.",
            "vid": "https://youtube.com/..."  // Optional video URL
          },
          {
            "n": "[DB] Flat Dumbbell Press",
            "t_r": "8-10",
            "t_k": 25,
            "bio": "Optimal untuk stabilisasi bahu",
            "note": "Turunkan 3 detik, dorong eksplosif"
          },
          {
            "n": "[Machine] Chest Press",
            "t_r": "10-12",
            "t_k": 50,
            "bio": "High stability untuk isolasi",
            "note": "Soft-lock siku di atas"
          }
        ]
      }
    ]
  },
  "s2": {
    // Additional sessions...
  }
}

VALIDATION RULES:
1. Each session MUST have: label, title, exercises array
2. Each exercise MUST have: sets (number), rest (number), options (array min 3)
3. Each option MUST have: n (name), t_r (target reps), t_k (target weight), bio
4. Exercise names MUST match EXERCISE_TARGETS library (fuzzy matching applied)
5. Session IDs (s1, s2...) must be unique - duplicates get auto-suffix
6. Cardio exercises use type: "cardio" field
`
      },

      /**
       * Recipe Spontaneous Schema - JSON template for spontaneous workout import
       * Reduced requirements (min 2 variants vs 3 for program)
       * Category: schema
       */
      recipeSpontaneous: {
        title: "⚡ Spontaneous Session Import Schema",
        description: "JSON schema untuk spontaneous workout import",
        category: "schema",
        includeContext: false,
        template: `{
  "spontaneous": {
    "label": "SPONTANEOUS",         // Always "SPONTANEOUS"
    "title": "Express Upper Body",  // Custom session name
    "dynamic": "Jumping Jacks, Arm Circles",
    "exercises": [
      {
        "sets": 3,
        "rest": 90,
        "note": "Quick pump work",
        "options": [                // Min 2 variants required
          {
            "n": "[DB] Dumbbell Curl",
            "t_r": "12-15",
            "t_k": 10,
            "bio": "Bicep isolation",
            "note": "Supinate at top"
          },
          {
            "n": "[Cable] Cable Curl",
            "t_r": "12-15",
            "t_k": 15,
            "bio": "Constant tension",
            "note": "Slow eccentric"
          }
        ]
      }
    ]
  }
}

VALIDATION RULES:
1. Session ID MUST be "spontaneous" (not timestamp)
2. Label MUST be "SPONTANEOUS"
3. Each exercise needs min 2 options (reduced from program import)
4. Same field requirements as program import
5. Will replace existing spontaneous session if exists
6. NOT tracked in last_performed rotation
`
      }
    },

    /**
     * Custom Prompts (User-created)
     * Loaded from LocalStorage on init, persisted via library.saveToStorage()
     */
    _customPrompts: {},

    /**
     * Computed getter - merges built-in and custom prompts
     * Provides backward compatibility with existing code using APP.aiBridge.prompts
     */
    get prompts() {
      return { ...this._builtInPrompts, ...this._customPrompts };
    },

    /**
     * Generates contextual data for AI prompts
     * @param {string} scenario - Prompt scenario name (e.g., "coach", "codePartner")
     * @returns {string} Formatted context string with user profile, recent workouts, and program structure
     */
    getPromptContext: function(scenario) {
      try {
        // Read data using LS_SAFE wrapper (global variable from core.js)
        const profile = window.LS_SAFE.getJSON("profile", {});
        const workoutLogs = window.LS_SAFE.getJSON("gym_hist", []);
        const weights = window.LS_SAFE.getJSON("weights", []);
        const program = window.APP.state.workoutData;

        // Get last 5 unique workout dates
        const uniqueDates = [...new Set(workoutLogs.map(l => l.date))].slice(-5);

        // Format context string
        let context = `\n\n--- CONTEXT DATA ---\n\n`;

        // User Profile Section
        context += `**User Profile:**\n`;
        context += `- Nama: ${profile.name || "Dok"}\n`;
        context += `- Usia: ${profile.a || "-"} tahun\n`;
        context += `- Tinggi: ${profile.h || 170} cm\n`;
        context += `- Berat: ${weights.length > 0 ? weights[0].v : 80} kg\n`;
        context += `- TDEE: ${window.LS_SAFE.get("tdee") || "?"} kkal\n\n`;

        // Recent Workout Logs (formatted like exportForConsultation)
        context += `**5 Latihan Terakhir:**\n`;
        uniqueDates.forEach(date => {
          const dayLogs = workoutLogs.filter(l => l.date === date);

          // Build session titles with individual [SPONTANEOUS] tags
          const sessionTitles = [...new Set(dayLogs.map(l => {
            const title = l.title || l.src;
            const spontTag = l.src === "spontaneous" ? " [SPONTANEOUS]" : "";
            return `${title}${spontTag}`;
          }))].join(" & ");

          // Calculate total volume (exclude cardio)
          const totalVol = dayLogs.reduce((acc, curr) => {
            return acc + (curr.type === "cardio" ? 0 : (curr.vol || 0));
          }, 0);

          context += `\n📅 ${date} | ${sessionTitles}\n`;
          context += `Volume: ${totalVol} kg | Sets: ${dayLogs.filter(l => l.type !== "cardio").length}\n`;

          // Exercise breakdown
          dayLogs.forEach(l => {
            if (l.type === "cardio") {
              const cardioSpontTag = l.src === "spontaneous" ? " [SPONTANEOUS]" : "";
              context += `- 🏃 ${l.machine} LISS: ${l.duration}min @ ${l.avgHR}bpm${cardioSpontTag}\n`;
            } else if (l.d && Array.isArray(l.d)) {
              const exerciseSpontTag = l.src === "spontaneous" ? " [SPONTANEOUS]" : "";
              const setsStr = l.d.map(s => `${s.k}x${s.r}${s.rpe ? "@"+s.rpe : ""}`).join(", ");
              context += `- ${l.ex}: ${setsStr}${exerciseSpontTag}\n`;
            }
          });
        });

        // Program Structure with Exercise Details
        context += `\n**Program Aktif:**\n`;
        const sessionIds = Object.keys(program).filter(id => id !== "spontaneous");
        sessionIds.forEach(id => {
          const session = program[id];
          context += `\n### ${session.label || id}: "${session.title}"\n`;
          context += `Dynamic Warmup: ${session.dynamic || "N/A"}\n`;
          context += `Total Exercises: ${session.exercises.length}\n\n`;

          // Detail setiap exercise
          session.exercises.forEach((ex, idx) => {
            const isCardio = ex.type === "cardio";

            if (isCardio) {
              // Cardio exercise
              context += `${idx + 1}. **CARDIO** (${ex.sets || 1} set, ${ex.rest || 60}s rest)\n`;
              context += `   Target: ${ex.target_duration || 30} min @ ${ex.target_hr_zone || "Zone 2"}\n`;
              if (ex.note) context += `   Note: ${ex.note}\n`;

              // Cardio options
              if (ex.options && ex.options.length > 0) {
                context += `   Machines:\n`;
                ex.options.forEach((opt, optIdx) => {
                  const machines = opt.machines ? opt.machines.join(", ") : "N/A";
                  context += `   ${optIdx + 1}. ${opt.n} - Available: ${machines}\n`;
                });
              }
            } else {
              // Resistance training exercise
              context += `${idx + 1}. **${ex.note || "Exercise"}** (${ex.sets} sets, ${ex.rest}s rest)\n`;

              // Exercise options (main + alternates)
              if (ex.options && ex.options.length > 0) {
                ex.options.forEach((opt, optIdx) => {
                  const optLabel = optIdx === 0 ? "MAIN" : `ALT ${optIdx}`;
                  context += `   [${optLabel}] ${opt.n}\n`;
                  context += `      - Target: ${opt.t_k}kg × ${opt.t_r} reps\n`;
                  if (opt.bio) context += `      - Bio: ${opt.bio}\n`;
                  if (opt.note) context += `      - Note: ${opt.note}\n`;
                });
              }
            }
            context += `\n`;
          });
        });

        context += `\n--- END CONTEXT ---\n\n`;

        console.log("[AI-BRIDGE] Context generated successfully");
        return context;

      } catch (e) {
        console.error("[AI-BRIDGE] Context generation error:", e);
        return "\n\n[⚠️ Error generating context data]\n\n";
      }
    },

/**
 * Get prompt with dynamic placeholder replacement
 * @param {string} scenario - Prompt ID (e.g., "coach", "codePartner")
 * @param {object} userInputs - User-provided values for {{USER_DESCRIPTION}}, etc.
 * @returns {object} { title, description, content } with placeholders replaced
 */
getPrompt: function(scenario, userInputs = {}) {
  const prompt = this.prompts[scenario];
  
  if (!prompt) {
    console.error(`[AI-BRIDGE] Unknown scenario: ${scenario}`);
    return null;
  }

  let output = prompt.template;

  // STEP 1: Replace {{CONTEXT}} if includeContext is true
  if (prompt.includeContext) {
    const context = this.getPromptContext(scenario);
    output = output.replace(/\{\{CONTEXT\}\}/g, context);
  }

  // STEP 2: Replace {{VERSION}} with APP.version.number
  if (window.APP?.version?.number) {
    const versionInfo = window.APP.version.number;
    const archName = window.APP.version.name || "";
    const fullVersion = archName ? `${versionInfo} (${archName})` : versionInfo;
    output = output.replace(/\{\{VERSION\}\}/g, fullVersion);
  } else {
    output = output.replace(/\{\{VERSION\}\}/g, "Current Version");
  }

  // STEP 3: Replace {{ARCHITECTURE}} with APP.architecture.pattern
  if (window.APP?.architecture?.pattern) {
    output = output.replace(/\{\{ARCHITECTURE\}\}/g, window.APP.architecture.pattern);
  } else {
    output = output.replace(/\{\{ARCHITECTURE\}\}/g, "IIFE Modular");
  }

  // STEP 4: Replace {{STACK}} with stack array joined
  if (window.APP?.architecture?.stack && Array.isArray(window.APP.architecture.stack)) {
    const stackString = window.APP.architecture.stack.join(", ");
    output = output.replace(/\{\{STACK\}\}/g, stackString);
  } else {
    output = output.replace(/\{\{STACK\}\}/g, "Vanilla JavaScript, Tailwind CSS, Chart.js");
  }

  // STEP 5: Replace {{FILES}} with files array joined (if exists)
  if (window.APP?.architecture?.files && Array.isArray(window.APP.architecture.files)) {
    const filesString = window.APP.architecture.files.join(", ");
    output = output.replace(/\{\{FILES\}\}/g, filesString);
  }

  // STEP 6: Replace user-provided placeholders (e.g., {{USER_DESCRIPTION}}, {{TOPIC}})
  if (userInputs && typeof userInputs === 'object') {
    Object.keys(userInputs).forEach(key => {
      const placeholder = new RegExp(`\\{\\{${key.toUpperCase()}\\}\\}`, 'g');
      const value = userInputs[key] || "";
      output = output.replace(placeholder, value);
    });
  }

  // STEP 7: Return formatted prompt object
  return {
    title: prompt.title,
    description: prompt.description,
    content: output,
    category: prompt.category,
    includeContext: prompt.includeContext
  };
},

    /**
     * Prompt Library Management System
     * CRUD operations for custom user prompts
     */
    library: {
      /**
       * Add a new custom prompt
       * @param {string} id - Unique identifier for the prompt
       * @param {Object} promptData - Prompt configuration
       * @param {string} promptData.title - Display title
       * @param {string} promptData.description - Short description
       * @param {string} promptData.category - Category: "coaching", "development", or "custom"
       * @param {boolean} promptData.includeContext - Whether to include workout context
       * @param {string} promptData.template - Prompt template text
       * @returns {boolean} Success status
       */
      add: function(id, promptData) {
        try {
          // Validation: Check ID format
          if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_]+$/.test(id)) {
            console.error("[AI-BRIDGE] Invalid prompt ID format. Use alphanumeric and underscore only.");
            return false;
          }

          // Validation: Check for built-in ID collision
          if (window.APP.aiBridge._builtInPrompts[id]) {
            console.error(`[AI-BRIDGE] Cannot use reserved ID: ${id}`);
            return false;
          }

          // Validation: Check required fields
          if (!promptData.title || !promptData.description || !promptData.template) {
            console.error("[AI-BRIDGE] Missing required fields: title, description, template");
            return false;
          }

          // Add to custom prompts
          window.APP.aiBridge._customPrompts[id] = {
            title: promptData.title,
            description: promptData.description,
            category: promptData.category || "custom",
            includeContext: promptData.includeContext || false,
            template: promptData.template
          };

          // Save to LocalStorage
          this.saveToStorage();
          console.log(`[AI-BRIDGE] Custom prompt added: ${id}`);
          return true;

        } catch (e) {
          console.error("[AI-BRIDGE] Error adding custom prompt:", e);
          return false;
        }
      },

      /**
       * Edit an existing custom prompt
       * @param {string} id - Prompt ID to edit
       * @param {Object} updates - Fields to update
       * @returns {boolean} Success status
       */
      edit: function(id, updates) {
        try {
          // Validation: Check if prompt exists in custom
          if (!window.APP.aiBridge._customPrompts[id]) {
            console.error(`[AI-BRIDGE] Custom prompt not found: ${id}`);
            return false;
          }

          // Validation: Cannot edit built-in prompts
          if (window.APP.aiBridge._builtInPrompts[id]) {
            console.error(`[AI-BRIDGE] Cannot edit built-in prompt: ${id}`);
            return false;
          }

          // Merge updates
          Object.assign(window.APP.aiBridge._customPrompts[id], updates);

          // Save to LocalStorage
          this.saveToStorage();
          console.log(`[AI-BRIDGE] Custom prompt updated: ${id}`);
          return true;

        } catch (e) {
          console.error("[AI-BRIDGE] Error editing custom prompt:", e);
          return false;
        }
      },

      /**
       * Delete a custom prompt
       * @param {string} id - Prompt ID to delete
       * @returns {boolean} Success status
       */
      delete: function(id) {
        try {
          // Validation: Check if prompt exists in custom
          if (!window.APP.aiBridge._customPrompts[id]) {
            console.error(`[AI-BRIDGE] Custom prompt not found: ${id}`);
            return false;
          }

          // Validation: Cannot delete built-in prompts
          if (window.APP.aiBridge._builtInPrompts[id]) {
            console.error(`[AI-BRIDGE] Cannot delete built-in prompt: ${id}`);
            return false;
          }

          // Delete from custom prompts
          delete window.APP.aiBridge._customPrompts[id];

          // Save to LocalStorage
          this.saveToStorage();
          console.log(`[AI-BRIDGE] Custom prompt deleted: ${id}`);
          return true;

        } catch (e) {
          console.error("[AI-BRIDGE] Error deleting custom prompt:", e);
          return false;
        }
      },

      /**
       * Export all custom prompts as JSON
       * @returns {string} JSON string with metadata
       */
      export: function() {
        try {
          const exportData = {
            version: window.APP?.version?.number || "29.0",
            exportedAt: new Date().toISOString(),
            customPrompts: window.APP.aiBridge._customPrompts
          };

          return JSON.stringify(exportData, null, 2);
        } catch (e) {
          console.error("[AI-BRIDGE] Error exporting prompts:", e);
          return null;
        }
      },

      /**
       * Import custom prompts from JSON
       * @param {string} jsonString - JSON export data
       * @returns {Object} Import result with stats
       */
      import: function(jsonString) {
        const result = {
          success: false,
          imported: 0,
          skipped: 0,
          errors: []
        };

        try {
          const data = JSON.parse(jsonString);

          // Validation: Check format
          if (!data.customPrompts || typeof data.customPrompts !== 'object') {
            result.errors.push("Invalid format: missing customPrompts object");
            return result;
          }

          // Import each prompt
          Object.keys(data.customPrompts).forEach(id => {
            const prompt = data.customPrompts[id];

            // Skip if built-in ID
            if (window.APP.aiBridge._builtInPrompts[id]) {
              result.skipped++;
              result.errors.push(`Skipped built-in ID: ${id}`);
              return;
            }

            // Skip if already exists (no overwrite)
            if (window.APP.aiBridge._customPrompts[id]) {
              result.skipped++;
              result.errors.push(`Skipped existing ID: ${id}`);
              return;
            }

            // Add prompt
            window.APP.aiBridge._customPrompts[id] = prompt;
            result.imported++;
          });

          // Save to LocalStorage
          this.saveToStorage();
          result.success = result.imported > 0;

          console.log(`[AI-BRIDGE] Import complete: ${result.imported} imported, ${result.skipped} skipped`);
          return result;

        } catch (e) {
          result.errors.push(e.message);
          console.error("[AI-BRIDGE] Error importing prompts:", e);
          return result;
        }
      },

      /**
       * List all prompt IDs by type
       * @returns {Object} Lists of built-in and custom IDs
       */
      list: function() {
        return {
          builtIn: Object.keys(window.APP.aiBridge._builtInPrompts),
          custom: Object.keys(window.APP.aiBridge._customPrompts)
        };
      },

      /**
       * Load custom prompts from LocalStorage
       * Called on module init
       */
      loadFromStorage: function() {
        try {
          if (!window.LS_SAFE) {
            console.warn("[AI-BRIDGE] LS_SAFE not available, skipping custom prompt load");
            return;
          }

          const saved = window.LS_SAFE.getJSON("ai_custom_prompts", {});
          window.APP.aiBridge._customPrompts = saved;

          const count = Object.keys(saved).length;
          console.log(`[AI-BRIDGE] Loaded ${count} custom prompts from storage`);

        } catch (e) {
          console.error("[AI-BRIDGE] Error loading custom prompts:", e);
        }
      },

      /**
       * Save custom prompts to LocalStorage
       * Internal helper called by add/edit/delete
       */
      saveToStorage: function() {
        try {
          if (!window.LS_SAFE) {
            console.warn("[AI-BRIDGE] LS_SAFE not available, skipping save");
            return false;
          }

          const success = window.LS_SAFE.setJSON("ai_custom_prompts", window.APP.aiBridge._customPrompts);

          if (!success) {
            console.error("[AI-BRIDGE] Failed to save custom prompts to LocalStorage");
          }

          return success;

        } catch (e) {
          console.error("[AI-BRIDGE] Error saving custom prompts:", e);
          return false;
        }
      }
    },

    /**
     * Parses and validates AI-generated recipe JSON
     * @param {string} jsonString - Raw JSON string from AI
     * @returns {Object} Parse result with validation status
     * @returns {boolean} returns.success - Whether parsing succeeded
     * @returns {Object|null} returns.data - Parsed and validated data
     * @returns {string[]} returns.errors - Hard validation errors (blocking)
     * @returns {string[]} returns.warnings - Soft validation warnings (non-blocking)
     * @returns {string|null} returns.schemaType - "program_import" or "spontaneous_import"
     */
    parseRecipe: function(jsonString) {
      const result = {
        success: false,
        data: null,
        errors: [],
        warnings: [],
        schemaType: null
      };

      try {
        // Step 1: Parse JSON
        const parsed = JSON.parse(jsonString);

        // Step 2: Detect schema type
        if (parsed.spontaneous) {
          result.schemaType = "spontaneous_import";
          result.data = parsed;
        } else {
          result.schemaType = "program_import";
          result.data = parsed;
        }

        console.log(`[AI-BRIDGE] Parsing ${result.schemaType}...`);

        // Step 3: Validate structure
        if (result.schemaType === "spontaneous_import") {
          const validateResult = this.validateSpontaneousSchema(parsed);
          result.errors = validateResult.errors;
          result.warnings = validateResult.warnings;
        } else {
          const validateResult = this.validateProgramSchema(parsed);
          result.errors = validateResult.errors;
          result.warnings = validateResult.warnings;
        }

        // Step 4: Auto-correct exercise names (fuzzy matching)
        let autoMappedCount = 0;
        Object.keys(result.data).forEach(sessionId => {
          const session = result.data[sessionId];
          if (!session.exercises) return;

          session.exercises.forEach((ex, exIdx) => {
            if (!ex.options) return;

            ex.options.forEach((opt, optIdx) => {
              if (!opt.n) return;

              // Check against EXERCISE_TARGETS (global variable from exercises-library.js)
              // CRITICAL: Must use window. prefix and defensive check
              if (!window.EXERCISE_TARGETS || !window.EXERCISE_TARGETS[opt.n]) {
                const matched = window.APP.validation.fuzzyMatchExercise(opt.n);

                if (matched && matched !== opt.n) {
                  console.log(`[AI-BRIDGE] 🔄 Auto-mapped: "${opt.n}" → "${matched}"`);
                  opt.n = matched;
                  autoMappedCount++;
                } else {
                  result.warnings.push(
                    `Session ${sessionId}, Exercise ${exIdx+1}, Option ${optIdx+1}: ` +
                    `"${opt.n}" not found in library. Volume tracking may fail.`
                  );
                }
              }
            });
          });
        });

        if (autoMappedCount > 0) {
          result.warnings.unshift(`✅ Auto-corrected ${autoMappedCount} exercise name(s) to match library`);
        }

        // Step 5: Check for duplicate session IDs and add warning (but don't rename)
        // AI import is designed to OVERWRITE existing sessions, not create duplicates
        if (result.schemaType === "program_import") {
          const existingIds = Object.keys(window.APP.state.workoutData);
          const newIds = Object.keys(result.data);

          newIds.forEach(newId => {
            if (existingIds.includes(newId)) {
              console.log(`[AI-BRIDGE] Session "${newId}" will be overwritten`);
              result.warnings.push(
                `⚠️ Session "${newId}" sudah ada dan akan ditimpa.`
              );
            }
          });
        }

        // Step 6: Set success flag
        result.success = result.errors.length === 0;

        console.log(`[AI-BRIDGE] Parse result: ${result.success ? "SUCCESS" : "FAILED"}`);
        console.log(`[AI-BRIDGE] Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`);

      } catch (e) {
        result.errors.push(`JSON Parse Error: ${e.message}`);
        console.error("[AI-BRIDGE] Parse error:", e);
      }

      return result;
    },

    /**
     * Validates program import schema structure
     * @param {Object} data - Parsed program data
     * @returns {Object} Validation result with errors and warnings arrays
     */
    validateProgramSchema: function(data) {
      const errors = [];
      const warnings = [];

      // Check if object
      if (!data || typeof data !== "object") {
        errors.push("Invalid schema: Must be an object");
        return { errors, warnings };
      }

      // Must have at least one session
      const sessionIds = Object.keys(data);
      if (sessionIds.length === 0) {
        errors.push("No sessions found in program");
        return { errors, warnings };
      }

      // Validate each session
      sessionIds.forEach(sessionId => {
        const session = data[sessionId];
        const prefix = `Session "${sessionId}":`;

        // Required fields
        if (!session.label) warnings.push(`${prefix} Missing "label" field`);
        if (!session.title) warnings.push(`${prefix} Missing "title" field`);
        if (!session.exercises) {
          errors.push(`${prefix} Missing "exercises" array`);
          return;
        }
        if (!Array.isArray(session.exercises)) {
          errors.push(`${prefix} "exercises" must be an array`);
          return;
        }

        // Validate each exercise
        session.exercises.forEach((ex, exIdx) => {
          const exPrefix = `${prefix} Exercise ${exIdx + 1}:`;

          if (typeof ex.sets !== "number") errors.push(`${exPrefix} Missing or invalid "sets" field`);
          if (typeof ex.rest !== "number") errors.push(`${exPrefix} Missing or invalid "rest" field`);
          if (!ex.options || !Array.isArray(ex.options)) {
            errors.push(`${exPrefix} Missing "options" array`);
            return;
          }

          if (ex.options.length < 3) {
            warnings.push(`${exPrefix} Only ${ex.options.length} variants (recommended: 3+)`);
          }

          // Validate each option
          ex.options.forEach((opt, optIdx) => {
            const optPrefix = `${exPrefix} Option ${optIdx + 1}:`;

            if (!opt.n) errors.push(`${optPrefix} Missing "n" (name) field`);
            if (!opt.t_r) warnings.push(`${optPrefix} Missing "t_r" (target reps)`);
            if (typeof opt.t_k !== "number") warnings.push(`${optPrefix} Missing "t_k" (target weight)`);
            if (!opt.bio) warnings.push(`${optPrefix} Missing "bio" (biomechanics description)`);
          });
        });
      });

      return { errors, warnings };
    },

    /**
     * Validates spontaneous session import schema structure
     * @param {Object} data - Parsed spontaneous session data (must have "spontaneous" key)
     * @returns {Object} Validation result with errors and warnings arrays
     */
    validateSpontaneousSchema: function(data) {
      const errors = [];
      const warnings = [];

      // Must have "spontaneous" key
      if (!data.spontaneous) {
        errors.push('Missing "spontaneous" key. Schema must be: { "spontaneous": {...} }');
        return { errors, warnings };
      }

      const session = data.spontaneous;
      const prefix = "Spontaneous session:";

      // Required fields
      if (session.label !== "SPONTANEOUS") {
        warnings.push(`${prefix} Label should be "SPONTANEOUS" (found: "${session.label}")`);
      }
      if (!session.title) warnings.push(`${prefix} Missing "title" field`);
      if (!session.exercises) {
        errors.push(`${prefix} Missing "exercises" array`);
        return { errors, warnings };
      }
      if (!Array.isArray(session.exercises)) {
        errors.push(`${prefix} "exercises" must be an array`);
        return { errors, warnings };
      }

      // Validate each exercise
      session.exercises.forEach((ex, exIdx) => {
        const exPrefix = `${prefix} Exercise ${exIdx + 1}:`;

        if (typeof ex.sets !== "number") errors.push(`${exPrefix} Missing or invalid "sets" field`);
        if (typeof ex.rest !== "number") errors.push(`${exPrefix} Missing or invalid "rest" field`);
        if (!ex.options || !Array.isArray(ex.options)) {
          errors.push(`${exPrefix} Missing "options" array`);
          return;
        }

        if (ex.options.length < 2) {
          warnings.push(`${exPrefix} Only ${ex.options.length} variant (recommended: 2+)`);
        }

        // Validate each option
        ex.options.forEach((opt, optIdx) => {
          const optPrefix = `${exPrefix} Option ${optIdx + 1}:`;

          if (!opt.n) errors.push(`${optPrefix} Missing "n" (name) field`);
          if (!opt.t_r) warnings.push(`${optPrefix} Missing "t_r" (target reps)`);
          if (typeof opt.t_k !== "number") warnings.push(`${optPrefix} Missing "t_k" (target weight)`);
          if (!opt.bio) warnings.push(`${optPrefix} Missing "bio" (biomechanics description)`);
        });
      });

      return { errors, warnings };
    },

    /**
     * Generates a unique session ID by appending suffix if duplicate exists
     * @param {string} baseName - Base session ID (e.g., "s1")
     * @returns {string} Unique session ID (e.g., "s1_1" if "s1" exists)
     */
    generateSessionId: function(baseName) {
      const existing = Object.keys(window.APP.state.workoutData);

      // If not duplicate, return as-is
      if (!existing.includes(baseName)) {
        return baseName;
      }

      // Find next available suffix
      let suffix = 1;
      let candidate = `${baseName}_${suffix}`;

      while (existing.includes(candidate)) {
        suffix++;
        candidate = `${baseName}_${suffix}`;
      }

      console.log(`[AI-BRIDGE] Generated unique ID: ${candidate}`);
      return candidate;
    },

    /**
     * Returns example recipe templates for both schema types
     * @returns {Object} Object with programTemplate and spontaneousTemplate keys
     */
    getRecipeTemplates: function() {
      return {
        programTemplate: {
          "s1": {
            "label": "Session 1",
            "title": "Upper A (Back + Shoulders)",
            "exercises": [
              {
                "sets": 3,
                "rest": 120,
                "options": [
                  {
                    "n": "[Cable] Lat Pulldown (wide)",
                    "t_r": "8-12",
                    "t_k": 55,
                    "bio": "Vertical pull utama untuk membangun lebar punggung (V-Taper)"
                  },
                  {
                    "n": "[Machine] Close Neutral Grip Pulldown",
                    "t_r": "8-12",
                    "t_k": 40,
                    "bio": "Close neutral grip maximize lat thickness"
                  },
                  {
                    "n": "[Machine] Reverse Grip Pulldown",
                    "t_r": "8-12",
                    "t_k": 40,
                    "bio": "Underhand grip shift emphasis ke lower lat"
                  }
                ]
              },
              {
                "sets": 3,
                "rest": 90,
                "options": [
                  {
                    "n": "[Cable] Cable Lateral Raise",
                    "t_r": "12-15",
                    "t_k": 5,
                    "bio": "Memberikan tegangan konstan (Constant Tension)"
                  },
                  {
                    "n": "[DB] DB Lateral Raise",
                    "t_r": "12-15",
                    "t_k": 6,
                    "bio": "Target utama Lateral Delt untuk memberikan lebar bahu"
                  },
                  {
                    "n": "[Machine] Lateral Raise Machine",
                    "t_r": "12-15",
                    "t_k": 20,
                    "bio": "Pure medial deltoid isolation dengan arm path yang fixed"
                  }
                ]
              }
            ]
          },
          "s2": {
            "label": "Session 2",
            "title": "Lower A (Quad Focus)",
            "exercises": [
              {
                "sets": 4,
                "rest": 180,
                "options": [
                  {
                    "n": "[Barbell] Barbell Squat",
                    "t_r": "6-10",
                    "t_k": 60,
                    "bio": "Raja dari semua latihan lower body"
                  },
                  {
                    "n": "[Machine] Leg Press (Quad Bias)",
                    "t_r": "8-12",
                    "t_k": 120,
                    "bio": "Isolasi lower body dengan stabilitas maksimal"
                  },
                  {
                    "n": "[Machine] Hack Squat",
                    "t_r": "10-12",
                    "t_k": 100,
                    "bio": "Alat terbaik untuk hipertrofi Quads"
                  }
                ]
              },
              {
                "sets": 3,
                "rest": 120,
                "options": [
                  {
                    "n": "[Machine] Leg Extension",
                    "t_r": "12-15",
                    "t_k": 45,
                    "bio": "Isolasi Rectus Femoris secara maksimal"
                  }
                ]
              }
            ]
          }
        },
        spontaneousTemplate: {
          "spontaneous": {
            "label": "SPONTANEOUS",
            "title": "Express Session",
            "exercises": [
              {
                "sets": 3,
                "rest": 90,
                "options": [
                  {
                    "n": "[Machine] Pec Deck Fly",
                    "t_r": "12-15",
                    "t_k": 35,
                    "bio": "Isolasi dada murni tanpa melibatkan tricep"
                  },
                  {
                    "n": "[Machine] Incline Chest Press",
                    "t_r": "10-12",
                    "t_k": 40,
                    "bio": "Target Clavicular Head (Dada Atas)"
                  }
                ]
              },
              {
                "sets": 3,
                "rest": 90,
                "options": [
                  {
                    "n": "[DB] One Arm DB Row",
                    "t_r": "8-10",
                    "t_k": 22.5,
                    "bio": "Unilateral movement untuk memperbaiki ketimpangan kekuatan"
                  }
                ]
              },
              {
                "sets": 3,
                "rest": 90,
                "options": [
                  {
                    "n": "[Cable] Cable Lateral Raise",
                    "t_r": "15-20",
                    "t_k": 5,
                    "bio": "Memberikan tegangan konstan di seluruh rentang gerak"
                  }
                ]
              }
            ]
          }
        }
      };
    }

  };

  // Initialize custom prompts from LocalStorage
  if (window.APP && window.APP.aiBridge && window.APP.aiBridge.library) {
    window.APP.aiBridge.library.loadFromStorage();
  }

  // Module load confirmation
  console.log("[AI-BRIDGE] ✅ Module loaded");

})();
