import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VerificationService } from '../../../pages/Public/pages/settings/services/verification.service';
import { ToastService } from '../../../shared/services/toast.service';
import { filterPublicCommunityBadges } from '../../utils/community-badge-policy';

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

  @Input() extraOccupations: any[] = [];

  occupations: any[] = [
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

  readonly communitySecondGateKeys: string[] = [
    'Community Publishing Key',
    'Community Moderation Key',
    'Location Listing Key'
  ];

  showCommunityPolicyDetails = false;

  get isCommunityPolicyMode(): boolean {
    return (this.categoryName || '').trim().toLowerCase() === 'community';
  }

  toggleCommunityPolicyDetails(): void {
    this.showCommunityPolicyDetails = !this.showCommunityPolicyDetails;
  }

  ngOnInit() {
    const sourceOccupations = (this.extraOccupations && this.extraOccupations.length > 0)
      ? this.extraOccupations
      : this.occupations;

    // Community membership tags are internal and should never appear as public badge options.
    this.occupations = this.dedupeById(
      this.normalizeOccupations(filterPublicCommunityBadges(sourceOccupations))
    );

    this.initForm(this.getInitialOccupationId());
  }

  initForm(initialOccupationId: number | null) {
    this.verificationForm = this.fb.group({
      occupationId: [initialOccupationId, Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      documentType: [1, Validators.required],
      file: [null, Validators.required]
    });
  }

  private dedupeById(items: any[]): any[] {
    // Keep labels distinct even if backend tag ID is reused as fallback for multiple D01 labels.
    return items.filter((item, index, arr) => {
      const key = `${item.id}::${item.name}`;
      return arr.findIndex((x) => `${x.id}::${x.name}` === key) === index;
    });
  }

  private normalizeOccupations(items: any[]): any[] {
    return items
      .map((item) => {
        const id = Number(item?.id ?? item?.Id);
        const name = (item?.name ?? item?.Name ?? '').toString().trim();
        return { id, name };
      })
      .filter((item) => Number.isFinite(item.id) && !!item.name);
  }

  private getInitialOccupationId(): number | null {
    if (!this.occupations.length) return null;

    const preferredId = 1856; // Keep current default for housing-oriented flows.
    const hasPreferred = this.occupations.some((occ) => occ.id === preferredId);
    if (hasPreferred) return preferredId;

    return this.occupations[0]?.id ?? null;
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedDocFile = event.target.files[0];
      this.verificationForm.patchValue({ file: this.selectedDocFile });
    }
  }

  submitVerification() {
    if (!this.occupations.length) {
      this.toastService.error('No public badges are available for this request right now.');
      return;
    }

    if (this.verificationForm.invalid || !this.selectedDocFile) {
      this.verificationForm.markAllAsTouched();
      return;
    }

    this.isSubmittingVerification = true;
    const data = {
      TagId: Number(this.verificationForm.value.occupationId),
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
