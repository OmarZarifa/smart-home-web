import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const UpdateDeviceDialog = ({ isOpen, onClose, device, onDeviceUpdated }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState(false);

    useEffect(() => {
        if (device) {
            setName(device.name || "");
            setDescription(device.description || "");
            setStatus(device.status || false);
        }
    }, [device]);

    if (!isOpen || !device) return null;

    const updateDevice = async (deviceData) => {
        try {
            const response = await axiosInstance.patch(`/device/${device.id}`, {
                status: deviceData.status,
                name: deviceData.name,
                description: deviceData.description,
            });

            if (response.data.error != null) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update device');
            }

            const result = response?.data?.data;
            return result;
        } catch (err) {
            console.error('Error updating device:', err);
            throw err;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedDevice = await updateDevice({ name, description, status });
            onDeviceUpdated?.(updatedDevice);
            onClose();
        } catch (error) {
            alert('Failed to update device');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Update Device</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Device Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Device Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Device Status</label>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={status}
                                onChange={() => setStatus(!status)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div className="action-bar-dialog">
                        <button type="button" onClick={onClose} className="cancel-button">
                            Cancel
                        </button>
                        <button type="submit" className="confirm-add-device-button">
                            Update Device
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateDeviceDialog;
