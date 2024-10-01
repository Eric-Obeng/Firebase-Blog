import { Routes } from '@angular/router';

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
      import('./components/auth/profile/profile.component').then(
        (p) => p.ProfileComponent
      ),
  },
];
