import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3004';

export function useWebSocket(zoneId, onAlert, onSlotUpdate, onSessionUpdate) {
  const socketRef = useRef(null);
  const onAlertRef = useRef(onAlert);
  const onSlotUpdateRef = useRef(onSlotUpdate);
  const onSessionUpdateRef = useRef(onSessionUpdate);

  // Keep refs updated
  useEffect(() => {
    onAlertRef.current = onAlert;
    onSlotUpdateRef.current = onSlotUpdate;
    onSessionUpdateRef.current = onSessionUpdate;
  }, [onAlert, onSlotUpdate, onSessionUpdate]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      if (zoneId) {
        socket.emit('subscribe-zone', zoneId);
      } else {
        // Subscribe to all zones updates
        socket.emit('subscribe-zone', 'all');
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.log('WebSocket connection error:', error);
    });

    // Listen for zone capacity alerts
    socket.on('zone-capacity-alert', (data) => {
      if (onAlertRef.current) {
        onAlertRef.current(data);
      }
    });

    socket.on('capacity-alert', (data) => {
      if (onAlertRef.current) {
        onAlertRef.current(data);
      }
    });

    // Listen for slot updates
    socket.on('slot-update', (data) => {
      if (onSlotUpdateRef.current) {
        onSlotUpdateRef.current(data);
      }
    });

    // Listen for session updates
    socket.on('session-update', (data) => {
      if (onSessionUpdateRef.current) {
        onSessionUpdateRef.current(data);
      }
    });

    // Subscribe to zone if provided
    if (zoneId) {
      socket.emit('subscribe-zone', zoneId);
    }

    return () => {
      if (socketRef.current) {
        if (zoneId) {
          socketRef.current.emit('unsubscribe-zone', zoneId);
        }
        socketRef.current.disconnect();
      }
    };
  }, [zoneId]);

  return socketRef.current;
}

