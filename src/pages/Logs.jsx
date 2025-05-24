import React, { useState, useEffect } from 'react';
import { FaUser, FaSearch } from 'react-icons/fa';
import '../components/styles.css';
import axiosInstance from '../utils/axiosInstance';

function LogsList() {
    const [logs, setLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        try {
            const response = await axiosInstance.get('/logs');
            if (response.data.data) {
                setLogs(response.data.data.logs);
            }
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        Object.values(log).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="min-h-screen bg-[#76766b] dark:bg-gray-900 p-8">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-white dark:text-white" style={{ fontFamily: 'Tenor Sans' }}>
                    Security Logs
                </h2>
                <div className="relative">
                    <FaSearch className="search-button" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="bg-[#1c2120] dark:bg-gray-800 text-white">
                        <th className="p-4 text-left flex items-center">
                            <FaUser className="mr-2" />
                            User
                        </th>
                        <th className="p-4 text-left">Role</th>
                        <th className="p-4 text-left">Action</th>
                        <th className="p-4 text-left">Device</th>
                        <th className="p-4 text-left">Time Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLogs.map((log, index) => (
                        <tr
                            key={index}
                            className={`${index % 2 === 0 ? 'bg-[#2a2f2e] dark:bg-gray-800/50' : 'bg-[#1c2120] dark:bg-gray-800'
                                } text-white`}
                        >
                            <td className="p-4">{log.user_id}</td>
                            <td className="p-4">{log.role}</td>
                            <td className="p-4">{log.action}</td>
                            <td className="p-4">{log.device_id}</td>
                            <td className="p-4">
                                {new Date(log.created_at).toISOString().slice(0, 16).replace('T', ' ')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default LogsList;
