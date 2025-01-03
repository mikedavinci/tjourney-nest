import { BASE_URL, ALGORITHM, JWT_ISSUER } from './constants';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

function formatPrivateKey(privateKeyString: string): string {
  // Clean up the key by removing any existing formatting
  const cleanKey = privateKeyString
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/-----BEGIN EC PRIVATE KEY-----/g, '')
    .replace(/-----END EC PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');

  // Format as PKCS8
  return [
    '-----BEGIN PRIVATE KEY-----',
    cleanKey.match(/.{1,64}/g)?.join('\n'),
    '-----END PRIVATE KEY-----',
  ].join('\n');
}

export function generateToken(
  requestMethod: string,
  requestPath: string,
  apiKey: string,
  apiSecret: string
): string {
  try {
    const formattedKey = formatPrivateKey(apiSecret);
    const uri = `${requestMethod} ${BASE_URL}${requestPath}`;

    const payload = {
      iss: JWT_ISSUER,
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120,
      sub: apiKey,
      uri,
    };

    const options: jwt.SignOptions = {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: apiKey,
        typ: 'JWT',
      },
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
