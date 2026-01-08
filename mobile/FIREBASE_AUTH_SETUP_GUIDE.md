# Firebase Authentication Setup Guide

## ⚠️ Important: For NEW Users

Firebase CLI `auth:import` requires **hashed passwords** and is designed for **migrating existing users**.

**For NEW users (like M.Tech DS students), use one of these easier methods:**

1. ✅ **Firebase Admin SDK** (Recommended - Automated)
2. ✅ **Firebase Console** (Manual - Easiest)
3. ⚠️ **Firebase CLI** (Complex - Only for migrating existing users)

See `scripts/importUsersFirebaseCLI.md` for CLI details.

---

## Quick Setup Methods

### Method 1: Firebase Console (Easiest - Recommended)

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com/project/pudocs-depofcs/authentication/users
   - Sign in with your Google account

2. **Add Users One by One**
   - Click "Add user" button
   - Enter email: `25mtnispy0002@pondiuni.ac.in` (lowercase)
   - Enter password: `pass@123`
   - Click "Add user"
   - Repeat for all 22 students

3. **Student List** (all emails are lowercase):
   - `25mtnispy0002@pondiuni.ac.in`
   - `25mtnispy0003@pondiuni.ac.in`
   - `25mtnispy0004@pondiuni.ac.in`
   - `25mtnispy0005@pondiuni.ac.in`
   - `25mtnispy0006@pondiuni.ac.in`
   - `25mtnispy0007@pondiuni.ac.in`
   - `25mtnispy0008@pondiuni.ac.in`
   - `25mtnispy0009@pondiuni.ac.in`
   - `25mtnispy0010@pondiuni.ac.in`
   - `25mtnispy0011@pondiuni.ac.in`
   - `25mtnispy0012@pondiuni.ac.in`
   - `25mtnispy0013@pondiuni.ac.in`
   - `25mtnispy0014@pondiuni.ac.in`
   - `25mtnispy0015@pondiuni.ac.in`
   - `25mtnispy0017@pondiuni.ac.in`
   - `25mtnispy0018@pondiuni.ac.in`
   - `25mtnispy0019@pondiuni.ac.in`
   - `25mtnispy0020@pondiuni.ac.in`
   - `25mtnispy0023@pondiuni.ac.in`
   - `25mtnispy0024@pondiuni.ac.in`
   - `25mtnispy0025@pondiuni.ac.in`
   - `25mtnispy0026@pondiuni.ac.in`

**Common Password**: `pass@123` (for all students)

---

### Method 2: CSV Import (Bulk Import)

1. **Prepare CSV File**
   - Use the file: `scripts/mtech_ds_students_auth.csv`
   - Or create your own with format:
   ```csv
   email,password
   25mtnispy0002@pondiuni.ac.in,pass@123
   25mtnispy0003@pondiuni.ac.in,pass@123
   ...
   ```

2. **Import in Firebase Console**
   - Go to: https://console.firebase.google.com/project/pudocs-depofcs/authentication/users
   - Click "Import users" button
   - Upload the CSV file
   - Map columns: `email` → email, `password` → password
   - Click "Import"

---

### Method 3: Firebase Admin SDK (Server-Side Script)

**Prerequisites:**
- Node.js installed
- Firebase Admin SDK: `npm install firebase-admin`
- Service Account Key from Firebase Console

**Steps:**

1. **Get Service Account Key**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in project root

2. **Run the Script**
   ```bash
   node scripts/createFirebaseAuthUsers.js
   ```

3. **What it does:**
   - Creates all 22 Firebase Auth accounts
   - Creates user documents in Firestore `users` collection
   - Handles existing users gracefully
   - Shows summary of created/existing/errors

---

## After Creating Auth Accounts

Once Firebase Auth accounts are created:

1. **Student Profiles** (already seeded automatically)
   - Collection: `students_pg_mtech_da_1`
   - Document ID: Register Number (e.g., `25MTNISPY0002`)

2. **User Documents** (created on first login or by script)
   - Collection: `users`
   - Document ID: Firebase Auth UID
   - Contains: email, role, registerNumber, name

3. **Students can login**
   - Email: `25mtnispy0002@pondiuni.ac.in`
   - Password: `pass@123`

---

## Verification

After creating accounts, verify:

1. **Firebase Console**
   - Go to Authentication → Users
   - Check that all 22 users are listed
   - Verify emails are correct (lowercase)

2. **Test Login**
   - Try logging in with any student email
   - Password: `pass@123`
   - Should successfully authenticate

3. **Check Firestore**
   - Collection: `users`
   - Should have user documents (created on login or by script)
   - Collection: `students_pg_mtech_da_1`
   - Should have all 22 student profiles

---

## Troubleshooting

### "Email already exists"
- User already created, skip and continue

### "Invalid email format"
- Ensure email is lowercase: `25mtnispy0002@pondiuni.ac.in`
- Check for typos

### "Password too weak"
- Firebase requires minimum 6 characters
- `pass@123` should work (8 characters)

### Users can't login
- Verify email is correct (lowercase)
- Verify password is `pass@123`
- Check if account is disabled in Firebase Console

---

## Quick Reference

- **Total Students**: 22
- **Email Format**: `{registerNumber}@pondiuni.ac.in` (lowercase)
- **Common Password**: `pass@123`
- **Firebase Project**: `pudocs-depofcs`
- **Console URL**: https://console.firebase.google.com/project/pudocs-depofcs/authentication/users

