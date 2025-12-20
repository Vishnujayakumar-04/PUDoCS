# PUDoCS Mobile App - Quick Start Guide

## 🚀 Getting Started

### Backend Setup

1. **Navigate to backend:**
```bash
cd d:\SideProjects\PUDoCS\backend
```

2. **Create `.env` file:**
```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/pudocs
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:19006
```

3. **Start the server:**
```bash
npm run dev
```

Server runs on: `http://localhost:5000`

### Mobile App Setup

1. **Navigate to mobile:**
```bash
cd d:\SideProjects\PUDoCS\mobile
```

2. **Update API URL in `services/api.js`:**
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
// For Android emulator: 'http://10.0.2.2:5000/api'
// For iOS simulator: 'http://localhost:5000/api'
// For physical device: 'http://YOUR_IP:5000/api'
```

3. **Start Expo:**
```bash
npx expo start
```

4. **Run on device:**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app

## 📱 Test Credentials

You'll need to create test users first. Use the backend API or create a seed script.

### Sample User Creation (via API)

**Student:**
```json
POST /api/auth/register
{
  "email": "student@pu.edu",
  "password": "password123",
  "role": "Student",
  "profileData": {
    "name": "John Doe",
    "registerNumber": "CS2021001",
    "email": "student@pu.edu",
    "course": "UG",
    "program": "B.Tech",
    "year": 3,
    "section": "A"
  }
}
```

**Staff:**
```json
POST /api/auth/register
{
  "email": "staff@pu.edu",
  "password": "password123",
  "role": "Staff",
  "profileData": {
    "name": "Dr. Smith",
    "email": "staff@pu.edu",
    "designation": "Assistant Professor",
    "department": "Computer Science"
  }
}
```

**Office:**
```json
POST /api/auth/register
{
  "email": "office@pu.edu",
  "password": "password123",
  "role": "Office",
  "profileData": {}
}
```

## ✅ Testing Checklist

### Role-Based Access
- [ ] Login as Student → See read-only dashboard
- [ ] Login as Staff → See management features
- [ ] Login as Office → See administrative controls

### Student Module
- [ ] View dashboard with marquee
- [ ] Check profile with fee status
- [ ] View timetable
- [ ] Read notices
- [ ] Check exam schedule and seat allocation

### Staff Module
- [ ] View assigned classes
- [ ] Add/Edit/Delete students
- [ ] Create exam
- [ ] Allocate seats (movie-ticket style)
- [ ] View seat map

### Office Module
- [ ] View statistics dashboard
- [ ] Update student fees
- [ ] Check exam eligibility report
- [ ] See eligible vs ineligible students

## 🔧 Troubleshooting

### Backend Issues
- **MongoDB connection failed:** Check MONGODB_URI in `.env`
- **JWT errors:** Ensure JWT_SECRET is set
- **CORS errors:** Verify CLIENT_URL matches your mobile app URL

### Mobile App Issues
- **API connection failed:** 
  - Check API_BASE_URL in `services/api.js`
  - Ensure backend is running
  - For Android emulator, use `10.0.2.2` instead of `localhost`
  
- **Login fails:**
  - Check network connectivity
  - Verify user exists in database
  - Check backend logs for errors

- **Expo errors:**
  - Clear cache: `npx expo start -c`
  - Reinstall dependencies: `rm -rf node_modules && npm install`

## 📊 Current Implementation Status

### ✅ Fully Implemented
- Complete backend (100%)
- Student module core screens (70%)
- Staff module core screens (60%)
- Office module core screens (60%)

### 🚧 Placeholder Screens
- Student: Events, Results, Staff Directory, Letters
- Staff: Attendance, Timetable, Internals, Notices
- Office: Results Upload, Notices Management

## 🎯 Next Steps for Production

1. **Create Sample Data:**
   - Add classrooms for seat allocation
   - Create sample students with varied fee status
   - Add sample notices and events

2. **Test Critical Features:**
   - Exam seat allocation algorithm
   - Fee eligibility validation
   - Role-based access control

3. **Deploy:**
   - Backend to Render
   - Mobile app via Expo EAS

4. **Complete Remaining Screens:**
   - Implement placeholder screens
   - Add image upload functionality
   - Add PDF generation

---

**For detailed documentation, see:**
- [README.md](file:///d:/SideProjects/PUDoCS/README.md)
- [DEPLOYMENT.md](file:///d:/SideProjects/PUDoCS/DEPLOYMENT.md)
- [walkthrough.md](file:///C:/Users/Vishn/.gemini/antigravity/brain/0bd9b726-ba1b-43d6-940a-1d0d3cfb3b5e/walkthrough.md)
