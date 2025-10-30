import { Injectable } from '@angular/core';

const USER = 'q_user';
const TOKEN = 'authToken';
const CURRENT_USER = 'currentUser';

@Injectable({
  providedIn: 'root'
})
export class UserStorage {
  
  constructor(){}
  
  static saveUser(user: any): void {
    window.localStorage.removeItem(USER);
    window.localStorage.removeItem(CURRENT_USER);
    window.localStorage.setItem(USER, JSON.stringify(user));
    window.localStorage.setItem(CURRENT_USER, JSON.stringify(user));
  }

  static saveToken(token: string): void {
    window.localStorage.setItem(TOKEN, token);
    // Also save the login timestamp
    window.localStorage.setItem('loginTimestamp', Date.now().toString());
  }

  static getToken(): string | null {
    return localStorage.getItem(TOKEN);
  }

  static getUser(): any {
    const user = localStorage.getItem(USER);
    return user ? JSON.parse(user) : null;
  }

  static getCurrentUser(): any {
    const user = localStorage.getItem(CURRENT_USER);
    return user ? JSON.parse(user) : null;
  }

  static getUserId(): string {
    const user = this.getUser();
    if (user == null) { return ''; }
    return user.id;
  }

  static getUserRole(): string {
    const user = this.getUser();
    if (user == null) { return ''; }
    return user.role;
  }

  static isAdminLoggedIn(): boolean {
    const role: string = this.getUserRole();
    const token = this.getToken();
    return role === 'ADMIN' && !!token;
  }

  static isUserLoggedIn(): boolean {
    const role: string = this.getUserRole();
    const token = this.getToken();
    return role === 'USER' && !!token;
  }

  static signOut(): void {
    window.localStorage.removeItem(USER);
    window.localStorage.removeItem(TOKEN);
    window.localStorage.removeItem(CURRENT_USER);
    window.localStorage.removeItem('rememberMe');
    window.localStorage.removeItem('loginTimestamp');
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  static getLoginTimestamp(): number | null {
    const timestamp = localStorage.getItem('loginTimestamp');
    return timestamp ? parseInt(timestamp) : null;
  }

  static getSessionDuration(): number | null {
    const loginTime = this.getLoginTimestamp();
    return loginTime ? Date.now() - loginTime : null;
  }

  static getSessionDurationMinutes(): number | null {
    const duration = this.getSessionDuration();
    return duration ? Math.floor(duration / (1000 * 60)) : null;
  }
}
