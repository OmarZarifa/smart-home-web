import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../socket';
import axiosInstance from '../utils/axiosInstance';

export default function VoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [devices, setDevices] = useState([]);
  const recognitionRef = useRef(null);
  const lastTranscriptRef = useRef('');

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

  const normalize = (text) =>
    text
      .replace(/_/g, ' ')        
      .replace(/[^\w\s]/g, '')   
      .toLowerCase()
      .trim();

  const toggleDeviceStatus = async (device, newStatusString) => {
    const booleanStatus = newStatusString === 'ON';

    try {
      const response = await axiosInstance.patch(`/device/${device.id}`, {
        status: booleanStatus,
        value: booleanStatus ? 1.0 : 0.0,
      });

      if (response.data.data) {
        setDevices((prev) =>
          prev.map((d) =>
            d.id === device.id ? { ...d, status: booleanStatus } : d
          )
        );
      }

      // Emit device update to server 
      const emitPayload = {
        device_name: device.name,
        status: newStatusString
      };

      console.log('Emitting device:update:', emitPayload);
      socket.emit('device:update', emitPayload);
    } catch (err) {
      console.error('Failed to update device status:', err);
    }
  };

  const handleVoiceCommand = (transcript) => {
    console.log('Heard:', transcript);
    const turnOnMatch = transcript.match(/turn on (?:the )?(.+)/);
    const turnOffMatch = transcript.match(/turn off (?:the )?(.+)/);

    const rawDeviceName = turnOnMatch?.[1] || turnOffMatch?.[1];
    if (!rawDeviceName) return;

    const normalizedSpokenName = normalize(rawDeviceName);
    const newStatusString = turnOnMatch ? 'ON' : 'OFF';

    const matchedDevices = devices.filter(
      (d) =>
        normalize(d.type) === normalizedSpokenName ||
        normalize(d.name) === normalizedSpokenName
    );

    if (matchedDevices.length === 0) {
      console.warn(`No devices matched with: "${normalizedSpokenName}"`);
    }

    matchedDevices.forEach((device) => {
      toggleDeviceStatus(device, newStatusString);
    });
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.resultIndex][0].transcript
        .toLowerCase()
        .trim();

      if (transcript !== lastTranscriptRef.current) {
        lastTranscriptRef.current = transcript;
        handleVoiceCommand(transcript);
      }
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
      <p className="text-lg mb-6 text-gray-300">
      Say "turn on the [device name]" or "turn off the [device name]"
     </p>
      <button
        onClick={isListening ? stopListening : startListening}
        className={`px-6 py-3 rounded-2xl text-lg font-semibold transition-colors ${
          isListening
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isListening ? 'Stop Listening' : 'Start Voice Control'}
      </button>
    </div>
  );
}
