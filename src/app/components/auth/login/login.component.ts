import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { user } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email validation
      password: ['', [Validators.required, Validators.minLength(6)]], // Password validation
    });
  }

  // Handles form submission
  onLogin() {
    const { email, password } = this.loginForm.value;

    if (this.loginForm.valid) {
      this.authService.login(email, password).subscribe({
        next: () => {
          this.errorMessage = '';
          this.loginForm.reset();
          this.router.navigate(['']);
        },
        error: (error) => {
          this.errorMessage = error.message;
        },
      });
    }
  }

  // Google Sign-In
  onGoogleSignIn() {
    this.authService.googleSignIn().subscribe({
      next: () => {
        this.errorMessage = '';
        this.loginForm.reset();
        this.router.navigate(['']);
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }
}
