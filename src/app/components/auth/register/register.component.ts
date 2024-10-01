import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { updateProfile, User } from '@angular/fire/auth';
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
    this.selectedFile = file;
  }

  onRegister() {
    const { email, password, username } = this.registerForm.value;

    this.authService.register(email, password).subscribe({
      next: (user) => {
        this.updateUserProfile(user, username);
        this.registerForm.reset();
        this.router.navigate(['profile']);
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error(error);
      },
    });
  }

  updateUserProfile(user: User, username: string) {
    if (this.selectedFile) {
      this.authService
        .uploadProfilePicture(this.selectedFile, user)
        .subscribe((photoURL) => {
          updateProfile(user, { displayName: username, photoURL }).then(() => {
            console.log('User profile updated successfully with picture');
          });
        });
    } else {
      updateProfile(user, { displayName: username }).then(() => {
        console.log('User profile updated successfully without picture');
      });
    }
  }
}
