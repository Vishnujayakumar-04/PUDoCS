// web/src/services/mockFirebase.js

const LOC_KEY = 'PUDOCS_DB_V1';

// --- Default Data Seeding ---
const SEED_DATA = {
    users: {
        'staff_krishna': {
            uid: 'staff_krishna',
            email: 'krishnapriya.csc@pondiuni.ac.in',
            role: 'Staff',
            name: 'Dr. Krishnapriya',
            designation: 'Assistant Professor',
            department: 'Computer Science'
        },
        'staff_admin': {
            uid: 'staff_admin',
            email: 'staff@pondiuni.ac.in',
            role: 'Staff',
            name: 'Staff Admin',
        },
        'office_admin': {
            uid: 'office_admin',
            email: 'office@pondiuni.ac.in',
            role: 'Office',
            name: 'Office Admin'
        },
        'student_01': {
            uid: 'student_01',
            email: '25mscscpy0001@pondiuni.ac.in',
            role: 'Student',
            name: 'AHAMED THIJANI PP',
            registerNumber: '25MSCSCPY0001'
        },
        'parent_01': {
            uid: 'parent_01',
            email: 'parent@pondiuni.ac.in',
            role: 'Parent',
            name: 'Parent User',
            linkedStudentId: '25MSCSCPY0001'
        }
    },
    staff: {
        'staff_krishna': {
            uid: 'staff_krishna',
            email: 'krishnapriya.csc@pondiuni.ac.in',
            role: 'Staff',
            name: 'Dr. Krishnapriya',
            designation: 'Assistant Professor',
            department: 'Computer Science'
        },
        'staff_admin': {
            uid: 'staff_admin',
            role: 'Staff'
        }
    },
    students: {
        'student_01': {
            uid: 'student_01',
            email: '25mscscpy0001@pondiuni.ac.in',
            name: 'AHAMED THIJANI PP',
            registerNumber: '25MSCSCPY0001',
            course: 'M.Sc Computer Science',
            batch: '2025-2027'
        }
    },
    parents: {
        'parent_01': {
            uid: 'parent_01',
            email: 'parent@pondiuni.ac.in',
            linkedStudentId: '25MSCSCPY0001'
        }
    },
    notifications: {},
    attendance: {}
};

// Initiate DB if empty
if (!localStorage.getItem(LOC_KEY)) {
    console.log("Seeding LocalStorage DB...");
    localStorage.setItem(LOC_KEY, JSON.stringify(SEED_DATA));
}

const getDB = () => JSON.parse(localStorage.getItem(LOC_KEY) || '{}');
const saveDB = (data) => localStorage.setItem(LOC_KEY, JSON.stringify(data));

// --- Mock Firestore API ---

export const db = { type: 'mock' }; // Dummy object

export const collection = (db, name) => ({ type: 'collection', path: name });

export const doc = (db, colOrPath, id) => {
    if (typeof colOrPath === 'string') return { type: 'doc', path: colOrPath, id }; // legacy path
    return { type: 'doc', path: colOrPath.path, id };
};

export const getDoc = async (docRef) => {
    const data = getDB();
    const colStr = docRef.path;
    const docData = data[colStr] ? data[colStr][docRef.id] : null;

    return {
        exists: () => !!docData,
        data: () => docData,
        id: docRef.id
    };
};

export const setDoc = async (docRef, data, options = {}) => {
    const dbData = getDB();
    if (!dbData[docRef.path]) dbData[docRef.path] = {};

    if (options.merge && dbData[docRef.path][docRef.id]) {
        dbData[docRef.path][docRef.id] = { ...dbData[docRef.path][docRef.id], ...data };
    } else {
        dbData[docRef.path][docRef.id] = { ...data };
    }

    saveDB(dbData);
    console.log(`[MockDB] Wrote to ${docRef.path}/${docRef.id}`);
};

export const addDoc = async (colRef, data) => {
    const id = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await setDoc({ path: colRef.path, id }, data);
    return { id, path: colRef.path + '/' + id };
};

export const updateDoc = async (docRef, data) => {
    // mapped to setDoc merge
    return setDoc(docRef, data, { merge: true });
};

// Query simulation
export const query = (colRef, ...constraints) => {
    return { type: 'query', colRef, constraints };
};

export const where = (field, op, value) => ({ type: 'where', field, op, value });
export const limit = (count) => ({ type: 'limit', count });
export const orderBy = (field, dir) => ({ type: 'orderBy', field, dir });

export const getDocs = async (queryObj) => {
    // If passed a collection ref directly
    const colPath = queryObj.type === 'collection' ? queryObj.path : queryObj.colRef.path;
    const constraints = queryObj.constraints || [];

    const dbData = getDB();
    const collectionData = dbData[colPath] || {};
    let docsArray = Object.values(collectionData);

    // Filter
    constraints.forEach(c => {
        if (c.type === 'where') {
            docsArray = docsArray.filter(d => {
                if (c.op === '==') return (d[c.field] && d[c.field].toLowerCase ? d[c.field].toLowerCase() : d[c.field]) == (c.value && c.value.toLowerCase ? c.value.toLowerCase() : c.value);
                if (c.op === 'array-contains') return Array.isArray(d[c.field]) && d[c.field].includes(c.value);
                return true;
            });
        }
        if (c.type === 'limit') {
            docsArray = docsArray.slice(0, c.count);
        }
    });

    return {
        empty: docsArray.length === 0,
        size: docsArray.length,
        docs: docsArray.map(d => ({
            id: d.uid || d.id || 'unknown',
            data: () => d,
            exists: () => true
        }))
    };
};

export const deleteDoc = async (docRef) => {
    const dbData = getDB();
    if (dbData[docRef.path] && dbData[docRef.path][docRef.id]) {
        delete dbData[docRef.path][docRef.id];
        saveDB(dbData);
    }
}
