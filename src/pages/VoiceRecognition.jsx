import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../socket';
import axiosInstance from '../utils/axiosInstance';

export default function VoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [devices, setDevices] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchDevices();

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

  const toggleDeviceStatus = async (device, newStatus) => {
    const updatedLightStatus = newStatus ? 'ON' : 'OFF';

    try {
      const response = await axiosInstance.patch(`/device/${device.id}`, {
        status: newStatus,
        value: newStatus ? 1.0 : 0.0,
      });

      if (response.data.data) {
        setDevices((prev) =>
          prev.map((d) =>
            d.id === device.id ? { ...d, status: newStatus } : d
          )
        );
      }

      // Emit device update to server
      const emitPayload = { device_name: device.name, status: updatedLightStatus };
      console.log('Emitting device:update:', emitPayload);
      socket.emit('device:update', emitPayload);
      
    } catch (err) {
      console.error('Failed to update device status:', err);
    }
  };

  const handleVoiceCommand = (transcript) => {
    const turnOnMatch = transcript.match(/turn on the (.+)/);
    const turnOffMatch = transcript.match(/turn off the (.+)/);

    if (turnOnMatch || turnOffMatch) {
      const deviceType = (turnOnMatch || turnOffMatch)[1].trim();
      const newStatus = !!turnOnMatch;

      const matchedDevices = devices.filter(
        (d) => d.type.toLowerCase() === deviceType
      );

      if (matchedDevices.length === 0) {
        console.warn(`No devices of type "${deviceType}" found.`);
      }

      matchedDevices.forEach((device) => {
        toggleDeviceStatus(device, newStatus);
      });
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.resultIndex][0].transcript.toLowerCase();
      console.log('Heard:', transcript);
      handleVoiceCommand(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Voice Recognition</h1>
      <button
        onClick={isListening ? stopListening : startListening}
        className={`px-6 py-3 rounded-2xl text-lg font-semibold transition-colors ${isListening
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700'
          }`}
      >
        {isListening ? 'Stop Listening' : 'Start Voice Control'}
      </button>
    </div>
  );
}
