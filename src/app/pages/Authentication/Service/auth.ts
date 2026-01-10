import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common'; 
import { jwtDecode } from 'jwt-decode'; 

// Models
import { 
  AuthResponse, ChangePasswordRequest, ConfirmEmailRequest, ForgotPasswordRequest, 
  RefreshTokenRequest, ResetPasswordRequest, LoginResponseData
} from '../models/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID); 
  
  private apiUrl = `${environment.apiBaseUrl}/auth`;
  
  private tokenKey = 'nyc360_token'; 
  private refreshTokenKey = 'nyc360_refresh_token'; 

  // User State
  public currentUser$ = new BehaviorSubject<any>(null);

  constructor() {
    // محاولة تحميل المستخدم عند بدء التطبيق
    this.loadUserFromToken();
  }

  // ============================================================
  // 1. PERMISSION & ROLE CHECKS
  // ============================================================

  hasPermission(permission: string): boolean {
    const user = this.currentUser$.value;
    if (!user) return false;
    if (this.hasRole('SuperAdmin')) return true;
    const userPermissions: string[] = user.permissions || [];
    return userPermissions.includes(permission);
  }

  hasRole(targetRole: string): boolean {
    const user = this.currentUser$.value;
    if (!user || !user.role) return false;
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    if (userRoles.includes('SuperAdmin')) return true;
    return userRoles.includes(targetRole);
  }

  isLoggedIn(): boolean {
    // التحقق من وجود قيمة في الـ BehaviorSubject
    return !!this.currentUser$.value;
  }

  // ============================================================
  // 2. API CALLS (ACCOUNT MANAGEMENT Only)
  // ============================================================

  refreshToken(data: RefreshTokenRequest): Observable<AuthResponse<LoginResponseData>> {
    return this.http.post<AuthResponse<LoginResponseData>>(`${this.apiUrl}/refresh-token`, data);
  }

  confirmEmail(data: ConfirmEmailRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/confirm-email`, data);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/password-reset`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/change-password`, data);
  }

  // ============================================================
  // 3. STATE MANAGEMENT & HELPERS
  // ============================================================

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    }
    this.currentUser$.next(null);
    this.router.navigate(['/auth/login']); 
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem(this.tokenKey);
    return null;
  }

  getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem(this.refreshTokenKey);
    return null;
  }

  public saveTokens(accessToken: string, refreshToken: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, accessToken);
      if (refreshToken) localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  /**
   * 🔥 Load User + Check Expiration
   * هذه الدالة هي المسؤولة عن إبقائك في الصفحة عند الريفريش أو طردك لو انتهت الصلاحية
   */
  public loadUserFromToken() {
    // 1. لو مش براوزر، اخرج (SSR Safety)
    if (!isPlatformBrowser(this.platformId)) return;

    const token = this.getToken();
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        // 2. فحص صلاحية التوكن (Expiration Check)
        // exp بيكون بالثواني (Unix Timestamp)، لازم نضربه في 1000 عشان يبقى Milliseconds
        if (decoded.exp && (decoded.exp * 1000) < Date.now()) {
          console.warn('⚠️ Token expired. Logging out.');
          this.logout(); // التوكن منتهي -> طرد
          return;
        }

        // 3. لو التوكن سليم، استخرج البيانات
        const user = {
          id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded['nameid'] || decoded['sub'] || decoded['id'] || decoded['userId'],
          email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded['email'],
          role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded['role'],
          username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded['unique_name'] || decoded['sub'] || '',
          permissions: decoded.permissions || decoded.Permissions || []
        };
        
        // تحديث الحالة فوراً
        this.currentUser$.next(user);

      } catch (e) {
        console.error('Invalid Token:', e);
        this.logout();
      }
    } else {
      this.currentUser$.next(null);
    }
  }
}