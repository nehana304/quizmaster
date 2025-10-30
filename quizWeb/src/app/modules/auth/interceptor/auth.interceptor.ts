import { HttpInterceptorFn } from '@angular/common/http';
import { UserStorage } from '../services/user-storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip adding token for auth requests
  const isAuthRequest = req.url.includes('/auth/login') || 
                       req.url.includes('/auth/register') || 
                       req.url.includes('/auth/signup');
  
  if (isAuthRequest) {
    return next(req);
  }

  // Get the JWT token
  const token = UserStorage.getToken();
  
  if (token) {
    // Clone the request and add the Authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};