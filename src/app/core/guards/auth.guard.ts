import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router, CanLoad, Route, UrlSegment } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree {
    const user = localStorage.getItem('user');
    if (user) {
      return true;
    }
    return this.router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    const user = localStorage.getItem('user');
    if (user) {
      return true;
    }
    const returnUrl = segments.map((segment) => segment.path).join('/');
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: `/${returnUrl}` },
    });
    return false;
  }
}
