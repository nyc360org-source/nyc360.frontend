import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { Post, PostCategoryList, InteractionType, Comment, FlagReasonType } from '../models/posts';
import { PostsService } from '../services/posts';
import { AuthService } from '../../../../Authentication/Service/auth';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './post-list.html',
  styleUrls: ['./post-list.scss']
})
export class PostListComponent implements OnInit {
  
  protected readonly environment = environment;
  protected readonly InteractionType = InteractionType;
  
  private postsService = inject(PostsService);
  private authService = inject(AuthService); 
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // --- Data ---
  posts: Post[] = [];
  categories = PostCategoryList;
  isLoading = true;
  errorMessage = '';
  selectedCategoryId: number | null = null;
  currentUserId: string | null = null;
  currentUserData: any = null;
  isAdmin = false;

  // --- UI State Maps ---
  commentInputs: { [postId: number]: string } = {}; 
  replyInputs: { [commentId: number]: string } = {}; 
  showComments: { [postId: number]: boolean } = {}; 
  commentLimits: { [postId: number]: number } = {}; 
  activeReplyId: number | null = null;
  openMenuId: number | null = null; // For Dropdown

  // --- Report Modal State ---
  isReportModalOpen = false;
  reportPostId: number | null = null;
  reportReason: number | null = null;
  reportDetails: string = '';
  isReporting = false;

  // Report Reasons List for Select Box
  reportReasonsList = [
    { id: FlagReasonType.Spam, label: 'Spam' },
    { id: FlagReasonType.HateSpeech, label: 'Hate Speech' },
    { id: FlagReasonType.Harassment, label: 'Harassment' },
    { id: FlagReasonType.InappropriateContent, label: 'Inappropriate Content' },
    { id: FlagReasonType.ScamOrFraud, label: 'Scam or Fraud' },
    { id: FlagReasonType.ViolationOfPolicy, label: 'Violation of Policy' },
    { id: FlagReasonType.Other, label: 'Other' }
  ];

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id || user.userId;
        this.currentUserData = user;
        this.isAdmin = Array.isArray(user.roles) ? user.roles.includes('Admin') : user.roles === 'Admin';
      }
    });

    this.route.queryParams.subscribe(params => {
      const catId = params['category'];
      this.selectedCategoryId = catId ? Number(catId) : null;
      this.loadPosts();
    });
  }

  loadPosts() {
    this.isLoading = true;
    this.errorMessage = '';
    const categoryParam = this.selectedCategoryId !== null ? this.selectedCategoryId : undefined;

    this.postsService.getAllPosts(categoryParam).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.isSuccess && Array.isArray(res.data)) {
           this.posts = res.data.map(p => {
             this.commentLimits[p.id] = 3; 
             return {
               ...p,
               stats: p.stats || { likes: 0, comments: 0, views: 0, dislikes: 0, shares: 0 },
               comments: p.comments || []
             };
           });
        } else {
           this.posts = [];
        }
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.errorMessage = 'Could not load feed.'; this.cdr.detectChanges(); }
    });
  }

  // --- Interaction Logic ---
  toggleLike(post: Post) {
    if (!this.currentUserId) return alert('Please login.');
    if (!post.stats) post.stats = { likes: 0, comments: 0, views: 0, dislikes: 0, shares: 0 };

    const isLiked = post.currentUserInteraction === InteractionType.Like;
    const previousState = post.currentUserInteraction;

    if (isLiked) {
      post.currentUserInteraction = 0; post.stats.likes--;
    } else {
      post.currentUserInteraction = InteractionType.Like; post.stats.likes++;
      if (previousState === InteractionType.Dislike) post.stats.dislikes--;
    }

    this.postsService.interact(post.id, InteractionType.Like).subscribe({
      error: () => {
        post.currentUserInteraction = previousState;
        if (isLiked) post.stats!.likes++; else post.stats!.likes--;
      }
    });
  }

  toggleComments(postId: number) {
    this.showComments[postId] = !this.showComments[postId];
  }

  toggleCommentLimit(post: Post) {
    const total = post.comments?.length || 0;
    const current = this.commentLimits[post.id];
    this.commentLimits[post.id] = (current < total) ? total : 3;
  }

  submitComment(post: Post) {
    const content = this.commentInputs[post.id];
    if (!content?.trim()) return;
    if (!this.currentUserId) return alert('Please login.');

    if (!post.comments) post.comments = [];
    if (!post.stats) post.stats = { likes: 0, comments: 0, views: 0, dislikes: 0, shares: 0 };

    // Optimistic UI
    const tempComment: any = {
      id: -Date.now(), content: content,
      author: { fullName: this.currentUserData?.fullName || 'Me', imageUrl: this.currentUserData?.imageUrl },
      createdAt: new Date().toISOString(), replies: []
    };

    post.comments.unshift(tempComment); 
    post.stats.comments++;
    this.commentInputs[post.id] = ''; 
    this.showComments[post.id] = true; 
    this.commentLimits[post.id] = (this.commentLimits[post.id] || 3) + 1;

    this.postsService.addComment(post.id, content).subscribe({
      next: (res) => { if (res.isSuccess) { post.comments!.shift(); post.comments!.unshift(res.data as any); } },
      error: () => { post.comments!.shift(); post.stats!.comments--; this.commentInputs[post.id] = content; }
    });
  }

  openReplyInput(commentId: number) {
    this.activeReplyId = this.activeReplyId === commentId ? null : commentId;
  }

  submitReply(post: Post, parentComment: Comment) {
    const content = this.replyInputs[parentComment.id];
    if (!content?.trim()) return;
    if (!this.currentUserId) return alert('Please login.');

    if (!parentComment.replies) parentComment.replies = [];

    const tempReply: any = {
      id: -Date.now(), content: content,
      author: { fullName: this.currentUserData?.fullName || 'Me', imageUrl: this.currentUserData?.imageUrl },
      createdAt: new Date().toISOString()
    };

    parentComment.replies.push(tempReply);
    this.replyInputs[parentComment.id] = '';
    this.activeReplyId = null;
    if(post.stats) post.stats.comments++;

    this.postsService.addComment(post.id, content, parentComment.id).subscribe({
      next: (res) => { if (res.isSuccess) { parentComment.replies!.pop(); parentComment.replies!.push(res.data as any); } },
      error: () => { parentComment.replies!.pop(); if(post.stats) post.stats.comments--; }
    });
  }

  // --- Menu & Report Logic ---
  toggleMenu(postId: number, event: Event) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === postId ? null : postId;
  }

  openReportModal(post: Post) {
    this.reportPostId = post.id;
    this.reportReason = null;
    this.reportDetails = '';
    this.isReportModalOpen = true;
    this.openMenuId = null;
  }

  closeReportModal() { this.isReportModalOpen = false; this.reportPostId = null; }

  submitReport() {
    if (!this.reportPostId || !this.reportReason) return;
    this.isReporting = true;
    this.postsService.reportPost(this.reportPostId, this.reportReason, this.reportDetails).subscribe({
      next: (res) => {
        this.isReporting = false;
        if (res.isSuccess) { alert('Report submitted successfully.'); this.closeReportModal(); }
        else { alert(res.error?.message || 'Failed to submit.'); }
      },
      error: () => { this.isReporting = false; alert('Network error.'); }
    });
  }

  // --- Helpers ---
  resolveImageUrl(url: string | undefined | null): string {
    if (!url) return '';
    if (url.includes('@local://')) return `${this.environment.apiBaseUrl3}/${url.replace('@local://', '')}`;
    if (!url.startsWith('http') && !url.startsWith('data:')) return `${this.environment.apiBaseUrl}/${url}`;
    return url;
  }

  getAvatar(author: any): string {
    const url = author?.imageUrl;
    return this.resolveImageUrl(url) || 'assets/images/default-avatar.png';
  }

  getMainImage(post: Post): string | null {
    if (post.attachments?.length > 0) return this.resolveImageUrl(post.attachments[0].url);
    if (post.imageUrl) return this.resolveImageUrl(post.imageUrl);
    return null;
  }

  filterByCategory(id: number | null) {
    this.selectedCategoryId = id;
    this.router.navigate([], { relativeTo: this.route, queryParams: { category: id } });
  }

  getCategoryName(id: number): string { return this.categories.find(c => c.id === id)?.name || 'General'; }

  // Check Permissions
  isOwnerOrAdmin(post: Post): boolean {
    if (this.isAdmin) return true;
    if (!this.currentUserId || !post.author) return false;
    const authorId = (typeof post.author === 'object') ? (post.author as any).id : post.author;
    return String(authorId) === String(this.currentUserId);
  }

  onDelete(id: number) {
    if (confirm('Delete post?')) {
      this.postsService.deletePost(id).subscribe({ next: () => this.posts = this.posts.filter(p => p.id !== id) });
    }
  }
}