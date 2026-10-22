import axios from "axios";
import tokenStorage from "./tokenStorage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let onUnauthorized = null;

export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = typeof fn === "function" ? fn : null;
};

const handleUnauthorized = () => {
  tokenStorage.clear();
  if (onUnauthorized) {
    onUnauthorized();
  } else {
    window.location.href = "/login";
  }
};

api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const SKIP_REFRESH_URLS = ["/token/", "/token/refresh/", "/create-user/", "/verify-email/", "/resend-otp/"];

const shouldSkipRefresh = (url = "") => SKIP_REFRESH_URLS.some((path) => url.includes(path));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const is401 = error.response.status === 401;
    const alreadyRetried = Boolean(originalRequest._retry);
    const skipRefresh = shouldSkipRefresh(originalRequest.url || "");

    if (!is401 || alreadyRetried || skipRefresh) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      handleUnauthorized();
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${BASE_URL}/token/refresh/`, {
        refresh: refreshToken,
      });

      const newAccess = data.access;
      if (!newAccess) throw new Error("No access token in refresh response");

      tokenStorage.setAccessToken(newAccess);
      if (data.refresh) tokenStorage.setRefreshToken(data.refresh);

      processQueue(null, newAccess);

      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      handleUnauthorized();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;