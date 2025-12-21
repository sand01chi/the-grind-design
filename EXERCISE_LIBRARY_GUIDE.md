# 📚 Exercise Library Integration Guide

## Overview
Exercise Library telah terintegrasi dengan THE GRIND DESIGN untuk memudahkan penambahan gerakan latihan dengan template yang lengkap dan konsisten.

## Fitur Utama

### 1. **Tambah Gerakan Baru dari Library**
- Klik tombol **"Tambah Gerakan Baru"** di workout view
- Modal Exercise Library akan terbuka
- Pilih exercise dari library atau gunakan search
- Exercise langsung ditambahkan dengan:
  - ✅ Nama gerakan (dengan tag DB/Barbell/Machine/Cable/Bodyweight/Stretch)
  - ✅ Target reps/waktu
  - ✅ Deskripsi biomechanics
  - ✅ Catatan khusus (jika ada)

### 2. **Tambah Variant/Alternatif Exercise**
- Pada exercise card yang sudah ada, klik tombol **"+" (plus)**
- Modal Exercise Library terbuka
- Pilih exercise untuk ditambahkan sebagai alternatif
- Variant baru tersimpan otomatis dengan dropdown selector

### 3. **Filter & Pencarian**
- **Kategori:** Pilih dari 10+ kategori (chest, back, shoulders, arms, legs, core, cardio, stretching, compound)
- **Search:** Cari exercise dengan nama/keyword
- Kombinasi filter + search untuk hasil yang lebih presisi

### 4. **Automatic Plate Calculator Detection**
Library menggunakan standar tagging yang kompatibel dengan plate calculator:

| Tag | Tipe | Plate Calc |
|-----|------|-----------|
| `[Barbell]` | Barbell | ✅ Barbell Protocol (20kg bar) |
| `[Machine]` | Plate-loaded | ✅ Plate Loaded (0kg base) |
| `[DB]` | Dumbbell | ❌ Standard (no plates) |
| `[Cable]` | Cable machine | ❌ Standard |
| `[Bodyweight]` | Bodyweight | ❌ Standard |
| `[Stretch]` | Stretching | ❌ Standard |

**Contoh:**
- `[Barbell] Squat` → Akan menghitung plate per side saat warmup
- `[Machine] Leg Press` → Akan menghitung plate untuk plate-loaded press
- `[DB] Dumbbell Curl` → Tidak ada plate calculation (single/pair dumbbell)

## Library Structure

### 10 Kategori Exercise
1. **Chest** - 7 gerakan (Press, Fly, dll)
2. **Back** - 7 gerakan (Deadlift, Row, Pulldown, dll)
3. **Shoulders** - 7 gerakan (OHP, Lateral Raise, dll)
4. **Arms** - 8 gerakan (Curl, Tricep Extension, dll)
5. **Legs** - 10 gerakan (Squat, Leg Press, Extension, dll)
6. **Core** - 6 gerakan (Plank, Deadbug, Crunch, dll)
7. **Cardio** - 5 gerakan (Jumping Jacks, Burpees, Treadmill, dll)
8. **Stretching** - 6 gerakan (Cat-Cow, Child Pose, dll)
9. **Compound** - 5 gerakan (Bench Press, Deadlift, Squat, Row, OHP)

### Exercise Template Format
```javascript
{
  n: "[TAG] Exercise Name",      // Name dengan tag
  t_r: "10-12",                 // Target reps atau waktu
  bio: "Deskripsi teknik",      // Biomechanics & instruksi
  note: "Fokus area" (optional) // Catatan tambahan
}
```

## File Structure

```
the-grind-design/
├── index.html                 # Main app dengan Exercise Picker UI
├── exercises-library.js       # Library dengan 100+ template exercise
└── EXERCISE_LIBRARY_GUIDE.md  # Dokumentasi ini
```

## Menggunakan Library Programmatically

### Search Exercise
```javascript
const results = EXERCISES_LIBRARY.searchExercise('press');
// Returns array of exercises yang namanya contain 'press'
```

### Get Category
```javascript
const chestExercises = EXERCISES_LIBRARY.getExerciseByCategory('chest');
// Returns array dari semua exercise di chest category
```

### Get All Categories
```javascript
const categories = EXERCISES_LIBRARY.getCategories();
// Returns ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'stretching', 'compound']
```

### Create Custom Exercise
```javascript
const newExercise = EXERCISES_LIBRARY.createExercise(
  "[DB] Custom Exercise",
  "8-12",
  "Deskripsi biomechanic",
  "Catatan khusus"
);
```

## UI Flow Diagram

### Tambah Gerakan Baru
```
"Tambah Gerakan Baru" Button
         ↓
Exercise Picker Modal (opens)
         ↓
[Select Category] → [Search] → [Pick Exercise]
         ↓
New Exercise Card Added
         ↓
Auto-populate: name, reps, bio, note
         ↓
Ready to log sets & weights
```

### Tambah Variant
```
Exercise Card → Click "+" Button
         ↓
Exercise Picker Modal (opens)
         ↓
[Select Category] → [Search] → [Pick Exercise]
         ↓
Variant Added to Dropdown
         ↓
User can switch between variants
```

## Key Features

✅ **Fast Selection**: 100+ exercises dengan kategori dan search
✅ **Consistent Format**: Semua exercise punya struktur yang sama
✅ **Auto-Detection**: Tag otomatis mendeteksi tipe beban untuk plate calculator
✅ **Rich Bio Data**: Setiap exercise punya deskripsi teknik lengkap
✅ **Notes & Tips**: Catatan khusus untuk setiap exercise
✅ **Easy Extension**: Bisa menambah exercise baru ke library dengan mudah

## Menambah Exercise Baru ke Library

1. Buka `exercises-library.js`
2. Pilih kategori yang sesuai
3. Tambahkan object baru dalam array kategori:

```javascript
{
  n: "[Barbell] New Exercise",
  t_r: "8-10",
  bio: "Deskripsi teknik dan biomechanics...",
  note: "Catatan tambahan (opsional)"
}
```

4. Pastikan format sesuai dengan standar
5. Save & reload app - exercise baru langsung tersedia

## Troubleshooting

### Exercise Picker Modal Tidak Muncul
- Pastikan `exercises-library.js` sudah di-load (check browser console)
- Pastikan `EXERCISES_LIBRARY` object ada dan valid
- Check browser console untuk error messages

### Plate Calculator Tidak Bekerja
- Pastikan exercise name menggunakan tag yang benar `[Barbell]` atau `[Machine]`
- Tag harus di dalam bracket `[ ]`
- Check nama exercise di history untuk validasi

### Library Kosong / Tidak Ada Exercise
- Refresh page (Ctrl+F5)
- Check network tab untuk pastikan `exercises-library.js` loaded
- Check browser console untuk error

## Contact & Support
Untuk menambah exercise atau improvement, update `exercises-library.js` dan commit ke repository.
