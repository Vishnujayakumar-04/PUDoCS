import React, { useState, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { studentStorageService } from '../../services/studentStorageService';
import {
    FileText,
    Upload,
    CheckCircle,
    AlertCircle,
    File
} from 'lucide-react';

const DOCUMENT_TYPES = [
    { id: 'tenthMarksheet', label: '10th Marksheet (PDF)' },
    { id: 'twelfthMarksheet', label: '12th Marksheet (PDF)' },
    { id: 'ugOverall', label: 'UG Overall Marksheet (PDF)' },
    { id: 'ugProvisional', label: 'UG Provisional Certificate (PDF)' },
    { id: 'incomeCertificate', label: 'Income Certificate (PDF)' },
    { id: 'residencyCertificate', label: 'Residency Certificate (PDF)' },
    { id: 'casteCertificate', label: 'Caste Certificate (PDF)' },
    { id: 'nptel', label: 'NPTEL (PDF)' },
    { id: 'outreachProgram', label: 'Outreach Program (PDF)' },
];

const StudentDocuments = () => {
    const [uploadingId, setUploadingId] = useState(null);
    const [uploadedDocs, setUploadedDocs] = useState({}); // Mock tracking uploads
    const fileInputRef = useRef(null);
    const [activeDocType, setActiveDocType] = useState(null);

    // Mock User
    const user = { uid: 'student123' };

    const handleUploadClick = (docType) => {
        setActiveDocType(docType);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeDocType) return;

        if (file.type !== 'application/pdf') {
            alert('Please select a PDF document.');
            return;
        }

        try {
            setUploadingId(activeDocType.id);

            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock saving metadata
            const metadata = {
                label: activeDocType.label,
                fileName: file.name,
                size: file.size,
                uploadedAt: new Date().toISOString(),
                mockUrl: URL.createObjectURL(file) // For demo session
            };

            // Update local state to show "Uploaded"
            setUploadedDocs(prev => ({
                ...prev,
                [activeDocType.id]: metadata
            }));

            // Ideally call studentStorageService.saveDocumentMetadata(user.uid, activeDocType.id, metadata);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        } finally {
            setUploadingId(null);
            setActiveDocType(null);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="Student" />

            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FileText className="mr-3 text-blue-600" />
                        Documents
                    </h1>
                    <p className="text-gray-500 mt-1">Upload required certificates and marksheets (PDF only)</p>
                </header>

                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-blue-800">Important Instruction</h4>
                            <p className="mt-1 text-sm text-blue-700">
                                Please upload clear PDF copies. Staff and office administration will verify these documents.
                            </p>
                        </div>
                    </div>

                    {DOCUMENT_TYPES.map((docType) => {
                        const isUploaded = !!uploadedDocs[docType.id];
                        const uploadedMeta = uploadedDocs[docType.id];

                        return (
                            <Card key={docType.id} className="transition-colors hover:border-gray-300">
                                <div className="flex flex-col sm:flex-row items-center justify-between">
                                    <div className="flex items-center mb-4 sm:mb-0 w-full sm:w-auto">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${isUploaded ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {isUploaded ? <CheckCircle className="w-6 h-6" /> : <File className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">{docType.label}</h3>
                                            {isUploaded ? (
                                                <p className="text-sm text-green-600 flex items-center mt-1">
                                                    Uploaded on {new Date(uploadedMeta.uploadedAt).toLocaleDateString()}
                                                    <span className="mx-2">•</span>
                                                    {(uploadedMeta.size / 1024).toFixed(1)} KB
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-500 mt-1">Not uploaded yet</p>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        variant={isUploaded ? "outline" : "primary"}
                                        onClick={() => handleUploadClick(docType)}
                                        disabled={uploadingId === docType.id}
                                        className="w-full sm:w-auto"
                                    >
                                        {uploadingId === docType.id ? (
                                            <span className="flex items-center">
                                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
                                                Uploading...
                                            </span>
                                        ) : isUploaded ? (
                                            <span className="flex items-center">
                                                <Upload className="w-4 h-4 mr-2" /> Re-upload
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <Upload className="w-4 h-4 mr-2" /> Upload PDF
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                />

            </main>
        </div>
    );
};

export default StudentDocuments;

