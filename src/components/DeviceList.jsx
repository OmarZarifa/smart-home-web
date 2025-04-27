import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { socket } from '../socket';
import axiosInstance from '../utils/axiosInstance';
import './styles.css';

function DeviceList() {
  const [devices, setDevices] = useState([]);

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

    return () => {
      socket.off('device:update');
    };
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await axiosInstance.get('/device/all');
      if (response.data.data) {
        setDevices(response.data.data.devices);
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  };

  const toggleDeviceStatus = async (device) => {
    const updatedStatus = !device.status;
    const updatedLightStatus = updatedStatus ? 'ON' : 'OFF';

    try {
      const response = await axiosInstance.patch(`/device/${device.id}`, {
        status: updatedStatus,
        value: updatedStatus ? 1.0 : 0.0,
      });

      if (response.data.data) {
        setDevices(prevDevices =>
          prevDevices.map(d =>
            d.id === device.id ? { ...d, status: updatedStatus } : d
          )
        );

        // Emit device update to server
        const emitPayload = { device_name: device.name, status: updatedStatus };
        console.log('Emitting device:update:', emitPayload);
        socket.emit('device:update', emitPayload);
      }
      // Emit device update to server
      const emitPayload = { device_name: device.name, status: updatedLightStatus };
      console.log('Emitting device:update:', emitPayload);
      socket.emit('device:update', emitPayload);
      
    } catch (err) {
    console.error('Failed to update device status:', err);
  }
};

return (
  <div className="device-list-container">
    <div className="device-list-header">
      <div className="device-list-title-container">
        <h1 className="device-list-title">
          My Devices
        </h1>
        <div className="search-container">
          <FaSearch className="search-button" />
          <input type="text" placeholder="Search devices..." className="search-input" />
        </div>
      </div>
    </div>

    <div className="device-list-spacer"></div>

    {devices.length === 0 ? (
      <p>No devices found.</p>
    ) : (
      <div className="device-grid">
        {devices.map((device) => (
          <div key={device.id} className="device-item">
            <div className="device-header">
              <h3 className="device-name">
                {device.name} ({device.type})
              </h3>
            </div>

            <br />

            <div className="device-info">
              <p>
                Created:{' '}
                {new Date(device.created_at)
                  .toISOString()
                  .slice(0, 16)
                  .replace('T', ' ')}
              </p>
            </div>

            <div className="device-info">
              <p>
                Last Updated:{' '}
                {new Date(device.modified_at)
                  .toISOString()
                  .slice(0, 16)
                  .replace('T', ' ')}
              </p>
            </div>

            <div className="device-info">
              <p>Status: {device.status ? 'ON' : 'OFF'}</p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={device.status}
                onChange={() => toggleDeviceStatus(device)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        ))}
      </div>
    )}
  </div>
);
}

export default DeviceList;
