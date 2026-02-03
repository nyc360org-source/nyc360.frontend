import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { CommunityPostService } from '../../services/community-post';
import { CreateCommunityService } from '../../services/createcommunty'; // Use this for tag search
import { Tag } from '../../models/createcommunty';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { CategoryContextService } from '../../../../../../shared/services/category-context.service';

@Component({
  selector: 'app-create-community-post',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-community-post.html',
  styleUrls: ['./create-community-post.scss']
})
export class CreateCommunityPostComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private locationService = inject(Location);
  private postService = inject(CommunityPostService);
  private communityService = inject(CreateCommunityService); // For searching tags
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);
  private categoryContext = inject(CategoryContextService);

  // Data
  communityId: number = 0;
  title: string = '';
  content: string = '';

  // Tags Logic (Searchable)
  tags: Tag[] = [];
  tagSearchControl = new FormControl('');
  tagResults: Tag[] = [];
  isSearchingTags = false;
  showTagResults = false;

  // Images
  images: File[] = [];
  imagesPreview: string[] = [];
  isPosting = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.communityId = +id;
    } else {
      // Fallback: Check Category Context
      // If coming from Housing (Category 4), default to Community ID 15
      const currentCategory = this.categoryContext.getCategory();
      if (currentCategory === 4) {
        this.communityId = 15;
      }
    }

    // Tag Search Setup
    this.tagSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => (term || '').length >= 1),
      switchMap(term => {
        this.isSearchingTags = true;
        this.showTagResults = true;
        return this.communityService.searchTags(term || '');
      })
    ).subscribe({
      next: (res) => {
        this.isSearchingTags = false;
        if (res.isSuccess) {
          const selectedIds = new Set(this.tags.map(t => t.id));
          this.tagResults = (res.data || []).filter(t => !selectedIds.has(t.id));
        } else {
          this.tagResults = [];
        }
      },
      error: () => {
        this.isSearchingTags = false;
        this.tagResults = [];
      }
    });
  }

  // --- Tags Management ---
  onTagSelect(tag: Tag) {
    if (this.tags.length >= 5) {
      this.toastService.error('You can select up to 5 tags.');
      return;
    }
    if (!this.tags.find(t => t.id === tag.id)) {
      this.tags.push(tag);
    }
    this.tagSearchControl.setValue('', { emitEvent: false });
    this.showTagResults = false;
    this.tagResults = [];
  }

  removeTag(tag: Tag) {
    this.tags = this.tags.filter(t => t.id !== tag.id);
  }

  onTagBlur() {
    setTimeout(() => this.showTagResults = false, 200);
  }

  // --- Images Management ---
  onImageSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      this.images.push(...files);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagesPreview.push(e.target.result);
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
    this.imagesPreview.splice(index, 1);
  }

  // --- Submit ---
  submitPost() {
    if ((!this.content.trim() && !this.title.trim()) && this.images.length === 0) return;

    this.isPosting = true;

    // We send tag NAMES or IDs? 
    // Usually existing tags have IDs, but new tags?
    // The simplified version sends just names usually, or IDs if specifically required.
    // Based on `create-community` update I did earlier (which I reverted), it sent IDs.
    // Let's assume for posts we want names (hashtags) or IDs.
    // I'll send NAMES for now to match the previous string[] behavior, unless I can confirm IDs are supported.
    // Actually `createPost` interface: let's assume it can take strings.
    const tagNames = this.tags.map(t => t.name);

    this.postService.createPost({
      communityId: this.communityId,
      title: this.title,
      content: this.content,
      tags: tagNames, // Sending names as strings
      attachments: this.images
    }).subscribe({
      next: (res) => {
        this.isPosting = false;
        if (res.isSuccess) {
          this.toastService.success('Post created successfully!');
          const postId = res.data?.id || res.data;
          if (postId) {
            this.router.navigate(['/public/posts/details', postId]);
          } else {
            this.locationService.back();
          }
        } else {
          this.toastService.error(res.error?.message || 'Failed to create post');
        }
      },
      error: () => {
        this.isPosting = false;
        this.toastService.error('Network error, please try again.');
      }
    });
  }

  cancel() {
    this.locationService.back();
  }
}