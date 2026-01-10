// src/app/routes/auth.routes.ts
import { Routes } from '@angular/router';
import { AuthLayout } from '../pages/Layout/auth-layout/auth-layout';

export const AUTH_ROUTES: Routes = [
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      { path: 'login', loadComponent: () => import('../pages/Authentication/pages/login/login').then(m => m.LoginComponent) },
      { path: 'register-selection', loadComponent: () => import('../pages/Authentication/pages/register-selection/register-selection').then(m => m.RegisterSelectionComponent) },
      { path: 'verify-otp', loadComponent: () => import('../pages/Authentication/pages/verify-otp/verify-otp').then(m => m.VerifyOtpComponent) },
      { path: 'forgot-password', loadComponent: () => import('../pages/Authentication/pages/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent) },
      { path: 'confirm-email', loadComponent: () => import('../pages/Authentication/pages/confirm-email/confirm-email').then(m => m.ConfirmEmailComponent) },
      { path: 'reset-password', loadComponent: () => import('../pages/Authentication/pages/reset-password/reset-password').then(m => m.ResetPasswordComponent) }
    ]
  }
];