# PUDoCS - Complete Project Structure

## 📁 Root Directory Structure

```
PUDoCS/
├── backend/                    # Node.js + Express + MongoDB Backend
├── mobile/                     # React Native + Expo Mobile App
├── README.md                   # Project documentation
├── DEPLOYMENT.md              # Deployment guide
├── TESTING.md                 # Testing guide
├── QUICKSTART.md              # Quick start guide
└── .gitignore                 # Git ignore file
```

---

## 🖥️ Backend Structure

```
backend/
├── config/
│   └── database.js            # MongoDB connection config
│
├── controllers/
│   ├── authController.js      # Authentication logic (register, login, verify)
│   ├── studentController.js   # Student endpoints (read-only)
│   ├── staffController.js     # Staff endpoints (CRUD + management)
│   └── officeController.js    # Office endpoints (admin functions)
│
├── middleware/
│   └── authMiddleware.js      # JWT auth + role-based access control
│
├── models/
│   ├── User.js               # User model (email, password, role)
│   ├── Student.js            # Student profile + academic data
│   ├── Staff.js              # Staff profile
│   ├── Timetable.js          # Class timetables
│   ├── Classroom.js          # Exam halls + seat layouts
│   ├── Exam.js               # Exams + seat allocations
│   ├── Notice.js             # Notices + announcements
│   ├── Event.js              # Events + photo gallery
│   └── LetterFormat.js       # Official letter templates
│
├── routes/
│   ├── authRoutes.js         # /api/auth/* routes
│   ├── studentRoutes.js      # /api/student/* routes
│   ├── staffRoutes.js        # /api/staff/* routes
│   └── officeRoutes.js       # /api/office/* routes
│
├── .env.example              # Environment variables template
├── .gitignore               # Backend gitignore
├── package.json             # Backend dependencies
└── server.js                # Express server entry point
```

---

## 📱 Mobile App Structure

```
mobile/
├── assets/
│   ├── Staff Photos/         # 19 faculty photos (local images)
│   │   ├── subramaniam-csc-profile.jpeg
│   │   ├── Chithralekha-Balamurugan-768x1024.jpg
│   │   ├── DSC_1112-copy-Sivasathya-Sundaram-scaled-e1593754969122-767x1024.jpg
│   │   └── ... (16 more images)
│   └── staffImages.js        # Image mapping (imageKey → require())
│
├── components/
│   ├── Button.js             # Reusable button (primary, secondary, outline)
│   ├── Card.js               # Card container with shadow
│   ├── Header.js             # App header with title/subtitle
│   ├── Marquee.js            # Scrolling marquee for notices
│   └── LoadingSpinner.js     # Loading indicator
│
├── context/
│   └── AuthContext.js        # Authentication state management
│
├── data/
│   └── staffData.js          # 19 faculty members data (JS module)
│
├── navigation/
│   ├── AppNavigator.js       # Main navigation (auth vs role-based)
│   ├── StudentNavigator.js   # Student bottom tabs + hidden screens
│   ├── StaffNavigator.js     # Staff bottom tabs + exam stack
│   └── OfficeNavigator.js    # Office bottom tabs
│
├── screens/
│   ├── WelcomeScreen.js      # Landing screen
│   ├── RoleSelectionScreen.js # Choose Student/Staff/Office
│   ├── LoginScreen.js        # Role-based login
│   │
│   ├── student/
│   │   ├── StudentDashboard.js        # Dashboard with marquee + features
│   │   ├── StudentProfile.js          # Profile + fee status + eligibility
│   │   ├── StudentTimetable.js        # Day-wise timetable
│   │   ├── StudentNotices.js          # Notices with priority badges
│   │   ├── StudentExams.js            # Exams + seat allocation
│   │   ├── StudentStaffDirectory.js   # Staff directory with photos
│   │   └── PlaceholderScreens.js      # Events, Results, Letters
│   │
│   ├── staff/
│   │   ├── StaffDashboard.js          # Quick actions + assigned classes
│   │   ├── StaffStudentManagement.js  # Add/Edit/Delete students
│   │   ├── StaffAttendance.js         # Mark attendance (toggle UI)
│   │   ├── StaffTimetable.js          # Create timetables
│   │   ├── StaffInternals.js          # Upload internal marks
│   │   ├── StaffExamManagement.js     # Create exams
│   │   ├── StaffSeatAllocation.js     # Movie-ticket style seat map
│   │   └── StaffNotices.js            # Post notices + create events
│   │
│   └── office/
│       ├── OfficeDashboard.js         # Statistics + fee summary
│       ├── OfficeFeeManagement.js     # Update all fee types
│       ├── OfficeExamEligibility.js   # Eligible/not eligible report
│       ├── OfficeResults.js           # Upload semester results
│       └── OfficeNotices.js           # Post official notices
│
├── services/
│   ├── api.js                # Axios instance + JWT interceptor
│   ├── authService.js        # Login, register, token management
│   ├── studentService.js     # All student API calls
│   ├── staffService.js       # All staff API calls
│   └── officeService.js      # All office API calls
│
├── styles/
│   ├── colors.js             # Color palette (navy/indigo theme)
│   └── commonStyles.js       # Reusable styles
│
├── App.js                    # Root component with providers
├── package.json              # Mobile dependencies
└── .gitignore               # Mobile gitignore
```

---

## 📊 Key Features by Module

### 🎓 Student Module (Read-Only)
- ✅ Dashboard with marquee
- ✅ Profile with fee status
- ✅ Timetable (day-wise)
- ✅ Notices with priority
- ✅ Exams with seat allocation
- ✅ **Staff Directory with 19 faculty photos**
- 🚧 Events, Results, Letters (placeholders)

### 👨‍🏫 Staff Module (Management)
- ✅ Dashboard with quick actions
- ✅ Student Management (full CRUD)
- ✅ Attendance marking (toggle UI)
- ✅ Timetable creation
- ✅ Internal marks upload
- ✅ Exam creation
- ✅ **Seat Allocation (movie-ticket style)**
- ✅ Notices & Events posting

### 🏢 Office Module (Administrative)
- ✅ Dashboard with statistics
- ✅ Fee Management (Semester, Exam, Hostel)
- ✅ **Exam Eligibility Report**
- ✅ Results upload
- ✅ Official notices

---

## 🎨 Design System

### Colors (`mobile/styles/colors.js`)
```javascript
primary: '#1E3A8A'      // Navy blue
secondary: '#4F46E5'    // Indigo
accent: '#F59E0B'       // Amber
success: '#10B981'      // Green
error: '#EF4444'        // Red
warning: '#F59E0B'      // Orange
```

### Components
- **Button**: Primary, Secondary, Outline variants
- **Card**: White background with shadow
- **Header**: Navy background with title/subtitle
- **Marquee**: Auto-scrolling notices

---

## 🔐 Authentication Flow

```
1. Welcome Screen
   ↓
2. Role Selection (Student/Staff/Office)
   ↓
3. Login (role-specific)
   ↓
4. JWT Token stored in AsyncStorage
   ↓
5. Role-based Navigator loaded
```

---

## 🗄️ Database Models

### User
- email, password (hashed), role, profileRef, isActive

### Student
- name, registerNumber, email, course, program, year, section
- attendance, internals, results, fees, examEligibility (virtual)

### Exam
- name, subject, type, date, startTime, endTime
- eligibleStudents[], hallAllocations[], seatAssignments[]
- **Auto seat allocation algorithm**

### Classroom
- name, building, capacity, seatLayout (rows × columns)

---

## 📦 Dependencies

### Backend
- express, mongoose, bcryptjs, jsonwebtoken
- cors, dotenv

### Mobile
- expo, react-navigation (stack + bottom-tabs)
- axios, @react-native-async-storage/async-storage
- react-native-gesture-handler, react-native-screens

---

## 🚀 Running the Project

### Backend
```bash
cd backend
npm install
# Create .env file
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
# Scan QR code with Expo Go
```

---

## 📝 Important Files

### Configuration
- `backend/.env` - Database URL, JWT secret
- `mobile/services/api.js` - Backend URL

### Entry Points
- `backend/server.js` - Express server
- `mobile/App.js` - React Native app

### Critical Features
- `backend/controllers/staffController.js` - **Seat allocation algorithm**
- `mobile/screens/staff/StaffSeatAllocation.js` - **Visual seat map**
- `mobile/screens/student/StudentStaffDirectory.js` - **Staff directory with photos**
- `mobile/data/staffData.js` - **19 faculty members**
- `mobile/assets/staffImages.js` - **Photo mappings**

---

## ✅ Implementation Status

- **Backend**: 100% ✅
- **Student Module**: 90% ✅ (Staff Directory completed)
- **Staff Module**: 100% ✅
- **Office Module**: 95% ✅
- **Total Screens**: 25+ screens

---

## 🎯 Next Steps

1. ✅ Fix package.json dependencies
2. ✅ Ensure all 19 staff photos are in `mobile/assets/Staff Photos/`
3. ✅ Test on physical device
4. 📋 Create sample data (students, exams, classrooms)
5. 🧪 End-to-end testing
6. 🚀 Deploy to production

---

**Project Type**: University Department Management System  
**Tech Stack**: MERN (MongoDB, Express, React Native, Node.js)  
**Target**: Academic evaluation, real-world deployment  
**Status**: Demo-ready, Production-quality
