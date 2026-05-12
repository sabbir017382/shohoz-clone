import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { User } from '../../../models/user';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  images: string[] = ['assets/images/bus.jpg', 'assets/images/bus1.jpg'];
  currentImageIndex = 0;

  user: User = {
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    gender: '',
    password: '',
    confirmPassword: '',
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    setInterval(() => {
      this.nextImage();
    }, 3000);
  }
  showPassword = false;
  showConfirmPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      alert('Password does not match');
      return;
    }
    this.user.role = 'user';
    this.authService.register(this.user).subscribe({
      next: (response) => {
        localStorage.setItem('user', JSON.stringify(response));
        alert('Registration Successful');
        form.reset();
      },
      error: (error) => {
        console.error('Registration Error:', error);
        alert('Registration Failed');
      },
    });
  }
}
