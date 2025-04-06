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

    return <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontFamily: 'Tenor Sans', fontSize: '1.5rem', color: 'white' }}>
                Security Logs
            </h2>
            <div style={{ position: 'relative', width: '300px' }}>
                <FaSearch
                    className="search-button"
                />
                <input
                    type="text"
                    placeholder="Search logs..."
                    className="search-input"
                />
            </div>
        </div>
        <table className="security-log">
            <thead>
                <tr style={{ backgroundColor: '#000000', color: 'white' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', display: 'flex', alignItems: 'center' }} >
                        <FaEnvelope style={{ marginRight: '0.5rem' }} />Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Action</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Success</th>
                </tr>
            </thead>
            <tbody>
                {logsData.map((log, index) => (
                    <tr
                        key={index}
                        style={{
                            backgroundColor: index % 2 === 0 ? '#444' : '#555',
                        }}
                    >
                        <td style={{ padding: '1rem' }}>{log.email}</td>
                        <td style={{ padding: '1rem' }}>{log.action}</td>
                        <td style={{ padding: '1rem' }}>
                            <span
                                style={{
                                    color: log.success ? 'green' : 'red',
                                    fontWeight: 'bold',
                                }}
                            >
                                {log.success ? (
                                    <FaCheckCircle style={{ color: 'green' }} />
                                ) : (
                                    <FaTimesCircle style={{ color: '#f35000' }} />
                                )}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>;
}
