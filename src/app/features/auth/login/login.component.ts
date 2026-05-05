import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  images: string[] = ['assets/images/bus.jpg', 'assets/images/bus1.jpg'];
  currentImageIndex = 0;
  isLoading = false;

  user: User = {
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    gender: '',
    password: '',
    confirmPassword: '',
  };

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    setInterval(() => {
      this.nextImage();
    }, 3000);
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  showPassword = false;
  showConfirmPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  login(form: NgForm) {
    if (form.invalid) return;

    this.isLoading = true;
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

    this.auth.login(this.user.mobile, this.user.password).subscribe({
      next: (users) => {
        this.isLoading = false;

        if (users && users.length > 0) {
          this.router.navigateByUrl(returnUrl);
          form.resetForm();
        } else {
          alert('Invalid mobile number or password');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);
        const message =
          err?.error?.message ||
          err?.statusText ||
          err?.message ||
          'Login failed';
        alert(`Login failed: ${message}`);
      },
    });
  }
}
