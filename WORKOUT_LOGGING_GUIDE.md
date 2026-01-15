# 📝 Workout Logging Guide (V30+)
## Complete Guide to Logging Weight, Reps, and RPE

**Last Updated:** January 15, 2026  
**App Version:** V30.8+

---

## 🎯 Quick Reference Table

| Exercise Type | Weight Input | Reps Input | Volume Formula | Example |
|--------------|--------------|------------|----------------|---------|
| **Standard** | ✅ Enter actual weight | ✅ Enter reps | `weight × reps` | 100kg × 10 = 1,000kg |
| **Bodyweight** | 🚫 Auto (hidden) | ✅ Enter reps | `bodyweight × multiplier × reps` | 70kg × 1.0 × 10 = 700kg |
| **Unilateral** | ✅ Enter weight per side | ✅ Enter reps per side | `weight × (reps × 2)` | 50kg × (10 × 2) = 1,000kg |
| **Bilateral DB** | ✅ Enter one DB weight | ✅ Enter reps | `(weight × 2) × reps` | 15kg × 2 × 10 = 300kg |
| **Time-Based** | ✅/🚫 Varies | ✅ Enter seconds | `N/A` | 60 seconds hold |

---

## 📚 DETAILED SCENARIOS

### 1️⃣ STANDARD EXERCISES (Barbell, Machine, Cable)

**Examples:** Barbell Back Squat, Bench Press, Leg Press, Cable Row

#### How to Log:
```
Set 1:  Weight: 100kg    Reps: 10    RPE: 7.5
Set 2:  Weight: 100kg    Reps: 10    RPE: 8.0
Set 3:  Weight: 100kg    Reps: 8     RPE: 9.0
```

#### What You'll See:
- **Weight Field:** Normal input box showing "kg"
- **Reps Field:** Enter total reps performed
- **Volume Counter:** Updates automatically (100 × 10 = 1,000kg per set)

#### ✅ Correct Entry:
```
Exercise: Barbell Back Squat
Set 1: 100kg × 10 reps → 1,000kg volume ✅
```

#### ❌ Common Mistakes:
- Don't enter "0" for weight (volume will be 0)
- Don't forget to check the "Done" box after completing the set

---

### 2️⃣ BODYWEIGHT EXERCISES (Calisthenics)

**Examples:** Pull-Up, Push-Up, Dip, Chin-Up, Pistol Squat

#### How to Log:
```
Set 1:  Weight: [HIDDEN - Auto]    Reps: 10    RPE: 7.5
Set 2:  Weight: [HIDDEN - Auto]    Reps: 8     RPE: 8.5
Set 3:  Weight: [HIDDEN - Auto]    Reps: 6     RPE: 9.0
```

#### What You'll See:
- **Weight Field:** Hidden (shows 🤸 BW badge instead)
- **Reps Field:** Enter reps performed
- **Volume Counter:** Auto-calculated using your body weight

#### Volume Calculation:
The app uses your profile weight and exercise-specific multipliers:
- **Pull-Up / Chin-Up:** 100% bodyweight (1.0)
- **Dip:** 76% bodyweight (0.76)
- **Push-Up:** 64% bodyweight (0.64)
- **Pistol Squat:** 100% bodyweight (1.0)
- **Nordic Curl:** 100% bodyweight (1.0)

#### Example (User weighs 70kg):
```
Exercise: [Bodyweight] Pull Up
Set 1: [Auto: 70kg] × 10 reps → 700kg volume ✅
Set 2: [Auto: 70kg] × 8 reps → 560kg volume ✅
Total Volume: 1,260kg
```

#### ✅ Correct Entry:
- Just enter reps - weight is automatic
- Update your body weight in Profile for accuracy

#### ❌ Common Mistakes:
- Don't try to enter weight manually (field is hidden)
- If using default 70kg, update your actual weight for accurate tracking

#### ⚠️ Important Notes:
- First-time users: Default weight is 70kg
- Update your weight: Profile → Body Weight → Save
- Historical data: If you logged bodyweight exercises before V30, run migration from Profile → Storage Status

---

### 3️⃣ UNILATERAL EXERCISES (Single Arm/Leg)

**Examples:** DB Single Arm Row, Lunges (any type), Split Squats, Single Leg Press, One Arm Cable Crossover

#### How to Log:
```
Set 1:  Weight: 50kg     Reps: 10    RPE: 7.5
        (per side)       (per side)
```

#### What You'll See:
- **Weight Field:** Enter weight for ONE side only
- **Reps Field:** Enter reps for ONE side
- **Volume Counter:** Automatically DOUBLES (counts both sides)

#### Volume Calculation:
```
Formula: weight × (reps × 2)
```

#### Example 1: DB Single Arm Row
```
You performed:
- Right arm: 50kg × 10 reps
- Left arm: 50kg × 10 reps

How to log:
Weight: 50kg
Reps: 10
Volume shown: 50 × (10 × 2) = 1,000kg ✅
```

#### Example 2: Walking Lunge [DB]
```
You performed:
- 10 steps right leg with 20kg DBs
- 10 steps left leg with 20kg DBs

How to log:
Weight: 20kg (one DB)
Reps: 10 (one leg)
Volume shown: 20 × (10 × 2) = 400kg ✅
```

#### Example 3: Bulgarian Split Squat [DB]
```
You performed:
- Right leg: 15kg DB × 12 reps
- Left leg: 15kg DB × 12 reps

How to log:
Weight: 15kg
Reps: 12
Volume shown: 15 × (12 × 2) = 360kg ✅
```

#### ✅ Correct Entry:
- Enter weight for ONE side only
- Enter reps for ONE side only
- System automatically counts both sides

#### ❌ Common Mistakes:
- ❌ Don't double the weight (e.g., 50kg + 50kg = 100kg)
- ❌ Don't double the reps (e.g., 10 + 10 = 20)
- ❌ Don't log each side separately (creates duplicate entries)

#### Recognized Unilateral Exercises:
- Exercises with `[Unilateral]` tag
- Exercises containing: "single arm", "one arm", "single leg", "one leg"
- All lunge variations: Forward Lunge, Walking Lunge, Reverse Lunge, etc.
- Split squats: Bulgarian Split Squat, Split Squat (Static), etc.
- Pistol Squats

---

### 4️⃣ BILATERAL DUMBBELL EXERCISES (Two Dumbbells)

**Examples:** DB Flat Press, DB Shoulder Press, DB Curl, DB Squat

#### How to Log:
```
Set 1:  Weight: 15kg     Reps: 10    RPE: 8.0
        (one DB)
```

#### What You'll See:
- **Weight Field:** Enter weight of ONE dumbbell
- **Reps Field:** Enter total reps
- **Volume Counter:** Automatically SUMS both DBs

#### Volume Calculation:
```
Formula: (weight × 2) × reps
```

#### Example 1: DB Flat Press
```
You performed:
- 15kg DB in left hand
- 15kg DB in right hand
- Pressed 10 reps

How to log:
Weight: 15kg (one DB)
Reps: 10
Volume shown: (15 × 2) × 10 = 300kg ✅
```

#### Example 2: DB Shoulder Press
```
You performed:
- 20kg per hand
- 8 reps

How to log:
Weight: 20kg
Reps: 8
Volume shown: (20 × 2) × 8 = 320kg ✅
```

#### Example 3: DB Goblet Squat
```
You performed:
- Holding one 24kg DB with both hands
- 12 reps

How to log:
Weight: 24kg
Reps: 12
Volume shown: 24 × 12 = 288kg (standard formula) ✅
Note: Only counted once since it's one DB
```

#### ✅ Correct Entry:
- Enter weight of ONE dumbbell
- System automatically counts both DBs
- Don't add them yourself

#### ❌ Common Mistakes:
- ❌ Don't add both DBs (e.g., 15kg + 15kg = 30kg)
- ❌ Don't log as unilateral (creates wrong calculation)

#### Recognized Bilateral DB Exercises:
- Exercises with `[DB]` tag that are NOT unilateral
- Examples: DB Flat Press, DB Incline Press, DB Shoulder Press
- NOT lunges or split squats (these are unilateral)

---

### 5️⃣ TIME-BASED EXERCISES (Isometric Holds)

**Examples:** Plank, Dead Bug, Wall Sit, Hollow Body Hold

#### How to Log:
```
Set 1:  Weight: N/A      Reps: 60    RPE: 7.5
                         (seconds)
```

#### What You'll See:
- **Weight Field:** Usually not needed (enter 0 or leave empty)
- **Reps Field:** Placeholder shows "45" (enter seconds held)
- **Volume Counter:** No volume calculated (time-based)

#### Example 1: Plank
```
You performed:
- Held plank for 60 seconds

How to log:
Weight: 0 (or leave empty)
Reps: 60 (seconds)
RPE: 7.5
Volume: N/A (time-based exercise)
```

#### Example 2: [Core] Dead Bug
```
You performed:
- Dead bug pattern for 45 seconds

How to log:
Weight: 0
Reps: 45
RPE: 8.0
```

#### ✅ Correct Entry:
- Enter time in seconds in the "Reps" field
- Weight usually not needed (enter 0)
- Focus on RPE for intensity tracking

#### ❌ Common Mistakes:
- Don't enter minutes (convert to seconds: 1min = 60sec)
- Don't worry about volume (not calculated for holds)

---

## 🎨 VISUAL GUIDE: UI Differences

### Standard Exercise UI:
```
Set 1:
[1] [  100kg  ] [ 10 ] [RPE▼] [✓]
    Weight(kg)  Reps   RPE    Done
```

### Bodyweight Exercise UI:
```
Set 1:
[1] [  🤸 BW  ] [ 10 ] [RPE▼] [✓]
    (Hidden)    Reps   RPE    Done
```

### Visual Indicators:
- **Standard:** Normal weight input box
- **Bodyweight:** Purple badge "🤸 BW" replaces weight input
- **Volume Counter:** Updates in real-time as you enter data

---

## 🔄 RPE (Rate of Perceived Exertion) Guide

### How to Log RPE:
Every set should have an RPE rating from 6.0 to 10.0

| RPE | Meaning | Color | When to Use |
|-----|---------|-------|-------------|
| **6.0-7.0** | Easy, could do many more | 🟡 Yellow | Warm-up, technique work |
| **7.5-8.5** | Moderate, 2-4 reps left | 🟢 Green | Most working sets |
| **9.0-9.5** | Hard, 1-2 reps left | 🟢 Green | Near-max effort |
| **10.0** | Maximum, absolute limit | 🔴 Red | True failure |

### ⚠️ High RPE Warning:
If you log 5+ sets with RPE ≥ 9.0 in one week, the app will recommend a deload.

---

## 📊 VOLUME TRACKING

### How Volume is Calculated:

#### Standard Exercises:
```
Volume = Weight × Reps
Example: 100kg × 10 = 1,000kg
```

#### Bodyweight Exercises:
```
Volume = Body Weight × Multiplier × Reps
Example: 70kg × 1.0 × 10 = 700kg (Pull-Up)
Example: 70kg × 0.64 × 10 = 448kg (Push-Up)
```

#### Unilateral Exercises:
```
Volume = Weight × (Reps × 2)
Example: 50kg × (10 × 2) = 1,000kg
Reason: Counts both sides
```

#### Bilateral DB Exercises:
```
Volume = (Weight × 2) × Reps
Example: (15kg × 2) × 10 = 300kg
Reason: Sums both dumbbells
```

### Volume Counter Display:
- **During Workout:** Updates in real-time in the volume counter
- **After Workout:** Total volume shown in workout summary
- **Analytics:** Weekly/monthly volume tracked in dashboard

---

## 🔧 SMART AUTO-FILL FEATURE

### What It Does:
Automatically fills all sets based on your previous workout performance.

### How to Use:
1. Click **"Fill All"** button on exercise card
2. System loads your last performance for that exercise
3. Reviews all fields (weight, reps, RPE)
4. Adjust if needed
5. Check "Done" box as you complete each set

### Smart Features:
- Remembers last weight used
- Suggests progressive overload (slightly more than last time)
- Fills RPE based on your typical rating
- Works with exercise history

---

## 📱 WORKFLOW EXAMPLES

### Example 1: Standard Workout (Chest Day)

**Exercise 1: Barbell Bench Press**
```
Set 1: 100kg × 10 → RPE 7.5 → ✓ Done
Set 2: 100kg × 10 → RPE 8.0 → ✓ Done
Set 3: 100kg × 8  → RPE 9.0 → ✓ Done
Total Volume: 2,800kg
```

**Exercise 2: DB Flat Press**
```
Set 1: 15kg × 10 → RPE 7.5 → ✓ Done (volume: 300kg)
Set 2: 15kg × 10 → RPE 8.0 → ✓ Done (volume: 300kg)
Set 3: 15kg × 10 → RPE 8.5 → ✓ Done (volume: 300kg)
Total Volume: 900kg (automatically summed both DBs)
```

**Exercise 3: [Bodyweight] Dip**
```
Set 1: [Auto 70kg] × 10 → RPE 8.0 → ✓ Done (volume: 532kg)
Set 2: [Auto 70kg] × 8  → RPE 8.5 → ✓ Done (volume: 426kg)
Set 3: [Auto 70kg] × 6  → RPE 9.0 → ✓ Done (volume: 319kg)
Total Volume: 1,277kg (70kg × 0.76 multiplier)
```

---

### Example 2: Lower Body (Leg Day)

**Exercise 1: Barbell Back Squat**
```
Set 1: 100kg × 10 → RPE 7.5 → ✓ Done
Set 2: 100kg × 10 → RPE 8.0 → ✓ Done
Set 3: 100kg × 10 → RPE 8.5 → ✓ Done
Total Volume: 3,000kg
```

**Exercise 2: Walking Lunge [DB]**
```
Set 1: 20kg × 10 → RPE 7.5 → ✓ Done (volume: 400kg - counted both legs)
Set 2: 20kg × 10 → RPE 8.0 → ✓ Done (volume: 400kg)
Total Volume: 800kg
Note: Enter 10 reps = 10 reps per leg (20 total steps)
```

**Exercise 3: Bulgarian Split Squat [DB]**
```
Set 1: 15kg × 12 → RPE 8.0 → ✓ Done (volume: 360kg - counted both legs)
Set 2: 15kg × 12 → RPE 8.5 → ✓ Done (volume: 360kg)
Total Volume: 720kg
Note: Enter weight of ONE dumbbell, reps for ONE leg
```

---

### Example 3: Pull Day with Bodyweight

**Exercise 1: [Bodyweight] Pull Up** (User: 70kg)
```
Set 1: [Auto] × 10 → RPE 7.5 → ✓ Done (volume: 700kg)
Set 2: [Auto] × 8  → RPE 8.5 → ✓ Done (volume: 560kg)
Set 3: [Auto] × 6  → RPE 9.0 → ✓ Done (volume: 420kg)
Total Volume: 1,680kg
```

**Exercise 2: [DB] Single Arm Row**
```
Set 1: 50kg × 10 → RPE 7.5 → ✓ Done (volume: 1,000kg - both arms)
Set 2: 50kg × 10 → RPE 8.0 → ✓ Done (volume: 1,000kg)
Total Volume: 2,000kg
```

**Exercise 3: [Machine] Lat Pulldown**
```
Set 1: 80kg × 12 → RPE 7.5 → ✓ Done
Set 2: 80kg × 10 → RPE 8.5 → ✓ Done
Total Volume: 1,760kg
```

---

## ⚠️ COMMON MISTAKES & FIXES

### Mistake 1: Doubling Unilateral Weights
❌ **WRONG:**
```
DB Single Arm Row: 100kg × 10 (thinking: 50kg per arm)
Result: 2,000kg volume (incorrect!)
```

✅ **CORRECT:**
```
DB Single Arm Row: 50kg × 10 (one arm)
Result: 1,000kg volume (system doubles it)
```

---

### Mistake 2: Adding Both Dumbbells
❌ **WRONG:**
```
DB Flat Press: 30kg × 10 (thinking: 15kg + 15kg)
Result: 300kg volume (incorrect!)
```

✅ **CORRECT:**
```
DB Flat Press: 15kg × 10 (one DB)
Result: 300kg volume (system sums both)
```

---

### Mistake 3: Bodyweight with Manual Weight
❌ **WRONG:**
```
Pull-Up: 70kg × 10 (trying to enter body weight)
Result: Can't - field is hidden!
```

✅ **CORRECT:**
```
Pull-Up: [Auto] × 10
Result: 700kg volume (uses profile weight)
```

**How to Fix:**
- Update body weight in Profile → Body Weight
- Don't try to enter weight manually for bodyweight exercises

---

### Mistake 4: Logging Both Sides Separately
❌ **WRONG:**
```
Set 1: Right arm row - 50kg × 10
Set 2: Left arm row - 50kg × 10
Result: Looks like 2 sets instead of 1
```

✅ **CORRECT:**
```
Set 1: Single arm row - 50kg × 10
Result: 1,000kg (system counts both sides)
```

---

### Mistake 5: Time in Minutes Instead of Seconds
❌ **WRONG:**
```
Plank: 1 minute → Enter "1" in reps field
Result: 1 second hold (incorrect!)
```

✅ **CORRECT:**
```
Plank: 1 minute → Enter "60" in reps field
Result: 60 second hold (correct!)
```

---

## 🔄 MIGRATION NOTICE (V30.8)

### If You Have Historical Data Before V30:

The app will prompt you to migrate old workout data to use the new volume formulas.

#### What Gets Migrated:
1. **Bodyweight exercises** - Recalculated using body weight multipliers
2. **Bodyweight structure** - Cleaned up weight fields (set to 0)
3. **Unilateral exercises** - Volume doubled to count both sides
4. **Bilateral DB exercises** - Volume summed to count both DBs

#### How to Migrate:
1. Go to **Profile → Storage Status**
2. If migration is needed, you'll see a prompt with details
3. Click **"Migrate Now"**
4. System backs up data, recalculates volumes, verifies changes
5. Review changes and confirm

#### What to Expect:
- **Bodyweight volumes:** Will show realistic values (not 0)
- **Unilateral volumes:** Will double (counts both sides now)
- **Bilateral DB volumes:** Will increase (sums both DBs)
- **Historical analytics:** Will show accurate muscle group ratios

#### Safety Features:
- Automatic backup before migration
- Rollback available if issues occur
- Verification step to review changes
- No data loss

---

## 📈 ANALYTICS INTERPRETATION

### Volume Tracking:
After logging your workouts, check **Analytics** to see:

- **Total Weekly Volume:** Sum of all exercises
- **Volume by Muscle Group:** Push/Pull/Legs breakdown
- **Bodyweight Contribution:** Percentage from bodyweight exercises
- **Training Balance:** Bilateral vs Unilateral ratio

### What Good Balance Looks Like:
- **Push/Pull Ratio:** 0.7-1.2 (optimal)
- **Horizontal/Vertical:** 0.8-1.2 for both push and pull
- **Quad/Hams Ratio:** 0.6-0.8 (optimal)
- **Unilateral Volume:** ≥15% of total

### Clinical Insights:
The app will alert you if:
- 🚨 Push/Pull ratio is imbalanced (injury risk)
- 🚨 Quad/Hams ratio is off (ACL risk)
- ⚠️ Too many high-RPE sets (overtraining)
- ⚠️ Low unilateral volume (stability concerns)

---

## 🎯 BEST PRACTICES

### 1. Update Your Body Weight Regularly
- Go to **Profile → Body Weight**
- Update weekly or bi-weekly
- Critical for accurate bodyweight exercise volume

### 2. Use RPE Consistently
- Rate every set immediately after completing
- Be honest about effort level
- Use color coding as guide (yellow/green/red)

### 3. Check the "Done" Box
- Mark sets complete as you finish them
- Helps track progress during workout
- Ensures accurate volume counter

### 4. Use Smart Auto-Fill
- Saves time entering data
- Based on your actual history
- Suggests progressive overload

### 5. Review Analytics Weekly
- Check for imbalances
- Monitor volume trends
- Address clinical warnings

### 6. Trust the System
- Let it handle volume calculations
- Don't manually double anything
- Enter data as performed (one side, one DB)

---

## 🆘 TROUBLESHOOTING

### Q: Volume counter shows 0
**A:** Check if you entered weight and reps. For bodyweight exercises, make sure your profile weight is set.

### Q: Can't enter weight for Pull-Ups
**A:** Correct! Weight is auto-calculated. If you use added weight, log as "Weighted Pull-Up" instead.

### Q: Unilateral volume seems doubled
**A:** It's correct! System counts both sides. Enter data for one side only.

### Q: DB exercise volume seems high
**A:** If it's bilateral (both hands), volume sums both DBs. This is intentional and accurate.

### Q: Old workouts show wrong volumes
**A:** Run migration from Profile → Storage Status to fix historical data.

### Q: RPE dropdown is empty
**A:** Bug or loading issue. Refresh the page. RPE should show 6.0-10.0 in 0.5 increments.

### Q: Volume counter not updating
**A:** Make sure you're entering numbers (not text). Check that exercise is recognized.

---

## 📞 NEED HELP?

### In-App Help:
- **AI Consultation:** Analytics → AI Insights
- **Exercise Info:** Click exercise name for bio/notes
- **Clinical Warnings:** Read and follow safety recommendations

### Documentation:
- **Architecture:** See `ARCHITECTURE.md`
- **Exercise Library:** See `EXERCISE_LIBRARY_GUIDE.md`
- **Scientific Basis:** See `SCIENTIFIC_BASIS.md`

---

## ✅ QUICK CHECKLIST

Before each workout:
- [ ] Profile weight is up to date
- [ ] Know which exercises are bodyweight/unilateral/bilateral
- [ ] Understand volume will auto-calculate

During workout:
- [ ] Enter data as performed (one side, one DB)
- [ ] Rate RPE for every set
- [ ] Check "Done" box after completing sets
- [ ] Watch volume counter update

After workout:
- [ ] Review total volume
- [ ] Check analytics for insights
- [ ] Address any clinical warnings
- [ ] Plan next session based on data

---

**Happy Training! 💪**

*Remember: The system handles all calculations. Just log your actual performance and let the app do the math!*
