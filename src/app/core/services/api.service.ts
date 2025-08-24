// api.service.ts
import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8080',
      timeout: 10000, // 10 second timeout
      headers: { 
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add any auth tokens here if needed
        // config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.get<T>(url, config).then(res => res.data);
  }

  post<T>(url: string, body: any, config?: AxiosRequestConfig) {
    // Handle FormData differently
    if (body instanceof FormData) {
      const formConfig = {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
        },
      };
      return this.api.post<T>(url, body, formConfig).then(res => res.data);
    }
    
    return this.api.post<T>(url, body, config).then(res => res.data);
  }

  put<T>(url: string, body: any, config?: AxiosRequestConfig) {
    return this.api.put<T>(url, body, config).then(res => res.data);
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.delete<T>(url, config).then(res => res.data);
  }

  // Method to handle file uploads specifically
  uploadFile<T>(url: string, formData: FormData) {
    return this.api.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // Longer timeout for file uploads
    }).then(res => res.data);
  }
}