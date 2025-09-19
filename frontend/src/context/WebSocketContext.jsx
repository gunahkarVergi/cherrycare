import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

const WebSocketContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; // backend URL

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (token) {
      // Connect to WebSocket server
      const newSocket = io(
        import.meta.env.VITE_API_URL || "http://localhost:5000",
        {
          auth: {
            token: token,
          },
        }
      );

      newSocket.on("connect", () => {
        console.log("Connected to WebSocket server");
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
        setIsConnected(false);
      });

      newSocket.on("new_notification", (notification) => {
        console.log("New notification received:", notification);

        // Add notification to state
        setNotifications((prev) => [notification, ...prev]);

        // Update unread count
        setUnreadCount((prev) => prev + 1);

        // Optional: Show toast notification
        // toast.info(notification.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // If no token, disconnect socket
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
        setNotifications([]);
        setUnreadCount(0);
      }
    }
  }, [token]);

  // Load existing notifications from API on mount
  useEffect(() => {
    const loadNotifications = async () => {
      if (token) {
        try {
          const response = await axios.get(
            `${API_URL}/api/notifications`, // url
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(
              data.notifications?.filter((n) => !n.is_read).length || 0
            );
          }
        } catch (error) {
          console.error("Failed to load notifications:", error);
        }
      }
    };

    loadNotifications();
  }, [token]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/notifications/${notificationId}/read`, // url
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/notifications/mark-all-read`, // url
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/notifications/${notificationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const notificationToDelete = notifications.find(
          (n) => n.id === notificationId
        );
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );

        if (notificationToDelete && !notificationToDelete.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const value = {
    socket,
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
