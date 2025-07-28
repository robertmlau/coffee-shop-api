import fetch from 'node-fetch';

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

  async get<T>(path: string): Promise<{ status: number; body: ApiResponse<T> }> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const body = await response.json() as ApiResponse<T>;
    return { status: response.status, body };
  }

  async post<T>(path: string, data: any): Promise<{ status: number; body: ApiResponse<T> }> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const body = await response.json() as ApiResponse<T>;
    return { status: response.status, body };
  }

  async put<T>(path: string, data: any): Promise<{ status: number; body: ApiResponse<T> }> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const body = await response.json() as ApiResponse<T>;
    return { status: response.status, body };
  }

  async delete<T>(path: string): Promise<{ status: number; body: ApiResponse<T> }> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const body = await response.json() as ApiResponse<T>;
    return { status: response.status, body };
  }
}