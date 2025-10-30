import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { AuthService } from '../../../modules/user/services/auth';
import { TokenValidationService } from '../../../modules/auth/services/token-validation.service';
import { UserStorage } from '../../../modules/auth/services/user-storage';

@Component({
  selector: 'app-session-status',
  standalone: true,
  imports: [CommonModule, NzTagModule, NzIconModule, NzToolTipModule],
  template: `
    <div class="session-status" *ngIf="isAuthenticated">
      <nz-tag 
        [nzColor]="getStatusColor()" 
        nz-tooltip 
        [nzTooltipTitle]="getTooltipText()">
        <i nz-icon nzType="clock-circle" nzTheme="outline"></i>
        Session: {{getStatusText()}}
      </nz-tag>
    </div>
  `,
  styles: [`
    .session-status {
      display: inline-block;
    }
  `]
})
export class SessionStatus implements OnInit, OnDestroy {
  isAuthenticated = false;
  private intervalId: any;

  constructor(
    private authService: AuthService,
    private tokenValidation: TokenValidationService
  ) {}

  ngOnInit() {
    this.updateStatus();
    
    // Update status every minute
    this.intervalId = setInterval(() => {
      this.updateStatus();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateStatus() {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  getStatusColor(): string {
    const timeLeft = this.authService.getTimeUntilExpiry();
    
    if (!timeLeft) return 'default';
    
    if (timeLeft <= 5) return 'red';
    if (timeLeft <= 15) return 'orange';
    return 'green';
  }

  getStatusText(): string {
    const timeLeft = this.authService.getTimeUntilExpiry();
    
    if (!timeLeft) return 'Unknown';
    
    if (timeLeft < 1) return 'Expiring soon';
    if (timeLeft === 1) return '1 min left';
    return `${timeLeft} mins left`;
  }

  getTooltipText(): string {
    const token = this.authService.getToken();
    if (!token) return 'Not authenticated';

    const tokenInfo = this.tokenValidation.getTokenInfo(token);
    if (!tokenInfo) return 'Invalid token';

    const sessionDuration = UserStorage.getSessionDurationMinutes();
    
    return `
      Session started: ${sessionDuration ? sessionDuration + ' minutes ago' : 'Unknown'}
      Expires at: ${tokenInfo.expiresAt?.toLocaleTimeString() || 'Unknown'}
      Time remaining: ${tokenInfo.timeUntilExpiryMinutes || 0} minutes
    `;
  }
}