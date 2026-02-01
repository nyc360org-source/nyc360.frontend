import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProfessionFeedData, FeedArticle } from '../../models/profession-feed';
import { ProfessionFeedService } from '../../service/profession-feed';
import { environment } from '../../../../../../environments/environment';
import { ArticleHeroComponent } from '../../../../Widgets/article-hero.component/article-hero.component';
import { ArticleGridCardComponent } from '../../../../Widgets/article-grid-card.component/article-grid-card.component';
import { ImageService } from '../../../../../../shared/services/image.service';
import { ImgFallbackDirective } from '../../../../../../shared/directives/img-fallback.directive';
import { GlobalLoaderService } from '../../../../../../shared/components/global-loader/global-loader.service';

@Component({
  selector: 'app-profession-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, ArticleHeroComponent, ArticleGridCardComponent, ImgFallbackDirective],
  templateUrl: './profession-feed.html',
  styleUrls: ['./profession-feed.scss']
})
export class ProfessionFeedComponent implements OnInit {
  private feedService = inject(ProfessionFeedService);
  private cdr = inject(ChangeDetectorRef);
  private loaderService = inject(GlobalLoaderService);
  protected readonly environment = environment;
  protected imageService = inject(ImageService);

  // Data Buckets
  heroArticle: FeedArticle | null = null;
  visualArticles: FeedArticle[] = []
  textArticles: FeedArticle[] = [];

  // Hiring news kept as is, or distinct
  hiringNews: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadFeed();
  }

  loadFeed() {
    this.isLoading = true;
    this.loaderService.show();
    this.feedService.getFeed().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.hiringNews = res.data.hiringNews || [];

          // Combine all "News" type content
          const allArticles = [];
          if (res.data.heroArticle) allArticles.push(res.data.heroArticle);
          if (res.data.careerArticles) allArticles.push(...res.data.careerArticles);

          // Split based on image availability
          const withImages = allArticles.filter(a => this.hasImage(a));
          const noImages = allArticles.filter(a => !this.hasImage(a));

          // Assign buckets
          this.heroArticle = withImages.length > 0 ? withImages[0] : null;
          this.visualArticles = withImages.length > 1 ? withImages.slice(1) : [];
          this.textArticles = noImages;
        }
        this.isLoading = false;
        this.loaderService.hide();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.loaderService.hide();
        this.cdr.detectChanges();
      }
    });
  }

  hasImage(article: FeedArticle): boolean {
    const direct = !!(article.attachments && article.attachments.length > 0);
    const parent = !!(article.parentPost?.attachments && article.parentPost.attachments.length > 0);
    return direct || parent;
  }

  getArticleImage(article: any): string {
    return this.imageService.resolvePostImage(article);
  }

  getAuthorAvatar(author: any): string {
    return this.imageService.resolveAvatar(author);
  }

  // Label Helpers
  getWorkArrangement(val: number): string {
    const map: any = { 0: 'On-Site', 1: 'Remote', 2: 'Hybrid' };
    return map[val] || 'On-Site';
  }

  getEmploymentType(val: number): string {
    const map: any = { 0: 'Full-Time', 1: 'Part-Time', 2: 'Contract', 3: 'Internship', 4: 'Freelance' };
    return map[val] || 'Full-Time';
  }

  getLevel(val: number): string {
    const map: any = { 1: 'Junior', 2: 'Mid', 3: 'Mid-Senior', 4: 'Senior' };
    return map[val] || 'Mid-Level';
  }

  formatSalary(min: number | undefined, max: number | undefined): string {
    if (min != null && max != null) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min != null) return `$${min.toLocaleString()}+`;
    if (max != null) return `Up to $${max.toLocaleString()}`;
    return 'Salary Undisclosed';
  }
}