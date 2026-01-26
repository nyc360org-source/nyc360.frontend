import { Component, Input, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Post, InteractionType } from '../../../posts/models/posts';
import { PostsService } from '../../../posts/services/posts';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { environment } from '../../../../../../environments/environment';

@Component({
    selector: 'app-profile-post',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile-post.component.html',
    styleUrls: ['./profile-post.component.scss']
})
export class ProfilePostComponent {
    @Input() post!: any;
    @Input() isOwner: boolean = false;
    @Input() currentUserId: string | null = null;
    @Input() displayName: string = '';
    @Input() authorImageUrl: string | null | undefined = '';

    protected readonly InteractionType = InteractionType;
    protected readonly environment = environment;

    private postsService = inject(PostsService);
    private router = inject(Router);
    private toastService = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);

    // Sharing state
    showShareModal = false;
    shareCommentary = '';
    isSharing = false;

    toggleInteraction(post: any, type: InteractionType, event?: Event) {
        if (event) event.stopPropagation();
        if (!this.currentUserId) {
            this.toastService.warning('Please login to interact with posts.');
            return;
        }

        const oldInteraction = post.userInteraction;

        if (post.userInteraction === type) {
            post.userInteraction = null;
            if (post.stats) {
                if (type === InteractionType.Like) post.stats.likes--;
                else post.stats.dislikes--;
            }
        } else {
            if (post.stats) {
                if (post.userInteraction === InteractionType.Like) post.stats.likes--;
                if (post.userInteraction === InteractionType.Dislike) post.stats.dislikes--;
                if (type === InteractionType.Like) post.stats.likes++;
                else post.stats.dislikes++;
            }
            post.userInteraction = type;
        }

        this.postsService.interact(post.id, type).subscribe({
            error: () => {
                post.userInteraction = oldInteraction;
                this.cdr.detectChanges();
            }
        });

        this.cdr.detectChanges();
    }

    toggleComments(post: any, event?: Event) {
        if (event) event.stopPropagation();
        post.showComments = !post.showComments;
        if (post.showComments && (!post.comments || post.comments.length === 0)) {
            this.loadCommentsForPost(post);
        }
    }

    loadCommentsForPost(post: any) {
        this.postsService.getPostById(post.id).subscribe((res: any) => {
            if (res.isSuccess && res.data) {
                const fullData = res.data.post || res.data;
                post.comments = fullData.comments || res.data.comments || [];
                this.cdr.detectChanges();
            }
        });
    }

    submitComment(post: any, event?: Event) {
        if (event) event.stopPropagation();
        if (!post.newCommentContent?.trim() || !this.currentUserId) return;

        this.postsService.addComment(post.id, post.newCommentContent).subscribe({
            next: (res: any) => {
                if (res.isSuccess) {
                    if (!post.comments) post.comments = [];
                    post.comments.unshift(res.data);
                    if (post.stats) post.stats.comments++;
                    post.newCommentContent = '';
                    this.cdr.detectChanges();
                }
            }
        });
    }

    viewPostDetails(postId: any, event?: Event) {
        if (event) event.stopPropagation();

        // ✅ Redirection Logic: If this is a Job Post, go to Job Profile
        if (this.post?.category === 8 && this.post?.linkedResource) {
            this.router.navigate(['/public/job-profile', this.post.linkedResource.id]);
            return;
        }

        this.router.navigate(['/public/posts/details', postId]);
    }

    openShareModal(event?: Event) {
        if (event) event.stopPropagation();
        if (!this.currentUserId) {
            this.toastService.warning('Please login to share posts.');
            return;
        }
        this.showShareModal = true;
        this.shareCommentary = '';
    }

    closeShareModal() {
        this.showShareModal = false;
        this.shareCommentary = '';
        this.isSharing = false;
    }

    submitShare() {
        if (!this.post || !this.post.id) return;
        this.isSharing = true;

        this.postsService.sharePost(this.post.id, this.shareCommentary).subscribe({
            next: (res: any) => {
                this.isSharing = false;
                if (res.isSuccess) {
                    if (this.post.stats) this.post.stats.shares++;
                    this.toastService.success('Post shared successfully!');
                    this.closeShareModal();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to share post.');
                }
                this.cdr.detectChanges();
            },
            error: () => {
                this.isSharing = false;
                this.toastService.error('Network error while sharing.');
                this.cdr.detectChanges();
            }
        });
    }

    resolveImageUrl(url: string | undefined | null): string {
        if (!url || url.trim() === '') return 'assets/images/default-post.jpg';
        let cleanUrl = url.replace('@local://', '');
        if (cleanUrl.startsWith('http') || cleanUrl.startsWith('https') || cleanUrl.startsWith('data:')) return cleanUrl;
        if (cleanUrl.startsWith('posts/')) return `${environment.apiBaseUrl2}/${cleanUrl}`;
        return `${environment.apiBaseUrl3}/${cleanUrl}`;
    }

    getAuthorImage(author: any): string {
        if (author && author.imageUrl) {
            if (author.imageUrl.includes('http')) return author.imageUrl;
            return `${environment.apiBaseUrl2}/avatars/${author.imageUrl}`;
        }
        return 'assets/images/default-avatar.png';
    }

    getAuthorName(author: any): string {
        return author?.name || author?.username || 'User';
    }

    resolveImage(url: string | null | undefined): string {
        if (!url) return 'assets/images/default-avatar.png';
        if (url.includes('http') || url.startsWith('data:')) return url;
        return `${environment.apiBaseUrl2}/avatars/${url}`;
    }
}
