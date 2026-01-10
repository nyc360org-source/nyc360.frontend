import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostsService } from '../services/posts';
import { Post } from '../models/posts';
import { environment } from '../../../../../environments/environment';
import { CATEGORY_LIST } from '../../../../../pages/models/category-list';

@Component({
  selector: 'app-tag-posts',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tag-posts.html',
  styleUrls: ['./tag-posts.scss']
})
export class TagPostsComponent implements OnInit {
  
  protected readonly environment = environment;
  private route = inject(ActivatedRoute);
  private postsService = inject(PostsService);
  private cdr = inject(ChangeDetectorRef);

  posts: Post[] = [];
  
  // هذه المصفوفة ستحمل التاجات المستخرجة من البوستات
  relatedTags: string[] = []; 
  
  tagName: string = '';
  isLoaded = false; 
  totalCount = 0;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const rawTag = params.get('tag');
      if (rawTag) {
        this.tagName = rawTag;
        this.loadTagPosts(this.tagName);
      }
    });
  }

  loadTagPosts(tag: string) {
    this.isLoaded = false; 
    this.posts = []; 
    this.relatedTags = []; // تصفية التاجات القديمة

    // طلب 10 بوستات فقط للسرعة
    this.postsService.getPostsByTag(tag, 1, 10).subscribe({
      next: (res) => {
        this.isLoaded = true;

        if (res.isSuccess) {
          if (Array.isArray(res.data)) {
            this.posts = res.data;
            this.totalCount = res.totalCount ?? this.posts.length;
            
            // 🔥 استخراج التاجات من البوستات (Extraction Logic)
            this.extractRelatedTags(this.posts);
          } else {
            this.posts = [];
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoaded = true;
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  // دالة لاستخراج وتجميع التاجات من البوستات
  extractRelatedTags(posts: Post[]) {
    const allTags = new Set<string>();
    
    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(t => allTags.add(t));
      }
    });

    // تحويل الـ Set لمصفوفة وأخذ أول 15 تاج مثلاً
    // ونستبعد التاج الحالي الذي نبحث عنه لعدم التكرار
    this.relatedTags = Array.from(allTags)
      .filter(t => t.toLowerCase() !== this.tagName.toLowerCase())
      .slice(0, 20);
  }

  // --- Helpers ---
  get displayTagName(): string {
    if (!this.tagName) return '';
    return this.tagName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getCategoryName(id: number): string {
    const cat = CATEGORY_LIST.find(c => c.id === id);
    return cat ? cat.name : 'General';
  }

  getAuthorName(author: any): string {
    if (!author) return 'NYC360';
    if (typeof author === 'string') return author;
    return author.name || author.username || 'NYC360';
  }

  resolvePostImage(post: Post): string {
    const attachment = post.attachments?.[0];
    const url = attachment?.url || post.imageUrl;
    
    if (!url) return 'assets/images/default-placeholder.jpg';
    if (url.includes('@local://')) return `${this.environment.apiBaseUrl3}/${url.replace('@local://', '')}`;
    return url.startsWith('http') ? url : `${this.environment.apiBaseUrl3}/${url}`;
  }
}