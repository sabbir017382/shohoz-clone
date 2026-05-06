import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { User } from 'src/app/models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  register(data: User) {
    return this.http.post<User>(this.baseUrl + 'users', data);
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
    return user ? JSON.parse(user) : null;
  }

  updateUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
}
