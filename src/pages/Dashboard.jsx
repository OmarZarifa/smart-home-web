import React from 'react';
import DeviceList from '../components/DeviceList';
import '../components/styles.css';
import { FaMicrophone } from 'react-icons/fa';

export default function Dashboard() {
    return (
        <div>
            <DeviceList />
            <button className="ai-button"
                //TODO Add AI Assistant functionality
                onClick={() => alert('AI Assistant clicked')}>
                <FaMicrophone size={20} />
                Ask AI Assistant
            </button>
        </div>
    );
}
