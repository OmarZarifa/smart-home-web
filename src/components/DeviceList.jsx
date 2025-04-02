import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5050';

// Establish the WebSocket connection
const socket = io(WS_URL);

function DeviceList() {
  const [devices, setDevices] = useState([]);

  // Fetch devices initially
  useEffect(() => {
    fetchDevices();

    // Listen for real-time updates from the server
    socket.on('device:update', (updatedDevice) => {
      console.log('Received device:update:', updatedDevice);

      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.id === updatedDevice.id ? updatedDevice : device
        )
      );
    });

    // Cleanup event listener when component unmounts
    return () => {
      socket.off('device:update');
    };
  }, []);

  // Fetch devices from the backend
  const fetchDevices = async () => {
    try {
      const response = await fetch(`${API_URL}/device/all`);
      const data = await response.json();
      if (data.data) {
        setDevices(data.data.devices);
      }
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    }
  };

  // Toggle device status
  const toggleDeviceStatus = async (device) => {
    const updatedStatus = !device.status;
    const updatedLightStatus = updatedStatus ? 'ON' : 'OFF';

    try {
      const response = await fetch(`${API_URL}/device/${device.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updatedStatus,
          value: updatedStatus ? 1.0 : 0.0,
        }),
      });

      const updatedDevice = await response.json();
      if (updatedDevice.error) {
        console.error('Failed to update device:', updatedDevice.error);
      } else {
        // Emit WebSocket event
        const deviceKey = device.name;
        const emitPayload = { device_name: deviceKey, status: updatedLightStatus };

        console.log("Emitting device:update:", emitPayload);
        socket.emit('device:update', emitPayload);
      }
    } catch (err) {
      console.error('Failed to update device status:', err);
    }
  };

  return (
    <div>
      {devices.length === 0 ? (
        <p>No devices found.</p>
      ) : (
        <ul>
          {devices.map((device) => (
            <li key={device.id} className="mb-4 p-3 border rounded shadow flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{device.name} ({device.type})</h3>
                <p>Status: {device.status ? 'ON' : 'OFF'}</p>
              </div>
              <button
                onClick={() => toggleDeviceStatus(device)}
                className={`px-4 py-2 rounded ${device.status ? 'bg-red-500' : 'bg-green-500'} text-white`}
              >
                {device.status ? 'Turn OFF' : 'Turn ON'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DeviceList;
