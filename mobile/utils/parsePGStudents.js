// Utility script to parse PG students from Word document
// This script requires: npm install mammoth
// 
// Usage: node mobile/utils/parsePGStudents.js
//
// The script will read the Word document and extract PG student lists
// Excludes: M.Sc CS 1st year and MCA 1st year (as per user request)

import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig.js';
import { studentStorageService } from '../services/studentStorageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse PG students from Word document
 * Expected format: Name - RegisterNumber
 * Or: RegisterNumber Name
 */
export const parsePGStudents = async () => {
    try {
        const docxPath = path.join(__dirname, '../assets/Student name list/PG Name lsit With class.docx');
        
        if (!fs.existsSync(docxPath)) {
            console.error('❌ File not found:', docxPath);
            return null;
        }

        console.log('📄 Reading Word document...');
        const result = await mammoth.extractRawText({ path: docxPath });
        const text = result.value;

        console.log('📝 Extracted text length:', text.length);
        
        // Parse students by program and year
        const studentsByProgram = {
            'M.Sc CS': { '1': [], '2': [] },
            'M.Sc DS': { '1': [], '2': [] },
            'M.Sc CS Integrated': { '5': [], '6': [] },
            'M.Tech DS': { '1': [], '2': [] },
            'M.Tech NIS': { '1': [], '2': [] },
            'M.Tech CSE': { '1': [], '2': [] },
            'MCA': { '1': [], '2': [] },
        };

        const lines = text.split('\n').filter(line => line.trim());
        let currentProgram = null;
        let currentYear = null;

        for (const line of lines) {
            const trimmed = line.trim();
            
            // Skip empty lines
            if (!trimmed) continue;

            // Detect program headers
            if (trimmed.includes('M.Sc') || trimmed.includes('M.Tech') || trimmed.includes('MCA')) {
                // Extract program name
                if (trimmed.includes('M.Sc CS') && !trimmed.includes('Integrated')) {
                    currentProgram = 'M.Sc CS';
                } else if (trimmed.includes('M.Sc CS Integrated')) {
                    currentProgram = 'M.Sc CS Integrated';
                } else if (trimmed.includes('M.Sc DS') || trimmed.includes('M.Sc Data Science')) {
                    currentProgram = 'M.Sc DS';
                } else if (trimmed.includes('M.Tech DS') || trimmed.includes('M.Tech (DS & AI)')) {
                    currentProgram = 'M.Tech DS';
                } else if (trimmed.includes('M.Tech NIS')) {
                    currentProgram = 'M.Tech NIS';
                } else if (trimmed.includes('M.Tech CSE')) {
                    currentProgram = 'M.Tech CSE';
                } else if (trimmed.includes('MCA')) {
                    currentProgram = 'MCA';
                }

                // Extract year
                if (trimmed.match(/1st|First|I\s+Year|Year\s+1/i)) {
                    currentYear = '1';
                } else if (trimmed.match(/2nd|Second|II\s+Year|Year\s+2/i)) {
                    currentYear = '2';
                } else if (trimmed.match(/5th|Fifth|V\s+Year|Year\s+5/i)) {
                    currentYear = '5';
                } else if (trimmed.match(/6th|Sixth|VI\s+Year|Year\s+6/i)) {
                    currentYear = '6';
                }
                
                continue;
            }

            // Parse student entries
            // Format 1: Name – RegisterNumber
            // Format 2: RegisterNumber Name
            // Format 3: Name RegisterNumber
            if (currentProgram && currentYear) {
                // Skip M.Sc CS 1st year and MCA 1st year
                if ((currentProgram === 'M.Sc CS' && currentYear === '1') ||
                    (currentProgram === 'MCA' && currentYear === '1')) {
                    continue;
                }

                const dashMatch = trimmed.match(/^(.+?)\s*[–-]\s*([A-Z0-9]+)$/);
                const regNumFirstMatch = trimmed.match(/^([A-Z0-9]+)\s+(.+)$/);
                const nameFirstMatch = trimmed.match(/^(.+?)\s+([A-Z0-9]{8,})$/);

                let name, registerNumber;

                if (dashMatch) {
                    name = dashMatch[1].trim();
                    registerNumber = dashMatch[2].trim();
                } else if (regNumFirstMatch) {
                    registerNumber = regNumFirstMatch[1].trim();
                    name = regNumFirstMatch[2].trim();
                } else if (nameFirstMatch) {
                    name = nameFirstMatch[1].trim();
                    registerNumber = nameFirstMatch[2].trim();
                }

                if (name && registerNumber) {
                    studentsByProgram[currentProgram][currentYear].push({
                        name: name.trim(),
                        registerNumber: registerNumber.trim(),
                        program: currentProgram,
                        year: parseInt(currentYear),
                        course: 'PG'
                    });
                }
            }
        }

        // Flatten and return
        const allStudents = [];
        for (const [program, years] of Object.entries(studentsByProgram)) {
            for (const [year, students] of Object.entries(years)) {
                allStudents.push(...students.map(s => ({
                    ...s,
                    program,
                    year: parseInt(year)
                })));
            }
        }

        console.log(`✅ Parsed ${allStudents.length} students`);
        console.log('📊 Breakdown:');
        for (const [program, years] of Object.entries(studentsByProgram)) {
            for (const [year, students] of Object.entries(years)) {
                if (students.length > 0) {
                    console.log(`  ${program} - Year ${year}: ${students.length} students`);
                }
            }
        }

        return allStudents;
    } catch (error) {
        console.error('❌ Error parsing document:', error);
        return null;
    }
};

/**
 * Import PG students to Firestore
 */
export const importPGStudents = async () => {
    const students = await parsePGStudents();
    
    if (!students || students.length === 0) {
        console.log('⚠️ No students found in document');
        return;
    }

    console.log(`🚀 Importing ${students.length} students...`);
    
    const results = [];
    const errors = [];

    for (const student of students) {
        try {
            // Use registerNumber as document ID
            const studentRef = doc(db, 'students', student.registerNumber);
            
            await setDoc(studentRef, {
                ...student,
                id: student.registerNumber,
                registerNumber: student.registerNumber,
                name: student.name,
                program: student.program,
                year: student.year,
                course: student.course,
                createdAt: new Date().toISOString(),
            }, { merge: true });

            // Also add to local storage
            await studentStorageService.addStudent({
                ...student,
                id: student.registerNumber,
            });

            results.push({
                registerNumber: student.registerNumber,
                name: student.name,
                status: 'imported'
            });
            
            console.log(`✅ Imported: ${student.name} (${student.registerNumber})`);
        } catch (error) {
            errors.push({
                registerNumber: student.registerNumber,
                name: student.name,
                error: error.message
            });
            console.error(`❌ Failed for ${student.registerNumber}:`, error.message);
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Success: ${results.length}`);
    console.log(`  ❌ Errors: ${errors.length}`);
    
    return { results, errors };
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    importPGStudents();
}

