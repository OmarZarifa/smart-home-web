import React, { useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AddDeviceDialog = ({ isOpen, onClose, onDeviceAdded }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');

    const addDevice = async (deviceData) => {
        try {
            const response = await fetch(`${API_URL}/device/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deviceData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add device');
            }

            const result = await response.json();
            console.log('Device added:', result.data);
            return result.data;
        } catch (err) {
            console.error('Error adding device:', err);
            throw err;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newDevice = await addDevice({ name, type });
            onDeviceAdded?.(newDevice);
            setName('');
            setType('');
            onClose();
        } catch (error) {
            alert('Failed to add device');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" >
                <h2 className="modal-title">Add New Device</h2>
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
                        <label className="label">Device Type</label>
                        <input
                            type="text"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>
                    <div className="action-bar-dialog">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cancel-button"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="confirm-add-device-button"
                        >
                            Add Device
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDeviceDialog;
