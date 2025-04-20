import React from "react";
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaSearch } from 'react-icons/fa';
import '../components/styles.css';

//TODO Replace hardcoded examples with actual data from the database (to be implemented)
const logsData = [
    { email: 'user1@example.com', action: 'Login', success: true },
    { email: 'user2@example.com', action: 'Added device', success: false },
    { email: 'user3@example.com', action: 'Deleted device', success: true },
    { email: 'user4@example.com', action: 'Updated device', success: false },
];

export default function Rooms() {
    return (
        <div className="min-h-screen bg-[#76766b] dark:bg-gray-900 p-8">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-white dark:text-white" style={{ fontFamily: 'Tenor Sans' }}>
                    Security Logs
                </h2>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="pl-10 pr-4 py-2 rounded-lg bg-white/10 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/50 text-white dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="bg-[#1c2120] dark:bg-gray-800 text-white">
                        <th className="p-4 text-left flex items-center">
                            <FaEnvelope className="mr-2" />
                            Email
                        </th>
                        <th className="p-4 text-left">Action</th>
                        <th className="p-4 text-left">Success</th>
                    </tr>
                </thead>
                <tbody>
                    {logsData.map((log, index) => (
                        <tr
                            key={index}
                            className={`${
                                index % 2 === 0 ? 'bg-[#2a2f2e] dark:bg-gray-800/50' : 'bg-[#1c2120] dark:bg-gray-800'
                            } text-white`}
                        >
                            <td className="p-4">{log.email}</td>
                            <td className="p-4">{log.action}</td>
                            <td className="p-4">
                                {log.success ? (
                                    <FaCheckCircle className="text-green-500" />
                                ) : (
                                    <FaTimesCircle className="text-red-500" />
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
