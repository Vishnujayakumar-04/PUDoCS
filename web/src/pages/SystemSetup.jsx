import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import createTestStaff from '../utils/createTestStaff';
import createTestParent from '../utils/createTestParent';
import createTestCR from '../utils/createTestCR';
import createStudentAccounts from '../utils/createStudentAccounts';
import createTestOffice from '../utils/createTestOffice';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Terminal, RefreshCw } from 'lucide-react';

const SystemSetup = () => {
    const { currentUser } = useAuth();
    const [logs, setLogs] = useState([]);
    const [isTesting, setIsTesting] = useState(false);

    const log = (msg, type = 'info') => {
        setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
    };

    const clearLogs = () => setLogs([]);

    const testRules = async () => {
        setIsTesting(true);
        log("Testing Firestore Write Permissions...", 'info');
        try {
            if (!currentUser) {
                log("Warning: No user logged in. Write test might fail if rules require auth.", 'warning');
            }
            // Try to write to a dummy doc in users collection.
            // Note: Rules allow users to write to their OWN uid.
            // If logged out, this should fail.
            // If logged in, we write to users/{uid}.

            const targetUid = currentUser ? currentUser.uid : 'test_guest';

            if (!currentUser) {
                log("Error: You must be logged in to test writes properly. Run 'Fix Staff' first to auto-login.", 'error');
                setIsTesting(false);
                return;
            }

            await setDoc(doc(db, 'users', targetUid), {
                testWrite: true,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            log("✅ Success! Rules are deployed and allowing writes.", 'success');
        } catch (error) {
            console.error(error);
            log(`❌ FAILED: ${error.message}`, 'error');
            if (error.message.includes("permission")) {
                log("CRITICAL: 'Missing or insufficient permissions' means rules are NOT deployed.", 'error');
                log("ACTION REQUIRED: Run 'firebase deploy --only firestore:rules' in terminal.", 'warning');
            }
        }
        setIsTesting(false);
    };

    const runFixStaff = async () => {
        setIsTesting(true);
        log("Starting Staff Fix...", 'info');
        try {
            await createTestStaff();
            log("✅ Staff Fix Script Completed Successfully.", 'success');
        } catch (error) {
            log(`❌ Staff Fix Failed: ${error.message}`, 'error');
            if (error.message.includes("permission")) {
                log("⚠️ RULES ISSUE: The 'staff' collection is locked. Run 'firebase deploy --only firestore:rules'", 'warning');
            }
        }
        setIsTesting(false);
    };

    const runFixParent = async () => {
        setIsTesting(true);
        log("Starting Parent Fix...", 'info');
        try {
            await createTestParent();
            log("✅ Parent Fix Script Completed Successfully.", 'success');
        } catch (error) {
            log(`❌ Parent Fix Failed: ${error.message}`, 'error');
        }
        setIsTesting(false);
    };

    const runFixCR = async () => {
        setIsTesting(true);
        log("Starting CR Account Creation...", 'info');
        try {
            await createTestCR();
            log("✅ CR Account Created Successfully (cr.mca1@pondiuni.ac.in).", 'success');
        } catch (error) {
            log(`❌ CR Creation Failed: ${error.message}`, 'error');
        }
        setIsTesting(false);
    };

    const runCreateStudents = async () => {
        setIsTesting(true);
        log("Starting Student Account Creation (M.Sc CS 1st Year)...", 'info');
        try {
            const result = await createStudentAccounts();
            log(`✅ Batch Complete. Success: ${result.success}, Failed: ${result.failed}`, 'success');
            if (result.failed > 0) {
                log(`⚠️ Check console for failure details.`, 'warning');
            }
        } catch (error) {
            log(`❌ Student Creation Failed: ${error.message}`, 'error');
        }
        setIsTesting(false);
    };

    const runCreateOffice = async () => {
        setIsTesting(true);
        log("Starting Office Account Creation...", 'info');
        try {
            await createTestOffice();
            log("✅ Office Account Created (office.csc@pondiuni.ac.in).", 'success');
        } catch (error) {
            log(`❌ Office Creation Failed: ${error.message}`, 'error');
        }
        setIsTesting(false);
    };

    const runAlignment = async () => {
        setIsTesting(true);
        log("🔄 STARTING DATABASE ALIGNMENT...", 'info');

        try {
            // 1. Load Staff Mapping
            const { staffMapping } = await import('../data/staffMapping');
            log(`Loaded ${Object.keys(staffMapping).length} staff mappings from file.`, 'info');

            // 2. Fetch Collections
            const { collection, getDocs } = await import('firebase/firestore');

            // Helper to align a collection
            const alignCollection = async (collName, role) => {
                log(`Scanning '${collName}' collection...`, 'info');
                const snap = await getDocs(collection(db, collName));
                let count = 0;

                for (const d of snap.docs) {
                    const data = d.data();
                    const uid = d.id; // Assuming Doc ID is UID as per strict rules. 
                    // If not, we have a problem, but for now we assume strictness.

                    // Check/Create Router Doc
                    const userRef = doc(db, 'users', uid);
                    await setDoc(userRef, {
                        email: data.email || `${uid}@placeholder.com`,
                        role: role,
                        isActive: true, // Auto-activate existing
                        profileRef: `${collName}/${uid}`,
                        updatedAt: new Date().toISOString()
                    }, { merge: true });

                    // Specific Logic: Staff Assignments
                    if (role === 'Staff' && data.name) {
                        const assignments = staffMapping[data.name.trim()] || [];
                        if (assignments.length > 0) {
                            // Save to staff/{uid}/teachingAssignments (as array or subcol layout?)
                            // User asked for: staff/{uid}/teachingAssignments[] -> Field in doc usually, or subcollection?
                            // Plan says "teachingAssignments[]" inside doc is easier for now.
                            await setDoc(doc(db, 'staff', uid), {
                                teachingAssignments: assignments
                            }, { merge: true });
                            // log(`   -> Assigned ${assignments.length} classes to ${data.name}`);
                        }
                    }
                    count++;
                }
                log(`✅ Aligned ${count} ${role} accounts.`, 'success');
            };

            await alignCollection('students', 'Student');
            await alignCollection('staff', 'Staff');
            await alignCollection('parents', 'Parent');

            log("🚀 DATABASE ALIGNMENT COMPLETE!", 'success');

        } catch (error) {
            console.error(error);
            log(`❌ ALIGNMENT FAILED: ${error.message}`, 'error');
        }
        setIsTesting(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-mono">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center border-b border-slate-700 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-indigo-400 flex items-center gap-2">
                            <Terminal size={24} />
                            System Diagnostics
                        </h1>
                        <p className="text-sm text-slate-500">Database & Permissions Utility</p>
                    </div>
                    <Link to="/" className="text-sm text-slate-400 hover:text-white underline">Back to Login</Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <h2 className="text-lg font-semibold mb-2">1. Account Fixes</h2>
                            <p className="text-xs text-slate-400 mb-4">
                                Creates Authentication users and seeds Firestore profiles (users/staff/students).
                                Handles "User Not Found" errors.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={runFixStaff}
                                    disabled={isTesting}
                                    className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                    <RefreshCw size={16} /> Fix Staff Account (Krishnapriya)
                                </button>
                                <button
                                    onClick={runFixParent}
                                    disabled={isTesting}
                                    className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 rounded text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                    <RefreshCw size={16} /> Fix Parent Account
                                </button>
                                <button
                                    onClick={runFixCR}
                                    disabled={isTesting}
                                    className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 rounded text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                    <RefreshCw size={16} /> Create Test CR
                                </button>
                                <button
                                    onClick={runCreateStudents}
                                    disabled={isTesting}
                                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                    <RefreshCw size={16} /> Create Student Accounts (M.Sc CS)
                                </button>
                                <button
                                    onClick={runCreateOffice}
                                    disabled={isTesting}
                                    className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 rounded text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                    <RefreshCw size={16} /> Create Office Account
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <h2 className="text-lg font-semibold mb-2">2. Verify Rules</h2>
                            <p className="text-xs text-slate-400 mb-4">
                                Attempts to write to the database. If this fails, you MUST deploy rules.
                            </p>
                            <button
                                onClick={testRules}
                                disabled={isTesting}
                                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                <CheckCircle size={16} /> Test Write Permissions
                            </button>
                        </div>

                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <h2 className="text-lg font-semibold mb-2">3. Database Alignment</h2>
                            <p className="text-xs text-slate-400 mb-4">
                                Migrates all existing users to the new "Router Pattern" (users/UID) and uploads Staff Assignments.
                            </p>
                            <button
                                onClick={runAlignment}
                                disabled={isTesting}
                                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                <RefreshCw size={16} /> Align & Migrate Database
                            </button>
                        </div>
                    </div>

                    {/* Console Log */}
                    <div className="bg-black rounded-lg border border-slate-700 flex flex-col h-[500px]">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
                            <span className="text-xs font-bold text-slate-500">Live Logs</span>
                            <button onClick={clearLogs} className="text-xs text-slate-500 hover:text-white">Clear</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
                            {logs.length === 0 && <span className="text-slate-600 italic">Ready...</span>}
                            {logs.map((log, idx) => (
                                <div key={idx} className={`flex gap-2 ${log.type === 'error' ? 'text-red-400' :
                                    log.type === 'success' ? 'text-green-400' :
                                        log.type === 'warning' ? 'text-yellow-400' : 'text-slate-300'
                                    }`}>
                                    <span className="text-slate-600 shrink-0">[{log.time}]</span>
                                    <span>{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSetup;
