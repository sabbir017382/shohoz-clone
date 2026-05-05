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

  // ✅ USER FIXED
  user: User | null = null;

  // NAV ITEMS
  navItems: NavItem[] = [
    { label: 'Bus', key: 'bus', icon: '🚌' },
    { label: 'Air', key: 'plane', icon: '✈️' },
    { label: 'Train', key: 'train', icon: '🚆' },
    { label: 'Ship', key: 'ship', icon: '🚢' },
  ];

  activeNav: string = 'bus';
  isDropdownOpen: boolean = false;

  ngOnInit(): void {
    this.fetchUser();
  }

  fetchUser(): void {
    this.user = this.service.getUser();
  }

  setActive(key: string): void {
    this.activeNav = key;
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

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
