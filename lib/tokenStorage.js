const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage may be unavailable (e.g. private mode); fail silently
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const tokenStorage = {
  getAccessToken() {
    return safeGet(ACCESS_KEY);
  },

  getRefreshToken() {
    return safeGet(REFRESH_KEY);
  },

  setTokens({ access, refresh }) {
    if (access) safeSet(ACCESS_KEY, access);
    if (refresh) safeSet(REFRESH_KEY, refresh);
  },

  setAccessToken(token) {
    if (token) safeSet(ACCESS_KEY, token);
  },

  setRefreshToken(token) {
    if (token) safeSet(REFRESH_KEY, token);
  },

  clear() {
    safeRemove(ACCESS_KEY);
    safeRemove(REFRESH_KEY);
  },

  isAuthenticated() {
    return Boolean(safeGet(ACCESS_KEY));
  },
};

export default tokenStorage;