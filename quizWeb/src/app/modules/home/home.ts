import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../shared/shared-module';
import { UserStorage } from '../auth/services/user-storage';

@Component({
  selector: 'app-home',
  imports: [SharedModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home {
  
  constructor(private router: Router) { }

  // Sample statistics for the home page
  getStatistics() {
    return {
      totalTests: 25,
      activeUsers: 150,
      completedTests: 1200,
      averageScore: 78
    };
  }

  navigateToLogin() {
    // Check if user is already logged in
    if (UserStorage.isUserLoggedIn()) {
      // Redirect to user dashboard if already logged in as user
      this.router.navigate(['/user/dashboard']);
    } else if (UserStorage.isAdminLoggedIn()) {
      // Redirect to admin dashboard if already logged in as admin
      this.router.navigate(['/admin/dashboard']);
    } else {
      // Navigate to login page if not logged in
      this.router.navigate(['/login']);
    }
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToUserDashboard() {
    this.router.navigate(['/user/dashboard']);
  }

  navigateToAdminDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  isLoggedIn(): boolean {
    return UserStorage.isUserLoggedIn() || UserStorage.isAdminLoggedIn();
  }

  logout(): void {
    UserStorage.signOut();
    // Navigate to login page after logout
    this.router.navigate(['/login']);
  }
}