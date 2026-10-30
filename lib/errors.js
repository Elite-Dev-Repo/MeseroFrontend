export const getErrorMessage = (err, fallback = "An unexpected error occurred") => {
  if (!err) return fallback;
  if (err.response?.data?.detail) {
    const detail = err.response.data.detail;
    if (typeof detail === "string") return detail;
    if (typeof detail === "object") {
      const messages = Object.values(detail).flat();
      return messages.join(", ");
    }
  }
  if (err.response?.data?.message) return err.response.data.message;
  const data = err.response?.data;
  if (data && typeof data === "object") {
    const messages = Object.values(data)
      .flat()
      .filter((value) => typeof value === "string");
    if (messages.length > 0) return messages.join(", ");
  }
  if (err.message) return err.message;
  return fallback;
};