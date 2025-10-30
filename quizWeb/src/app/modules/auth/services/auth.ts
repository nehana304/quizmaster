import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';

// API Configuration
const API_CONFIG = {
  // Base URL for API requests - adjust this based on your backend configuration
  baseUrl: 'http://16.16.90.232:9090/api/auth',  // Direct URL to your backend
  
  // CSRF token handling
  csrfToken: '',
  
  // Get headers with CSRF token if available
  getHeaders: () => {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
    
    // Add CSRF token if available
    if (API_CONFIG.csrfToken) {
      headers['X-XSRF-TOKEN'] = API_CONFIG.csrfToken;
    }
    
    // Get CSRF token from cookies if it exists
    const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
    if (csrfCookie) {
      API_CONFIG.csrfToken = csrfCookie.split('=')[1];
      headers['X-XSRF-TOKEN'] = API_CONFIG.csrfToken;
    }
    
    return new HttpHeaders(headers);
  }
  // getHeaders is already defined above
};

// HTTP request options
const getHttpOptions = (includeCredentials = false) => ({
  headers: API_CONFIG.getHeaders(),
  withCredentials: includeCredentials,
  observe: 'response' as const,
  responseType: 'json' as const
});

// Type definitions
export interface LoginRequest {
  name: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
  // Add other registration fields as needed
}

export interface AuthResponse {
  user: any; // Replace 'any' with your User interface
  token?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly authUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Register a new user
   * @param userData User registration data
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    const url = `${this.authUrl}/register`;
    console.log('Sending registration request to:', url, userData);
    
    return this.http.post<AuthResponse>(
      url,
      userData,
      {
        headers: API_CONFIG.getHeaders(),
        withCredentials: true,
        observe: 'response' as const
      }
    ).pipe(
      tap({
        next: (response) => {
          console.log('Registration successful:', response.body);
          if (response.body?.token) {
            this.setAuthToken(response.body.token);
          }
        },
        error: (error) => {
          console.error('Registration failed:', error);
          if (error.status === 403) {
            console.error('Access forbidden. Please check if the user already exists or if there are permission issues.');
          }
        }
      }),
      map(response => response.body || { user: {} } as AuthResponse),
      catchError(this.handleError)
    );
  }

  /**
   * Login user
   * @param credentials User login credentials
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    const url = `${this.authUrl}/login`;
    console.log('Sending login request to:', url);
    
    // For login, we might need credentials
    return this.http.post<AuthResponse>(url, credentials, {
      headers: API_CONFIG.getHeaders(),
      withCredentials: true,
      observe: 'response' as const
    }).pipe(
      tap({
        next: (response) => {
          console.log('Login successful');
          // Store token in localStorage if exists
          if (response.body?.token) {
            this.setAuthToken(response.body.token);
          }
        },
        error: (error) => {
          console.error('Login error:', this.handleError(error));
        }
      }),
      map(response => response.body || { user: {} } as AuthResponse),
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.status === 0) {
      // Client-side or network error
      console.error('Client or network error:', error.error);
      errorMessage = 'Unable to connect to the server. Please check your connection.';
    } else {
      // Backend returned an unsuccessful response code
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
      errorMessage = error.error?.message || error.message || 'An error occurred';
    }
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Store authentication token
   */
  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  /**
   * Get authentication token
   */
  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Logout user
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }
}
