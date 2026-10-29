import api from "./api";

export const login = async (email, password) => {
  const { data } = await api.post("/token/", { email, password });
  return data;
};

export const register = async (payload) => {
  const { data } = await api.post("/create-user/", payload);
  return data;
};

export const verifyEmail = async (code, email) => {
  const { data } = await api.post("/verify-email/", { code, email });
  return data;
};

export const resendOtp = async (email) => {
  const { data } = await api.post("/resend-otp/", { email });
  return data;
};

export const requestPasswordReset = async (email) => {
  const { data } = await api.post("/forgot-password/", { email });
  return data;
};

export const validateResetToken = async (uidbs4, token) => {
  const { data } = await api.get(`/password/${uidbs4}/${token}/`);
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await api.post("/change-password/", payload);
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get("/profile/");
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.patch("/profile/", payload);
  return data;
};

export const refreshToken = async (refresh) => {
  const { data } = await api.post("/token/refresh/", { refresh });
  return data;
};