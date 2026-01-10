import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../pages/Authentication/Service/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  // 1. Lazy Injection to prevent Circular Dependency
  // We don't inject AuthService here yet, we assume we can read from localStorage directly first if needed
  // OR we use inject() but ensure AuthService doesn't inject HttpClient which uses this interceptor directly in a loop.
  // The safest way in modern Angular functional interceptors:
  
  let authReq = req;
  let token = null;

  // Read token directly from storage to avoid initial circular dependency
  if (typeof localStorage !== 'undefined') {
    token = localStorage.getItem('nyc360_token');
  }

  // Attach Token if exists
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // 🛑 If 401 Unauthorized (Token Expired)
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh-token')) {
        
        // Now we inject AuthService to handle the refresh logic
        const authService = inject(AuthService);
        const refreshToken = authService.getRefreshToken();
        const currentToken = token; // The expired one

        if (refreshToken && currentToken) {
          
          // 🔄 Call Refresh Token API
          return authService.refreshToken({ 
            accessToken: currentToken, 
            refreshToken: refreshToken 
          }).pipe(
            switchMap((res: any) => {
              if (res.isSuccess) {
                // ✅ Success! Retry the FAILED request with the NEW token
                const newReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${res.data.accessToken}` }
                });
                return next(newReq);
              } else {
                // ❌ Refresh failed (maybe refresh token expired too) -> Logout
                authService.logout();
                return throwError(() => error);
              }
            }),
            catchError((refreshErr) => {
              // API Call failed -> Logout
              authService.logout();
              return throwError(() => refreshErr);
            })
          );
        } else {
            // No tokens found -> Logout
            authService.logout();
        }
      }

      return throwError(() => error);
    })
  );
};