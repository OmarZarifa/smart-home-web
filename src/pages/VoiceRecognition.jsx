import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../socket';
import axiosInstance from '../utils/axiosInstance';
import '../components/styles.css';

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
    <div className="voice-dialog-wrapper">
  <div className="voice-dialog">
    <div className="voice-container">
  <div className="voice-inner-box">
    {/* Mic Icon */}
    <div className="mic-icon-wrapper">
      <div className={`mic-icon ${isListening ? 'mic-active' : 'mic-idle'}`}>
        <svg
          className="mic-svg"
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
    <div className="voice-instructions">
      <h2 className="voice-heading">Say a Command</h2>
      <p className="voice-subtext">You can say one of the following:</p>
      <div className="voice-examples">
        <div className="voice-command">
          turn on the <span className="voice-highlight">[device name]</span>
        </div>
        <div className="voice-command">
          turn off the <span className="voice-highlight">[device name]</span>
        </div>
      </div>
    </div>

    {/* Start/Stop Button */}
    <button
      onClick={isListening ? stopListening : startListening}
      className={`voice-button ${isListening ? 'stop' : 'start'}`}
    >
      {isListening ? 'Stop Listening' : 'Start Voice Control'}
    </button>
  </div>
</div>
</div>
</div>

  );
}
