import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
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
    { label: 'Bus', key: 'bus', icon: '/assets/images/hbus.png' },
    { label: 'Air', key: 'plane', icon: '/assets/images/air.png' },
    { label: 'Train', key: 'train', icon: '/assets/images/train.png' },
    { label: 'Launch', key: 'launch', icon: '/assets/images/ship.png' },
    { label: 'Event', key: 'event', icon: '/assets/images/event.png' },
    { label: 'Park', key: 'park', icon: '/assets/images/park.png', beta: true },
  ];

  activeNav: string = 'bus';

  // PROFILE DROPDOWN
  isDropdownOpen: boolean = false;

  // MOBILE MENU
  isMobileMenuOpen: boolean = false;

  ngOnInit(): void {
    this.fetchUser();
    this.updateActiveNav(this.router.url);

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe((event) => {
        this.updateActiveNav(event.urlAfterRedirects);
      });
  }

  fetchUser(): void {
    this.user = this.service.getUser();
  }

  updateActiveNav(url: string): void {
    if (url.startsWith('/air') || url.startsWith('/contact')) {
      this.activeNav = 'plane';
    } else if (
      url === '/home' ||
      url.startsWith('/create-ticket') ||
      url.startsWith('/ticket-list') ||
      url.startsWith('/ticket-booking') ||
      url.startsWith('/trip-info') ||
      url.startsWith('/payment')
    ) {
      this.activeNav = 'bus';
    } else if (url.startsWith('/train')) {
      this.activeNav = 'train';
    } else if (url.startsWith('/launch')) {
      this.activeNav = 'launch';
    } else if (url.startsWith('/event')) {
      this.activeNav = 'event';
    } else if (url.startsWith('/park')) {
      this.activeNav = 'park';
    } else {
      this.activeNav = 'bus';
    }
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
        this.router.navigate(['/unknown']);
        break;

      case 'launch':
        this.router.navigate(['/unknown']);
        break;

      case 'event':
        this.router.navigate(['/unknown']);
        break;

      case 'park':
        this.router.navigate(['/unknown']);
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

  onCreateBusTicket(): void {
    this.isDropdownOpen = false;

    this.router.navigate(['/create-ticket']);
  }

  onCreateAirTicket(): void {
    this.isDropdownOpen = false;

    this.router.navigate(['/air-ticket-create']);
  }

  onLogout(): void {
    this.isDropdownOpen = false;

    localStorage.removeItem('user');
    localStorage.removeItem('token');

    this.router.navigate(['/login']);
  }
}
