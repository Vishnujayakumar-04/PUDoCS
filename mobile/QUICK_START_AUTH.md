# Quick Start: Create Firebase Auth Users

## ⚡ Fastest Way (3 Steps)

### Step 1: Install Firebase Admin SDK
```bash
npm install firebase-admin
```

### Step 2: Get Service Account Key
1. Go to: https://console.firebase.google.com/project/pudocs-depofcs/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Save the downloaded file as `serviceAccountKey.json` in your project root (same folder as `package.json`)
4. ⚠️ **IMPORTANT**: Add `serviceAccountKey.json` to `.gitignore` (never commit this file!)

### Step 3: Run the Script
```bash
node scripts/createUsersWithPlainPasswords.js
```

That's it! The script will:
- ✅ Create all 22 Firebase Auth accounts
- ✅ Set password to `pass@123` for all
- ✅ Create Firestore user documents
- ✅ Show progress and summary

---

## What You'll See

```
🔐 Creating Firebase Auth users for M.Tech DS students...
📋 Total students: 22
🔑 Password: pass@123

[1/22] Durgadevi (25mtnispy0002@pondiuni.ac.in)...
   ✅ Created (UID: abc123...)
   ✅ Firestore document created

[2/22] Vijayadamodaran N (25mtnispy0003@pondiuni.ac.in)...
   ✅ Created (UID: def456...)
   ✅ Firestore document created

...

📊 SUMMARY
✅ Created: 22
ℹ️  Already exists: 0
❌ Errors: 0

🎉 Script completed!
```

---

## Troubleshooting

### "serviceAccountKey.json not found"
- Make sure you downloaded the key from Firebase Console
- Place it in the project root (same folder as `package.json`)
- File name must be exactly: `serviceAccountKey.json`

### "Cannot find module 'firebase-admin'"
- Run: `npm install firebase-admin`

### "Email already exists"
- This is fine! The user already exists, script will skip it
- Check summary to see how many were created vs already existed

### Permission Errors
- Make sure service account has "Firebase Admin" role
- Regenerate the key if needed

---

## Verify Users Were Created

1. Go to: https://console.firebase.google.com/project/pudocs-depofcs/authentication/users
2. You should see all 22 users listed
3. Try logging in with any email: `25mtnispy0002@pondiuni.ac.in` / `pass@123`

---

## Next Steps

After users are created:
1. ✅ Students can login with their email and `pass@123`
2. ✅ Student profiles are already seeded (automatic)
3. ✅ Timetable is already seeded (automatic)
4. ✅ Students will see all their data (timetable, attendance, marks)

