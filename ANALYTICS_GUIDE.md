# V29.0 ADVANCED ANALYTICS - USER GUIDE

**Quick Reference for Clinical Analytics Dashboard**

---

## 📊 WHAT IS ADVANCED ANALYTICS?

V29.0 adds evidence-based injury prevention and training optimization to THE GRIND DESIGN. The analytics automatically detect imbalances and provide actionable recommendations based on your actual training data.

**Located in:** Clinical Analytics (Klinik mode) → Scroll to "Advanced Analytics" section

---

## 🎯 RATIO CARDS

### **🦵 Quad/Hamstring Balance**

**What it shows:** Ratio of hamstring volume to quad volume
**Target:** 0.6 - 0.8 (hamstrings should be 60-80% of quad strength)

**Color Guide:**
- 🚨 **Red (Danger):** Severe imbalance - immediate attention needed
- ⚠️ **Yellow (Warning):** Moderate imbalance - monitor closely
- ✅ **Green (Optimal):** Well-balanced - maintain current approach

**Why it matters:** Prevents ACL injuries and anterior knee instability

**How to interpret:**
```
Ratio 0.45 (Red) → Too quad-dominant → Add hamstring exercises
Ratio 0.72 (Green) → Optimal balance → Maintain current training
Ratio 1.15 (Red) → Too hamstring-dominant → Add quad exercises
```

---

### **⚖️ Push/Pull Balance**

**What it shows:** Ratio of pull volume to push volume
**Target:** 1.0 - 1.2 (pull should equal or slightly exceed push)

**Breakdown:**
- **Total:** Overall upper + lower body balance
- **Upper:** Chest/shoulders vs back (collapsible)
- **Lower:** Quads vs hamstrings (collapsible)

**Why it matters:** Prevents shoulder impingement and maintains posture

**How to interpret:**
```
Ratio 0.75 (Red) → Too push-heavy → Add back/pull exercises
Ratio 1.08 (Green) → Optimal balance → Maintain current training
Ratio 1.52 (Red) → Too pull-heavy → Add chest/shoulder exercises
```

---

### **💪 Core Training**

**What it shows:** Weekly core training volume
**Target:** 15-25 sets/week

**Metrics:**
- Weekly sets (your average)
- Frequency (days per week)
- Variety (number of exercises)

**Why it matters:** Spine health, athletic performance, force transfer

**How to interpret:**
```
8 sets/week (Red) → Severely inadequate → Add 3-4 core exercises/session
18 sets/week (Green) → Optimal volume → Maintain frequency
32 sets/week (Yellow) → Excessive volume → Consider reducing
```

---

### **🤸 Bodyweight Contribution**

**What it shows:** Percentage of training volume from bodyweight exercises
**Insight:** How calisthenics-focused your training is

**Categories:**
- **<15%:** Minimal bodyweight training (equipment-focused)
- **15-30%:** Balanced mix (optimal for most)
- **>30%:** Calisthenics-focused training

**Why it matters:** Ensures progressive overload strategy appropriate for training style

**⚠️ Note:** If you see "Using default 70kg weight" → Update your profile weight for accurate calculations

---

## 💡 CLINICAL INSIGHTS

### **How Insights Work**

The system analyzes your last 30 days of training and generates 3-7 evidence-based insights, prioritized by urgency.

**Priority Order:**
1. 🚨 **Danger** (Red) → Immediate injury risk - act now
2. ⚠️ **Warning** (Yellow) → Imbalance detected - monitor/adjust
3. ℹ️ **Info** (Blue) → Optimization tips - consider when ready
4. ✅ **Success** (Green) → Doing well - maintain approach

---

### **Understanding Insight Cards**

Each insight contains:
- **Title:** What the issue/success is
- **Metrics:** Specific numbers from your data
- **Risk:** What could happen (danger/warning only)
- **Action:** Exactly what to do
- **Evidence:** Scientific source (click to see full citation)

---

### **Common Insights**

#### **🚨 Severe Quad Dominance**
```
Metrics: Quad/Hams Ratio 1.42 (Target: 0.6-0.8)
Risk: High ACL Injury Risk
Action: Immediate: Add 2-3 hamstring exercises per week
Evidence: Croisier et al. (2008)
```
**What to do:** Add Romanian Deadlifts, Leg Curls, Nordic Curls

---

#### **⚠️ Push/Pull Slightly Imbalanced**
```
Metrics: Ratio 0.88 (Target: 1.0-1.2)
Risk: Shoulder Posture Concerns
Action: Increase pull volume - Add 1-2 back exercises per week
Evidence: NSCA Guidelines
```
**What to do:** Add Rows, Face Pulls, or Pull-Up variations

---

#### **✅ Optimal Quad/Hamstring Balance**
```
Metrics: Ratio 0.71
Action: Maintain current balance
Evidence: Croisier et al. (2008)
```
**What to do:** Keep doing what you're doing!

---

## 🔍 SCIENTIFIC TOOLTIPS

### **How to Use**

Click the ℹ️ icon on any ratio card or evidence link on insight cards to see:
- Full scientific source
- Research findings
- Why the threshold matters

**Example:**
```
Click ℹ️ on Quad/Hams card →

Quad/Hamstring Ratio
Optimal ratio: 0.6-0.8 (hamstrings should be 60-80% of quad strength).
Prevents ACL injuries and anterior knee instability.
Source: Croisier et al. (2008)
```

---

## 📱 MOBILE TIPS

- **Cards stack vertically** - Scroll to see all 4 ratios
- **Tap ℹ️ icons** - Works same as desktop
- **Expand breakdowns** - Tap "View Upper/Lower Breakdown" on Push/Pull card
- **Tooltips** - Tap evidence links to view citations

---

## ⚠️ IMPORTANT NOTES

### **Data Requirements**

For accurate insights:
- ✅ **Log 3+ workouts** in analysis period (30 days default)
- ✅ **Update profile weight** (or bodyweight exercises use 70kg estimate)
- ✅ **Use canonical exercise names** (app auto-corrects most variations)

### **Limitations**

- **30-day window:** Recent training only (may miss long-term trends)
- **Volume-based:** Doesn't account for exercise velocity or power
- **Assumes form:** Cannot detect execution quality
- **Averages:** Individual biomechanics vary

### **Not a Substitute**

These analytics are tools, not medical advice. For injury prevention or rehabilitation:
- Consult sports medicine professional
- Consider individual factors (injury history, goals, recovery)
- Use analytics as one input in decision-making

---

## 🎓 LEARN MORE

**Scientific Basis:** See `SCIENTIFIC_BASIS.md` for complete methodology
**Technical Details:** See `ARCHITECTURE.md` for system design
**Bug Reports:** GitHub issues

---

**Last Updated:** V29.0 (2026-01-03)
**Questions?** Reference SCIENTIFIC_BASIS.md or consult documentation
