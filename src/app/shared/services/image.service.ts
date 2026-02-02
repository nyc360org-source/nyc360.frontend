import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ImageService {

    private readonly apiBaseUrl2 = environment.apiBaseUrl2;
    private readonly apiBaseUrl3 = environment.apiBaseUrl3;

    // Global Default Assets
    // Global Default Assets
    readonly DEFAULT_POST = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80'; // Abstract Gradient
    readonly DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80'; // Generic User
    readonly DEFAULT_HOUSING = 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=800&q=80'; // NYC Architecture
    readonly PLACEHOLDER = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80';

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
    resolveImageUrl(url: string | null | undefined, type: 'post' | 'avatar' | 'housing' = 'post'): string {
        const fallback = type === 'avatar' ? this.DEFAULT_AVATAR :
            type === 'housing' ? this.DEFAULT_HOUSING :
                this.DEFAULT_POST;

        if (!url || url.trim() === '') {
            console.warn('[ImageService] No URL provided, using fallback:', fallback);
            return fallback;
        }

        if (type === 'avatar') {
            return this.cleanAndResolveAvatar(url, fallback);
        }

        return this.cleanAndResolve(url, fallback, type);
    }

    private cleanAndResolve(url: string, fallback: string, context: 'post' | 'housing' = 'post'): string {
        if (!url) return fallback;

        let cleanUrl = url.replace('@local://', '').trim();

        // Remove any leading/trailing slashes
        cleanUrl = cleanUrl.replace(/^\/+|\/+$/g, '');

        // 1. If absolute or data URL, return as is
        if (cleanUrl.startsWith('http') || cleanUrl.startsWith('https') || cleanUrl.startsWith('data:')) {
            console.log('[ImageService] Using absolute URL:', cleanUrl);
            return cleanUrl;
        }

        const lowerUrl = cleanUrl.toLowerCase();

        // 2. If it already has a known folder prefix, resolve to base URL
        if (lowerUrl.startsWith('posts/') || lowerUrl.startsWith('housing/') || lowerUrl.startsWith('avatars/')) {
            const finalUrl = `${this.apiBaseUrl2}/${cleanUrl}`;
            console.log('[ImageService] Resolved with folder prefix:', { originalUrl: url, finalUrl });
            return finalUrl;
        }

        // 3. For housing context, try multiple common patterns
        if (context === 'housing') {
            // Common patterns: "filename.jpg", "housing/filename.jpg", "uploads/housing/filename.jpg"
            const possiblePaths = [
                `${this.apiBaseUrl2}/housing/${cleanUrl}`,
                `${this.apiBaseUrl2}/uploads/housing/${cleanUrl}`,
                `${this.apiBaseUrl2}/${cleanUrl}`,
            ];

            // For now, use the first one (can be enhanced with retry logic)
            const finalUrl = possiblePaths[0];
            console.log('[ImageService] Resolved housing context:', {
                originalUrl: url,
                finalUrl,
                note: 'If this fails, image will fallback to placeholder'
            });
            return finalUrl;
        }

        // 4. Default to posts folder
        const finalUrl = `${this.apiBaseUrl2}/posts/${cleanUrl}`;
        console.log('[ImageService] Resolved default posts:', { originalUrl: url, finalUrl });
        return finalUrl;
    }

    private cleanAndResolveAvatar(url: string, fallback: string): string {
        if (!url) return fallback;

        let cleanUrl = url.replace('@local://', '');

        if (cleanUrl.startsWith('http') || cleanUrl.startsWith('https') || cleanUrl.startsWith('data:')) {
            return cleanUrl;
        }

        // Usually avatars are in /avatars/
        if (cleanUrl.toLowerCase().startsWith('avatars/')) {
            return `${this.apiBaseUrl2}/${cleanUrl}`;
        }

        if (cleanUrl.includes('/') || cleanUrl.includes('\\')) {
            return `${this.apiBaseUrl2}/${cleanUrl}`;
        }

        return `${this.apiBaseUrl2}/avatars/${cleanUrl}`;
    }
}
