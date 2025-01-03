// src/alerts/coinbase/jwt-generator.ts

import { BASE_URL, ALGORITHM, JWT_ISSUER } from './constants';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

function formatPrivateKey(privateKeyString: string): string {
  // If key already has headers, return as is
  if (privateKeyString.includes('BEGIN EC PRIVATE KEY')) {
    return privateKeyString;
  }

  // Add PEM formatting if not present
  return `-----BEGIN EC PRIVATE KEY-----\n${privateKeyString}\n-----END EC PRIVATE KEY-----`;
}

export function generateToken(
  requestMethod: string,
  requestPath: string,
  apiKey: string,
  privateKey: string
): string {
  try {
    // Format the URI exactly as in documentation
    const uri = `${requestMethod} ${BASE_URL}${requestPath}`;

    // Create payload exactly as in documentation
    const payload = {
      iss: 'cdp',
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120,
      sub: apiKey,
      uri,
    };

    // Create header exactly as in documentation
    const header = {
      alg: 'ES256',
      kid: apiKey,
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    // Format the key
    const formattedKey = formatPrivateKey(privateKey);

    // Use exact options from documentation
    const options = {
      algorithm: 'ES256' as jwt.Algorithm,
      header: header,
    };

    return jwt.sign(payload, formattedKey, options);
  } catch (error) {
    console.error('JWT Generation Error:', {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    throw error;
  }
}

// Function to test key format and JWT generation
export function debugPrivateKey(privateKeyString: string): void {
  try {
    console.log('\n=== Key Debug Info ===');
    console.log('Original key length:', privateKeyString.length);
    console.log('Contains BEGIN header:', privateKeyString.includes('BEGIN'));
    console.log('Contains END header:', privateKeyString.includes('END'));

    const formattedKey = formatPrivateKey(privateKeyString);
    console.log('\nFormatted key:');
    console.log(formattedKey);

    // Test JWT generation
    const testToken = generateToken(
      'GET',
      '/api/v3/brokerage/accounts',
      'test-key',
      formattedKey
    );
    console.log('\nTest JWT generation successful');
    console.log('Token:', testToken.substring(0, 50) + '...');
  } catch (error) {
    console.error('\nKey validation failed:', {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    throw error;
  }
}
