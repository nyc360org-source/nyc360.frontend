import { Routes } from '@angular/router';
import { PublicLayoutComponent } from '../pages/Layout/public-layout/public-layout.component';
import { AdminLayoutComponent } from '../pages/Layout/admin-layout/admin-layout.component';
import { authGuard } from '../guard/auth-guard'; 
import { AuthLayout } from '../pages/Layout/auth-layout/auth-layout';
import { LandingLayout } from '../pages/Layout/landing-layout/landing-layout';
import { AUTH_ROUTES } from './auth.routes';
import { PUBLIC_ROUTES } from './public.routes';
import { ADMIN_ROUTES } from './admin.routes';

export const routes: Routes = [
  
  // ============================================================
  // 1. LANDING & GENERAL (Root)
  // ============================================================
  {
    path: '',
    component: LandingLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('../pages/landing/pages/landing-page/landing-page').then(m => m.LandingPage)
      },
      {
        path: 'about',
        loadComponent: () => import('../pages/landing/pages/about-us/about-us').then(m => m.AboutUsComponent)
      }
    ]
  },

// 2. Auth Routes
  ...AUTH_ROUTES,

  // 3. Public Routes (Feed, Profile, etc.)
  ...PUBLIC_ROUTES,

  // 4. Admin Routes
  ...ADMIN_ROUTES,

  {
    path: '**',
    loadComponent: () => import('../pages/Public/Widgets/not-found/not-found').then(m => m.NotFoundComponent)
  }
  
];