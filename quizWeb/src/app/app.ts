import { Component, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { SharedModule } from './modules/shared/shared-module';
import { NzHeaderComponent } from "ng-zorro-antd/layout";
import { UserStorage } from './modules/auth/services/user-storage';
import { AuthService } from './modules/user/services/auth';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SharedModule, NzHeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('quizWeb');

  isUserLoggedIn: boolean = false;
  isAdminLoggedIn: boolean = false;
  private subscription = new Subscription();

  constructor(private router: Router, public authService: AuthService) {
    // React to auth service signal changes using effect (must be in constructor)
    effect(() => {
      // This will run whenever isAuthenticated signal changes
      this.authService.isAuthenticated();
      this.updateAuthStatus();
    });
  }

  ngOnInit() {
    // Refresh auth state from storage on app init
    this.authService.refreshAuthState();
    
    // Start session monitoring
    this.authService.startSessionMonitoring();
    
    // Initial check
    this.updateAuthStatus();

    // Listen to router events to update auth status
    const routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateAuthStatus();
      });

    this.subscription.add(routerSub);
  }

  private updateAuthStatus(): void {
    this.isUserLoggedIn = UserStorage.isUserLoggedIn();
    this.isAdminLoggedIn = UserStorage.isAdminLoggedIn();
  }

  onLogout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

