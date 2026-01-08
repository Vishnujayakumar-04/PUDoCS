# 🚀 Create Firebase Auth Users - Run This Now!

## ✅ Step 1: Get Service Account Key (Required)

1. **Open this link:**
   https://console.firebase.google.com/project/pudocs-depofcs/settings/serviceaccounts/adminsdk

2. **Click "Generate new private key"**
   - A JSON file will download

3. **Save the file:**
   - Rename it to: `serviceAccountKey.json`
   - Place it in your project root (same folder as `package.json`)
   - Location: `d:\SideProjects\PUDoCS\mobile\serviceAccountKey.json`

4. **⚠️ Security Note:**
   - This file is already added to `.gitignore`
   - Never commit this file to Git!

---

## ✅ Step 2: Run the Script

Once you have `serviceAccountKey.json` in the project root, run:

```bash
node scripts/createUsersWithPlainPasswords.js
```

This will:
- ✅ Create all 22 Firebase Auth accounts
- ✅ Set password to `pass@123` for all
- ✅ Create Firestore user documents
- ✅ Show progress for each student

---

## 📋 What You'll See

```
✅ Firebase Admin initialized

🔐 Creating Firebase Auth users for M.Tech DS students...
📋 Total students: 22
🔑 Password: pass@123

[1/22] Durgadevi (25mtnispy0002@pondiuni.ac.in)...
   ✅ Created (UID: abc123...)
   ✅ Firestore document created

[2/22] Vijayadamodaran N (25mtnispy0003@pondiuni.ac.in)...
   ✅ Created (UID: def456...)
   ✅ Firestore document created

... (continues for all 22 students)

📊 SUMMARY
✅ Created: 22
ℹ️  Already exists: 0
❌ Errors: 0

🎉 Script completed!
```

---

## ✅ Step 3: Verify

After the script completes:

1. **Check Firebase Console:**
   - Go to: https://console.firebase.google.com/project/pudocs-depofcs/authentication/users
   - You should see all 22 users listed

2. **Test Login:**
   - Try logging in with: `25mtnispy0002@pondiuni.ac.in` / `pass@123`
   - Should work!

---

## 🆘 Troubleshooting

### "serviceAccountKey.json not found"
- Make sure you downloaded the key from Firebase Console
- Place it in: `d:\SideProjects\PUDoCS\mobile\serviceAccountKey.json`
- File name must be exactly: `serviceAccountKey.json`

### "Email already exists"
- This is fine! User already exists, script will skip it
- Check summary to see how many were created

### Permission Errors
- Make sure service account has "Firebase Admin" role
- Regenerate the key if needed

---

## 🎯 Quick Command Reference

```bash
# 1. Install (already done ✅)
npm install firebase-admin

# 2. Get serviceAccountKey.json from Firebase Console (you need to do this)

# 3. Run script (after you have the key)
node scripts/createUsersWithPlainPasswords.js
```

---

**Ready? Get the service account key and run the script!** 🚀

