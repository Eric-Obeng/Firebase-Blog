import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./components/auth/register/register.component').then(
        (r) => r.RegisterComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.component').then(
        (l) => l.LoginComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then(
        (p) => p.ProfileComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/blog-post/blog-post.component').then(
        (b) => b.BlogPostComponent
      ),
    canActivate: [AuthGuard],
  },
];
