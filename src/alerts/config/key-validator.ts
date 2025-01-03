// src/utils/key-validator.ts

import * as crypto from 'crypto';

export function validateAndFormatKey(privateKeyString: string): string {
  try {
    // Remove any whitespace and headers
    const cleanKey = privateKeyString
      .replace('-----BEGIN EC PRIVATE KEY-----', '')
      .replace('-----END EC PRIVATE KEY-----', '')
      .replace(/[\r\n\s]/g, '');

    // Verify it's valid base64
    const keyBuffer = Buffer.from(cleanKey, 'base64');
    const decodedKey = keyBuffer.toString('base64');

    // If we got here, the key is valid base64
    return cleanKey;
  } catch (error) {
    throw new Error(`Invalid private key format: ${error.message}`);
  }
}

export function verifyKey(privateKeyString: string): boolean {
  try {
    const cleanKey = validateAndFormatKey(privateKeyString);
    return true;
  } catch (error) {
    console.error('Key verification failed:', error.message);
    return false;
  }
}

export function validateECKey(privateKey: string): boolean {
  try {
    // Create key object
    const keyObject = crypto.createPrivateKey(privateKey);

    // Verify it's an EC key
    const keyDetails = keyObject.asymmetricKeyDetails;
    return (
      keyDetails?.namedCurve === 'prime256v1' ||
      keyDetails?.namedCurve === 'P-256'
    );
  } catch (error) {
    return false;
  }
}

// Function to inspect key format
export function inspectKey(privateKeyString: string): void {
  console.log('Key inspection:');
  console.log('Raw key length:', privateKeyString.length);
  console.log('Contains BEGIN header:', privateKeyString.includes('BEGIN'));
  console.log('Contains END header:', privateKeyString.includes('END'));
  console.log('Contains newlines:', privateKeyString.includes('\n'));

  const cleanKey = privateKeyString
    .replace('-----BEGIN EC PRIVATE KEY-----', '')
    .replace('-----END EC PRIVATE KEY-----', '')
    .replace(/[\r\n\s]/g, '');

  console.log('Cleaned key length:', cleanKey.length);
  console.log('Is base64:', isBase64(cleanKey));
}

function isBase64(str: string): boolean {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch {
    return false;
  }
}
