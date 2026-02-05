import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CategoryPost } from '../models/category-home.models';
import { CategoryHomeService } from '../service/category-home.service';
import { CATEGORY_THEMES } from '../../feeds/models/categories';
import { environment } from '../../../../../environments/environment';
import { ImageService } from '../../../../../shared/services/image.service';
import { ImgFallbackDirective } from '../../../../../shared/directives/img-fallback.directive';
import { CategoryContextService } from '../../../../../shared/services/category-context.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../Authentication/Service/auth';
import { VerificationService } from '../../../pages/settings/services/verification.service';
import { ToastService } from '../../../../../shared/services/toast.service';

export interface HeaderButtonChild {
  label: string;
  link: any[];
  icon?: string;
  isAction?: boolean;
  queryParams?: any;
}

export interface HeaderButton {
  label: string;
  link?: any[];
  icon?: string;
  queryParams?: any;
  isDropdown?: boolean;
  children?: HeaderButtonChild[];
}

@Component({
  selector: 'app-category-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ImgFallbackDirective],
  templateUrl: './category-home.component.html',
  styleUrls: ['./category-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryHomeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private homeService = inject(CategoryHomeService);
  private cdr = inject(ChangeDetectorRef);
  private categoryContext = inject(CategoryContextService);
  protected readonly environment = environment;
  protected imageService = inject(ImageService);
  protected authService = inject(AuthService);
  private verificationService = inject(VerificationService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

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
  activeCategoryId: number = 0;

  // Data Buckets
  structuredPosts: CategoryPost[] = []; // JSON metadata posts
  homesForSale: CategoryPost[] = [];
  homesForRent: CategoryPost[] = [];
  officialPosts: CategoryPost[] = [];

  // --- Dynamic Buttons ---
  headerButtons: HeaderButton[] = [];

  // --- Permissions & Verification ---
  showVerificationModal = false;
  isSubmittingVerification = false;
  verificationForm!: FormGroup;
  selectedDocFile: File | null = null;

  // Default / Generic Occupations
  modalOccupations: any[] = [];

  // Known Housing Occupations (Hardcoded for now)
  private readonly housingOccupations = [
    { id: 1854, name: 'Housing Advisor' },
    { id: 1855, name: 'Housing Organization' },
    { id: 1856, name: 'Licensed Agent' }
  ];

  documentTypes = [
    { id: 1, name: 'Government ID' },
    { id: 2, name: 'Utility Bill' },
    { id: 5, name: 'Professional License' },
    { id: 6, name: 'Employee ID Card' },
    { id: 11, name: 'Contract Agreement' },
    { id: 12, name: 'Letter of Recommendation' },
    { id: 99, name: 'Other' }
  ];

  ngOnInit(): void {
    this.initVerificationForm();
    this.setupAuthSubscription();
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
      this.activeCategoryId = divisionId;
      this.isHousingCategory = (divisionId === 4); // CategoryEnum.Housing

      // Update global context
      this.categoryContext.setCategory(divisionId);

      this.resolveHeaderButtons(divisionId, path);
      this.updateModalOccupations(); // Update occupations based on category
      this.fetchData(divisionId);
    } else {
      this.activeTheme = { label: 'News', color: '#333' }; // Fallback
      this.isHousingCategory = false;
      this.isLoading = false;
      this.resolveHeaderButtons(0, 'news');
      this.updateModalOccupations();
    }
  }

  updateModalOccupations() {
    if (this.isHousingCategory) {
      this.modalOccupations = [...this.housingOccupations];
    } else {
      // Generic Generation for other categories
      const label = this.activeTheme?.label || 'Community';
      this.modalOccupations = [
        { id: 0, name: `${label} Contributor` }, // Placeholder ID
        { id: 0, name: `${label} Organization` },
        { id: 0, name: `${label} Expert` }
      ];
    }

    // Reset selection in form if exists
    if (this.verificationForm) {
      this.verificationForm.patchValue({ occupationId: this.modalOccupations[0]?.id });
    }
  }

  resolveHeaderButtons(divisionId: number, path: string) {
    if (this.activeTheme && this.activeTheme.topLinks && this.activeTheme.topLinks.length > 0) {
      console.log('Category Path:', path);
      this.headerButtons = this.activeTheme.topLinks.map((link: any): HeaderButton => {
        const btn: HeaderButton = {
          label: link.label,
          icon: link.icon,
          isDropdown: link.isDropdown || false
        };

        if (link.isDropdown && link.children) {
          btn.children = link.children.map((child: any): HeaderButtonChild => ({
            label: child.label,
            link: [child.route],
            icon: child.icon,
            isAction: child.isAction || false,
            queryParams: (child.route?.includes('/posts/create') || child.route?.includes('/rss/connect'))
              ? { category: divisionId }
              : (child.queryParams || undefined)
          }));
        } else {
          btn.link = [link.route];
          btn.queryParams = link.route?.includes('/posts/create') ? { category: divisionId } : (link.queryParams || undefined);
        }

        return btn;
      });

      // Add 'Ask a Question' Button at the end
      if (path) {
        this.headerButtons.push({
          label: 'Ask a Question',
          link: ['/public/forums', path],
          icon: 'bi-question-circle'
        });
      }
      return;
    }

    // Default fallbacks
    this.headerButtons = [
      { label: 'Feed', link: ['/public/feed', path], icon: 'bi-rss' },
      { label: 'Ask a Question', link: ['/public/forums', path], icon: 'bi-question-circle' }
    ];
  }

  fetchData(divisionId: number) {
    // نطلب عدد أكبر قليلاً لملء الصفحة
    this.homeService.getCategoryHomeData(divisionId, 25).subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.data) {
          // دمج المصادر لعمل الفرز اليدوي
          const allIncoming = [...(res.data.featured || []), ...(res.data.latest || [])];

          // 1. فصل البوستات: "بصور" vs "بدون صور"
          let allPosts: any[] = allIncoming.map(p => this.parsePostData(p));

          // Separate structured posts (those with JSON metadata)
          this.structuredPosts = allPosts.filter((p: any) => p.housingMetadata);
          const remainingPosts = allPosts.filter((p: any) => !p.housingMetadata);

          const withImages = remainingPosts.filter((p: any) => this.hasImage(p));
          const noImages = remainingPosts.filter((p: any) => !this.hasImage(p));

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
          this.trendingPosts = res.data.trending?.map((p: any) => this.parsePostData(p)) || [];
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

  private setupAuthSubscription() {
    this.authService.fullUserInfo$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  private initVerificationForm() {
    this.verificationForm = this.fb.group({
      occupationId: [1856, Validators.required], // Default to Licensed Agent
      reason: ['', [Validators.required, Validators.minLength(10)]],
      documentType: [1, Validators.required],
      file: [null, Validators.required]
    });
  }

  // Check permission for current category
  hasContributorAccess(): boolean {
    if (!this.activeTheme || !this.activeTheme.path) return false;
    return this.authService.hasCategoryPermission(this.activeTheme.path);
  }

  handleContributorAction(event: Event) {
    if (!this.hasContributorAccess()) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      this.showVerificationModal = true;
      this.cdr.detectChanges(); // Use detectChanges to ensure view updates immediately
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedDocFile = event.target.files[0];
      this.verificationForm.patchValue({ file: this.selectedDocFile });
    }
  }

  submitVerification() {
    if (this.verificationForm.invalid || !this.selectedDocFile) {
      this.verificationForm.markAllAsTouched();
      return;
    }

    this.isSubmittingVerification = true;
    const data = {
      TagId: this.verificationForm.value.occupationId,
      Reason: this.verificationForm.value.reason,
      DocumentType: this.verificationForm.value.documentType,
      File: this.selectedDocFile
    };

    this.verificationService.submitVerification(data).subscribe({
      next: (res: any) => {
        this.isSubmittingVerification = false;
        if (res.isSuccess || res.IsSuccess) {
          this.toastService.success('Verification request submitted successfully!');
          this.showVerificationModal = false;
          this.verificationForm.reset({
            occupationId: 1856,
            documentType: 1
          });
          this.selectedDocFile = null;
        } else {
          const errorMessage = res.error?.message || res.Error?.Message || 'Submission failed';
          this.toastService.error(errorMessage);
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSubmittingVerification = false;
        this.toastService.error('Network error. Please try again.');
        this.cdr.markForCheck();
      }
    });
  }

  closeModal() {
    this.showVerificationModal = false;
    this.cdr.markForCheck();
  }
}