import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  editUser: User | null = null;
  isEditing = false;
  saving = false;
  currentView: 'profile' | 'changePassword' = 'profile';
  form: FormGroup;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group(
      {
        old_password: ['', [Validators.required]],
        new_password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(15),
          ],
        ],
        new_password_confirmation: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    const localUser = this.auth.getUser();
    if (localUser?.mobile) {
      this.auth.getUserByMobile(localUser.mobile).subscribe({
        next: (users) => {
          if (users && users.length > 0) {
            this.user = users[0];
            this.auth.updateUser(this.user);
          } else {
            this.user = localUser;
          }
        },
        error: () => {
          this.user = localUser;
        },
      });
    } else {
      this.user = localUser;
    }
  }

  startEdit(): void {
    if (!this.user) {
      return;
    }
    this.editUser = { ...this.user };
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.editUser = null;
    this.isEditing = false;
  }

  saveProfile(): void {
    if (!this.editUser) {
      return;
    }
    this.saving = true;
    this.auth.updateUserProfile(this.editUser).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.editUser = null;
        this.isEditing = false;
        this.saving = false;
      },
      error: () => {
        this.saving = false;
        alert('Unable to update profile. Please try again.');
      },
    });
  }

  showChangePassword(): void {
    this.currentView = 'changePassword';
    this.form.reset();
  }

  showProfile(): void {
    this.currentView = 'profile';
    this.isEditing = false;
  }

  passwordMatchValidator(group: FormGroup): any {
    const newPassword = group.get('new_password');
    const confirmPassword = group.get('new_password_confirmation');

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      const errors = confirmPassword?.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    return null;
  }

  toggleOldPassword(): void {
    this.showOldPassword = !this.showOldPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.form.valid && this.user) {
      const { old_password, new_password } = this.form.value;

      this.auth
        .changePassword(this.user.mobile, old_password, new_password)
        .subscribe({
          next: () => {
            alert('Password changed successfully!');
            this.form.reset();
            this.showProfile();
          },
          error: (error) => {
            alert(
              'Failed to change password. Please check your current password and try again.',
            );
            console.error('Password change error:', error);
          },
        });
    }
  }
}
