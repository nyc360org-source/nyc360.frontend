import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VerificationService } from '../../../pages/Public/pages/settings/services/verification.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-verification-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verification-modal.html',
  styleUrls: ['./verification-modal.scss']
})
export class VerificationModalComponent implements OnInit {
  @Input() categoryName: string = 'Housing';
  @Input() categoryId: number = 4; // Default to Housing
  @Output() close = new EventEmitter<void>();
  @Output() verified = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private verificationService = inject(VerificationService);
  private toastService = inject(ToastService);

  verificationForm!: FormGroup;
  isSubmittingVerification = false;
  selectedDocFile: File | null = null;

  occupations = [
    { id: 1854, name: 'Housing Advisor' },
    { id: 1855, name: 'Housing Organization' },
    { id: 1856, name: 'Licensed Agent' },
    { id: 2001, name: 'Community Leader' },
    { id: 2002, name: 'Organization Rep' }
  ];

  documentTypes = [
    { id: 1, name: 'Government ID' },
    { id: 2, name: 'Utility Bill' },
    { id: 5, name: 'Professional License' },
    { id: 6, name: 'Employee ID Card' },
    { id: 11, name: 'Contract Agreement' },
    { id: 12, name: 'Letter of Recommendation' },
    { id: 99, name: 'Other' }
  ];

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.verificationForm = this.fb.group({
      occupationId: [1856, Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      documentType: [1, Validators.required],
      file: [null, Validators.required]
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedDocFile = event.target.files[0];
      this.verificationForm.patchValue({ file: this.selectedDocFile });
    }
  }

  submitVerification() {
    if (this.verificationForm.invalid || !this.selectedDocFile) {
      this.verificationForm.markAllAsTouched();
      return;
    }

    this.isSubmittingVerification = true;
    const data = {
      TagId: this.verificationForm.value.occupationId,
      Reason: this.verificationForm.value.reason,
      DocumentType: this.verificationForm.value.documentType,
      File: this.selectedDocFile
    };

    this.verificationService.submitVerification(data).subscribe({
      next: (res: any) => {
        this.isSubmittingVerification = false;
        if (res.isSuccess || res.IsSuccess) {
          this.toastService.success('Verification request submitted successfully!');
          this.verified.emit();
          this.closeModal();
        } else {
          const errorMessage = res.error?.message || res.Error?.Message || 'Submission failed';
          this.toastService.error(errorMessage);
        }
      },
      error: () => {
        this.isSubmittingVerification = false;
        this.toastService.error('Network error. Please try again.');
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}
