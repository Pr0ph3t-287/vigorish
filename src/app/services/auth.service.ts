import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, shareReplay } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest, RevokeTokenRequest } from '../models/auth.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private isAuthenticatedSignal = signal<boolean>(false);
  private refreshTokenInProgress: Observable<AuthResponse> | null = null;

  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  refreshToken(request: RefreshTokenRequest): Observable<AuthResponse> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenInProgress) {
      return this.refreshTokenInProgress;
    }

    this.refreshTokenInProgress = this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, request).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
        this.refreshTokenInProgress = null;
      }),
      shareReplay(1)
    );

    return this.refreshTokenInProgress;
  }

  revokeToken(request: RevokeTokenRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/revoke`, request);
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.revokeToken({ refreshToken }).subscribe({
        complete: () => this.clearAuthData()
      });
    } else {
      this.clearAuthData();
    }
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('tokenExpiry', (Date.now() + response.expiresIn * 1000).toString());
    this.isAuthenticatedSignal.set(true);
  }

  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    this.isAuthenticatedSignal.set(false);
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('accessToken');
    const expiry = localStorage.getItem('tokenExpiry');

    if (token && expiry && Date.now() < parseInt(expiry)) {
      this.isAuthenticatedSignal.set(true);
    } else {
      this.clearAuthData();
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}
