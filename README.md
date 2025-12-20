# PUDoCS - Department Management Mobile App

A comprehensive, role-based mobile application for the Department of Computer Science, Pondicherry University, built with React Native Expo and Node.js.

## 🎯 Project Overview

PUDoCS is a production-ready university department management system that digitizes academic, examination, and administrative activities through a centralized mobile platform.

### User Roles
- **Student** (Read-only): Access profile, timetable, notices, exams, results, events, and staff directory
- **Staff** (Academic Management): Manage students, attendance, timetable, exams, seat allocation, internals, and notices
- **Office** (Administrative Authority): Fee management, exam eligibility, results upload, and official records

## 📁 Project Structure

```
PUDoCS/
├── backend/                 # Node.js + Express + MongoDB
│   ├── models/             # Mongoose schemas
│   ├── controllers/        # Business logic
│   ├── routes/             # API routes
│   ├── middleware/         # Auth & validation
│   ├── config/             # Database config
│   └── server.js           # Entry point
│
└── mobile/                 # React Native Expo
    ├── screens/            # UI screens
    │   ├── student/       # Student module
    │   ├── staff/         # Staff module
    │   └── office/        # Office module
    ├── components/         # Reusable components
    ├── navigation/         # Navigation setup
    ├── services/           # API services
    ├── context/            # Auth context
    ├── styles/             # Styling
    └── App.js              # Entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:19006
```

4. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API base URL in `services/api.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url:5000/api';
// For local development: 'http://localhost:5000/api'
// For Render deployment: 'https://your-app.onrender.com/api'
```

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
- JWT-based authentication
- Strict permission enforcement
- UI visibility based on user role
- API-level authorization checks

## 📱 Mobile App Screens

### Common Screens
- ✅ Welcome Screen
- ✅ Role Selection
- ✅ Login (role-based)

### Student Module (Implemented)
- ✅ Dashboard with marquee
- ✅ Profile with attendance & fees
- ✅ Timetable (day-wise)
- ✅ Notices
- ✅ Exams with seat allocation
- 🚧 Events & Gallery (placeholder)
- 🚧 Results (placeholder)
- 🚧 Staff Directory (placeholder)
- 🚧 Letter Formats (placeholder)

### Staff & Office Modules
- 🚧 Placeholder screens (backend APIs ready)

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **CORS**: Enabled for mobile app

### Mobile
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **UI**: Custom components with professional styling

## 🎨 Design System

- **Color Palette**: Navy/Indigo theme
- **Typography**: Clean, readable fonts
- **Components**: Cards, buttons, badges, headers
- **Layout**: Mobile-first, responsive
- **Animations**: Smooth transitions, marquee scrolling

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

### Student (Protected)
- `GET /api/student/profile`
- `GET /api/student/timetable`
- `GET /api/student/notices`
- `GET /api/student/exams`
- `GET /api/student/events`
- `GET /api/student/results`
- `GET /api/student/staff`
- `GET /api/student/attendance`

### Staff (Protected)
- `POST /api/staff/students` - Add student
- `PUT /api/staff/students/:id` - Update student
- `POST /api/staff/attendance` - Mark attendance
- `POST /api/staff/exams` - Create exam
- `POST /api/staff/exams/:id/allocate-seats` - Auto-allocate seats
- `PUT /api/staff/exams/:id/lock-seats` - Lock allocation
- `POST /api/staff/internals` - Upload marks
- `POST /api/staff/notices` - Post notice

### Office (Protected)
- `PUT /api/office/fees/:studentId` - Update fees
- `GET /api/office/exam-eligibility` - Get eligibility report
- `POST /api/office/results` - Upload results
- `POST /api/office/notices` - Post official notice
- `PUT /api/office/notices/:id/approve` - Approve notice

## 🔐 Security

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based authorization middleware
- Protected API routes
- Secure token storage in AsyncStorage

## 📝 Development Status

### ✅ Completed
- Complete backend infrastructure
- All MongoDB models
- Authentication system
- All API endpoints
- Mobile app navigation
- Student module core screens
- Professional UI components
- Service layer for API calls

### 🚧 In Progress
- Remaining student screens (Events, Results, Staff, Letters)
- Staff module screens
- Office module screens

### 📋 Pending
- Image upload functionality
- PDF generation for letters
- Push notifications
- Offline support
- Unit tests

## 🚢 Deployment

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set environment variables
4. Deploy

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

## 👥 Contributing

This is an academic project for Pondicherry University. For contributions or issues, please contact the development team.

## 📄 License

This project is developed for academic purposes at Pondicherry University.

## 🙏 Acknowledgments

- Department of Computer Science, Pondicherry University
- React Native and Expo communities
- MongoDB and Express.js teams

---

**Built with ❤️ for PUDoCS**
