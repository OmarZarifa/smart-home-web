import React from 'react';
import DeviceList from '../components/DeviceList';

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🏠 Smart Home Control</h1>
      <DeviceList />
    </div>
  );
}
