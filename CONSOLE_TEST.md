# 🧪 Console Testing Guide - Phase 1

## Quick Test in Browser Console

Open the app in your browser, then open DevTools Console (F12) and run these tests:

### **Test 1: Bodyweight Exercise**
```javascript
APP.session.detectExerciseType("[Bodyweight] Pull Up")
// Expected: { isBodyweight: true, isCore: false, isTimeBased: false, isUnilateral: false, isBilateralDB: false, needsSideTracking: false }
```

### **Test 2: Core + Time-Based**
```javascript
APP.session.detectExerciseType("[Bodyweight] Plank")
// Expected: { isBodyweight: true, isCore: true, isTimeBased: true, isUnilateral: false, isBilateralDB: false, needsSideTracking: false }
```

### **Test 3: Unilateral (needs tracking)**
```javascript
APP.session.detectExerciseType("[DB] Single Arm Row")
// Expected: { isBodyweight: false, isCore: false, isTimeBased: false, isUnilateral: true, isBilateralDB: false, needsSideTracking: true }
```

### **Test 4: Bilateral Dumbbell**
```javascript
APP.session.detectExerciseType("[DB] Flat Press")
// Expected: { isBodyweight: false, isCore: false, isTimeBased: false, isUnilateral: false, isBilateralDB: true, needsSideTracking: false }
```

### **Test 5: Standard Exercise (no special handling)**
```javascript
APP.session.detectExerciseType("[Barbell] Bench Press")
// Expected: All false
```

### **Test 6: Edge Cases**
```javascript
APP.session.detectExerciseType("")
APP.session.detectExerciseType(null)
APP.session.detectExerciseType(undefined)
// Expected: All should return all false (safe handling)
```

---

## Batch Test (Copy-Paste All at Once)

```javascript
// Run all tests at once
const tests = [
  { name: "[Bodyweight] Pull Up", expect: "bodyweight" },
  { name: "[Bodyweight] Plank", expect: "bodyweight + core + time" },
  { name: "[DB] Single Arm Row", expect: "unilateral + tracking" },
  { name: "[DB] Flat Press", expect: "bilateral DB" },
  { name: "[Barbell] Bench Press", expect: "standard (no flags)" },
  { name: "[Bodyweight] Bulgarian Split Squat", expect: "bodyweight + unilateral + tracking" }
];

tests.forEach(test => {
  console.log("\n🧪 Testing:", test.name);
  console.log("Expected:", test.expect);
  const result = APP.session.detectExerciseType(test.name);
  console.log("Result:", result);
  
  // Visual indicator
  const flags = Object.entries(result).filter(([k,v]) => v).map(([k]) => k);
  console.log("✅ Active flags:", flags.length > 0 ? flags.join(", ") : "none");
});
```

---

## Expected Console Output

```
🧪 Testing: [Bodyweight] Pull Up
Expected: bodyweight
Result: {isBodyweight: true, isCore: false, isTimeBased: false, isUnilateral: false, isBilateralDB: false, needsSideTracking: false}
✅ Active flags: isBodyweight

🧪 Testing: [Bodyweight] Plank
Expected: bodyweight + core + time
Result: {isBodyweight: true, isCore: true, isTimeBased: true, isUnilateral: false, isBilateralDB: false, needsSideTracking: false}
✅ Active flags: isBodyweight, isCore, isTimeBased

🧪 Testing: [DB] Single Arm Row
Expected: unilateral + tracking
Result: {isBodyweight: false, isCore: false, isTimeBased: false, isUnilateral: true, isBilateralDB: false, needsSideTracking: true}
✅ Active flags: isUnilateral, needsSideTracking

🧪 Testing: [DB] Flat Press
Expected: bilateral DB
Result: {isBodyweight: false, isCore: false, isTimeBased: false, isUnilateral: false, isBilateralDB: true, needsSideTracking: false}
✅ Active flags: isBilateralDB

🧪 Testing: [Barbell] Bench Press
Expected: standard (no flags)
Result: {isBodyweight: false, isCore: false, isTimeBased: false, isUnilateral: false, isBilateralDB: false, needsSideTracking: false}
✅ Active flags: none

🧪 Testing: [Bodyweight] Bulgarian Split Squat
Expected: bodyweight + unilateral + tracking
Result: {isBodyweight: true, isCore: false, isTimeBased: false, isUnilateral: true, isBilateralDB: false, needsSideTracking: true}
✅ Active flags: isBodyweight, isUnilateral, needsSideTracking
```

---

## Verification Checklist

- [ ] Function exists: `typeof APP.session.detectExerciseType === 'function'`
- [ ] Returns object with 6 properties
- [ ] Bodyweight detection works
- [ ] Core detection works
- [ ] Time-based detection works
- [ ] Unilateral detection works
- [ ] Bilateral DB detection works
- [ ] Side tracking flag works for unilateral
- [ ] Edge cases return all false
- [ ] No errors in console

---

## If Tests Pass

✅ **Phase 1 is working correctly!**

You can now:
1. Test on mobile device (responsive check)
2. Verify no impact on existing features
3. Check no console errors during normal app usage
4. Approve Phase 2A (UI integration)

---

## If Tests Fail

Check:
1. Is session.js loaded? `console.log(APP.session)`
2. Any console errors? (red messages)
3. Browser cache cleared? (Ctrl+Shift+R)
4. Correct branch? `v30.6-experimental`

Report the error output and we'll debug!
