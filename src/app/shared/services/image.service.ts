import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ImageService {

    private readonly apiBaseUrl2 = environment.apiBaseUrl2;
    private readonly apiBaseUrl3 = environment.apiBaseUrl3;

    // Global Default Assets
    readonly DEFAULT_POST = 'assets/images/default-post.jpg';
    readonly DEFAULT_AVATAR = 'assets/images/default-avatar.png';
    readonly PLACEHOLDER = 'assets/images/placeholder.jpg';

    constructor() { }

    /**
     * Resolves a post image URL with fallback to default
     */
    resolvePostImage(post: any): string {
        if (!post) return this.DEFAULT_POST;

        let attachment = post.attachments?.[0];
        let url = attachment?.url || post.imageUrl;

        // 1. If no direct image, check parent (Shared Post)
        if ((!url || url.trim() === '') && post.parentPost) {
            attachment = post.parentPost.attachments?.[0];
            url = attachment?.url || post.parentPost.imageUrl;
        }

        // 2. If still no image, return global default
        if (!url || url.trim() === '') return this.DEFAULT_POST;

        return this.cleanAndResolve(url, this.DEFAULT_POST);
    }

    /**
     * Checks if a post has any image (direct or inherited)
     */
    hasImage(post: any): boolean {
        if (!post) return false;
        const direct = !!(post.attachments?.[0]?.url || post.imageUrl);
        if (direct) return true;
        if (post.parentPost) return this.hasImage(post.parentPost);
        return false;
    }

    /**
     * Resolves an author/avatar image URL with fallback
     */
    resolveAvatar(author: any): string {
        if (!author) return this.DEFAULT_AVATAR;

        let url = typeof author === 'string' ? author : author.imageUrl || author.avatarUrl;

        if (!url || url.trim() === '') return this.DEFAULT_AVATAR;

        return this.cleanAndResolveAvatar(url, this.DEFAULT_AVATAR);
    }

    /**
     * Resolves a simple image URL
     */
    resolveImageUrl(url: string | null | undefined, type: 'post' | 'avatar' = 'post'): string {
        const fallback = type === 'post' ? this.DEFAULT_POST : this.DEFAULT_AVATAR;
        if (!url || url.trim() === '') return fallback;

        return type === 'post' ? this.cleanAndResolve(url, fallback) : this.cleanAndResolveAvatar(url, fallback);
    }

    private cleanAndResolve(url: string, fallback: string): string {
        if (!url) return fallback;

        let cleanUrl = url.replace('@local://', '');

        // 1. If absolute or data URL, return as is
        if (cleanUrl.startsWith('http') || cleanUrl.startsWith('https') || cleanUrl.startsWith('data:')) {
            return cleanUrl;
        }

        // 2. If it already starts with 'posts/', resolve to secondary base (root)
        if (cleanUrl.toLowerCase().startsWith('posts/')) {
            return `${this.apiBaseUrl2}/${cleanUrl}`;
        }

        // 3. Otherwise, treat as a filename in the 'posts' folder
        // Use apiBaseUrl3 if it points to /posts, or prepend posts/ to apiBaseUrl2
        if (this.apiBaseUrl3.endsWith('/posts')) {
            return `${this.apiBaseUrl3}/${cleanUrl}`;
        }

        return `${this.apiBaseUrl2}/posts/${cleanUrl}`;
    }

    private cleanAndResolveAvatar(url: string, fallback: string): string {
        if (!url) return fallback;

        let cleanUrl = url.replace('@local://', '');

        if (cleanUrl.startsWith('http') || cleanUrl.startsWith('https') || cleanUrl.startsWith('data:')) {
            return cleanUrl;
        }

        // Usually avatars are in /avatars/
        if (cleanUrl.includes('/') || cleanUrl.includes('\\')) {
            // If it already has a path, assume it's relative to root
            return `${this.apiBaseUrl2}/${cleanUrl}`;
        }

        return `${this.apiBaseUrl2}/avatars/${cleanUrl}`;
    }
}
