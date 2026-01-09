import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { CreditCard, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const StudentFees = () => {
    const [loading, setLoading] = useState(false);

    // Mock fee data - you can replace this with actual API calls
    const feeData = {
        totalFees: 45000,
        paidAmount: 30000,
        pendingAmount: 15000,
        dueDate: '2026-02-15',
        transactions: [
            {
                id: 1,
                date: '2025-12-10',
                description: 'Semester Fee - Installment 1',
                amount: 15000,
                status: 'paid',
                receiptNo: 'RCP001234'
            },
            {
                id: 2,
                date: '2026-01-05',
                description: 'Semester Fee - Installment 2',
                amount: 15000,
                status: 'paid',
                receiptNo: 'RCP001567'
            },
            {
                id: 3,
                date: '2026-02-15',
                description: 'Semester Fee - Installment 3',
                amount: 15000,
                status: 'pending',
                receiptNo: null
            }
        ]
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar role="Student" />
                <div className="flex-1 ml-0 lg:ml-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="Student" />

            <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <CreditCard className="mr-3 text-green-600" />
                        Fee Management
                    </h1>
                    <p className="text-gray-500 mt-1">Track your fee payments and pending dues</p>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600 font-medium text-sm">Total Fees</p>
                                <h2 className="text-3xl font-bold text-blue-900 mt-2">
                                    ₹{feeData.totalFees.toLocaleString()}
                                </h2>
                            </div>
                            <div className="p-4 rounded-full bg-blue-200">
                                <DollarSign className="w-8 h-8 text-blue-700" />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-600 font-medium text-sm">Paid Amount</p>
                                <h2 className="text-3xl font-bold text-green-900 mt-2">
                                    ₹{feeData.paidAmount.toLocaleString()}
                                </h2>
                            </div>
                            <div className="p-4 rounded-full bg-green-200">
                                <CheckCircle className="w-8 h-8 text-green-700" />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-600 font-medium text-sm">Pending Amount</p>
                                <h2 className="text-3xl font-bold text-orange-900 mt-2">
                                    ₹{feeData.pendingAmount.toLocaleString()}
                                </h2>
                                <p className="text-xs text-orange-600 mt-1">
                                    Due: {new Date(feeData.dueDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="p-4 rounded-full bg-orange-200">
                                <Clock className="w-8 h-8 text-orange-700" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Payment History */}
                <Card title="Payment History">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Receipt No.</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {feeData.transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 text-sm text-gray-900">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900">
                                            {transaction.description}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-semibold text-gray-900 text-right">
                                            ₹{transaction.amount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600 text-center">
                                            {transaction.receiptNo || '-'}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {transaction.status === 'paid' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Payment Instructions */}
                {feeData.pendingAmount > 0 && (
                    <Card className="mt-6 bg-orange-50 border-orange-200">
                        <div className="flex items-start">
                            <AlertCircle className="w-6 h-6 text-orange-600 mr-3 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-orange-900 mb-2">Payment Reminder</h3>
                                <p className="text-sm text-orange-800 mb-3">
                                    You have a pending fee of ₹{feeData.pendingAmount.toLocaleString()} due on {new Date(feeData.dueDate).toLocaleDateString()}.
                                </p>
                                <p className="text-xs text-orange-700">
                                    Please contact the office for payment details or visit the accounts section.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}
            </main>
        </div>
    );
};

export default StudentFees;
