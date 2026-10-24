import api from "./api";

export const login = async (email, password) => {
  const { data } = await api.post("/token/", { email, password });
  return data;
};

export const register = async (name, email, password) => {
  const { data } = await api.post("/create-user/", { name, email, password });
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