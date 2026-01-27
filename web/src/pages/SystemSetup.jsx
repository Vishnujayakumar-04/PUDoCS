import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import createTestStaff from '../utils/createTestStaff';
import createTestParent from '../utils/createTestParent';
import { doc, setDoc } from '../services/mockFirebase';
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
                            <h2 className="text-lg font-semibold mb-2">Status Info</h2>
                            <div className="text-xs space-y-2 text-slate-300">
                                <p>Logged In: {currentUser ? <span className="text-green-400">Yes ({currentUser.email})</span> : <span className="text-red-400">No</span>}</p>
                                <p>UID: {currentUser?.uid || 'N/A'}</p>
                            </div>
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
