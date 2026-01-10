// src/app/routes/public.routes.ts
import { Routes } from '@angular/router';
import { PublicLayoutComponent } from '../pages/Layout/public-layout/public-layout.component';
import { authGuard } from '../guard/auth-guard';

export const PUBLIC_ROUTES: Routes = [
  {
    path: 'public',
    component: PublicLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Feed
      { path: 'home', loadComponent: () => import('../pages/Public/pages/posts/home/home').then(m => m.Home) },
      { path: 'posts/details/:id', loadComponent: () => import('../pages/Public/pages/posts/post-details/post-details').then(m => m.PostDetailsComponent) },
      { path: 'posts/tags/:tag', loadComponent: () => import('../pages/Public/pages/posts/tag-posts/tag-posts').then(m => m.TagPostsComponent) },
      { path: 'posts/create', loadComponent: () => import('../pages/Dashboard/pages/posts/post-form/post-form').then(m => m.PostFormComponent) },

      // Community
      { path: 'community', loadComponent: () => import('../pages/Public/pages/communities/pages/community/community').then(m => m.CommunityComponent) },
      { path: 'create-community', loadComponent: () => import('../pages/Public/pages/communities/pages/create-community/create-community').then(m => m.CreateCommunityComponent) },
      { path: 'community/:slug', loadComponent: () => import('../pages/Public/pages/communities/pages/community-profile/community-profile').then(m => m.CommunityProfileComponent) },
      { path: 'discover', loadComponent: () => import('../pages/Public/pages/communities/pages/community-discovery/community-discovery').then(m => m.CommunityDiscoveryComponent) },
      { path: 'community/:id/create-post', loadComponent: () => import('../pages/Public/pages/communities/pages/create-community-post/create-community-post').then(m => m.CreateCommunityPostComponent) },
      { path: 'my-communities', loadComponent: () => import('../pages/Public/pages/communities/pages/mycommunities/mycommunities').then(m => m.MycommunitiesComponent) },
      { path: 'post/:id', loadComponent: () => import('../pages/Public/pages/communities/pages/post-details/post-details').then(m => m.PostDetailsComponent) },


      // Profile & Misc
      { path: 'coming-soon', loadComponent: () => import('../pages/Public/Widgets/coming-soon/coming-soon').then(m => m.ComingSoonComponent) },
      { path: 'profile/:username', loadComponent: () => import('../pages/Public/pages/profile/profile/profile').then(m => m.ProfileComponent) }
    ]
  }
];