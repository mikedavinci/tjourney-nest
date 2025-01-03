// src/jwt-generator.ts

import { BASE_URL, ALGORITHM, JWT_ISSUER } from './constants';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

function formatAndConvertKey(privateKeyString: string): Buffer {
  try {
    // First, try to convert directly if it's already in the correct format
    return Buffer.from(privateKeyString, 'base64');
  } catch (error) {
    // If that fails, try to clean and format the key
    const cleanKey = privateKeyString
      .replace('-----BEGIN EC PRIVATE KEY-----', '')
      .replace('-----END EC PRIVATE KEY-----', '')
      .replace(/[\r\n]/g, '');

    return Buffer.from(cleanKey, 'base64');
  }
}

export function generateToken(
  requestMethod: string,
  requestPath: string,
  apiKey: string,
  apiSecret: string
): string {
  try {
    const keyBuffer = formatAndConvertKey(apiSecret);
    const uri = `${requestMethod} ${BASE_URL}${requestPath}`;

    const payload = {
      iss: JWT_ISSUER,
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120,
      sub: apiKey,
      uri,
    };

    const header = {
      alg: ALGORITHM,
      kid: apiKey,
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    const privateKey = {
      key: keyBuffer,
      format: 'der',
      type: 'pkcs8',
      passphrase: '',
    };

    const options: jwt.SignOptions = {
      algorithm: ALGORITHM as jwt.Algorithm,
      header: header,
    };

    return jwt.sign(payload, privateKey, options);
  } catch (error) {
    console.error('JWT Signing Error Details:', {
      error: error.message,
      algorithm: ALGORITHM,
      errorName: error.name,
      errorCode: error.code,
    });
    throw new Error(`Failed to generate JWT token: ${error.message}`);
  }
}
