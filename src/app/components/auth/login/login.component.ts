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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin() {
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.errorMessage = '';
        console.log('User logged in Successful:', user);
        this.loginForm.reset();
        this.router.navigate(['']);
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }

  onGoggleSignIn() {
    this.authService.googleSignIn().subscribe({
      next: () => {
        this.errorMessage = '';
        console.log('User sign-in Successful:', user);
        this.loginForm.reset();
        this.router.navigate([''])
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }
}
