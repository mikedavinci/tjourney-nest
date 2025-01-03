/**
 * Formats a private key string by ensuring proper line breaks and headers
 */
// src/alerts/config/key-utils.ts
export function formatPrivateKey(rawKey: string): string {
  try {
    // First, check if it's already in proper PEM format
    if (rawKey.includes('-----BEGIN EC PRIVATE KEY-----')) {
      return rawKey.trim();
    }

    // Clean the key of any existing formatting
    let cleanKey = rawKey
      .trim()
      .replace(/-----BEGIN .*?-----/, '')
      .replace(/-----END .*?-----/, '')
      .replace(/[\r\n\s]/g, '');

    // Format as PEM with correct headers and 64-character lines
    const formattedKey = [
      '-----BEGIN EC PRIVATE KEY-----',
      ...(cleanKey.match(/.{1,64}/g) || []),
      '-----END EC PRIVATE KEY-----',
    ].join('\n');

    // Add final newline
    return formattedKey + '\n';
  } catch (error) {
    console.error('Key formatting error:', error);
    throw new Error(`Failed to format private key: ${error.message}`);
  }
}

/**
 * Validates that a key is properly formatted
 */
export function validatePrivateKey(key: string): boolean {
  const keyPattern =
    /^-----BEGIN EC PRIVATE KEY-----\n[\s\S]*\n-----END EC PRIVATE KEY-----\n?$/;
  return keyPattern.test(key);
}
