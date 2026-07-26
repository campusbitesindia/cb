import React, { createContext, useContext, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SocketUrl } from '../services/api';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);


  const connectSocket = () => {
    if (!socketRef.current) {
      console.log("connecting to socket...");
      socketRef.current = io(SocketUrl);

      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current?.id);
        setIsConnected(true);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
      });
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      console.log("disconnecting socket...");
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const getSocket = () => socketRef.current;

 

  const value = {
    connectSocket,
    disconnectSocket,
    getSocket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
