// src/alerts/coinbase/jwt-generator.ts

import { createPrivateKey, randomBytes } from 'crypto';
import { SignOptions, sign } from 'jsonwebtoken';

const ALGORITHM = 'ES256';
const REQUEST_HOST = 'api.coinbase.com';

export function generateToken(
  requestMethod: string,
  requestPath: string,
  apiKey: string,
  privateKey: string
): string {
  try {
    // Format URI exactly as in documentation
    const uri = `${requestMethod} ${REQUEST_HOST}${requestPath}`;

    // Create payload exactly as in documentation
    const payload = {
      iss: 'cdp',
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120,
      sub: apiKey, // This should be the full key path: organizations/{org_id}/apiKeys/{key_id}
      uri,
    };

    // Create header exactly as in documentation
    const header = {
      alg: ALGORITHM,
      kid: apiKey, // This should be the full key path
      nonce: randomBytes(16).toString('hex'),
    };

    // Sign JWT
    return sign(payload, privateKey, {
      algorithm: ALGORITHM,
      header,
    });
  } catch (error) {
    console.error('JWT Generation Error:', {
      message: error.message,
      name: error.constructor.name,
      code: error.code,
    });
    throw error;
  }
}