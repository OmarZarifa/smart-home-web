import React, { useEffect, useState } from 'react';
import { FaSearch, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { socket } from '../socket';
import axiosInstance from '../utils/axiosInstance';
import './styles.css';
import { LuSettings2 } from 'react-icons/lu';
import { IconContext } from 'react-icons';
import AddDeviceDialog from './AddDeviceDialog';
import DeleteDeviceDialog from './DeleteDeviceDialog';
import UpdateDeviceDialog from './UpdateDeviceDialog';


function DeviceList() {
    const [devices, setDevices] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isUpdateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(false);

    useEffect(() => {
        fetchDevices();

        // Listen for real-time updates from the server
        socket.on('device:update', (updatedDevice) => {
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

                // Emit only ON/OFF as the server expects
                const emitPayload = {
                    device_name: device.name,
                    status: updatedLightStatus
                };
                socket.emit('device:update', emitPayload);
            }
        } catch (err) {
            console.error('Failed to update device status:', err);
        }
    };

    const openDeleteDialog = (device) => {
        setSelectedDevice(device);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedDevice(null);
    };

    const openUpdateDialog = (device) => {
        setSelectedDevice(device);
        setUpdateDialogOpen(true);
    };

    const closeUpdateDialog = () => {
        setUpdateDialogOpen(false);
        setSelectedDevice(null);
    };

    const handleDeviceUpdated = (updatedDevice) => {
        fetchDevices();
    };

    const handleDeviceDeleted = (deletedDevice) => {
        setDevices(devices.filter((device) => device.id !== deletedDevice.id));
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

                {/*<button className="add-device-button" onClick={() => setShowDialog(true)}>
                    <FaPlus /> Add Device
                </button>*/}

                <AddDeviceDialog
                    isOpen={showDialog}
                    onClose={() => setShowDialog(false)}
                    onDeviceAdded={(device) => {
                        setShowDialog(false);
                        fetchDevices();
                    }}
                />
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
                                <div className="device-buttons">
                                    <IconContext.Provider value={{ size: '25px' }}>
                                        <button
                                            className="device-button"
                                            onClick={() => openUpdateDialog(device)}
                                        >
                                            <LuSettings2 className="device-button" />
                                        </button>

                                        {/*<button
                                            className="device-button"
                                            onClick={() => openDeleteDialog(device)}
                                        >
                                            <FaTrashAlt />
                                        </button>*/}
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
                        device={selectedDevice}
                        onDeviceDeleted={handleDeviceDeleted}
                    />

                    <UpdateDeviceDialog
                        isOpen={isUpdateDialogOpen}
                        onClose={closeUpdateDialog}
                        device={selectedDevice}
                        onDeviceUpdated={handleDeviceUpdated}
                    />
                </div>
            )}
        </div>
    );
}

export default DeviceList;
