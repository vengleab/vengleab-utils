export function encodeToBase64(str: string) {
  return btoa(str);
}

export function decodeToBase64(base64Str: string) {
  try {
    return atob(base64Str);
  } catch (error) {
    return 'The string to be decoded is not correctly encoded';
  }
}
