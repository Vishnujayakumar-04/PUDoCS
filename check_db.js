const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

// Config from your project
const firebaseConfig = {
    apiKey: "AIzaSyCaT7tbMpPhWLW6GZPsweUAtFBk9sWF_UU",
    authDomain: "pudocs-depofcs.firebaseapp.com",
    projectId: "pudocs-depofcs",
    storageBucket: "pudocs-depofcs.firebasestorage.app",
    messagingSenderId: "41744174106",
    appId: "1:41744174106:web:418f3d3239a07a925615a3"
};

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDatabase() {
    console.log("Checking Firestore Database Content...\n");

    const collectionsToCheck = ['users', 'students', 'staff', 'notices', 'events', 'exams'];

    for (const colName of collectionsToCheck) {
        try {
            const colRef = collection(db, colName);
            const snapshot = await getDocs(colRef);
            console.log(`📂 Collection: '${colName}'`);
            console.log(`   - Count: ${snapshot.size} documents`);

            if (snapshot.size > 0) {
                // Show first ID as sample
                const firstDoc = snapshot.docs[0];
                console.log(`   - Sample ID: ${firstDoc.id}`);
                // console.log(`   - Sample Data:`, JSON.stringify(firstDoc.data()).substring(0, 100) + "...");
            }
            console.log("");
        } catch (e) {
            console.log(`❌ Error checking '${colName}':`, e.message);
        }
    }
}

checkDatabase().then(() => {
    // console.log("Done");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
