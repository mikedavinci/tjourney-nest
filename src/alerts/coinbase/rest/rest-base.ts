// src/alerts/coinbase/rest/rest-base.ts

import { generateToken } from '../jwt-generator';
import fetch, { Headers, RequestInit, Response } from 'node-fetch';
import { BASE_URL, USER_AGENT } from '../constants';
import { RequestOptions } from './types/request-types';
import { handleException } from './errors';

export class RESTBase {
  private apiKey: string | undefined;
  private apiSecret: string | undefined;

  constructor(key?: string, secret?: string) {
    if (!key || !secret) {
      console.log('Could not authenticate. Only public endpoints accessible.');
    }

    console.log('\n=== RESTBase Initialization ===');
    console.log('API Key provided:', !!key);
    console.log('API Secret provided:', !!secret);
    console.log('API Key length:', key?.length);
    console.log('API Secret length:', secret?.length);

    this.apiKey = key;
    this.apiSecret = secret;
  }

  async request(options: RequestOptions): Promise<any> {
    console.log('\n=== Making API Request ===');
    console.log('Method:', options.method);
    console.log('Endpoint:', options.endpoint);
    console.log('Is Public:', options.isPublic);

    const { method, endpoint, isPublic } = options;
    let { queryParams, bodyParams } = options;

    queryParams = queryParams ? this.filterParams(queryParams) : {};
    if (bodyParams !== undefined) {
      bodyParams = bodyParams ? this.filterParams(bodyParams) : {};
    }

    return this.prepareRequest(
      method,
      endpoint,
      queryParams,
      bodyParams,
      isPublic
    );
  }

  private async prepareRequest(
    httpMethod: string,
    urlPath: string,
    queryParams?: Record<string, any>,
    bodyParams?: Record<string, any>,
    isPublic?: boolean
  ) {
    console.log('\n=== Preparing Request ===');
    const headers: Headers = this.setHeaders(httpMethod, urlPath, isPublic);

    // Log headers (excluding sensitive data)
    console.log('Request Headers:', {
      'Content-Type': headers.get('Content-Type'),
      'User-Agent': headers.get('User-Agent'),
      Authorization: headers.has('Authorization') ? '[PRESENT]' : '[MISSING]',
    });

    const requestOptions: RequestInit = {
      method: httpMethod,
      headers: headers,
      body: bodyParams ? JSON.stringify(bodyParams) : undefined,
    };

    const queryString = this.buildQueryString(queryParams);
    const url = `https://${BASE_URL}${urlPath}${queryString}`;
    console.log('Full URL:', url);

    return this.sendRequest(headers, requestOptions, url);
  }

  private async sendRequest(
    headers: Headers,
    requestOptions: RequestInit,
    url: string
  ) {
    console.log('\n=== Sending Request ===');
    console.log('URL:', url);
    console.log('Method:', requestOptions.method);

    const response: Response = await fetch(url, requestOptions);
    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);

    const responseText = await response.text();
    console.log('Raw Response:', responseText);

    handleException(response, responseText, response.statusText);
    return responseText;
  }

  private setHeaders(httpMethod: string, urlPath: string, isPublic?: boolean) {
    console.log('\n=== Setting Headers ===');
    const headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('User-Agent', USER_AGENT);

    if (this.apiKey !== undefined && this.apiSecret !== undefined) {
      const token = generateToken(
        httpMethod,
        urlPath,
        this.apiKey,
        this.apiSecret
      );
      console.log('JWT Token generated:', token.substring(0, 50) + '...');
      headers.append('Authorization', `Bearer ${token}`);
    } else if (isPublic == undefined || isPublic == false) {
      throw new Error(
        'Attempting to access authenticated endpoint with invalid API_KEY or API_SECRET.'
      );
    }

    return headers;
  }

  private filterParams(data: Record<string, any>) {
    const filteredParams: Record<string, any> = {};
    for (const key in data) {
      if (data[key] !== undefined) {
        filteredParams[key] = data[key];
      }
    }
    return filteredParams;
  }

  private buildQueryString(queryParams?: Record<string, any>): string {
    if (!queryParams || Object.keys(queryParams).length === 0) {
      return '';
    }

    const queryString = Object.entries(queryParams)
      .flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(
            (item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`
          );
        } else {
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }
      })
      .join('&');

    return `?${queryString}`;
  }
}
