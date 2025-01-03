/**
 * Formats a private key string by ensuring proper line breaks and headers
 */
export function formatPrivateKey(key: string): string {
  // Remove any existing headers and whitespace
  let cleanKey = key
    .replace(/-----(BEGIN|END) EC PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');

  // Add proper PEM formatting
  return [
    '-----BEGIN EC PRIVATE KEY-----',
    ...(cleanKey.match(/.{1,64}/g) || []), // Split into 64-character lines
    '-----END EC PRIVATE KEY-----',
  ].join('\n');
}

/**
 * Validates that a key is properly formatted
 */
export function validatePrivateKey(key: string): boolean {
  const keyPattern =
    /^-----BEGIN EC PRIVATE KEY-----\n[\s\S]*\n-----END EC PRIVATE KEY-----\n?$/;
  return keyPattern.test(key);
}
