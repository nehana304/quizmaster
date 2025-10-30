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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { Auth, RegisterRequest } from '../services/auth';
import { UserStorage } from '../services/user-storage';
import { SystemService } from '../services/system.service';
import { Subscription } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzSelectModule,
    NzAlertModule
  ],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup implements OnInit, OnDestroy {
  validateForm: FormGroup;
  isLoading = false;
  passwordVisible = false;
  showSystemStatus = false;
  isInitializing = false;
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
    private message: NzMessageService,
    private systemService: SystemService
  ) {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required, Validators.minLength(3)]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      role: ['USER', [Validators.required]], // Default to USER, CREATOR will be mapped to ADMIN
      agreeTerms: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (UserStorage.isUserLoggedIn()) {
      this.router.navigate(['/user/dashboard']);
    } else if (UserStorage.isAdminLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
    }
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
    const formValue = this.validateForm.value;
    
    // Prepare the request body with proper role mapping
    const requestBody = {
      name: formValue.name,
      email: formValue.email,
      password: formValue.password,
      role: formValue.role === 'CREATOR' ? 'ADMIN' : formValue.role // Map CREATOR to ADMIN for backend compatibility
    };

    console.log('Registration request (original role):', formValue.role);
    console.log('Registration request (mapped role):', requestBody.role);
    console.log('Full registration request:', requestBody);

    // Use the auth service's register method
    const registerSub = this.auth.register(requestBody as RegisterRequest)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {
          this.message.success('Registration successful! Please login to continue.', { nzDuration: 5000 });
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Registration error:', error);
          
          // If it's a role not found error, try to initialize roles and retry
          if (error?.error?.message?.includes('Role not found')) {
            this.message.info('Initializing system roles...', { nzDuration: 3000 });
            
            const initSub = this.systemService.initializeRoles()
              .pipe(
                switchMap(() => {
                  // Retry registration after role initialization with proper role mapping
                  const retryBody = {
                    ...requestBody,
                    role: formValue.role === 'CREATOR' ? 'ADMIN' : formValue.role
                  };
                  return this.auth.register(retryBody as RegisterRequest);
                }),
                finalize(() => {
                  this.isLoading = false;
                })
              )
              .subscribe({
                next: () => {
                  this.message.success('Registration successful! Please login to continue.', { nzDuration: 5000 });
                  this.router.navigate(['/auth/login']);
                },
                error: (retryError) => {
                  console.error('Registration retry error:', retryError);
                  const errorMessage = retryError?.error?.message || 'Registration failed after system initialization. Please contact administrator.';
                  this.message.error(errorMessage, { nzDuration: 5000 });
                  this.showSystemStatus = true; // Show manual initialization option
                }
              });
            
            this.subscriptions.add(initSub);
            return;
          }
          
          // Handle other errors
          let errorMessage = 'Registration failed. Please try again.';
          
          if (error?.error?.message) {
            if (error.error.message.includes('already exists')) {
              errorMessage = error.error.message;
            } else {
              errorMessage = error.error.message;
            }
          } else if (error?.status === 404) {
            errorMessage = 'Registration service not available. Please try again later.';
          } else if (error?.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          this.message.error(errorMessage, { nzDuration: 5000 });
        }
      });

    this.subscriptions.add(registerSub);
  }

  initializeSystem(): void {
    this.isInitializing = true;
    
    const initSub = this.systemService.initializeRoles()
      .pipe(
        finalize(() => {
          this.isInitializing = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('System initialization response:', response);
          if (response.success) {
            this.message.success('System initialized successfully! You can now register.', { nzDuration: 5000 });
            this.showSystemStatus = false;
          } else {
            this.message.error('System initialization failed: ' + (response.error || 'Unknown error'), { nzDuration: 5000 });
          }
        },
        error: (error) => {
          console.error('System initialization error:', error);
          this.message.error('Failed to initialize system. Please contact administrator.', { nzDuration: 5000 });
        }
      });

    this.subscriptions.add(initSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
