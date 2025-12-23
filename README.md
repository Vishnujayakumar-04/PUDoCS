# PUDoCS - Department Management Mobile App

A comprehensive, role-based mobile application for the Department of Computer Science, Pondicherry University, built with React Native Expo and Firebase.

## 🎯 Project Overview

PUDoCS is a production-ready university department management system that digitizes academic, examination, and administrative activities through a centralized mobile platform.

### User Roles
- **Student** (Read-only): Access profile, timetable, notices, exams, results, events, and staff directory
- **Staff** (Academic Management): Manage students, attendance, timetable, exams, seat allocation, internals, and notices
- **Office** (Administrative Authority): Fee management, exam eligibility, results upload, and official records

## 📁 Project Structure

```
PUDoCS/
├── mobile/                 # React Native Expo App
│   ├── screens/            # UI screens
│   │   ├── student/       # Student module
│   │   ├── staff/         # Staff module
│   │   └── office/        # Office module
│   ├── components/         # Reusable components
│   ├── navigation/         # Navigation setup
│   ├── services/           # Firebase services
│   ├── context/            # Auth context
│   ├── styles/             # Styling
│   ├── docs/               # Documentation
│   └── App.js              # Entry point
├── firestore.rules         # Firestore security rules
└── google-services.json    # Firebase configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Firebase account with Firestore enabled
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - The Firebase configuration is in `mobile/services/firebaseConfig.js`
   - Ensure your Firebase project has Firestore enabled
   - See `mobile/docs/FIREBASE_COLLECTIONS.md` for collection structure

4. Start Expo:
```bash
npx expo start
```

5. Run on device:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

## 🔑 Key Features

### Automated Exam Seat Allocation
The system includes a sophisticated seat allocation algorithm that:
- Checks student exam eligibility (semester fee + exam fee paid)
- Calculates total eligible students
- Finds available classrooms with sufficient capacity
- Auto-assigns seats sequentially (movie-ticket style)
- Prevents double-booking and seat conflicts
- Allows seat locking after allocation

### Fee-Based Exam Eligibility
Students must have both semester and exam fees marked as "Paid" to be eligible for exams. The system automatically:
- Validates eligibility before seat allocation
- Displays eligibility status in student profile
- Blocks ineligible students from exam seat allocation

### Role-Based Access Control
- Firebase Authentication with email/password
- Firestore security rules for data access
- UI visibility based on user role
- Service-level authorization checks

## 📱 Mobile App Screens

### Common Screens
- ✅ Welcome Screen
- ✅ Role Selection
- ✅ Login (role-based)

### Student Module (Implemented)
- ✅ Dashboard with marquee
- ✅ Profile with attendance & fees
- ✅ Timetable (day-wise, PDF viewer for even semester)
- ✅ Academic Calendar (30 pages with zoom)
- ✅ Notices
- ✅ Exams with seat allocation
- ✅ Staff Directory with photos
- ✅ Student Directory
- ✅ Results
- ✅ Events
- 🚧 Letters (placeholder)

### Staff Module
- ✅ Dashboard
- ✅ Student Management (CRUD)
- ✅ Attendance Marking
- ✅ Timetable Creation
- ✅ Exam Management
- ✅ Seat Allocation
- ✅ Internals Upload
- ✅ Notices & Events Posting

### Office Module
- ✅ Dashboard
- ✅ Fee Management
- ✅ Exam Eligibility Report
- ✅ Results Upload
- ✅ Official Notices

## 🛠️ Technology Stack

### Backend
- **Platform**: Firebase (Firestore + Authentication)
- **Database**: Cloud Firestore
- **Authentication**: Firebase Auth with email/password
- **Storage**: AsyncStorage for local session

### Mobile
- **Framework**: React Native (Expo SDK 54)
- **Navigation**: React Navigation v7 (Stack + Bottom Tabs)
- **State Management**: React Context API
- **Animations**: React Native Reanimated v4.1.1
- **UI**: Custom premium components with modern design

## 🎨 Design System

- **Color Palette**: Navy/Indigo theme (`#1E3A8A` primary, `#4F46E5` secondary)
- **Typography**: Clean, readable fonts
- **Components**: Cards, buttons, badges, headers
- **Layout**: Mobile-first, responsive
- **Animations**: Smooth transitions, marquee scrolling
- **Navigation**: Floating pill-shaped bottom navigation with animated indicator

## 📡 Firebase Collections

The app uses the following Firestore collections:
- `users` - User authentication and roles
- `students` - Student profiles and academic data
- `timetables` - Class schedules
- `exams` - Examination schedules and seat allocations
- `classrooms` - Examination halls
- `notices` - Announcements
- `events` - Department events

See `mobile/docs/FIREBASE_COLLECTIONS.md` for detailed collection structures and security rules.

## 🔐 Security

- Firebase Authentication with email/password
- Firestore security rules for role-based access
- Secure token storage in AsyncStorage
- Protected routes based on user role

## 📝 Development Status

### ✅ Completed
- Complete Firebase integration
- All Firestore collections defined
- Authentication system
- Mobile app navigation
- Student module core screens
- Professional UI components
- Service layer for Firebase calls
- Custom floating tab bar navigation
- Academic calendar with zoom
- Timetable PDF viewer

### 🚧 In Progress
- Remaining student screens (Letters)
- Performance optimizations
- Error handling improvements

### 📋 Pending
- Image upload functionality
- PDF generation for letters
- Push notifications
- Offline support
- Unit tests

## 🚢 Deployment

### Mobile (Expo)
1. Build for production:
```bash
eas build --platform android
eas build --platform ios
```

2. Submit to stores:
```bash
eas submit --platform android
eas submit --platform ios
```

### Firebase Setup
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Configure security rules (see `firestore.rules`)
5. Update `mobile/services/firebaseConfig.js` with your Firebase config

## 📚 Documentation

- **Firebase Collections**: `mobile/docs/FIREBASE_COLLECTIONS.md` - Detailed collection structures
- **Project Structure**: See project structure section above
- **Quick Start**: Follow the "Getting Started" section

## 👥 Contributing

This is an academic project for Pondicherry University. For contributions or issues, please contact the development team.

## 📄 License

This project is developed for academic purposes at Pondicherry University.

## 🙏 Acknowledgments

- Department of Computer Science, Pondicherry University
- React Native and Expo communities
- Firebase team

---

**Built with ❤️ for PUDoCS**

