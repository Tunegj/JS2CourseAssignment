export function getApiErrorMessage(data, fallback = "An error occurred") {
  return data?.errors?.[0]?.message ?? fallback;
}
