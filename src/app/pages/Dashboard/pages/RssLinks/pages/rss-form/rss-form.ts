import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RssService } from '../../services/rss';
import { RssSource } from '../../models/rss';
import { CATEGORY_THEMES, CategoryEnum } from '../../../../../Public/Widgets/feeds/models/categories';

@Component({
  selector: 'app-rss-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rss-form.html',
  styleUrls: ['./rss-form.scss']
})
export class RssFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private rssService = inject(RssService);
  private router = inject(Router);
  private location = inject(Location);

  form!: FormGroup;
  isEditMode = false;
  editId: number | null = null;

  // القائمة المشتركة
  categories = Object.entries(CATEGORY_THEMES).map(([key, value]) => ({
    id: Number(key),
    ...value
  }));

  isLoading = false;
  selectedFile: File | null = null;

  ngOnInit() {
    const state = history.state.data as RssSource;

    if (state && state.id) {
      this.isEditMode = true;
      this.editId = state.id;
      this.initEditForm(state);
    } else {
      this.initCreateForm();
    }
  }

  // --- Form for CREATE ---
  initCreateForm() {
    this.form = this.fb.group({
      url: ['', [Validators.required, Validators.pattern('https?://.+')]],
      // Validators.required يقبل الصفر كقيمة صحيحة، لكن يجب أن تكون القيمة المبدئية null
      category: [null, Validators.required]
    });
  }

  // --- Form for EDIT ---
  initEditForm(data: RssSource) {
    this.form = this.fb.group({
      name: [data.name, Validators.required],
      rssUrl: [data.rssUrl, Validators.required],
      category: [data.category, Validators.required],
      description: [data.description],
      isActive: [data.isActive]
    });
  }

  // --- File Handling ---
  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  // --- Submit Logic ---
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.editId) {
      // UPDATE Logic
      this.rssService.updateRssSource(this.editId, this.form.value, this.selectedFile || undefined)
        .subscribe({
          next: (res: any) => {
            if (res.isSuccess) {
              this.handleSuccess('Updated');
            } else {
              this.handleError({ error: res.error });
            }
          },
          error: (err: any) => this.handleError(err)
        });
    } else {
      // CREATE Logic
      const payload = {
        url: this.form.value.url,
        // تأكد من تحويلها لرقم، حتى لو كانت 0
        category: Number(this.form.value.category)
      };

      this.rssService.createRssSource(payload)
        .subscribe({
          next: (res: any) => {
            if (res.isSuccess) {
              this.handleSuccess('Created');
            } else {
              // إرسال الخطأ القادم من الباك إند
              this.handleError({ error: res.error });
            }
          },
          error: (err: any) => this.handleError(err)
        });
    }
  }

  handleSuccess(action: string) {
    alert(`RSS Feed ${action} Successfully!`);
    this.isLoading = false;
    this.router.navigate(['/admin/rss']);
  }

  // 🔥 تحسين هندلة الخطأ لعرض رسالة الباك إند
  handleError(err: any) {
    this.isLoading = false;
    console.error('API Error:', err);

    let msg = 'Operation failed. Please try again.';

    // محاولة استخراج الرسالة من الباك إند
    if (err.error && err.error.message) {
      msg = err.error.message;
    } else if (err.message) {
      msg = err.message;
    }

    alert(`Error: ${msg}`);
  }

  goBack() {
    this.location.back();
  }
}