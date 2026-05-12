import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, switchMap, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { User } from 'src/app/models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  register(data: User) {
    const payload = { ...data, role: data.role || 'user' };
    return this.http.post<User>(this.baseUrl + 'users', payload);
  }

  login(mobile: string, password: string) {
    return this.http
      .get<User[]>(`${this.baseUrl}users?mobile=${mobile}&password=${password}`)
      .pipe(
        tap((users) => {
          if (users.length > 0) {
            localStorage.setItem('user', JSON.stringify(users[0]));
          }
        }),
      );
  }
  getUser(): User | null {
    const user = localStorage.getItem('user');
    if (!user) {
      return null;
    }
    const parsedUser = JSON.parse(user) as User;
    if (!parsedUser.role) {
      parsedUser.role = 'user';
    }
    return parsedUser;
  }

  getUserByMobile(mobile: string) {
    return this.http.get<User[]>(`${this.baseUrl}users?mobile=${mobile}`);
  }

  updateUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  updateUserProfile(user: User) {
    if (!user.id) {
      throw new Error('User ID is required for profile update');
    }
    return this.http.put<User>(`${this.baseUrl}users/${user.id}`, user).pipe(
      tap((updatedUser) => {
        this.updateUser(updatedUser);
      }),
    );
  }

  changePassword(
    mobile: string,
    oldPassword: string,
    newPassword: string,
  ): Observable<any> {
    return this.http
      .get<
        User[]
      >(`${this.baseUrl}users?mobile=${mobile}&password=${oldPassword}`)
      .pipe(
        switchMap((users) => {
          if (users.length === 0) {
            return throwError(() => new Error('Current password is incorrect'));
          }
          const user = users[0];
          return this.http.patch<User>(`${this.baseUrl}users/${user.id}`, {
            password: newPassword,
          });
        }),
      );
  }
}
