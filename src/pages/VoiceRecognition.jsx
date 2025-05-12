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
    text.replace(/_/g, ' ').replace(/[^\w\s]/g, '').toLowerCase().trim();

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

      const emitPayload = {
        device_name: device.name,
        status: newStatusString,
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
    <div
      className="min-h-screen flex items-start justify-center px-4 pt-10 pb-20"
      style={{ backgroundColor: '#6e6e61' }}
    >
      <div className="w-full max-w-2xl rounded-3xl px-6 sm:px-10 py-10 text-center bg-white/10 backdrop-blur-md border border-black/10 shadow-md">
        {/* Mic Icon */}
        <div className="flex justify-center mb-8">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening ? 'bg-green-500 animate-ping-slow' : 'bg-black/10'
            }`}
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.25v3.25m0-3.25a6.5 6.5 0 006.5-6.5V9.75m-13 2c0 3.59 2.91 6.5 6.5 6.5m0-13.5v7.5m0-7.5a2 2 0 012 2v3.5a2 2 0 01-4 0V8.75a2 2 0 012-2z"
              />
            </svg>
          </div>
        </div>

        {/* Say a Command */}
        <div className="bg-white/10 border border-white/10 rounded-xl p-6 text-left">
          <h2 className="text-black font-bold text-lg mb-2 tracking-tight">Say a Command</h2>
          <p className="text-sm text-gray-800 font-medium">
            You can say one of the following:
          </p>
          <div className="mt-4 space-y-3 font-mono text-sm">
            <div className="bg-[#5f615a] text-white px-4 py-2 rounded-lg tracking-wide shadow-inner border border-white/10">
              turn on the <span className="text-gray-200 italic">[device name]</span>
            </div>
            <div className="bg-[#5f615a] text-white px-4 py-2 rounded-lg tracking-wide shadow-inner border border-white/10">
              turn off the <span className="text-gray-200 italic">[device name]</span>
            </div>
          </div>
        </div>

        {/* Start/Stop Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          className={`mt-10 w-full py-3 rounded-xl text-lg font-semibold tracking-tight transition-all duration-300 ${
            isListening
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isListening ? 'Stop Listening' : 'Start Voice Control'}
        </button>
      </div>
    </div>
  );
}
