import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Auth, LoginRequest, AuthResponse } from '../services/auth';
import { UserStorage } from '../services/user-storage';
import { AuthService } from '../../user/services/auth';
import { SoundService } from '../../shared/services/sound.service';
import { Test } from '../../user/services/test';
import { TokenValidationService } from '../services/token-validation.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

interface User {
  id: string;
  name: string;
  roles: { roleName: string }[];
  email?: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit, OnDestroy {
  validateForm: FormGroup;
  isLoading = false;
  passwordVisible = false;
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private authService: AuthService,
    private router: Router,
    private message: NzMessageService,
    private soundService: SoundService,
    private testService: Test,
    private tokenValidation: TokenValidationService
  ) {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required, Validators.minLength(3)]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      remember: [true]
    });
  }

  ngOnInit(): void {
    // Don't auto-redirect to dashboard when user explicitly navigates to login
    // This allows users to login as different user or refresh their session
    // Only show a message if they're already logged in
    if (UserStorage.isUserLoggedIn()) {
      this.message.info('You are already logged in as a user. You can logout first or login as a different user.', { nzDuration: 5000 });
    } else if (UserStorage.isAdminLoggedIn()) {
      this.message.info('You are already logged in as admin. You can logout first or login as a different user.', { nzDuration: 5000 });
    }

    // Check server connectivity
    this.checkServerHealth();
  }

  private checkServerHealth(): void {
    this.testService.checkHealth().subscribe({
      next: (response) => {
        console.log('Server health check successful:', response);
      },
      error: (error) => {
        console.error('Server health check failed:', error);

        if (error.status === 403) {
          // 403 means server is running but health endpoint needs authentication
          console.log('Server is running but health endpoint requires authentication (this is expected)');
        } else if (error.status === 0) {
          // Network error - server not reachable
          this.message.warning('Cannot connect to server. Please ensure the backend is running on port 8080.', {
            nzDuration: 8000
          });
        } else {
          // Other errors
          this.message.warning(`Server responded with error ${error.status}. Please check server configuration.`, {
            nzDuration: 6000
          });
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isLoading = true;
    const loginRequest: LoginRequest = {
      name: this.validateForm.get('name')?.value,
      password: this.validateForm.get('password')?.value
    };

    const loginSub = this.auth.login(loginRequest)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: AuthResponse) => {
          console.log('Login response received:', response);
          if (response?.user && response?.token) {
            const userData = response.user as User;
            const user = {
              id: userData.id,
              name: userData.name,
              role: userData.roles?.[0]?.roleName || 'USER'
            };

            // Save user and token using AuthService to ensure proper state management
            this.authService.updateAuthState(user, response.token);

            // Save remember me preference
            if (this.validateForm.get('remember')?.value) {
              localStorage.setItem('rememberMe', 'true');
            } else {
              localStorage.removeItem('rememberMe');
            }

            this.soundService.playCorrect();

            // Show session info in success message
            const tokenInfo = this.tokenValidation.getTokenInfo(response.token);
            const sessionMessage = tokenInfo && tokenInfo.timeUntilExpiryMinutes ?
              `Login successful! Session expires in ${tokenInfo.timeUntilExpiryMinutes} minutes.` :
              'Login successful!';

            this.message.success(sessionMessage, { nzDuration: 5000 });

            // Navigate based on role with a small delay to ensure storage is updated
            const redirectPath = user.role === 'ADMIN'
              ? '/admin/dashboard'
              : '/user/dashboard';

            setTimeout(() => {
              this.router.navigateByUrl(redirectPath);
            }, 100);
          } else {
            this.message.error('Invalid response from server', { nzDuration: 5000 });
          }
        },
        error: (error: any) => {
          console.error('Login error:', error);
          this.soundService.playIncorrect();
          const errorMessage = error?.error?.message || 'Invalid username or password';
          this.message.error(errorMessage, { nzDuration: 5000 });
        }
      });

    this.subscriptions.add(loginSub);
  }

  signInWithGoogle(): void {
    this.message.info('Google Sign-In coming soon!', { nzDuration: 3000 });
    // TODO: Implement Google OAuth integration
  }

  signInWithGithub(): void {
    this.message.info('GitHub Sign-In coming soon!', { nzDuration: 3000 });
    // TODO: Implement GitHub OAuth integration
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
