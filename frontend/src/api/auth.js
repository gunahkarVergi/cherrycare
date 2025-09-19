import axios from "axios";
/*
NOTE ON AXIOS:
For the GET request:
  The first parameter is the URL.
  The second parameter is the headers (among other things). Which is JSON as well.
For the POST request:
  The first parameter is the URL.
  The second is the JSON body that will be sent along your request.
  The third parameter is the headers (among other things). Which is JSON as well.
*/

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; // backend URL

export const signup = async ({ first_name, last_name, email, password }) => {
  const res = await axios.post(`${API_URL}/api/users/signup`, {
    first_name,
    last_name,
    email,
    password,
  });
  return res.data;
};

export const login = async ({ email, password }) => {
  const res = await axios.post(`${API_URL}/api/users/login`, { email, password });
  return res.data; // contains token
};

export const logout = async (token) => {
  const res = await axios.post(
    `${API_URL}/api/users/logout`, // url
    {}, // body
    { // headers
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const fetchProfile = async (token) => {
  const res = await axios.get(
    `${API_URL}/api/users/me`,  // url
    { // body
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return res.data;
};
