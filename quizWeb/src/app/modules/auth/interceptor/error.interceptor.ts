import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserStorage } from '../services/user-storage';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const message = inject(NzMessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't handle auth errors for login/register requests or admin operations
      const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');
      const isAdminOperation = req.url.includes('/api/test/remove') || req.url.includes('/api/test/cancel') || req.url.includes('/api/test/activate');
      
      if ((error.status === 401 || error.status === 403) && !isAuthRequest && !isAdminOperation) {
        // Only clear session for non-auth requests and specific error conditions
        const currentUrl = router.url;
        const isTokenExpired = error.error?.message?.includes('expired') || error.error?.message?.includes('invalid');
        
        if (!currentUrl.includes('/login') && !currentUrl.includes('/register') && !currentUrl.includes('/home')) {
          // Only clear session if it's definitely a token expiration issue
          if (error.status === 401 && isTokenExpired) {
            console.log('Token expired, clearing session');
            UserStorage.signOut();
            message.error('Your session has expired. Please login again.', { nzDuration: 5000 });
            router.navigate(['/login']);
          } else if (error.status === 403) {
            // For 403, don't clear session immediately - might be a permission issue
            console.log('Access forbidden - checking if session should be cleared');
            const token = UserStorage.getToken();
            if (!token) {
              message.error('Authentication required. Please login.', { nzDuration: 3000 });
              router.navigate(['/login']);
            } else {
              // Don't clear session for 403 errors - might be permission related
              console.log('403 error but token exists - likely permission issue, not session expiry');
            }
          }
        }
      } else if (error.status === 0 && !isAuthRequest) {
        // Network error
        message.error('Network error. Please check your connection.', { nzDuration: 5000 });
      } else if (error.status >= 500) {
        // Server error
        message.error('Server error. Please try again later.', { nzDuration: 5000 });
      }

      return throwError(() => error);
    })
  );
};