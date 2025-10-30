import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenValidationService {

  constructor() { }

  // Simple JWT token validation (client-side only for basic checks)
  isTokenValid(token: string): boolean {
    if (!token) {
      return false;
    }

    try {
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      // Decode the payload (second part)
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired with a 30-second buffer to account for clock skew
      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = 30; // 30 seconds buffer
      
      if (payload.exp && payload.exp < (currentTime - bufferTime)) {
        console.log('Token expired at:', new Date(payload.exp * 1000));
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  // Get token expiration time
  getTokenExpiration(token: string): Date | null {
    if (!token) {
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp) {
        return new Date(payload.exp * 1000);
      }

      return null;
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  }

  // Check if token will expire soon (within 5 minutes)
  isTokenExpiringSoon(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) {
      return false;
    }

    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return expiration < fiveMinutesFromNow;
  }

  // Get detailed token information for debugging
  getTokenInfo(token: string): any {
    if (!token) {
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return {
        payload,
        issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
        currentTime: new Date(currentTime * 1000),
        isExpired: payload.exp ? payload.exp < currentTime : false,
        timeUntilExpiry: payload.exp ? (payload.exp - currentTime) : null,
        timeUntilExpiryMinutes: payload.exp ? Math.floor((payload.exp - currentTime) / 60) : null
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  }
}