//write request with token
import axios from "axios";

export const request = axios.create({
  baseURL: "http://localhost:3000",
  // httpsAgent: agent,
  headers: {
    "Content-Type": "application/json",
  },
});

request.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
    const token = user ? JSON.parse(user).accessToken : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
