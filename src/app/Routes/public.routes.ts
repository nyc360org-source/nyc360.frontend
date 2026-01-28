// src/app/routes/public.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../guard/auth-guard';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../pages/Layout/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    canActivate: [authGuard],
    children: [
      // Feed
      { path: 'home', loadComponent: () => import('../pages/Public/pages/home/home').then(m => m.Home) },
      { path: 'posts/details/:id', loadComponent: () => import('../pages/Public/pages/posts/post-details/post-details').then(m => m.PostDetailsComponent) },
      { path: 'posts/tags/:tag', loadComponent: () => import('../pages/Public/pages/posts/tag-posts/tag-posts').then(m => m.TagPostsComponent) },
      { path: 'posts/create', loadComponent: () => import('../pages/Public/pages/posts/post-form/post-form').then(m => m.PostFormComponent) },
      { path: 'posts/edit/:id', loadComponent: () => import('../pages/Public/pages/posts/post-form/post-form').then(m => m.PostFormComponent) },

      // Community
      { path: 'community', loadComponent: () => import('../pages/Public/pages/communities/pages/community/community').then(m => m.CommunityComponent) },
      { path: 'create-community', loadComponent: () => import('../pages/Public/pages/communities/pages/create-community/create-community').then(m => m.CreateCommunityComponent) },
      { path: 'community/:slug', loadComponent: () => import('../pages/Public/pages/communities/pages/community-profile/community-profile').then(m => m.CommunityProfileComponent) },
      { path: 'community/:slug/manage', loadComponent: () => import('../pages/Public/pages/communities/pages/community-management/community-management').then(m => m.CommunityManagementComponent) },
      { path: 'discover', loadComponent: () => import('../pages/Public/pages/communities/pages/community-discovery/community-discovery').then(m => m.CommunityDiscoveryComponent) },
      { path: 'community/:id/create-post', loadComponent: () => import('../pages/Public/pages/communities/pages/create-community-post/create-community-post').then(m => m.CreateCommunityPostComponent) },
      { path: 'my-communities', loadComponent: () => import('../pages/Public/pages/communities/pages/mycommunities/mycommunities').then(m => m.MycommunitiesComponent) },
      { path: 'post/:id', loadComponent: () => import('../pages/Public/pages/communities/pages/post-details/post-details').then(m => m.PostDetailsComponent) },

      // jobs
      { path: 'create-offer', loadComponent: () => import('../pages/Public/pages/jobs/pages/create-offer/create-offer').then(m => m.CreateOfferComponent) },
      { path: 'job-profile/:id', loadComponent: () => import('../pages/Public/pages/jobs/pages/job-profile/job-profile').then(m => m.JobProfileComponent) },
      { path: 'profession/feed', loadComponent: () => import('../pages/Public/pages/jobs/pages/profession-feed/profession-feed').then(m => m.ProfessionFeedComponent) },
      { path: 'profession/my-applications', loadComponent: () => import('../pages/Public/pages/jobs/pages/my-applications.component/my-applications.component').then(m => m.MyApplicationsComponent) },
      { path: 'profession/jobs', loadComponent: () => import('../pages/Public/pages/jobs/pages/job-search/job-search').then(m => m.JobSearchComponent) },
      { path: 'profession/my-offers', loadComponent: () => import('../pages/Public/pages/jobs/pages/my-offers/my-offers').then(m => m.MyOffersComponent) },
      { path: 'edit-offer/:id', loadComponent: () => import('../pages/Public/pages/jobs/pages/edit-offer/edit-offer').then(m => m.EditOfferComponent) },

      // events
      {
        path: 'events',
        loadComponent: () => import('../pages/Public/pages/events/pages/event-layout/event-layout').then(m => m.EventLayoutComponent),
        children: [
          { path: 'home', loadComponent: () => import('../pages/Public/pages/events/pages/event-home/event-home').then(m => m.EventHomeComponent) },
          { path: 'list', loadComponent: () => import('../pages/Public/pages/events/pages/events-list/events-list').then(m => m.EventsListComponent) },
          { path: 'details/:id', loadComponent: () => import('../pages/Public/pages/events/pages/event-details/event-details').then(m => m.EventDetailsComponent) },
          { path: 'create', loadComponent: () => import('../pages/Public/pages/events/pages/create-event/create-event').then(m => m.CreateEventComponent) },
          { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
      },

      // housing
      { path: 'housing/home', loadComponent: () => import('../pages/Public/pages/housing/pages/housing-home/housing-home').then(m => m.HousingHomeComponent) },
      { path: 'housing/feed', loadComponent: () => import('../pages/Public/pages/housing/pages/housing-feed/housing-feed').then(m => m.HousingFeedComponent) },
      { path: 'housing/create', loadComponent: () => import('../pages/Public/pages/housing/pages/create-housing/create-housing').then(m => m.CreateHousingComponent) },
      { path: 'housing/requests', loadComponent: () => import('../pages/Public/pages/housing/pages/housing-requests/housing-requests.component').then(m => m.HousingRequestsComponent) },
      { path: 'housing/agent-request', loadComponent: () => import('../pages/Public/pages/housing/pages/agent-request/agent-request.component').then(m => m.AgentRequestComponent) },
      { path: 'housing', redirectTo: 'housing/home', pathMatch: 'full' },

      // category home
      {
        path: 'category/:categoryPath',
        loadComponent: () => import('../pages/Public/Widgets/category-home/category-home.component/category-home.component').then(m => m.CategoryHomeComponent)
      },

      //feed layout route
      {
        path: 'feed',
        loadChildren: () => import('../Routes/feed.routes').then(m => m.PostsRoutingModule)
      },

      // initiatives layout route
      {
        path: 'initiatives',
        loadChildren: () => import('../pages/Public/Widgets/initiatives/initiatives-routing.module').then(m => m.InitiativesRoutingModule)
      },
      // Profile & Misc
      { path: 'coming-soon', loadComponent: () => import('../pages/Public/Widgets/coming-soon/coming-soon').then(m => m.ComingSoonComponent) },
      { path: 'profile/settings', loadComponent: () => import('../pages/Public/pages/settings/settings').then(m => m.SettingsComponent) },
      { path: 'profile/:username', loadComponent: () => import('../pages/Public/pages/profile/profile/profile').then(m => m.ProfileComponent) }
    ]
  }
];