import { Component, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { UserProfile } from '../../model/user-profile';
import { CreatePostComponent } from '../modal/create-post/create-post.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, CreatePostComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user: UserProfile | null = null;
  showPostModal = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((firebaseUser) => {
      if (firebaseUser) {
        this.updateUserProfile(firebaseUser);
      } else {
        const storedUser = this.authService.getUserData();
        if (storedUser) {
          this.user = storedUser;
        } else {
          this.router.navigate(['login']);
        }
      }
    });
  }

  private updateUserProfile(firebaseUser: User) {
    this.user = {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };
    this.authService.setUserData(firebaseUser);
  }

  onLogout(): void {
    if (confirm('Are sure you want to logout?')) {
      this.authService.logout().subscribe(() => {
        this.router.navigate(['login']);
      });
    }
  }

  onShowPostModal() {
    this.showPostModal = !this.showPostModal;
  }
}
