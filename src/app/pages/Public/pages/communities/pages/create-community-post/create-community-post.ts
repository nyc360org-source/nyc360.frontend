import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommunityPostService } from '../../services/community-post';

@Component({
  selector: 'app-create-community-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-community-post.html',
  styleUrls: ['./create-community-post.scss']
})
export class CreateCommunityPostComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private locationService = inject(Location);
  private postService = inject(CommunityPostService);
  private cdr = inject(ChangeDetectorRef);

  // Data
  communityId: number = 0;
  title: string = '';
  content: string = '';
  
  // Tags Logic (Manual String Tags)
  tags: string[] = [];
  currentTagInput: string = ''; 

  // Images
  images: File[] = [];
  imagesPreview: string[] = [];
  isPosting = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.communityId = +id;
  }

  // --- Tags Management ---
  addTag() {
    const val = this.currentTagInput.trim();
    if (val && !this.tags.includes(val)) {
      this.tags.push(val);
      this.currentTagInput = ''; // تفريغ الحقل
    }
  }

  onTagKeyup(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault(); // منع سطر جديد
      this.addTag();
    }
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
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

    this.postService.createPost({
      communityId: this.communityId,
      title: this.title,
      content: this.content,
      tags: this.tags,        // إرسال التاجات كنصوص
      attachments: this.images
    }).subscribe({
      next: (res) => {
        this.isPosting = false;
        if (res.isSuccess) {
          this.locationService.back(); // العودة للصفحة السابقة عند النجاح
        } else {
          alert(res.error?.message || 'Failed to create post');
        }
      },
      error: () => {
        this.isPosting = false;
        alert('Network error, please try again.');
      }
    });
  }

  cancel() {
    this.locationService.back();
  }
}