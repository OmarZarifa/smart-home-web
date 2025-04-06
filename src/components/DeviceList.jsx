import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { FaSearch, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { LuSettings2 } from 'react-icons/lu';
import { IconContext } from 'react-icons';
import AddDeviceDialog from './AddDeviceDialog';
import DeleteDeviceDialog from './DeleteDeviceDialog';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

// Establish the WebSocket connection
const socket = io(WS_URL);

function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(false);

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
      const response = await fetch(`${API_URL}/device/all`);
      const data = await response.json();
      if (data.data) {
        setDevices(data.data.devices);
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  };

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
        const deviceKey = device.name;
        const emitPayload = { device_name: deviceKey, status: updatedLightStatus };

        console.log('Emitting device:update:', emitPayload);
        socket.emit('device:update', emitPayload);
      }
    } catch (err) {
      console.error('Failed to update device status:', err);
    }
  };

  const openDeleteDialog = (deviceId) => {
    setSelectedDeviceId(deviceId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedDeviceId(null);
  };

  const handleDeviceDeleted = (deviceId) => {
    setDevices(devices.filter((device) => device.id !== deviceId));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontFamily: 'Tenor Sans', fontSize: '1.5rem', color: 'white' }}>
            My Devices
          </h1>
          <div style={{ position: 'relative', width: '300px' }}>
            <FaSearch className="search-button" />
            <input type="text" placeholder="Search devices..." className="search-input" />
          </div>
        </div>

        <button className="add-device-button" onClick={() => setShowDialog(true)}>
          <FaPlus /> Add Device
        </button>

        <AddDeviceDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          onDeviceAdded={(device) => {
            setShowDialog(false);
            fetchDevices();
          }}
        />
      </div>

      <div style={{ height: '1.5rem' }}></div>

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
                <div className="device-buttons">
                  <IconContext.Provider value={{ size: '25px' }}>
                    <LuSettings2 className="device-button" />
                    <button
                      className="device-button"
                      onClick={() => openDeleteDialog(device.id)}
                    >
                      <FaTrashAlt />
                    </button>
                  </IconContext.Provider>
                </div>
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

          <DeleteDeviceDialog
            isOpen={isDeleteDialogOpen}
            onClose={closeDeleteDialog}
            deviceId={selectedDeviceId}
            onDeviceDeleted={handleDeviceDeleted}
          />
        </div>
      )}
    </div>
  );
}

export default DeviceList;
