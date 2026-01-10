import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID, makeStateKey, TransferState } from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { InteractionType, Post, PostAuthor, PostComment } from '../models/posts';
import { PostsService } from '../services/posts';
import { AuthService } from '../../../../Authentication/Service/auth';
import { CATEGORY_LIST } from '../../../../models/category-list';

interface RelatedPost {
  id: number;
  title: string;
  imageUrl: string;
  commentsCount: number;
}

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './post-details.html',
  styleUrls: ['./post-details.scss']
})
export class PostDetailsComponent implements OnInit {
   
  protected readonly environment = environment;
  protected readonly InteractionType = InteractionType;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postsService = inject(PostsService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  // ✅ SSR Optimization Injections
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);

  post: Post | null = null;
  // ✅ جعلنا التحميل false افتراضياً لتجنب الوميض إذا كانت البيانات جاهزة
  isLoading = true; 
  errorMessage = '';
   
  categories = CATEGORY_LIST;
  currentUserId: string | null = null;
  isAdmin = false;
   
  relatedPosts: RelatedPost[] = [];

  newCommentContent = '';
  replyInputs: { [key: number]: string } = {};
  activeReplyId: number | null = null;
   
  showMenu = false;
  showReportModal = false;
  reportReason = '';
  isReporting = false;

  showShareModal = false;
  shareComment = '';
  isSharing = false;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.id) {
        this.currentUserId = user.id;
        this.isAdmin = Array.isArray(user.roles) ? user.roles.includes('Admin') : user.roles === 'Admin';
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.post = null; 
        this.loadPost(+id);
      }
    });
  }

  loadPost(id: number) {
    // ✅ 1. إنشاء مفتاح فريد لتخزين البيانات
    const POST_KEY = makeStateKey<any>('post_data_' + id);

    // ✅ 2. فحص هل البيانات موجودة بالفعل (من السيرفر)؟
    if (this.transferState.hasKey(POST_KEY)) {
      // لو موجودة، خدها فوراً والغي التحميل
      const savedData = this.transferState.get(POST_KEY, null);
      this.transferState.remove(POST_KEY); // تنظيف الذاكرة
      this.handlePostData(savedData);
      this.isLoading = false; // لا يوجد تحميل
    } else {
      // لو مش موجودة (Client Side Navigation)، اطلبها من الـ API
      this.isLoading = true;
      this.postsService.getPostById(id).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.isSuccess && res.data) {
            // ✅ 3. لو شغالين ع السيرفر، احفظ البيانات عشان المتصفح يلاقيها
            if (isPlatformServer(this.platformId)) {
              this.transferState.set(POST_KEY, res.data);
            }
            this.handlePostData(res.data);
          } else {
            this.errorMessage = res.error?.message || 'Post not found.';
          }
          this.cdr.detectChanges();
        },
        error: () => { 
          this.isLoading = false; 
          this.errorMessage = 'Network error.'; 
          this.cdr.detectChanges();
        }
      });
    }
  }

  // ✅ فصلنا منطق معالجة البيانات عشان نستخدمه في الحالتين
  handlePostData(apiData: any) {
    // 1. Handle Main Post
    if (apiData.post) {
       this.post = this.normalizePostData(apiData.post);
    } else {
       this.post = this.normalizePostData(apiData);
    }

    // 2. Handle Comments
    if (apiData.comments) {
      this.post!.comments = apiData.comments;
      if (this.post?.stats) this.post.stats.comments = apiData.comments.length;
    }

    // 3. Handle Related Posts
    if (apiData.relatedPosts) {
      this.relatedPosts = apiData.relatedPosts;
    } else {
      this.relatedPosts = [];
    }
  }

  normalizePostData(post: Post): Post {
    if (!post.stats) post.stats = { views: 0, likes: 0, dislikes: 0, comments: 0, shares: 0 };
    if (post.currentUserInteraction !== undefined) post.userInteraction = post.currentUserInteraction;
    if (post.isSavedByUser !== undefined) post.isSaved = post.isSavedByUser;
    else post.isSaved = false;
    return post;
  }

  // --- Share Logic ---
  openShareModal() {
    if (!this.currentUserId) {
        alert('Please login to share posts.');
        return;
    }
    this.showShareModal = true;
    this.shareComment = '';
  }

  closeShareModal() {
    this.showShareModal = false;
    this.shareComment = '';
    this.isSharing = false;
  }

  submitShare() {
    if (!this.post) return;
    this.isSharing = true;
    this.postsService.sharePost(this.post.id, this.shareComment).subscribe({
      next: (res) => {
        this.isSharing = false;
        if (res.isSuccess) {
          if (this.post?.stats) this.post.stats.shares++;
          alert('Post shared successfully on your feed!');
          this.closeShareModal();
        } else {
          alert(res.error?.message || 'Failed to share post.');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSharing = false;
        alert('Network error while sharing.');
        this.cdr.detectChanges();
      }
    });
  }

  // --- Save Logic ---
  toggleSave() {
    if (!this.post) return;
    if (!this.currentUserId) { alert('Please login to save posts.'); return; }
    const oldState = this.post.isSaved;
    this.post.isSaved = !this.post.isSaved;
    this.postsService.savePost(this.post.id).subscribe({
        next: (res) => { if (!res.isSuccess) this.post!.isSaved = oldState; },
        error: () => { this.post!.isSaved = oldState; }
    });
  }

  // --- Helpers ---
  toggleMenu() { this.showMenu = !this.showMenu; }
  
  openReportModal() { 
    if (!this.currentUserId) {
      alert('Please login to report posts.');
      return;
    }
    this.showMenu = false; 
    this.showReportModal = true; 
  }

  closeReportModal() { 
    this.showReportModal = false; 
    this.reportReason = ''; 
    this.isReporting = false;
  }
   
  submitReport() {
    if (!this.reportReason.trim() || !this.post) return;
    this.isReporting = true;

    this.postsService.reportPost(this.post.id, this.reportReason).subscribe({
      next: (res) => {
        this.isReporting = false;
        if (res.isSuccess) {
          alert('Report submitted successfully! Thank you for your feedback.');
          this.closeReportModal();
        } else {
          alert(res.error?.message || 'Failed to submit report.');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isReporting = false;
        alert('Network error while reporting.');
        this.cdr.detectChanges();
      }
    });
  }

  getAuthorName(author: PostAuthor | string | undefined): string {
    if (!author) return 'NYC360 User';
    if (typeof author === 'string') return 'User';
    return author.name || author.fullName || author.username || 'User';
  }

  getAuthorAvatar(author: PostAuthor | string | undefined): string {
    if (typeof author === 'object' && author?.imageUrl) return this.resolveImageUrl(author.imageUrl);
    return 'assets/images/default-avatar.png';
  }

  resolveImageUrl(url: string | undefined | null): string {
    if (!url) return 'assets/images/placeholder.jpg'; 
    if (url.includes('@local://')) return `${this.environment.apiBaseUrl3}/${url.replace('@local://', '')}`;
    if (!url.startsWith('http') && !url.startsWith('data:')) return `${this.environment.apiBaseUrl}/${url}`;
    return url;
  }

  getCategoryName(id: number): string {
    // Handle category name resolution safely
    if (id === undefined || id === null) return 'General';
    return this.categories.find(c => c.id === id)?.name || 'General';
  }

  // --- Comment Logic ---
  submitComment() {
    if (!this.newCommentContent.trim() || !this.post || !this.currentUserId) return;
    this.postsService.addComment(this.post.id, this.newCommentContent).subscribe({
      next: (res) => {
        if (res.isSuccess && this.post?.comments) {
          this.post.comments.unshift(res.data as any); 
          if(this.post.stats) this.post.stats.comments++;
          this.newCommentContent = '';
          this.cdr.detectChanges();
        }
      }
    });
  }

  openReplyInput(commentId: number) { this.activeReplyId = this.activeReplyId === commentId ? null : commentId; }

  submitReply(parentComment: PostComment, content: string) {
    if (!content.trim() || !this.post || !this.currentUserId) return;
    this.postsService.addComment(this.post.id, content, parentComment.id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          if (!parentComment.replies) parentComment.replies = [];
          parentComment.replies.push(res.data as any);
          if (this.post?.stats) this.post.stats.comments++;
          this.replyInputs[parentComment.id] = ''; 
          this.activeReplyId = null;
          this.cdr.detectChanges();
        }
      }
    });
  }

  toggleInteraction(type: InteractionType) {
    if (!this.post || !this.currentUserId) return;
    const oldInteraction = this.post.userInteraction;
    if (this.post.userInteraction === type) {
      this.post.userInteraction = null;
      if (this.post.stats) type === InteractionType.Like ? this.post.stats.likes-- : this.post.stats.dislikes--;
    } else {
      if (this.post.stats) {
        if (this.post.userInteraction === InteractionType.Like) this.post.stats.likes--;
        if (this.post.userInteraction === InteractionType.Dislike) this.post.stats.dislikes--;
        type === InteractionType.Like ? this.post.stats.likes++ : this.post.stats.dislikes++;
      }
      this.post.userInteraction = type;
    }
    this.postsService.interact(this.post.id, type).subscribe({
      error: () => { if (this.post) this.post.userInteraction = oldInteraction; }
    });
  }

  get canEdit(): boolean {
    if (!this.post?.author || !this.currentUserId) return false;
    let authorId: any;
    if (typeof this.post.author === 'object') authorId = this.post.author.id;
    else authorId = this.post.author;
    return String(authorId) === String(this.currentUserId) || this.isAdmin;
  }

  onDelete() {
    if (this.post && confirm('Delete?')) {
      this.postsService.deletePost(this.post.id).subscribe({
        next: () => this.router.navigate(['/admin/posts'])
      });
    }
  }
}