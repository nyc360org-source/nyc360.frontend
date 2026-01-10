// src/app/routes/admin.routes.ts
import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../pages/Layout/admin-layout/admin-layout.component';
import { authGuard } from '../guard/auth-guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin', 'SuperAdmin'] },
    children: [
      // Dashboard
      { path: 'dashboard', loadComponent: () => import('../pages/Dashboard/pages/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent) },

      // Users
      { path: 'User', loadComponent: () => import('../pages/Dashboard/pages/users/userlist/userlist').then(m => m.UserList) },

      // Roles
      { path: 'Role', loadComponent: () => import('../pages/Dashboard/pages/Roles/roles-list/roles-list').then(m => m.RolesListComponent) },
      { path: 'roles/create', loadComponent: () => import('../pages/Dashboard/pages/Roles/role-form/role-form').then(m => m.RoleFormComponent) },
      { path: 'roles/edit/:id', loadComponent: () => import('../pages/Dashboard/pages/Roles/edit-role/edit-role').then(m => m.EditRoleComponent) },

      // RSS
      { path: 'rss', loadComponent: () => import('../pages/Dashboard/pages/RssLinks/pages/rss-list/rss-list').then(m => m.RssListComponent) },
      { path: 'rss/create', loadComponent: () => import('../pages/Dashboard/pages/RssLinks/pages/rss-form/rss-form').then(m => m.RssFormComponent) },
      { path: 'rss/edit', loadComponent: () => import('../pages/Dashboard/pages/RssLinks/pages/rss-form/rss-form').then(m => m.RssFormComponent) },

      // Posts Management
      { path: 'posts', loadComponent: () => import('../pages/Dashboard/pages/posts/post-list/post-list').then(m => m.PostListComponent) },
      { path: 'posts/create', loadComponent: () => import('../pages/Dashboard/pages/posts/post-form/post-form').then(m => m.PostFormComponent) },
      { path: 'posts/edit/:id', loadComponent: () => import('../pages/Dashboard/pages/posts/post-form/post-form').then(m => m.PostFormComponent) },
      { path: 'posts/details/:id', loadComponent: () => import('../pages/Public/pages/posts/post-details/post-details').then(m => m.PostDetailsComponent) },

      // Trending & Flags
      { path: 'trending', loadComponent: () => import('../pages/Dashboard/pages/posts/trending/trending').then(m => m.TrendingComponent) },
      { path: 'flags', loadComponent: () => import('../pages/Dashboard/pages/posts/flags-list/flags-list').then(m => m.FlagsListComponent) }
    ]
  }
];