export function encodeToBase64(str) {
  return btoa(str);
}

export function decodeToBase64(base64Str) {
  return atob(base64Str);
}