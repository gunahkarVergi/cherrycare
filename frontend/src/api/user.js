import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; // backend URL

export const fetchApplications = async (token) => {
  const res = await axios.get(`${API_URL}/api/financing-applications/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.applications;
};

export const submitApplication = async (data, token) => {
  const res = await axios.post(`${API_URL}/api/financing-applications/submit`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.application;
};

export const fetchNotifications = async (token) => {
  const res = await axios.get(`${API_URL}/api/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.notifications;
};

export const markNotificationRead = async (id, token) => {
  const response = await axios.patch(`${API_URL}/api/notifications/${id}/read`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.notification;
};