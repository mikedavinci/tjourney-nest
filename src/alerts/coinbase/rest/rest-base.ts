// src/alerts/coinbase/rest/rest-base.ts

import { generateToken } from '../jwt-generator';
import fetch from 'node-fetch';
import { BASE_URL, USER_AGENT } from '../constants';
import { RequestOptions } from './types/request-types';
import { Logger } from '@nestjs/common';

export class RESTBase {
  private apiKey: string | undefined;
  private apiSecret: string | undefined;
  private logger = new Logger('RESTBase');

  constructor(key?: string, secret?: string) {
    this.logger.debug('Initializing RESTBase:', {
      hasKey: !!key,
      keyLength: key?.length,
      hasSecret: !!secret,
      secretLength: secret?.length,
    });

    if (!key || !secret) {
      throw new Error('API key and secret are required');
    }

    this.apiKey = key;
    this.apiSecret = secret;
  }

  async request(options: RequestOptions): Promise<any> {
    this.logger.debug('Making request:', {
      method: options.method,
      endpoint: options.endpoint,
      isPublic: options.isPublic,
      hasBody: !!options.bodyParams,
    });

    try {
      // Generate JWT token
      this.logger.debug('Generating JWT token...');
      const token = generateToken(
        options.method,
        options.endpoint,
        this.apiKey!,
        this.apiSecret!
      );
      this.logger.debug('JWT token generated successfully');

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
        Authorization: `Bearer ${token}`,
      };

      // Ensure we have a complete URL with protocol
      const baseUrl = BASE_URL.startsWith('http')
        ? BASE_URL
        : `https://${BASE_URL}`;
      const fullUrl = `${baseUrl}${options.endpoint}`;
      this.logger.debug('Full request URL:', fullUrl);

      // Make request
      const response = await fetch(fullUrl, {
        method: options.method,
        headers,
        body: options.bodyParams
          ? JSON.stringify(options.bodyParams)
          : undefined,
      });

      // Log response details
      this.logger.debug('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers),
      });

      const responseText = await response.text();
      this.logger.debug('Response body:', responseText.substring(0, 200));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      return JSON.parse(responseText);
    } catch (error) {
      this.logger.error('Request failed:', {
        error: error.message,
        name: error.constructor.name,
        code: error.code,
        stack: error.stack,
      });
      throw error;
    }
  }
}
