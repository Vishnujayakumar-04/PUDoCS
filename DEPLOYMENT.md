# PUDoCS Deployment Guide

## Backend Deployment (Render)

### Prerequisites
- GitHub account
- Render account (free tier available)
- MongoDB Atlas cluster

### Steps

1. **Prepare Repository**
   - Push your code to GitHub
   - Ensure `.env` is in `.gitignore`

2. **Create MongoDB Atlas Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create database user
   - Whitelist all IPs (0.0.0.0/0) for development
   - Get connection string

3. **Deploy to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: pudocs-backend
     - **Root Directory**: backend
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   
4. **Set Environment Variables**
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_key_min_32_chars
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=production
   CLIENT_URL=*
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://pudocs-backend.onrender.com`

### Testing Backend
```bash
curl https://your-app.onrender.com/health
```

Should return:
```json
{
  "status": "OK",
  "message": "PUDoCS Backend Server is running"
}
```

## Mobile App Deployment (Expo)

### Prerequisites
- Expo account
- EAS CLI installed: `npm install -g eas-cli`

### Steps

1. **Update API URL**
   - Edit `mobile/services/api.js`
   - Change `API_BASE_URL` to your Render backend URL:
   ```javascript
   const API_BASE_URL = 'https://your-app.onrender.com/api';
   ```

2. **Login to Expo**
   ```bash
   cd mobile
   eas login
   ```

3. **Configure EAS**
   ```bash
   eas build:configure
   ```

4. **Build for Android**
   ```bash
   eas build --platform android --profile preview
   ```

5. **Build for iOS** (requires Apple Developer account)
   ```bash
   eas build --platform ios --profile preview
   ```

6. **Download and Test**
   - Download the APK/IPA from Expo dashboard
   - Install on device
   - Test all features

### Publishing Updates (OTA)
```bash
eas update --branch production --message "Bug fixes"
```

### Submitting to Stores

#### Google Play Store
```bash
eas submit --platform android
```

#### Apple App Store
```bash
eas submit --platform ios
```

## Environment-Specific Configuration

### Development
```env
# backend/.env
MONGODB_URI=mongodb://localhost:27017/pudocs
JWT_SECRET=dev_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:19006
```

```javascript
// mobile/services/api.js
const API_BASE_URL = 'http://localhost:5000/api';
```

### Production
```env
# Render environment variables
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pudocs
JWT_SECRET=production_secret_key_min_32_characters
NODE_ENV=production
CLIENT_URL=*
```

```javascript
// mobile/services/api.js
const API_BASE_URL = 'https://pudocs-backend.onrender.com/api';
```

## Database Seeding (Optional)

Create sample data for testing:

```javascript
// backend/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Student = require('./models/Student');
const Classroom = require('./models/Classroom');

async function seed() {
  // Create sample student
  const student = await Student.create({
    name: 'John Doe',
    registerNumber: 'CS2021001',
    email: 'john@student.pu.edu',
    course: 'UG',
    program: 'B.Tech',
    year: 3,
    section: 'A',
    fees: {
      semester: { status: 'Paid', amount: 50000 },
      exam: { status: 'Paid', amount: 1000 }
    }
  });

  // Create user account
  const hashedPassword = await bcrypt.hash('password123', 10);
  await User.create({
    email: 'john@student.pu.edu',
    password: hashedPassword,
    role: 'Student',
    profileId: student._id
  });

  // Create classrooms
  await Classroom.create([
    { name: 'CS-101', building: 'Main Block', capacity: 60, seatLayout: { rows: 10, columns: 6 } },
    { name: 'CS-102', building: 'Main Block', capacity: 40, seatLayout: { rows: 8, columns: 5 } }
  ]);

  console.log('Database seeded successfully');
}
```

Run: `node seed.js`

## Monitoring

### Backend Health Check
```bash
curl https://your-app.onrender.com/health
```

### Render Logs
- Go to Render dashboard
- Select your service
- Click "Logs" tab

### Expo Analytics
- Go to Expo dashboard
- View app analytics and crash reports

## Troubleshooting

### Backend Issues
1. Check Render logs
2. Verify environment variables
3. Test MongoDB connection
4. Check CORS settings

### Mobile App Issues
1. Clear Expo cache: `expo start -c`
2. Verify API URL in `services/api.js`
3. Check network connectivity
4. Review AsyncStorage data

## Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Enable MongoDB IP whitelist in production
- [ ] Use HTTPS for all API calls
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Enable CORS only for your domain
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Backup Strategy

### Database Backup (MongoDB Atlas)
- Enable automatic backups
- Schedule: Daily
- Retention: 7 days

### Code Backup
- Push to GitHub regularly
- Use tags for releases
- Maintain separate branches for dev/staging/production

---

**Deployment Checklist**
- [ ] Backend deployed to Render
- [ ] MongoDB Atlas configured
- [ ] Environment variables set
- [ ] Health check passing
- [ ] Mobile app API URL updated
- [ ] Android build created
- [ ] iOS build created (if applicable)
- [ ] App tested on real devices
- [ ] Store listings prepared
- [ ] Privacy policy created
- [ ] Terms of service created
