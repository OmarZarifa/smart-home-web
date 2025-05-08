
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
});

export default socket;
