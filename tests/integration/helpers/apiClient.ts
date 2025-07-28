import https from 'https';
import http from 'http';
import { URL } from 'url';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.API_GATEWAY_URL || 'http://localhost:3000/dev';
  }

  private async makeRequest<T>(
    method: string,
    path: string,
    data?: any
  ): Promise<{ status: number; body: ApiResponse<T> }> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}${path}`);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const postData = data ? JSON.stringify(data) : undefined;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...(postData && { 'Content-Length': Buffer.byteLength(postData) }),
        },
      };

      const req = client.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          try {
            const body = JSON.parse(responseBody) as ApiResponse<T>;
            resolve({
              status: res.statusCode || 500,
              body,
            });
          } catch (error) {
            reject(new Error(`Failed to parse response: ${responseBody}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (postData) {
        req.write(postData);
      }

      req.end();
    });
  }

  async get<T>(path: string): Promise<{ status: number; body: ApiResponse<T> }> {
    return this.makeRequest<T>('GET', path);
  }

  async post<T>(path: string, data: any): Promise<{ status: number; body: ApiResponse<T> }> {
    return this.makeRequest<T>('POST', path, data);
  }

  async put<T>(path: string, data: any): Promise<{ status: number; body: ApiResponse<T> }> {
    return this.makeRequest<T>('PUT', path, data);
  }

  async delete<T>(path: string): Promise<{ status: number; body: ApiResponse<T> }> {
    return this.makeRequest<T>('DELETE', path);
  }
}