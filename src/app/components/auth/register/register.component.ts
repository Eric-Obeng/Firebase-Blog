import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registerForm!: FormGroup;
  errorMessage: string = '';
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      username: ['', Validators.required],
      profilePicture: [''],
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];

    if (file) {
      const maxSize = 1048576;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

      if (file.size > maxSize) {
        this.errorMessage = 'File size must be less than 1MB.';
        this.selectedFile = null;
      } else if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Only image files (JPEG, PNG, GIF) are allowed.';
        this.selectedFile = null;
      } else {
        this.errorMessage = '';
        this.selectedFile = file;
      }
    }
  }

  onRegister() {
    const { email, password, username } = this.registerForm.value;

    this.authService.register(email, password).subscribe({
      next: (user) => {
        this.updateUserProfile(user, username);
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error(error);
      },
    });
  }

  updateUserProfile(user: User, username: string) {
    if (this.selectedFile) {
      this.authService.uploadProfilePicture(this.selectedFile, user).subscribe({
        next: (photoURL) => {
          this.authService
            .updateUserProfile(user, username, photoURL)
            .subscribe({
              next: () => this.onRegistrationSuccess(),
              error: (error) => this.handleError(error),
            });
        },
        error: (error) => this.handleError(error),
      });
    } else {
      this.authService.updateUserProfile(user, username).subscribe({
        next: () => this.onRegistrationSuccess(),
        error: (error) => this.handleError(error),
      });
    }
  }

  private onRegistrationSuccess() {
    console.log('User profile updated successfully');
    this.registerForm.reset();
    this.router.navigate(['']);
  }

  private handleError(error: any) {
    this.errorMessage = error.message;
    console.error(error);
  }
}
