import { Injectable } from '@angular/core';
import { UserStorage } from './user-storage';

@Injectable({
  providedIn: 'root'
})
export class AuthTestService {

  constructor() { }

  // Test method to verify authentication state
  testAuthState(): void {
    console.log('=== Auth State Test ===');
    console.log('Token:', UserStorage.getToken());
    console.log('User:', UserStorage.getUser());
    console.log('Is Authenticated:', UserStorage.isAuthenticated());
    console.log('Is User Logged In:', UserStorage.isUserLoggedIn());
    console.log('Is Admin Logged In:', UserStorage.isAdminLoggedIn());
    console.log('=====================');
  }

  // Method to clear all auth data for testing
  clearAuthData(): void {
    UserStorage.signOut();
    console.log('Auth data cleared');
  }
}