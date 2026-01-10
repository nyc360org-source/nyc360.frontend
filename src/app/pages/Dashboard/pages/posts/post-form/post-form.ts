// src/app/pages/Dashboard/pages/posts/post-form/post-form.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostsService } from '../services/posts';
import { PostCategoryList } from '../models/posts';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment'; // تأكد من المسار الصحيح

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-form.html',
  styleUrls: ['./post-form.scss']
})
export class PostFormComponent implements OnInit {
  
  // Expose environment to template if needed, or use via method
  protected readonly environment = environment;

  // Dependency Injection
  private fb = inject(FormBuilder);
  private postsService = inject(PostsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Form Group
  form: FormGroup;
  
  // UI State
  isEditMode = false;
  postId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  categories = PostCategoryList;
  
  // File Handling (Multiple)
  selectedFiles: File[] = []; 
  imagePreviews: string[] = []; // للصور الجديدة (Base64)
  existingAttachments: any[] = []; // للصور القديمة (من السيرفر)

  constructor() {
    // Initialize Form
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      category: [null, Validators.required]
    });
  }

  ngOnInit() {
    // Check for ID in URL to determine Edit Mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.postId = +params['id'];
        this.loadPostData(this.postId);
      }
    });
  }

  loadPostData(id: number) {
    this.isLoading = true;
    this.postsService.getPostById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          const post = res.data;
          this.form.patchValue({
            title: post.title,
            content: post.content,
            category: post.category
          });
          
          if (post.attachments && post.attachments.length > 0) {
            this.existingAttachments = post.attachments;
          }
        }
      },
      error: () => this.isLoading = false
    });
  }

  /**
   * دالة معالجة روابط الصور (نفس المنطق في القائمة)
   */
  resolveImageUrl(url: string): string {
    if (!url) return '';

    // معالجة روابط السيرفر الداخلية
    if (url.includes('@local://')) {
      const filename = url.replace('@local://', '');
      return `${this.environment.apiBaseUrl3}/${filename}`;
    }

    // معالجة الصور القديمة النسبية
    if (!url.startsWith('http') && !url.startsWith('data:')) {
       return `${this.environment.apiBaseUrl}/${url}`;
    }

    return url;
  }

  /**
   * Handle Multiple File Selection
   */
  onFileSelect(event: any) {
    const files = event.target.files;
    
    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files);
      this.imagePreviews = []; 

      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  /**
   * Submit Form
   */
  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const formData = this.form.value;

    let request$: Observable<any>;

    if (this.isEditMode && this.postId) {
      request$ = this.postsService.updatePost(this.postId, formData, this.selectedFiles.length > 0 ? this.selectedFiles : undefined);
    } else {
      request$ = this.postsService.createPost(formData, this.selectedFiles.length > 0 ? this.selectedFiles : undefined);
    }

    request$.subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.isSuccess) {
          alert(this.isEditMode ? 'Post updated successfully' : 'Post created successfully');
          this.goBack();
        } else {
          alert(res.error?.message || 'Operation failed');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        alert('Network error occurred');
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/posts']);
  }
}