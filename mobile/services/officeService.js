import { db, storage } from './firebaseConfig';
import { collection, doc, getDocs, updateDoc, addDoc, query, where, orderBy, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { studentStorageService } from './studentStorageService';
import { getAllStudentCollections } from '../utils/collectionMapper';

export const officeService = {
    // Dashboard stats
    getDashboard: async () => {
        try {
            // Get students for stats
            const students = await officeService.getStudents();
            const totalStudents = students.length;
            
            // Calculate fee status
            const feeStatus = {
                semesterFeePaid: students.filter(s => s.fees?.semester).length,
                semesterFeeNotPaid: students.filter(s => !s.fees?.semester).length,
                examFeePaid: students.filter(s => s.fees?.exam).length,
                examFeeNotPaid: students.filter(s => !s.fees?.exam).length,
            };
            
            // Get upcoming exams
            const examsQuery = query(
                collection(db, "exams"),
                orderBy("date", "asc")
            );
            const examsSnapshot = await getDocs(examsQuery);
            const upcomingExams = examsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(exam => {
                    const examDate = exam.date?.toDate ? exam.date.toDate() : new Date(exam.date);
                    return examDate >= new Date();
                })
                .slice(0, 5);
            
            return {
                totalStudents,
                feeStatus,
                upcomingExams
            };
        } catch (error) {
            console.error('Error loading dashboard:', error);
            return { 
                totalStudents: 0, 
                feeStatus: { semesterFeePaid: 0, semesterFeeNotPaid: 0, examFeePaid: 0, examFeeNotPaid: 0 },
                upcomingExams: []
            };
        }
    },

    // Student management (List) - fetches from all collections
    getStudents: async () => {
        try {
            // First try local storage
            let students = await studentStorageService.getStudents();
            
            if (students.length > 0) {
                console.log(`Using ${students.length} students from local storage`);
                
                // Sync with Firestore in background
                getAllStudentCollections().forEach(async (collName) => {
                    try {
                        const snapshot = await getDocs(collection(db, collName));
                        const firestoreStudents = snapshot.docs.map(doc => ({ 
                            id: doc.id, 
                            ...doc.data(),
                            _collectionName: collName // Add collection name for filtering
                        }));
                        if (firestoreStudents.length > 0) {
                            await studentStorageService.addStudentsBulk(firestoreStudents);
                        }
                    } catch (err) {
                        console.error(`Background sync error for ${collName}:`, err);
                    }
                });
                
                return students;
            }
            
            // If no local data, fetch from all Firestore collections
            console.log('No local data, fetching from all Firestore collections...');
            const allStudents = [];
            const collections = getAllStudentCollections();
            
            for (const collName of collections) {
                try {
                    const snapshot = await getDocs(collection(db, collName));
                    const collStudents = snapshot.docs.map(doc => ({ 
                        id: doc.id, 
                        ...doc.data(),
                        _collectionName: collName // Add collection name for filtering
                    }));
                    allStudents.push(...collStudents);
                } catch (error) {
                    console.error(`Error fetching from ${collName}:`, error);
                }
            }
            
            // Also check old students collection for backward compatibility
            try {
                const oldSnapshot = await getDocs(collection(db, "students"));
                const oldStudents = oldSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                allStudents.push(...oldStudents);
            } catch (oldError) {
                console.warn('Error checking old collection:', oldError);
            }
            
            // Save to local storage
            if (allStudents.length > 0) {
                await studentStorageService.saveStudents(allStudents);
            }
            
            return allStudents;
        } catch (error) {
            console.error('Error getting students:', error);
            // Fallback to local storage
            return await studentStorageService.getStudents();
        }
    },

    // Fee management
    updateFees: async (studentId, feeData) => {
        // feeData: { semester: { status: 'Paid', amount: 1000, ... }, exam: { status: 'Paid', ... } }
        const studentRef = doc(db, "students", studentId);
        const currentDoc = await getDoc(studentRef);
        const currentFees = currentDoc.data()?.fees || {};
        
        // Merge new fee data with existing fees
        const updatedFees = {
            ...currentFees,
            ...feeData
        };
        
        await updateDoc(studentRef, { fees: updatedFees });
        
        // Update local storage
        const students = await studentStorageService.getStudents();
        const updatedStudents = students.map(s => {
            if ((s.id || s._id || s.registerNumber) === studentId) {
                return { ...s, fees: updatedFees };
            }
            return s;
        });
        await studentStorageService.saveStudents(updatedStudents);
        
        return { id: studentId, fees: updatedFees };
    },

    // Exam eligibility report - REMOVED (feature no longer needed)

    // Notices
    postNotice: async (noticeData) => {
        await addDoc(collection(db, "notices"), {
            ...noticeData,
            createdAt: new Date().toISOString(),
            isApproved: true, // Office notices are auto-approved
            postedBy: 'Office' // Office role posts
        });
    },

    // Upload image to Firebase Storage and get URL
    uploadNoticeImage: async (imageUri, noticeId) => {
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            
            const imageName = `notice_${noticeId || Date.now()}.jpg`;
            const storageRef = ref(storage, `notices/${imageName}`);
            
            await uploadBytes(storageRef, blob);
            const downloadUrl = await getDownloadURL(storageRef);
            
            return downloadUrl;
        } catch (error) {
            console.error('Error uploading notice image:', error);
            throw new Error('Failed to upload image');
        }
    },

    approveNotice: async (noticeId) => {
        const noticeRef = doc(db, "notices", noticeId);
        await updateDoc(noticeRef, { isApproved: true });
    },

    // Get notices
    getNotices: async () => {
        try {
            const noticesQuery = query(
                collection(db, "notices"),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(noticesQuery);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting notices:', error);
            return [];
        }
    },

    // Get events
    getEvents: async () => {
        try {
            const eventsQuery = query(
                collection(db, "events"),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(eventsQuery);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    }
};
