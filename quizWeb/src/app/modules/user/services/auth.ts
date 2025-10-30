import { Injectable, inject, signal, computed } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";
import { UserStorage } from "../../auth/services/user-storage";
import { TokenValidationService } from "../../auth/services/token-validation.service";
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private router = inject(Router);
  private message = inject(NzMessageService);
  private tokenValidation = inject(TokenValidationService);

  currentUser = signal<any>(null);
  isAuthenticated = computed(() => {
    const user = this.currentUser();
    const token = this.getToken();
    
    if (!user || !token) {
      return false;
    }
    
    // Check token validity
    try {
      return this.tokenValidation.isTokenValid(token);
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  });
  isAdmin = computed(() => this.currentUser()?.role === "ADMIN");
  isUser = computed(() => this.currentUser()?.role === "USER");

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const user = UserStorage.getCurrentUser();
    const token = UserStorage.getToken();
    
    if (user && token) {
      try {
        // Get detailed token information for debugging
        const tokenInfo = this.tokenValidation.getTokenInfo(token);
        console.log('Token info:', tokenInfo);
        
        if (this.tokenValidation.isTokenValid(token)) {
          this.currentUser.set(user);
          console.log('User loaded from storage:', user.name, 'Token expires in:', tokenInfo?.timeUntilExpiryMinutes, 'minutes');
        } else {
          console.log('Invalid/expired token found, clearing storage. Token info:', tokenInfo);
          UserStorage.signOut();
          this.currentUser.set(null);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        UserStorage.signOut();
        this.currentUser.set(null);
      }
    } else {
      this.currentUser.set(null);
    }
  }

  logout(): void {
    try {
      // Clear all user data
      this.currentUser.set(null);
      UserStorage.signOut();
      
      // Show success message
      this.message.success('Logged out successfully', { nzDuration: 2000 });
      
      // Navigate to login page
      this.router.navigate(["/login"]).then(() => {
        // Force page reload to ensure clean state
        window.location.reload();
      });
    } catch (error) {
      console.error('Logout error:', error);
      this.message.error('Error during logout', { nzDuration: 3000 });
    }
  }

  getToken(): string | null {
    return UserStorage.getToken();
  }

  setUser(user: any): void {
    this.currentUser.set(user);
    UserStorage.saveUser(user);
  }

  setToken(token: string): void {
    UserStorage.saveToken(token);
  }

  // Method to update auth state after login
  updateAuthState(user: any, token: string): void {
    UserStorage.saveUser(user);
    UserStorage.saveToken(token);
    this.currentUser.set(user);
  }

  getCurrentUser(): any {
    return this.currentUser();
  }

  checkAuthStatus(): boolean {
    const token = this.getToken();
    const user = this.currentUser();
    
    if (!token || !user) {
      // Try to reload from storage before logging out
      this.loadUserFromStorage();
      const reloadedToken = this.getToken();
      const reloadedUser = this.currentUser();
      
      if (!reloadedToken || !reloadedUser) {
        this.logout();
        return false;
      }
    }
    
    return true;
  }

  // Method to refresh auth state from storage
  refreshAuthState(): void {
    this.loadUserFromStorage();
  }

  // Check if session is about to expire and warn user
  checkSessionExpiry(): void {
    const token = this.getToken();
    if (!token) return;

    const tokenInfo = this.tokenValidation.getTokenInfo(token);
    if (!tokenInfo) return;

    // Warn if token expires in less than 5 minutes
    if (tokenInfo.timeUntilExpiryMinutes !== null && tokenInfo.timeUntilExpiryMinutes <= 5 && tokenInfo.timeUntilExpiryMinutes > 0) {
      this.message.warning(`Your session will expire in ${tokenInfo.timeUntilExpiryMinutes} minutes. Please save your work.`, { 
        nzDuration: 10000 
      });
    }
  }

  // Start periodic session check
  startSessionMonitoring(): void {
    // Check session every 2 minutes
    setInterval(() => {
      this.checkSessionExpiry();
    }, 2 * 60 * 1000);

    // Also check immediately
    setTimeout(() => {
      this.checkSessionExpiry();
    }, 30000); // Check after 30 seconds
  }

  // Get time until token expires (in minutes)
  getTimeUntilExpiry(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const tokenInfo = this.tokenValidation.getTokenInfo(token);
    return tokenInfo?.timeUntilExpiryMinutes || null;
  }
}