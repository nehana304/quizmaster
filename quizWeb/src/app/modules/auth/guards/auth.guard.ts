import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { UserStorage } from '../services/user-storage';
import { NzMessageService } from 'ng-zorro-antd/message';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const message = inject(NzMessageService);

  const token = UserStorage.getToken();
  const user = UserStorage.getUser();

  if (token && user) {
    return true;
  }

  message.warning('Please login to access this page', { nzDuration: 3000 });
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const message = inject(NzMessageService);

  if (UserStorage.isAdminLoggedIn()) {
    return true;
  }

  message.error('Admin access required', { nzDuration: 3000 });
  router.navigate(['/login']);
  return false;
};

export const userGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const message = inject(NzMessageService);

  if (UserStorage.isUserLoggedIn()) {
    return true;
  }

  message.error('User access required', { nzDuration: 3000 });
  router.navigate(['/login']);
  return false;
};