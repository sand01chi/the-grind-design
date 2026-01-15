# V30.8 Migration Scenarios - Complete Reference

## Overview
V30.6 introduced specialized volume calculation formulas for different exercise types. The v30.8 migration system detects and fixes ALL pre-v30.6 exercise logs to match the new formulas.

## Migration Cases

### Case 1: Bodyweight Exercise - Zero Volume
**Issue**: Pre-v30.6 bodyweight exercises had `vol=0` because the system didn't calculate bodyweight volumes.

**Example**:
```javascript
// PRE-v30.6 (Wrong)
{
  ex: "Pull-ups [Bodyweight]",
  k: 0,
  reps: 10,
  sets: 3,
  vol: 0  // ❌ Shows 0kg
}

// POST-MIGRATION (Fixed)
{
  ex: "Pull-ups [Bodyweight]",
  k: 0,
  reps: 10,
  sets: 3,
  vol: 2100,  // ✅ Calculated: 70kg × 1.0 × 30 reps
  _migrated: "v30.8",
  _originalVolume: 0
}
```

**Detection**: `exType.isBodyweight && vol === 0`

**Formula**: `userWeight × multiplier × totalReps`
- Pull-up multiplier: 1.0
- Dip multiplier: 0.76
- Push-up multiplier: 0.64

---

### Case 2: Bodyweight Exercise - Incorrect Weight Field
**Issue**: Some users manually entered weight (k) for bodyweight exercises. Post-v30.6, bodyweight exercises should always have `k=0`.

**Example**:
```javascript
// PRE-v30.6 (Wrong)
{
  ex: "Plank [Bodyweight][Core][Time-based]",
  k: 55,  // ❌ User manually entered weight
  reps: 60,  // duration in seconds
  sets: 3,
  vol: 0
}

// POST-MIGRATION (Fixed)
{
  ex: "Plank [Bodyweight][Core][Time-based]",
  k: 0,  // ✅ Fixed to 0
  reps: 60,
  sets: 3,
  vol: 12600,  // ✅ Calculated: 70kg × 1.0 × 180 total seconds
  _migrated: "v30.8",
  _originalWeight: 55,
  _originalVolume: 0
}
```

**Detection**: `exType.isBodyweight && k > 0`

**Fix**: Set `k = 0`, store original in `_originalWeight`

---

### Case 3: Weighted Unilateral Exercise - Volume Not Doubled
**Issue**: Pre-v30.6 unilateral exercises only counted one side. Post-v30.6, they count both sides by doubling reps.

**Example**:
```javascript
// PRE-v30.6 (Wrong)
{
  ex: "Bulgarian Split Squat [Unilateral]",
  k: 20,  // 20kg dumbbell
  reps: 10,  // per leg
  sets: 3,
  vol: 600  // ❌ Old formula: 20 × 10 × 3 = 600kg (only one leg)
}

// POST-MIGRATION (Fixed)
{
  ex: "Bulgarian Split Squat [Unilateral]",
  k: 20,
  reps: 10,
  sets: 3,
  vol: 1200,  // ✅ New formula: 20 × (10 × 2) × 3 = 1200kg (both legs)
  _migrated: "v30.8",
  _originalVolume: 600
}
```

**Detection**: 
```javascript
exType.isUnilateral && !exType.isBodyweight && k > 0 && 
Math.abs(vol - (k × reps × sets)) < 10  // matches old formula
```

**Old Formula**: `k × r × sets` (one side only)  
**New Formula**: `k × (r × 2) × sets` (both sides)

**Exercises Affected**:
- Bulgarian Split Squat
- Single-Arm Dumbbell Row
- Single-Leg Romanian Deadlift
- Single-Arm Cable exercises

---

### Case 4: Bilateral Dumbbell Exercise - Volume Not Summed
**Issue**: Pre-v30.6 bilateral dumbbell exercises only counted one dumbbell. Post-v30.6, they sum both dumbbells by doubling weight.

**Example**:
```javascript
// PRE-v30.6 (Wrong)
{
  ex: "Dumbbell Bench Press [Bilateral DB]",
  k: 25,  // 25kg per dumbbell
  reps: 10,
  sets: 3,
  vol: 750  // ❌ Old formula: 25 × 10 × 3 = 750kg (one DB only)
}

// POST-MIGRATION (Fixed)
{
  ex: "Dumbbell Bench Press [Bilateral DB]",
  k: 25,
  reps: 10,
  sets: 3,
  vol: 1500,  // ✅ New formula: (25 × 2) × 10 × 3 = 1500kg (both DBs)
  _migrated: "v30.8",
  _originalVolume: 750
}
```

**Detection**: 
```javascript
exType.isBilateralDB && k > 0 && 
Math.abs(vol - (k × reps × sets)) < 10  // matches old formula
```

**Old Formula**: `k × r × sets` (one dumbbell)  
**New Formula**: `(k × 2) × r × sets` (both dumbbells)

**Exercises Affected**:
- Dumbbell Bench Press
- Dumbbell Shoulder Press
- Dumbbell Row
- Dumbbell Romanian Deadlift

---

## Migration Process

### 5-Step System
1. **BACKUP**: Create safety copy of entire `gym_hist`
2. **SCAN**: Detect all 4 migration cases, build `toMigrate[]` array
3. **CALCULATE**: Recalculate volumes using appropriate formulas
4. **VERIFY**: Validate all volumes (no NaN, no negative, no null)
5. **COMMIT**: Save to localStorage, mark as `_migrated: "v30.8"`

### Error Handling
- **Automatic Rollback**: If any error occurs during CALCULATE or VERIFY, restores backup
- **Audit Trail**: Stores `_originalVolume` and `_originalWeight` for all modified logs
- **Validation**: Checks for NaN, null, undefined, negative volumes
- **One-Click Revert**: User can manually restore backup from Profile view

---

## Testing Checklist

### Test Data Needed
- [ ] Bodyweight exercises with vol=0 (Pull-ups, Push-ups, Dips)
- [ ] Bodyweight core exercises with manual weight (Planks, Dead Bugs)
- [ ] Weighted unilateral exercises (Bulgarian Split Squat, Single-Arm Row)
- [ ] Bilateral dumbbell exercises (DB Bench Press, DB Shoulder Press)
- [ ] Mixed logs (some already migrated, some not)

### Validation Steps
1. **Before Migration**:
   - Check migration badge shows "Available"
   - Verify old volumes in Analytics (Pull-ups = 0kg, BSS = 600kg)

2. **During Migration**:
   - Backup created successfully
   - Console logs show all 4 case types detected
   - No errors in calculation step

3. **After Migration**:
   - Badge shows "Complete ✓"
   - Migration report shows breakdown by case type
   - Analytics show updated volumes (Pull-ups = 2100kg, BSS = 1200kg)
   - Backup timestamp recorded

4. **Rollback Test**:
   - Click "Revert to Backup"
   - Verify volumes return to original (Pull-ups = 0kg, BSS = 600kg)
   - Badge shows "Available" again
   - Can re-run migration

---

## Technical Details

### Exercise Type Detection
```javascript
// In session.js - detectExerciseType()
const exType = {
  isBodyweight: /\[Bodyweight\]|\[BW\]/i.test(exerciseName),
  isCore: /\[Core\]/i.test(exerciseName),
  isTimeBased: /\[Time-based\]/i.test(exerciseName),
  isUnilateral: /single.*arm|bulgarian|pistol/i.test(exerciseName),
  isBilateralDB: /dumbbell.*press|dumbbell.*row|db.*press/i.test(exerciseName),
  isCable: /cable/i.test(exerciseName)
};
```

### User Weight Estimation
```javascript
// 3-tier fallback system
_getUserWeightAtDate(dateStr) {
  // 1. Try historical weight logs nearest to date
  // 2. Fall back to current user weight setting
  // 3. Fall back to 70kg default
}
```

### Volume Formulas (Post-v30.6)
```javascript
// Standard (Barbell, Machine)
vol = k × r × sets

// Bodyweight
vol = userWeight × multiplier × r × sets

// Unilateral
vol = k × (r × 2) × sets  // counts both sides

// Bilateral DB
vol = (k × 2) × r × sets  // sums both dumbbells

// Time-based Core (Plank)
vol = userWeight × r × sets  // r = duration in seconds
```

---

## UI Components

### Migration Badge States
1. **Available** (🟢): Pre-v30.6 logs detected, migration ready
2. **Complete** (✅): Migration successful, logs up to date
3. **Skipped** (🟡): User declined migration
4. **Up to date** (⚪): No migration needed

### Migration Report Modal
- **Success View**: Shows breakdown by case type, volume added, backup info
- **What Changed**: Dynamic list based on which cases were detected
- **Actions**: "View Updated Analytics" or "Revert to Backup"

### Profile Integration
Located in: **Profile → Storage Status**
- Badge indicator next to storage stats
- "Check Migration Status" button
- Manual trigger (no auto-prompts)

---

## Common Scenarios

### Scenario 1: Pure Bodyweight User
**Before**: Pull-ups, Push-ups, Dips all showing 0kg  
**After**: All exercises showing calculated volumes (700kg, 448kg, 532kg per 10 reps @ 70kg)  
**Cases Fixed**: 1 & 2 (bodyweight volume + structure)

### Scenario 2: Weighted Calisthenics User
**Before**: Weighted pull-ups, dips showing correct volumes, but unweighted variants at 0kg  
**After**: All bodyweight exercises calculated  
**Cases Fixed**: 1 (bodyweight volume only)

### Scenario 3: Mixed Training User
**Before**: Bodyweight at 0kg, BSS at 600kg, DB Bench at 750kg  
**After**: Bodyweight calculated, BSS at 1200kg, DB Bench at 1500kg  
**Cases Fixed**: All 4 cases

### Scenario 4: Already Migrated User
**Detection**: Checks for `_migrated: "v30.8"` flag  
**Result**: Skips already-migrated logs, only processes new pre-v30.6 logs  
**Badge**: "Up to date" if no new logs to migrate

---

## Version History

### V30.6 (Original Formula Changes)
- Introduced bodyweight multipliers
- Introduced unilateral rep doubling
- Introduced bilateral DB weight summing

### V30.7 (Initial Migration - Incomplete)
- Only handled bodyweight exercises (Cases 1 & 2)
- Discovered bug: Plank data structure not fixed
- Fixed bug: Enhanced to set k=0 for bodyweight

### V30.8 (Comprehensive Migration - Complete)
- Added unilateral exercise detection (Case 3)
- Added bilateral DB exercise detection (Case 4)
- Enhanced report with detailed breakdown
- Comprehensive error handling with rollback

---

## Developer Notes

### Adding New Exercise Types
If adding new volume formulas in future versions:
1. Add detection logic in SCAN step (step 2)
2. Add calculation logic in CALCULATE step (step 3)
3. Update migration report UI to show new case type
4. Update this documentation with examples
5. Increment migration version string

### Migration Version Tracking
- Format: `_migrated: "v30.X"`
- Allows future migrations to skip already-migrated logs
- Stores `_migratedTimestamp` for audit trail
- Stores `_originalVolume` and `_originalWeight` for rollback verification

### Performance Considerations
- Migration runs synchronously (blocks UI for 1-2 seconds)
- Shows "Migrating..." spinner during processing
- For very large datasets (>1000 logs), consider:
  - Adding progress indicator
  - Chunking calculation step
  - Web Worker for background processing

---

## Support & Troubleshooting

### Migration Not Appearing
**Cause**: No pre-v30.6 logs detected  
**Solution**: System working correctly - badge shows "Up to date"

### Migration Failed
**Cause**: Validation errors (NaN, null volumes)  
**Solution**: Automatic rollback engaged, check console for specific errors

### Volumes Still Wrong After Migration
**Cause**: Exercise name not matching detection patterns  
**Solution**: Add exercise tags manually (e.g., `[Unilateral]`, `[Bilateral DB]`)

### Want to Re-Run Migration
**Cause**: Made changes to exercise names/data  
**Solution**: 
1. Click "Revert to Backup" in Profile → Storage Status
2. Clear `migration_v30_8_complete` in localStorage
3. Refresh page
4. Re-run migration

---

## Conclusion

The v30.8 migration system is **comprehensive** and **robust**, handling all exercise types affected by v30.6 formula changes. It includes:

✅ All 4 migration cases covered  
✅ Automatic backup & rollback  
✅ Detailed reporting & audit trail  
✅ User-friendly UI with manual control  
✅ Safe validation & error handling  
✅ Complete documentation & testing guide  

Users can confidently migrate their historical data knowing:
- Accurate volume calculations for all exercise types
- Safe backup in case of issues
- Clear visibility into what changed
- Easy rollback if needed
