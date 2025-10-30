import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, NgStyle } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { UserStorage } from '../../../modules/auth/services/user-storage';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzDropDownModule,
    NzAvatarModule,
    NzButtonModule,
    NzDividerModule,
    NgStyle
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isMobileMenuOpen = false;
  isLoggedIn = false;
  isAdmin = false;
  userName = '';
  isMobileView = false;
  readonly MOBILE_BREAKPOINT = 768;

  constructor(private router: Router) {
    this.checkLoginStatus();
    this.checkViewport();
  }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      if (this.isMobileView) {
        this.closeMobileMenu();
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.checkViewport();
  }

  private checkViewport(): void {
    this.isMobileView = window.innerWidth <= this.MOBILE_BREAKPOINT;
    if (!this.isMobileView) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  private checkLoginStatus(): void {
    this.isLoggedIn = UserStorage.isUserLoggedIn() || UserStorage.isAdminLoggedIn();
    this.isAdmin = UserStorage.isAdminLoggedIn();
    const user = UserStorage.getUser();
    if (user) {
      this.userName = user.name || 'User';
    }
  }

  logout(): void {
    UserStorage.signOut();
    this.router.navigateByUrl('/auth/login');
  }

  get userInitials(): string {
    if (!this.userName) return 'U';
    return this.userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
