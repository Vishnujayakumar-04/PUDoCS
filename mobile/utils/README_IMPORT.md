# Import Utilities Guide

This directory contains utilities to import staff credentials and student data from Word documents.

## Prerequisites

Install the required library to parse Word documents:

```bash
npm install mammoth
```

## 1. Import Staff Credentials

**File:** `mobile/assets/Staff/Username & pass.docx`

This script will:
- Parse staff usernames and passwords from the Word document
- Create/update staff accounts in Firebase Authentication
- Create user documents in Firestore

**Usage:**
```bash
node mobile/utils/parseStaffCredentials.js
```

**Note:** The script expects the document to have staff credentials in one of these formats:
- `email@pondiuni.ac.in | Password123`
- `Username: email@pondiuni.ac.in, Password: Pass@123`

## 2. Import PG Students

**File:** `mobile/assets/Student name list/PG Name lsit With class.docx`

This script will:
- Parse PG student lists from the Word document
- Import students to Firestore
- **Excludes:** M.Sc CS 1st year and MCA 1st year (as requested)

**Usage:**
```bash
node mobile/utils/parsePGStudents.js
```

**Note:** The script expects student entries in one of these formats:
- `Name – RegisterNumber`
- `RegisterNumber Name`
- `Name RegisterNumber`

## Alternative: Manual Data Entry

If the Word document parsing doesn't work perfectly, you can:

1. **Open the Word documents**
2. **Copy the data** and paste it into a text file
3. **Format it** as:
   ```
   For Staff:
   email@pondiuni.ac.in|Password123
   
   For Students:
   Name|RegisterNumber|Program|Year
   ```

4. **Create a simple import script** or use the existing bulk import functions in the app.

## Troubleshooting

If you encounter errors:

1. **Check file paths** - Make sure the Word documents are in the correct location
2. **Check document format** - The parser expects specific formats
3. **Check Firebase connection** - Ensure Firebase is properly configured
4. **Check console output** - The scripts provide detailed logging

## Next Steps

After importing:
1. Verify accounts in Firebase Console
2. Test login with staff credentials
3. Verify students appear in the Student Directory
4. Update any missing information manually if needed

