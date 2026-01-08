# Firebase CLI Import Guide

## Important Note

Firebase CLI `auth:import` is designed for **migrating existing users** with **hashed passwords**. For **new users**, it's easier to use:

1. **Firebase Console** (manual, easiest)
2. **Firebase Admin SDK** (automated, recommended) - See `createFirebaseAuthUsers.js`

However, if you want to use Firebase CLI, follow the steps below.

---

## Option 1: Firebase Admin SDK (Recommended for New Users)

This is the easiest way to create NEW users with plain text passwords.

### Steps:

1. **Install Firebase Admin SDK**
   ```bash
   npm install firebase-admin
   ```

2. **Get Service Account Key**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in project root

3. **Run the Script**
   ```bash
   node scripts/createFirebaseAuthUsers.js
   ```

This will create all 22 users with password `pass@123` automatically.

---

## Option 2: Firebase CLI Import (For Migrating Existing Users)

If you're migrating users with existing hashed passwords, use this method.

### Prerequisites:

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project** (if not already done)
   ```bash
   firebase init
   ```

### Step 1: Prepare CSV with Hashed Passwords

Firebase CLI requires **hashed passwords**, not plain text. You need to:

1. Hash passwords using Firebase's supported algorithms (MD5, SHA256, BCRYPT, etc.)
2. Include hash parameters in CSV

**CSV Format for Users with Passwords:**
```csv
uid,email,passwordHash,passwordSalt
25MTNISPY0002,25mtnispy0002@pondiuni.ac.in,<base64_hash>,<base64_salt>
25MTNISPY0003,25mtnispy0003@pondiuni.ac.in,<base64_hash>,<base64_salt>
```

**CSV Format for Users WITHOUT Passwords (OAuth only):**
```csv
uid,email,displayName
25MTNISPY0002,25mtnispy0002@pondiuni.ac.in,Durgadevi
25MTNISPY0003,25mtnispy0003@pondiuni.ac.in,Vijayadamodaran N
```

### Step 2: Get Hash Parameters from Firebase

1. Go to Firebase Console → Authentication → Users
2. Click on any existing user with a password
3. Check "Password Hash Parameters" section
4. Note the algorithm, key, rounds, etc.

### Step 3: Run Import Command

```bash
firebase auth:import scripts/mtech_ds_students_auth_hashed.csv \
  --hash-alg=SHA256 \
  --hash-key=<your_signer_key> \
  --hash-rounds=1 \
  --project pudocs-depofcs
```

**Replace:**
- `scripts/mtech_ds_students_auth_hashed.csv` with your CSV file path
- `<your_signer_key>` with your actual hash key from Firebase Console
- `pudocs-depofcs` is your project ID

### Supported Hash Algorithms:

- **MD5**: `--hash-alg=MD5`
- **SHA256**: `--hash-alg=SHA256 --hash-key=<key> --hash-rounds=1`
- **SHA512**: `--hash-alg=SHA512 --hash-key=<key> --hash-rounds=1`
- **BCRYPT**: `--hash-alg=BCRYPT`
- **SCRYPT**: `--hash-alg=SCRYPT --hash-key=<key> --hash-salt-separator=<separator> --hash-rounds=<rounds> --hash-mem-cost=<cost>`
- **PBKDF2SHA1**: `--hash-alg=PBKDF2SHA1 --hash-key=<key> --hash-rounds=<rounds>`
- **PBKDF2SHA256**: `--hash-alg=PBKDF2SHA256 --hash-key=<key> --hash-rounds=<rounds>`
- **STANDARDSCRYPT**: `--hash-alg=STANDARDSCRYPT --hash-key=<key> --hash-salt-separator=<separator> --hash-rounds=<rounds> --hash-mem-cost=<cost> --hash-parallelization=<parallel> --hash-block-size=<block> --hash-dk-len=<dklen>`

---

## Option 3: Firebase Console (Manual - Easiest for New Users)

For creating NEW users, this is the simplest method:

1. Go to: https://console.firebase.google.com/project/pudocs-depofcs/authentication/users
2. Click "Add user"
3. Enter email and password
4. Repeat for all 22 students

See `FIREBASE_AUTH_SETUP_GUIDE.md` for detailed steps.

---

## Recommendation

**For NEW users (like M.Tech DS students):**
- ✅ Use **Firebase Admin SDK script** (`createFirebaseAuthUsers.js`)
- ✅ Or use **Firebase Console** manually

**For MIGRATING existing users:**
- ✅ Use **Firebase CLI** with hashed passwords

Since M.Tech DS students are NEW users, **Option 1 (Admin SDK)** is the best choice.

