import { useRef, useState, useEffect, useCallback } from 'react';


const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const messageListenersRef = useRef([]);

  const connect = useCallback(() => {
    const SERVER_URL = `wss://poll-battel.onrender.com/`;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const socket = new window.WebSocket(SERVER_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
      setError(null);
    };

    socket.onclose = (event) => {
      console.warn(`[WebSocket] Disconnected: ${event.reason}`);
      setIsConnected(false);
    };

    socket.onerror = (err) => {
      console.error('[WebSocket] Error:', err);
      setError('WebSocket error');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        messageListenersRef.current.forEach((listener) => listener(data));
      } catch (e) {
        console.error('[WebSocket] JSON parse error:', e);
      }
    };
  }, []);

  const sendMessage = useCallback((type, payload) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === window.WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload });
      socket.send(message);
      return true;
    } else {
      console.warn('WebSocket not connected');
      return false;
    }
  }, []);

  const addMessageListener = useCallback((cb) => {
    messageListenersRef.current.push(cb);
    return () => {
      messageListenersRef.current = messageListenersRef.current.filter(
        (fn) => fn !== cb
      );
    };
  }, []);

  useEffect(() => {
    connect();
    return () => socketRef.current?.close();
  }, [connect]);

  return { isConnected, error, sendMessage, addMessageListener, connect };
};

export default useWebSocket;
