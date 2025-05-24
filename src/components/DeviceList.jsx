import React, { useEffect, useState } from 'react';
import { FaSearch, FaPlus, FaTrash } from 'react-icons/fa';
import { socket } from '../socket';
import axiosInstance from '../utils/axiosInstance';
import './styles.css';
import { LuSettings2 } from 'react-icons/lu';
import { IconContext } from 'react-icons';
import AddDeviceDialog from './AddDeviceDialog';
import UpdateDeviceDialog from './UpdateDeviceDialog';

function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [userDevices, setUserDevices] = useState([]);
  const [showAllDevicesList, setShowAllDevicesList] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isUpdateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDevices = async () => {
    try {
      const res = await axiosInstance.get('/device/all');
      if (res.data.data) {
        setDevices(res.data.data.devices);
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  };

  const refreshDevices = async () => {
    try {
      const res = await axiosInstance.get('/device/all');
      if (res.data.data) {
        const fetchedDevices = res.data.data.devices;
        setDevices(fetchedDevices);

        setUserDevices(prevUserDevices => {
          const updatedUserDevices = fetchedDevices.filter(dev =>
            prevUserDevices.some(ud => ud.id === dev.id)
          );
          localStorage.setItem('userDevices', JSON.stringify(updatedUserDevices));
          return updatedUserDevices;
        });
      }
    } catch (err) {
      console.error('Failed to refresh devices:', err);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    const savedUserDevices = localStorage.getItem('userDevices');
    if (savedUserDevices) {
      try {
        setUserDevices(JSON.parse(savedUserDevices));
      } catch {
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshDevices();
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const handleDeviceUpdate = ({ device_name, status }) => {
      const booleanStatus = status === 'ON';

      setDevices(prev =>
        prev.map(d =>
          d.name === device_name
            ? {
              ...d,
              status: booleanStatus,
              value: booleanStatus ? 1.0 : 0.0,
              modified_at: new Date().toISOString(),
            }
            : d
        )
      );

      setUserDevices(prev =>
        prev.map(d =>
          d.name === device_name
            ? {
              ...d,
              status: booleanStatus,
              value: booleanStatus ? 1.0 : 0.0,
              modified_at: new Date().toISOString(),
            }
            : d
        )
      );
    };

    socket.on('device:update', handleDeviceUpdate);
    return () => {
      socket.off('device:update', handleDeviceUpdate);
    };
  }, []);

  const toggleDeviceStatus = async (device) => {
    const updatedStatus = !device.status;
    const updatedLightStatus = updatedStatus ? 'ON' : 'OFF';

    try {
      const res = await axiosInstance.patch(`/device/${device.id}`, {
        status: updatedStatus,
        value: updatedStatus ? 1.0 : 0.0,
      });

      if (res.data.data) {
        const updatedDevice = { ...device, status: updatedStatus };

        setDevices(prev =>
          prev.map(d => (d.id === device.id ? updatedDevice : d))
        );
        setUserDevices(prev => {
          const updated = prev.map(d => (d.id === device.id ? updatedDevice : d));
          localStorage.setItem('userDevices', JSON.stringify(updated));
          return updated;
        });

        const emitPayload = {
          device_name: device.name,
          status: updatedLightStatus,
        };

        console.log('Emitting device:update:', emitPayload);
        socket.emit('device:update', emitPayload);

        refreshDevices();
      }
    } catch (err) {
      console.error('Failed to update device status:', err);
    }
  };

  const handleAddDeviceToDashboard = (device) => {
    if (!userDevices.some(d => d.id === device.id)) {
      const updatedDevices = [...userDevices, device];
      setUserDevices(updatedDevices);
      localStorage.setItem('userDevices', JSON.stringify(updatedDevices));
    }
  };

  const handleRemoveFromDashboard = (deviceId) => {
    const updatedDevices = userDevices.filter(d => d.id !== deviceId);
    setUserDevices(updatedDevices);
    localStorage.setItem('userDevices', JSON.stringify(updatedDevices));
  };

  const openUpdateDialog = (device) => {
    setSelectedDevice(device);
    setUpdateDialogOpen(true);
  };

  const closeUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setSelectedDevice(null);
  };

  const filteredDevices = userDevices.filter((device) =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="device-list-container">
      <div className="device-list-header">
        <div className="device-list-title-container">
          <h1 className="device-list-title">My Devices</h1>
          <div className="search-container">
            <FaSearch className="search-button" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <button
          className="add-device-button"
          onClick={() => setShowAllDevicesList(prev => !prev)}
        >
          <FaPlus /> Add Devices
        </button>

        <AddDeviceDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          onDeviceAdded={() => {
            setShowDialog(false);
            fetchDevices();
          }}
        />
      </div>

      {showAllDevicesList && (
        <div className="all-devices-scrollable">
          {devices.map(device => (
            <div key={device.id} className="addable-device-item">
              <span>{device.name} ({device.type})</span>
              <button onClick={() => handleAddDeviceToDashboard(device)}>
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="device-list-spacer"></div>

      {filteredDevices.length === 0 ? (
        <div className="no-devices-message">
        <p>No devices found. Please add your Devices.</p>
      </div>
      ) : (
        <div className="device-grid">
          {filteredDevices.map((device) => (
            <div key={device.id} className="device-item">
              <div className="device-header">
                <h3 className="device-name">
                  {device.name} ({device.type})
                </h3>
                <div className="device-buttons">
                  <IconContext.Provider value={{ size: '20px' }}>
                    <button
                      className="device-button"
                      onClick={() => openUpdateDialog(device)}
                      title="Edit Device"
                    >
                      <LuSettings2 />
                    </button>
                    <button
                      className="device-button"
                      onClick={() => handleRemoveFromDashboard(device.id)}
                      title="Remove from Dashboard"
                    >
                      <FaTrash />
                    </button>
                  </IconContext.Provider>
                </div>
              </div>

              <div className="device-info">
                <p>Created: {new Date(device.created_at).toLocaleString()}</p>
              </div>

              <div className="device-info">
                <p>Last Updated: {new Date(device.modified_at).toLocaleString()}</p>
              </div>

              <div className="device-info">
                <p>Status: {device.type === "SERVO"
                  ? (device.status ? 'OPEN' : 'CLOSED')
                  : (device.status ? 'ON' : 'OFF')}
                </p>
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

          <UpdateDeviceDialog
            isOpen={isUpdateDialogOpen}
            onClose={closeUpdateDialog}
            device={selectedDevice}
            onDeviceUpdated={fetchDevices}
          />
        </div>
      )}
    </div>
  );
}

export default DeviceList;
