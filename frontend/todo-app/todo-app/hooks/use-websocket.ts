import { useEffect, useState, useRef } from 'react';
import { BackendTask } from '@/types/task';

const useWebSocket = (userId: string, token: string) => {
  const [tasks, setTasks] = useState<BackendTask[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userId || !token) return;

    const wsUrl = `ws://localhost:8000/ws/${userId}?token=${token}`;
    webSocketRef.current = new WebSocket(wsUrl);

    webSocketRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    webSocketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'initial_tasks' || data.type === 'tasks_updated') {
        setTasks(data.tasks);
      }
    };

    webSocketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    webSocketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [userId, token]);

  return { tasks, isConnected };
};

export default useWebSocket;
