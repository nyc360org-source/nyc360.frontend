import { Component, OnInit, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd, Event } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../../Authentication/Service/auth';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
  
  public authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  
  isMenuOpen = false;
  isLoggedIn = false;
  currentUsername: string | null = null;
  hasNotifications = true; 
  
  // المتغير اللي ماسك القسم الحالي
  currentActiveCat: any = null;

  private userSub!: Subscription;
  private routerSub!: Subscription;

  // Categories definition
  categories = [
    { 
      id: 'community', name: 'Community', icon: 'bi-people-fill', route: '/public/community',
      topLinks: [
        { label: 'Feed', route: '/public/community' },
        { label: 'Explore', route: '/public/discover' },
        { label: 'My Communities', route: '/public/my-communities' }
      ]
    }, 
    { 
      id: 'culture', name: 'Culture', icon: 'bi-mask', route: '/public/coming-soon',
      topLinks: [
        { label: 'Feed', route: '/public/culture/feed' },
        { label: 'Exhibitions', route: '/public/culture/exhibitions' },
        { label: 'Artists', route: '/public/culture/artists' }
      ]
    }, 
    { 
      id: 'education', name: 'Education', icon: 'bi-journal-bookmark-fill', route: '/public/coming-soon',
      topLinks: [
        { label: 'Feed', route: '/public/education/feed' },
        { label: 'Courses', route: '/public/education/courses' },
        { label: 'Schools', route: '/public/education/schools' }
      ]
    }, 
    { 
      id: 'events', name: 'Events', icon: 'bi-calendar-event-fill', route: '/public/coming-soon',
      topLinks: [
        { label: 'Feed', route: '/public/events/feed' },
        { label: 'Calendar', route: '/public/events/calendar' },
        { label: 'My Tickets', route: '/public/events/tickets' }
      ]
    }, 
    { 
      id: 'health', name: 'Health', icon: 'bi-heart-pulse-fill', route: '/public/coming-soon',
      topLinks: [
        { label: 'Feed', route: '/public/health/feed' },
        { label: 'Directors', route: '/public/health/directors' },
        { label: 'Initiatives', route: '/public/health/initiatives' }
      ]
    }, 
    { 
      id: 'lifestyle', name: 'Lifestyle', icon: 'bi-person-arms-up', route: '/public/coming-soon',
      topLinks: [
        { label: 'Feed', route: '/public/lifestyle/feed' },
        { label: 'Trends', route: '/public/lifestyle/trends' },
        { label: 'Tips', route: '/public/lifestyle/tips' }
      ]
    }, 
    { 
      id: 'legal', name: 'Legal', icon: 'bi-bank2', route: '/public/coming-soon',
      topLinks: [
        { label: 'Feed', route: '/public/legal/feed' },
        { label: 'Consult', route: '/public/legal/consult' },
        { label: 'Library', route: '/public/legal/library' }
      ]
    }, 
    { 
      id: 'news', name: 'News', icon: 'bi-newspaper', route: '/public/coming-soon',
      topLinks: [
        { label: 'Feed', route: '/public/news/feed' },
        { label: 'Latest', route: '/public/news/latest' },
        { label: 'Saved', route: '/public/news/saved' }
      ]
    }, 
    { 
      id: 'profession', name: 'Profession', icon: 'bi-briefcase-fill', route: '/public/coming-soon',
      topLinks: [
        { label: 'Feed', route: '/public/profession/feed' },
        { label: 'Jobs', route: '/public/profession/jobs' },
        { label: 'My Application', route: '/public/profession/my-application' }
      ]
    }, 
    { 
      id: 'social', name: 'Social', icon: 'bi-globe', route: '/public/coming-soon',
      topLinks: [
        { label: 'Feed', route: '/public/social/feed' },
        { label: 'Campaigns', route: '/public/social/campaigns' },
        { label: 'Volunteer', route: '/public/social/volunteer' }
      ]
    }, 
    { 
      id: 'tour', name: 'Tour', icon: 'bi-map-fill', route: '/public/coming-soon',
      topLinks: [
        { label: 'Feed', route: '/public/tour/feed' },
        { label: 'Map', route: '/public/tour/map' },
        { label: 'Guides', route: '/public/tour/guides' }
      ]
    }, 
    { 
      id: 'tv', name: 'TV', icon: 'bi-tv-fill', route: '/public/coming-soon',
      topLinks: [
        { label: 'Feed', route: '/public/tv/feed' },
        { label: 'Live', route: '/public/tv/live' },
        { label: 'Series', route: '/public/tv/series' }
      ]
    } 
  ];

  ngOnInit() {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.currentUsername = user.username || user.unique_name || user.email;
      } else {
        this.currentUsername = null;
      }
    });

    // Listen to route changes
    this.routerSub = this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateActiveCategory(event.urlAfterRedirects);
    });

    // Initial check
    if (isPlatformBrowser(this.platformId)) {
       this.updateActiveCategory(this.router.url);
    }
  }

  updateActiveCategory(url: string) {
    if (url === '/' || url === '/public/home' || url.includes('/public/home')) {
      this.currentActiveCat = null;
      return;
    }

    // Logic to keep buttons persistent if URL starts with category route
    const found = this.categories.find(cat => url.startsWith(cat.route));
    
    if (found) {
      this.currentActiveCat = found;
    } else {
      this.currentActiveCat = null;
    }
  }

  toggleMenu() { 
    this.isMenuOpen = !this.isMenuOpen; 
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : 'auto';
    }
  }
  
  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
    if (this.routerSub) this.routerSub.unsubscribe();
  }
}