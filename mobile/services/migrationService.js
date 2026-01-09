import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { db, auth } from './firebaseConfig'; // Ensure auth is exported from config if needed, or import from authService
import { localDataService } from './localDataService';
import { studentStorageService } from './studentStorageService';

export const migrationService = {
    /**
     * Boostraps the current user's role in Firestore
     * This is required because security rules check /users/{uid} for role
     */
    bootstrapUserRole: async (role) => {
        const user = auth.currentUser;
        if (!user) throw new Error("Must be logged in to bootstrap role");

        console.log(`Bootstrapping role ${role} for user ${user.uid}`);
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            role: role,
            createdAt: new Date().toISOString()
        }, { merge: true });
    },

    /**
     * Migrates all local static data to Firestore
     * Requires the user to have 'Staff' or 'Office' role in Firestore
     */
    migrateAllData: async () => {
        try {
            console.log("Starting Migration...");

            // 1. Staff Data
            const staffList = localDataService.getAllStaff();
            console.log(`Found ${staffList.length} staff to migrate`);

            // Batch writes (limit 500 per batch)
            const staffBatch = writeBatch(db);
            staffList.forEach(staff => {
                // Use email as ID if possible, or generate one
                const id = staff.email ? staff.email.toLowerCase().replace(/[^a-z0-9]/g, '_') : Date.now().toString();
                const ref = doc(db, 'staff', id);
                staffBatch.set(ref, {
                    ...staff,
                    id: id, // Ensure ID is part of document
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            });
            await staffBatch.commit();
            console.log("Staff Migration Complete");

            // 2. Student Data
            console.log("Preparing Student Data...");
            const programs = localDataService.getAvailablePrograms();
            let allStudents = [];

            for (const program of programs) {
                const years = ["1", "2"];
                for (const year of years) {
                    const students = localDataService.getStudents(program, year);
                    if (students) {
                        const hydrated = students.map(s => ({
                            ...s,
                            program,
                            year,
                            // Ensure ID exists
                            id: s.registerNumber || s.RegisterNumber,
                            email: s.email || (s.registerNumber ? `${s.registerNumber.toLowerCase()}@pondiuni.ac.in` : null)
                        }));
                        allStudents = [...allStudents, ...hydrated];
                    }
                }
            }
            console.log(`Found ${allStudents.length} students to migrate`);

            // Chunk students into batches of 400 (safe margin)
            const chunkSize = 400;
            for (let i = 0; i < allStudents.length; i += chunkSize) {
                const chunk = allStudents.slice(i, i + chunkSize);
                const batch = writeBatch(db);

                chunk.forEach(student => {
                    if (student.id) {
                        const ref = doc(db, 'students', student.id);
                        batch.set(ref, {
                            ...student,
                            isActive: true, // Default to active
                            migratedAt: new Date().toISOString()
                        }, { merge: true });
                    }
                });

                await batch.commit();
                console.log(`Migrated students batch ${i / chunkSize + 1}`);
            }
            console.log("Student Migration Complete");

            // 3. Notices & Events (Optional - from Local Storage if any)
            // Skipping strictly static data for now unless requested.

            return { success: true, count: allStudents.length + staffList.length };

        } catch (error) {
            console.error("Migration Error:", error);
            throw error;
        }
    }
};
