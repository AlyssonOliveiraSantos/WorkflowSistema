// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  refreshToken: string;
}

interface JwtPayload {
  sub?: string;
  username?: string;
  perfil?: string;
  exp?: number;
  iat?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly REFRESH_KEY = 'refreshToken';
  private readonly API_URL = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, { username, password }).pipe(
      tap(res => {
        this.setToken(res.token);
        this.setRefreshToken(res.refreshToken);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  private setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setRefreshToken(token: string) {
    localStorage.setItem(this.REFRESH_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  private decodeToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  getPerfil(): string | null {
    const decoded = this.decodeToken();
    return decoded?.perfil ?? null;
  }

  getUsername(): string | null {
    const decoded = this.decodeToken();
    return decoded?.username ?? null;
  }

  isAuthenticated(): boolean {
    const decoded = this.decodeToken();
    if (!decoded?.exp) return false;
    return decoded.exp > Math.floor(Date.now() / 1000);
  }

  hasRole(role: string): boolean {
    const perfil = this.getPerfil();
    return perfil === role;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
  }
}
