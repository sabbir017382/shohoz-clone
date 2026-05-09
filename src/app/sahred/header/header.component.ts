import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/core/services/auth.service';

interface NavItem {
  label: string;
  key: string;
  icon: string;
  beta?: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  constructor(
    private router: Router,
    private service: AuthService,
  ) {}

  // USER
  user: User | null = null;

  // NAV ITEMS
  navItems: NavItem[] = [
    { label: 'Bus', key: 'bus', icon: '🚌' },
    { label: 'Air', key: 'plane', icon: '✈️' },
    { label: 'Train', key: 'train', icon: '🚆' },
    { label: 'Launch', key: 'launch', icon: '🚢' },
    { label: 'Event', key: 'event', icon: '🎫' },
    { label: 'Park', key: 'park', icon: '🌳', beta: true },
  ];

  activeNav: string = 'bus';

  // PROFILE DROPDOWN
  isDropdownOpen: boolean = false;

  // MOBILE MENU
  isMobileMenuOpen: boolean = false;

  ngOnInit(): void {
    this.fetchUser();
  }

  fetchUser(): void {
    this.user = this.service.getUser();
  }

  // NAVIGATION
  setActive(key: string): void {
    this.activeNav = key;

    // CLOSE MOBILE MENU
    this.isMobileMenuOpen = false;

    switch (key) {
      case 'bus':
        this.router.navigate(['/home']);
        break;

      case 'plane':
        this.router.navigate(['/air']);
        break;

      case 'train':
        this.router.navigate(['/train']);
        break;

      case 'launch':
        this.router.navigate(['/launch']);
        break;

      case 'event':
        this.router.navigate(['/event']);
        break;

      case 'park':
        this.router.navigate(['/park']);
        break;
    }
  }

  // DROPDOWN
  toggleDropdown(event: Event): void {
    event.stopPropagation();

    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  // MOBILE MENU
  toggleMobileMenu(event: Event): void {
    event.stopPropagation();

    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // PROFILE ACTIONS
  onMyProfile(): void {
    this.isDropdownOpen = false;

    this.router.navigate(['/profile']);
  }

  onChangePassword(): void {
    this.isDropdownOpen = false;

    this.router.navigate(['/change-password']);
  }

  onLogout(): void {
    this.isDropdownOpen = false;

    localStorage.removeItem('user');
    localStorage.removeItem('token');

    this.router.navigate(['/login']);
  }
}
