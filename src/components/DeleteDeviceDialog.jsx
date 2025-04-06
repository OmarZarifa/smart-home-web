import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DeleteDeviceDialog = ({ isOpen, onClose, deviceId, onDeviceDeleted }) => {
  const [loading, setLoading] = useState(false);

  const deleteDevice = async (deviceId) => {
    try {
      console.log(deviceId)
      setLoading(true);
      const response = await fetch(`${API_URL}/device/${deviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete device');
      }

      const result = await response.json();
      console.log('Device deleted:', result);

      // Notify the parent component that the device has been deleted
      onDeviceDeleted?.(deviceId);

      setLoading(false);
      onClose();  // Close the dialog after deleting the device
    } catch (err) {
      console.error('Error deleting device:', err);
      alert('Failed to delete device');
      setLoading(false);
    }
  };

  // Only render dialog if open
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" >
        <h2 className="modal-title">Are you sure you want to delete this device?</h2>
        <div className="action-bar-dialog">
          <button
            type="button"
            onClick={onClose}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => deleteDevice(deviceId)}
            className="confirm-delete-device-button"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Device"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDeviceDialog;
