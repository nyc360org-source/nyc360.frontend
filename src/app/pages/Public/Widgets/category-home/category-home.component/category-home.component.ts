import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CategoryPost } from '../models/category-home.models';
import { CategoryHomeService } from '../service/category-home.service';
import { CATEGORY_THEMES } from '../../feeds/models/categories';
import { environment } from '../../../../../environments/environment';
import { ImageService } from '../../../../../shared/services/image.service';
import { ImgFallbackDirective } from '../../../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-category-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ImgFallbackDirective],
  templateUrl: './category-home.component.html',
  styleUrls: ['./category-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryHomeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private homeService = inject(CategoryHomeService);
  private cdr = inject(ChangeDetectorRef);
  protected readonly environment = environment;
  protected imageService = inject(ImageService);

  // --- Data Buckets ---
  heroPost: CategoryPost | null = null;       // 1. الصورة الكبيرة (Hero)
  topSidePosts: CategoryPost[] = [];          // 2. القائمة الجانبية العلوية
  gridPosts: CategoryPost[] = [];             // 3. شبكة الصور (Latest Grid)
  moreNewsPosts: CategoryPost[] = [];         // 4. القائمة السفلية (More News)
  textOnlyPosts: CategoryPost[] = [];         // 5. بوستات بدون صور (التصميم الجديد في الأسفل)
  trendingPosts: CategoryPost[] = [];         // 6. التريند (Sidebar)

  // --- Theme ---
  activeTheme: any = null;
  isLoading = true;
  isHousingCategory = false;

  // Data Buckets
  structuredPosts: CategoryPost[] = []; // JSON metadata posts
  homesForSale: CategoryPost[] = [];
  homesForRent: CategoryPost[] = [];
  officialPosts: CategoryPost[] = [];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const path = params['categoryPath'];
      this.resolveCategory(path);
    });
  }

  resolveCategory(path: string) {
    this.isLoading = true;
    const categoryEntry = Object.entries(CATEGORY_THEMES).find(([key, val]: any) => val.path === path);

    if (categoryEntry) {
      this.activeTheme = categoryEntry[1];
      const divisionId = Number(categoryEntry[0]);
      this.isHousingCategory = (divisionId === 4); // CategoryEnum.Housing
      this.fetchData(divisionId);
    } else {
      this.activeTheme = { label: 'News', color: '#333' }; // Fallback
      this.isHousingCategory = false;
      this.isLoading = false;
    }
  }

  fetchData(divisionId: number) {
    // نطلب عدد أكبر قليلاً لملء الصفحة
    this.homeService.getCategoryHomeData(divisionId, 25).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          // دمج المصادر لعمل الفرز اليدوي
          const allIncoming = [...(res.data.featured || []), ...(res.data.latest || [])];

          // 1. فصل البوستات: "بصور" vs "بدون صور"
          let allPosts = allIncoming.map(p => this.parsePostData(p));

          // Separate structured posts (those with JSON metadata)
          this.structuredPosts = allPosts.filter(p => p.housingMetadata);
          const remainingPosts = allPosts.filter(p => !p.housingMetadata);

          const withImages = remainingPosts.filter(p => this.hasImage(p));
          const noImages = remainingPosts.filter(p => !this.hasImage(p));

          if (this.isHousingCategory) {
            this.heroPost = withImages[0] || this.structuredPosts[0] || null;
            this.homesForSale = this.structuredPosts.filter(p => p.housingMetadata && !p.housingMetadata.IsRenting);
            this.homesForRent = this.structuredPosts.filter(p => p.housingMetadata && p.housingMetadata.IsRenting);
            this.officialPosts = allPosts.filter(p => p.author?.type === 2); // Official posts
          } else {
            // Standard layout
            this.heroPost = withImages[0] || null;
            this.topSidePosts = withImages.slice(1, 5);
            this.gridPosts = withImages.slice(5, 8);
            this.moreNewsPosts = withImages.slice(8, 12);
          }

          // 3. وضع البوستات النصية في القسم الجديد بالأسفل
          this.textOnlyPosts = noImages;

          // 4. التريند
          this.trendingPosts = res.data.trending?.map(p => this.parsePostData(p)) || [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // التحقق من وجود صورة
  hasImage(post: CategoryPost): boolean {
    const direct = !!(post.attachments && post.attachments.length > 0);
    const parent = !!(post.parentPost?.attachments && post.parentPost.attachments.length > 0);
    // Safety check for imageUrl property if it exists on the data but not in interface
    const hasUrl = !!((post as any).imageUrl && (post as any).imageUrl.trim() !== '');
    return direct || parent || hasUrl;
  }

  // جلب رابط الصورة
  getImg(post: any): string {
    return this.imageService.resolvePostImage(post);
  }

  private router = inject(Router);

  // ... existing methods ...

  // Navigate to Feed with optional filters
  navigateToFeed(options: { search?: string, filter?: string, tab?: string } = {}) {
    const queryParams: any = {};

    if (options.search) queryParams.search = options.search;
    if (options.filter) queryParams.filter = options.filter;
    if (options.tab) queryParams.tab = options.tab;
    /* 
      We pass the current category as part of the route path, 
      assuming the feed route is structured like /public/feed/:category 
      or we pass it as a query param if the feed structure is different.
      Based on nav-bar, route is /public/feed/:categoryName
    */
    this.router.navigate(['/public/feed', this.activeTheme?.path || 'news'], { queryParams });
  }

  onSearch(event: any) {
    const query = event.target.value;
    if (query && query.length > 2) {
      // Navigate on Enter or if length is sufficient (usually execute on Enter)
      // Since it's a "Search in..." we might want to wait for Enter key in HTML
      // For now, let's assume this is called on Enter
      this.navigateToFeed({ search: query });
    }
  }

  get dynamicDescription(): string {
    return `Discover the latest updates, opportunities, and insights in ${this.activeTheme?.label || 'NYC'}.`;
  }

  getAuthorImg(author: any): string {
    return this.imageService.resolveAvatar(author);
  }

  private parsePostData(post: any): any {
    if (!post.content) return post;

    // Check for JSON in content
    if (post.content.includes('{') && post.content.includes('}')) {
      try {
        const parts = post.content.split('\n\n\n');
        const jsonPart = parts.find((p: string) => p.trim().startsWith('{'));
        if (jsonPart) {
          post.housingMetadata = JSON.parse(jsonPart.trim());
          post.cleanDescription = parts.find((p: string) => !p.trim().startsWith('{')) || '';
        }
      } catch (e) {
        console.error('Failed to parse post metadata', e);
      }
    }
    return post;
  }
}