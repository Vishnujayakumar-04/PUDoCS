// Utility script to parse staff credentials from Word document
// This script requires: npm install mammoth
// 
// Usage: node mobile/utils/parseStaffCredentials.js
//
// The script will read the Word document and extract staff usernames and passwords
// Then update/create staff accounts in Firebase

import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse staff credentials from Word document
 * Expected format in document:
 * - Each line should have: Email/Username | Password
 * - Or: Username: email@pondiuni.ac.in, Password: Pass@123
 */
export const parseStaffCredentials = async () => {
    try {
        const docxPath = path.join(__dirname, '../assets/Staff/Username & pass.docx');
        
        if (!fs.existsSync(docxPath)) {
            console.error('❌ File not found:', docxPath);
            return null;
        }

        console.log('📄 Reading Word document...');
        const result = await mammoth.extractRawText({ path: docxPath });
        const text = result.value;

        console.log('📝 Extracted text:', text.substring(0, 500));
        
        // Parse the text to extract credentials
        const credentials = [];
        const lines = text.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            // Try different formats
            // Format 1: email@pondiuni.ac.in | Password123
            if (line.includes('@pondiuni.ac.in')) {
                const parts = line.split(/[|\t]/).map(p => p.trim());
                const email = parts.find(p => p.includes('@pondiuni.ac.in'));
                const password = parts.find(p => p && !p.includes('@') && p.length > 0);
                
                if (email && password) {
                    credentials.push({
                        email: email.toLowerCase().trim(),
                        password: password.trim()
                    });
                }
            }
            // Format 2: Username: email@pondiuni.ac.in, Password: Pass@123
            else if (line.toLowerCase().includes('username') || line.toLowerCase().includes('password')) {
                const emailMatch = line.match(/([a-zA-Z0-9._-]+@pondiuni\.ac\.in)/i);
                const passwordMatch = line.match(/password[:\s]+([^\s,]+)/i);
                
                if (emailMatch && passwordMatch) {
                    credentials.push({
                        email: emailMatch[1].toLowerCase().trim(),
                        password: passwordMatch[1].trim()
                    });
                }
            }
        }

        console.log(`✅ Extracted ${credentials.length} credentials`);
        return credentials;
    } catch (error) {
        console.error('❌ Error parsing document:', error);
        return null;
    }
};

/**
 * Update staff accounts with credentials from document
 */
export const updateStaffAccounts = async () => {
    const credentials = await parseStaffCredentials();
    
    if (!credentials || credentials.length === 0) {
        console.log('⚠️ No credentials found in document');
        return;
    }

    console.log(`🚀 Updating ${credentials.length} staff accounts...`);
    
    const results = [];
    const errors = [];

    for (const cred of credentials) {
        try {
            // Check if user exists in Firestore
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', cred.email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                // User exists, update password in Auth
                console.log(`⚠️ User ${cred.email} already exists. Password update requires re-authentication.`);
                results.push({
                    email: cred.email,
                    status: 'exists',
                    note: 'Password needs to be updated manually'
                });
            } else {
                // Create new account
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    cred.email,
                    cred.password
                );
                
                // Create user document
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    uid: userCredential.user.uid,
                    email: cred.email,
                    role: 'Staff',
                    passwordChanged: false,
                    createdAt: new Date().toISOString(),
                });
                
                results.push({
                    email: cred.email,
                    status: 'created'
                });
                
                console.log(`✅ Created account for: ${cred.email}`);
            }
        } catch (error) {
            errors.push({
                email: cred.email,
                error: error.message
            });
            console.error(`❌ Failed for ${cred.email}:`, error.message);
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Success: ${results.length}`);
    console.log(`  ❌ Errors: ${errors.length}`);
    
    return { results, errors };
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    updateStaffAccounts();
}

