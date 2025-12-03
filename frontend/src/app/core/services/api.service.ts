import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../constants/app-config';
import { ErrorResponse } from '../models/api-response.model';

/**
 * Base API Service
 * Provides common HTTP methods for all API services
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  protected readonly baseUrl = APP_CONFIG.API_BASE_URL;

  constructor(protected http: HttpClient) { }

  /**
   * GET request
   */
  get<T>(url: string, params?: HttpParams | { [key: string]: any }): Observable<T> {
    const options = {
      params: params instanceof HttpParams ? params : this.createParams(params),
    };
    return this.http.get<T>(`${this.baseUrl}${url}`, options).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * POST request
   */
  post<T>(url: string, body: any, options?: { headers?: HttpHeaders; params?: HttpParams | { [key: string]: any } }): Observable<T> {
    const httpOptions = {
      headers: options?.headers,
      params: options?.params instanceof HttpParams ? options.params : this.createParams(options?.params),
    };
    const fullUrl = `${this.baseUrl}${url}`;
    console.log('🌐 API POST Request:');
    console.log('  Base URL:', this.baseUrl);
    console.log('  Endpoint:', url);
    console.log('  Full URL:', fullUrl);
    console.log('  Body:', body);
    return this.http.post<T>(fullUrl, body, httpOptions).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * PUT request
   */
  put<T>(url: string, body: any, options?: { headers?: HttpHeaders; params?: HttpParams | { [key: string]: any } }): Observable<T> {
    const httpOptions = {
      headers: options?.headers,
      params: options?.params instanceof HttpParams ? options.params : this.createParams(options?.params),
    };
    return this.http.put<T>(`${this.baseUrl}${url}`, body, httpOptions).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * PATCH request
   */
  patch<T>(url: string, body: any, options?: { headers?: HttpHeaders; params?: HttpParams | { [key: string]: any } }): Observable<T> {
    const httpOptions = {
      headers: options?.headers,
      params: options?.params instanceof HttpParams ? options.params : this.createParams(options?.params),
    };
    return this.http.patch<T>(`${this.baseUrl}${url}`, body, httpOptions).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * DELETE request
   */
  delete<T>(url: string, options?: { headers?: HttpHeaders; params?: HttpParams | { [key: string]: any } }): Observable<T> {
    const httpOptions = {
      headers: options?.headers,
      params: options?.params instanceof HttpParams ? options.params : this.createParams(options?.params),
    };
    return this.http.delete<T>(`${this.baseUrl}${url}`, httpOptions).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Create HttpParams from object
   */
  private createParams(params?: { [key: string]: any }): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }
    return httpParams;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    let errorResponse: ErrorResponse = {
      error: 'Unknown Error',
      message: errorMessage,
      status: error.status || 500,
    };

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
      errorResponse = {
        ...errorResponse,
        error: 'Client Error',
        message: errorMessage,
      };
    } else {
      // Server-side error
      if (error.error) {
        errorResponse = {
          error: error.error.error || 'Server Error',
          message: error.error.message || error.message || errorMessage,
          status: error.status,
          timestamp: error.error.timestamp,
          path: error.error.path,
        };
      } else {
        errorResponse = {
          error: `Server Error: ${error.status}`,
          message: error.message || errorMessage,
          status: error.status,
        };
      }
    }

    console.error('API Error:', errorResponse);
    return throwError(() => errorResponse);
  }
}

