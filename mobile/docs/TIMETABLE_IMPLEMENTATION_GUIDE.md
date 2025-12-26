# Timetable Implementation Guide - I MSc CS

## 📋 Overview

This guide explains how to use the structured timetable data for the **I MSc CS** class in your PUDoCS mobile app.

---

## 📁 Files Created

### 1. **Database JSON** (`data/timetables/I_MSc_CS_Timetable.json`)
- **Purpose**: Direct Firestore database storage
- **Format**: Matches your app's timetable schema
- **Use Case**: Seed database, API responses, data migration

### 2. **Human-Readable Format** (`data/timetables/I_MSc_CS_Timetable_Readable.txt`)
- **Purpose**: Documentation and user-friendly display
- **Format**: Plain text with formatted layout
- **Use Case**: Reference, printing, email notifications

### 3. **UI Format Dataset** (`data/timetables/I_MSc_CS_Timetable_UI_Format.js`)
- **Purpose**: React Native component integration
- **Format**: JavaScript module with colors and metadata
- **Use Case**: Direct import in timetable screens

### 4. **Color Utilities** (`utils/timetableColors.js`)
- **Purpose**: Consistent color mapping for subjects
- **Format**: Utility functions
- **Use Case**: UI theming, subject identification

### 5. **Database Seeder** (`utils/seedTimetable.js`)
- **Purpose**: One-time database population
- **Format**: Firestore seeding function
- **Use Case**: Initial setup, data migration

---

## 🚀 Quick Start

### Step 1: Seed Database

```javascript
import { seedI_MSc_CS_Timetable } from '../utils/seedTimetable';

// Run once to populate Firestore
await seedI_MSc_CS_Timetable();
```

### Step 2: Use in Timetable Screen

```javascript
import { 
    WEEKLY_TIMETABLE_UI, 
    getDaySchedule, 
    SUBJECTS_META 
} from '../data/timetables/I_MSc_CS_Timetable_UI_Format';

// Get Monday's schedule
const mondaySchedule = getDaySchedule('Monday');

// Get subject details
const subject = SUBJECTS_META['CSSC 422'];
// Returns: { code, name, shortName, type, faculty, color, bgColor }
```

### Step 3: Display with Colors

```javascript
import { getSubjectColor, getSubjectBgColor } from '../utils/timetableColors';

// In your component
<View style={{ backgroundColor: getSubjectBgColor('CSSC 422') }}>
    <Text style={{ color: getSubjectColor('CSSC 422') }}>
        Advanced Database Systems
    </Text>
</View>
```

---

## 📊 Data Structure

### Database Format (Firestore)

```javascript
{
  program: "M.Sc. Computer Science",
  year: "I",
  class: "I MSc CS",
  room: "SH310 - II Floor",
  schedule: [
    {
      day: "Monday",
      slots: [
        {
          startTime: "09:30 AM",
          endTime: "10:30 AM",
          subject: "Advanced Database Systems",
          subjectCode: "CSSC 422",
          type: "Hardcore",
          faculty: { name: "Dr Sukhvinder Singh" },
          room: "SH310"
        }
        // ... more slots
      ]
    }
    // ... more days
  ],
  subjects: [
    {
      code: "CSSC 422",
      name: "Advanced Database Systems",
      type: "Hardcore",
      hours: 3,
      faculty: "Dr Sukhvinder Singh"
    }
    // ... more subjects
  ]
}
```

### UI Format

```javascript
{
  Monday: [
    { 
      time: '09:30-10:30',
      subject: 'CSSC 422',
      code: 'CSSC 422',
      name: 'Advanced Database Systems',
      shortName: 'Advanced DB',
      type: 'Hardcore',
      faculty: 'Dr Sukhvinder Singh',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    // ... more slots
  ]
}
```

---

## 🎨 Color Mapping

Each subject has a consistent color:

| Subject Code | Color | Subject |
|-------------|-------|---------|
| CSSC 421 | 🔵 Blue | Modern Operating Systems |
| CSSC 422 | 🟢 Green | Advanced Database Systems |
| CSSC 423 | 🟡 Amber | OS Lab |
| CSSC 424 | 🟣 Purple | Database Lab |
| CSSC 433 | 🔴 Red | Optimization Techniques |
| CSEL 565 | 🔷 Cyan | Social Network Analytics |
| CSEL 581 | 🩷 Pink | AI & Expert Systems |

---

## 👥 User Role Implementation

### Student Role
```javascript
// Student sees only their class timetable
const studentTimetable = await studentService.getTimetable(
    "M.Sc. Computer Science", 
    "I"
);
```

### Staff/Faculty Role
```javascript
// Staff selects: Category → Class → Timetable
// Flow: UG/PG → M.Sc CS → I MSc CS → Display
const staffTimetable = await staffService.getTimetable(
    "M.Sc. Computer Science",
    "I"
);
```

### Office Role
```javascript
// Office has full access, same flow as staff
const officeTimetable = await staffService.getTimetable(
    "M.Sc. Computer Science",
    "I"
);
```

---

## 📱 Integration with Existing Screens

### StudentTimetable.js
The existing screen already supports this format. Just ensure:
1. Database is seeded with the JSON data
2. `program` matches "M.Sc. Computer Science"
3. `year` matches "I"

### StaffTimetable.js
Same structure applies. Staff can:
1. Select "PG" category
2. Select "M.Sc Computer Science"
3. Select "I MSc CS" or "1st Year"
4. View the timetable

---

## ✅ Verification Checklist

- [x] All 7 subjects included
- [x] All time slots preserved (8 slots per day)
- [x] All days covered (Monday-Friday)
- [x] Faculty names correct
- [x] Subject codes match exactly
- [x] Room information included
- [x] Break periods marked as null
- [x] Colors assigned to each subject
- [x] Database format matches Firestore schema
- [x] UI format ready for React Native

---

## 🔄 Next Steps

1. **Seed Database**: Run `seedI_MSc_CS_Timetable()` once
2. **Test Display**: Verify timetable shows correctly in Student/Staff/Office screens
3. **Add More Classes**: Use this as a template for other classes
4. **Update Colors**: Customize colors in `timetableColors.js` if needed

---

## 📝 Notes

- **Break Period**: 12:30-01:30 is marked as `null` in slots
- **Free Periods**: Empty slots are `null` in the array
- **Consecutive Slots**: Same subject in multiple slots (e.g., CSSC 423 appears 3 times on Monday)
- **Room**: All classes in SH310 - II Floor
- **Hours**: Each subject has 3 hours per week total

---

*Last Updated: Based on provided timetable data*

