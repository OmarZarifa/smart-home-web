import React from 'react';
import DeviceList from '../components/DeviceList';
import '../components/styles.css';
import { FaMicrophone } from 'react-icons/fa';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-[#76766b] dark:bg-gray-900 p-8">
            <DeviceList />
            <button className="ai-button bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white dark:from-indigo-600 dark:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800"
                //TODO Add AI Assistant functionality
                onClick={() => alert('AI Assistant clicked')}>
                <FaMicrophone size={20} />
                Ask AI Assistant
            </button>
        </div>
    );
}
