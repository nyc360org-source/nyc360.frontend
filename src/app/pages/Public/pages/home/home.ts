import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../Authentication/Service/auth';
import { environment } from '../../../../environments/environment';
import { PostsService } from '../posts/services/posts';
import { Post, FeedData, InterestGroup, CommunitySuggestion, PostAuthor } from '../posts/models/posts';
import { CATEGORY_LIST } from '../../../models/category-list';
import { WeatherService } from '../posts/services/weather';
import { CATEGORY_THEMES } from '../../Widgets/feeds/models/categories';
import { ToastService } from '../../../../shared/services/toast.service';
import { ImageService } from '../../../../shared/services/image.service';
import { ImgFallbackDirective } from '../../../../shared/directives/img-fallback.directive';

interface Alert { type: 'yellow' | 'blue' | 'red'; title: string; desc: string; icon: string; }

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ImgFallbackDirective],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {

  protected readonly environment = environment;
  private postsService = inject(PostsService);
  private weatherService = inject(WeatherService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  private router = inject(Router);
  private toastService = inject(ToastService);
  protected imageService = inject(ImageService);

  // Data
  featuredPosts: Post[] = [];
  heroBanner: Post | null = null;
  interestGroups: InterestGroup[] = [];
  trendingTags: string[] = [];
  suggestedCommunities: CommunitySuggestion[] = [];
  highlightedPosts: Post[] = [];
  textOnlyPosts: Post[] = []; // New array for posts without images

  // Weather Data
  weatherData: any = null;
  currentDate: Date = new Date();
  isFahrenheit: boolean = true; // Default to F for NYC

  // Alerts Data
  alerts: Alert[] = [
    { type: 'yellow', title: 'Gridlock Alert', desc: 'Midtown traffic moving slow due to UN General Assembly', icon: 'bi-exclamation-triangle-fill' },
    { type: 'blue', title: 'Rain Expected', desc: 'Light showers starting around 4 PM', icon: 'bi-cloud-rain-fill' }
  ];

  isLoading = true;
  selectedCategoryId: number = -1;
  categories = [{ id: -1, name: 'All', icon: 'bi-grid' }, ...CATEGORY_LIST];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const cat = params['category'];
      this.selectedCategoryId = cat !== undefined ? +cat : -1;
      this.loadFeed();
    });

    this.getRealWeather();
  }

  getRealWeather() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('Location access denied, defaulting to NYC');
          this.fetchWeather(); // Will use default inside service
        }
      );
    } else {
      this.fetchWeather();
    }
  }

  fetchWeather(lat?: number, lon?: number) {
    this.weatherService.getWeather(lat, lon).subscribe(data => {
      this.weatherData = data;
      this.cdr.detectChanges();
    });
  }

  toggleUnit() {
    this.isFahrenheit = !this.isFahrenheit;
  }

  get displayTemp(): number {
    if (!this.weatherData) return 0;
    if (this.isFahrenheit) {
      return Math.round((this.weatherData.tempC * 9 / 5) + 32);
    }
    return Math.round(this.weatherData.tempC);
  }

  loadFeed() {
    this.isLoading = true;
    this.postsService.getPostsFeed().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.processData(res.data);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Failed to load feed');
        this.cdr.detectChanges();
      }
    });
  }

  // Helper check (Used mainly for Hero selection logic)
  private hasValidImage(post: Post): boolean {
    if (post.imageUrl && post.imageUrl.trim() !== '') return true;
    if (post.attachments && post.attachments.length > 0 && post.attachments[0].url) return true;
    // Check Parent Post (for Shared Posts)
    if (post.parentPost) {
      if (post.parentPost.imageUrl && post.parentPost.imageUrl.trim() !== '') return true;
      if (post.parentPost.attachments && post.parentPost.attachments.length > 0 && post.parentPost.attachments[0].url) return true;
    }
    return false;
  }

  processData(data: FeedData) {
    this.textOnlyPosts = []; // Reset text-only posts
    const processedIds = new Set<string | number>(); // Track added IDs to avoid duplicates

    // Helper to add to textOnlyPosts if unique
    const addTextOnly = (post: Post) => {
      if (!processedIds.has(post.id)) {
        this.textOnlyPosts.push(post);
        processedIds.add(post.id);
      }
    };

    const rawFeatured = data.featuredPosts || [];
    const validFeatured: Post[] = [];

    // 1. Process Featured: Split into with-image and without-image
    rawFeatured.forEach(p => {
      const post = this.normalizePost(p);
      if (this.hasValidImage(post)) {
        validFeatured.push(post);
      } else {
        addTextOnly(post);
      }
    });

    // Take top 3 valid images for featured row
    this.featuredPosts = validFeatured.slice(0, 3);

    // 2. Hero Banner Logic
    const rawDiscovery = data.discoveryPosts || [];
    const validDiscovery: Post[] = [];

    rawDiscovery.forEach(p => {
      const post = this.normalizePost(p);
      if (this.hasValidImage(post)) {
        validDiscovery.push(post);
      } else {
        addTextOnly(post);
      }
    });

    if (validDiscovery.length > 0) {
      this.heroBanner = validDiscovery[0];
    } else if (validFeatured.length > 3) {
      // If we have extra featured posts with images, use the 4th one as hero (index 3)
      this.heroBanner = validFeatured[3];
    } else {
      this.heroBanner = null;
    }

    // 3. Interest Groups Logic
    this.interestGroups = (data.interestGroups || []).map(group => {
      const validGroupPosts: Post[] = [];

      group.posts.forEach(p => {
        const post = this.normalizePost(p);
        if (this.hasValidImage(post)) {
          validGroupPosts.push(post);
        } else {
          addTextOnly(post);
        }
      });

      return { ...group, posts: validGroupPosts };
    }).filter(g => g.posts.length > 0);

    // Highlights Logic (remains mostly same, picks from interest groups which are now only-images)
    this.highlightedPosts = [];
    this.interestGroups.forEach(group => {
      if (group.posts.length > 0) {
        this.highlightedPosts.push(group.posts[0]);
      }
    });

    this.trendingTags = data.trendingTags || [];
    this.suggestedCommunities = data.suggestedCommunities || [];
  }

  goToPost(post: Post) {
    this.router.navigate(['/public/posts/details', post.id], {
      state: { postData: post }
    });
  }

  onSavePost(post: Post, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.authService.currentUser$.value) {
      this.toastService.info('Please login to save posts');
      return;
    }
    const originalState = post.isSaved;
    post.isSaved = !post.isSaved;
    this.postsService.savePost(post.id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const msg = post.isSaved ? 'Post saved successfully!' : 'Post unsaved';
          this.toastService.success(msg);
        } else {
          post.isSaved = originalState;
          this.toastService.error('Failed to save post');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        post.isSaved = originalState;
        this.toastService.error('Error saving post');
        this.cdr.detectChanges();
      }
    });
  }

  onJoinCommunity(comm: CommunitySuggestion) {
    if (!this.authService.currentUser$.value) { this.toastService.info('Login required'); return; }
    if (comm.isJoined || comm.isLoadingJoin) return;
    comm.isLoadingJoin = true;
    this.postsService.joinCommunity(comm.id).subscribe({
      next: (res) => {
        comm.isLoadingJoin = false;
        if (res.isSuccess) { comm.isJoined = true; this.toastService.success('Joined!'); }
        else this.toastService.error('Failed');
        this.cdr.detectChanges();
      },
      error: () => { comm.isLoadingJoin = false; this.cdr.detectChanges(); }
    })
  }

  scrollGroup(categoryId: number, direction: 'left' | 'right') {
    const slider = document.getElementById('slider-' + categoryId);
    if (slider) {
      const scrollAmount = slider.clientWidth * 0.8;
      slider.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  // Helpers
  private normalizePost(post: any): Post {
    if (!post.stats) post.stats = { views: 0, likes: 0, dislikes: 0, comments: 0, shares: 0 };
    if (post.isSaved === undefined) post.isSaved = (post.isSavedByUser === true);
    if (!post.title) post.title = '';
    if (!post.content) post.content = '';
    return post;
  }

  getAuthorName(author: PostAuthor | string | undefined | null): string {
    if (!author) return 'NYC360';
    if (typeof author === 'string') return author;
    return author.name || author.username || 'NYC360';
  }

  getCategoryName(id: number): string {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : 'General';
  }

  getCategoryColor(id: number): string {
    const theme = (CATEGORY_THEMES as any)[id];
    return theme ? theme.color : '#d4af37'; // Default gold
  }

  getCategoryIcon(id: number): string {
    const theme = (CATEGORY_THEMES as any)[id];
    return theme ? theme.icon : '';
  }

  // ============================================
  // 🔥 دوال معالجة الصور (الذكية)
  // ============================================

  // Use ImageService for visuals
  getAuthorImage(author: any): string {
    return this.imageService.resolveAvatar(author);
  }

  resolvePostImage(post: Post): string {
    return this.imageService.resolvePostImage(post);
  }
}