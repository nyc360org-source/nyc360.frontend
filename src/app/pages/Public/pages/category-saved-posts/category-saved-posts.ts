import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostsService } from '../posts/services/posts';
import { CATEGORY_THEMES } from '../../Widgets/feeds/models/categories';
import { ApiResponse, Post } from '../posts/models/posts';
import { ImageService } from '../../../../shared/services/image.service';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';

@Component({
    selector: 'app-category-saved-posts',
    standalone: true,
    imports: [CommonModule, RouterModule, BreadcrumbsComponent],
    templateUrl: './category-saved-posts.html',
    styleUrls: ['./category-saved-posts.scss']
})
export class CategorySavedPostsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private postsService = inject(PostsService);
    private cdr = inject(ChangeDetectorRef);
    protected imageService = inject(ImageService);

    categoryTheme: any = null;
    activeCategoryId: number = -1;
    posts: Post[] = [];
    isLoading = true;

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
            this.activeCategoryId = Number(categoryEntry[0]);
            this.categoryTheme = categoryEntry[1];
            this.loadSavedPosts();
        } else {
            this.categoryTheme = { label: 'General', color: '#0A3D91' };
            this.loadSavedPosts();
        }
    }

    loadSavedPosts() {
        this.isLoading = true;
        this.postsService.getSavedPosts(this.activeCategoryId === -1 ? undefined : this.activeCategoryId).subscribe({
            next: (res: ApiResponse<Post[]>) => {
                if (res.isSuccess) {
                    this.posts = res.data;
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

    get fallbackColor(): string {
        return this.categoryTheme?.color || '#000000';
    }
}
