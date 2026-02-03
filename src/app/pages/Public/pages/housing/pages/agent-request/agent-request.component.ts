import { Component, OnInit, inject, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PostsService } from '../../../posts/services/posts';
import { ToastService } from '../../../../../../shared/services/toast.service';

@Component({
    selector: 'app-agent-request',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './agent-request.component.html',
    styleUrls: ['./agent-request.component.scss']
})
export class AgentRequestComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private postsService = inject(PostsService);
    private toastService = inject(ToastService);

    @Input() postId: number = 0;
    @Input() contentTitle: string | null = null;
    @Input() contentImage: string | null = null;
    @Input() authorization: any = null;
    @Output() close = new EventEmitter<void>();

    @Output() requestSubmitted = new EventEmitter<void>();

    form: FormGroup;
    isSubmitting = false;
    isSuccess = false;

    showContactDropdown = false;
    showHouseholdDropdown = false;

    // Date Constraints
    minContactDate: string = '';
    maxContactDate: string = '';
    minVirtualDate: string = '';
    maxVirtualDate: string = '';
    minInPersonDate: string = '';
    maxInPersonDate: string = '';
    todayDate: string = '';

    contactTypes = [
        { value: 0, label: 'Email' },
        { value: 1, label: 'Phone' },
        { value: 2, label: 'Text' }
    ];

    householdTypes = [
        { value: 0, label: 'Individual' },
        { value: 1, label: 'Couple' },
        { value: 2, label: 'Single Family' },
        { value: 3, label: 'Multi Family' }
    ];

    constructor() {
        this.form = this.fb.group({
            PostId: [0],
            Name: ['', [Validators.required, Validators.minLength(2)]],
            Email: ['', [Validators.required, Validators.email]],
            PhoneNumber: ['', [Validators.required, Validators.pattern('^[0-9+\\-\\s()]*$')]],
            PreferredContactType: [0, Validators.required],
            HouseholdType: [0, Validators.required],
            // Split fields for UI
            PrefContactDate: ['', Validators.required],
            PrefContactTime: ['', Validators.required],
            MoveInDate: ['', Validators.required],
            MoveOutDate: [''],
            ScheduleVirtualDate: [''],
            VirtualTime: [''],
            InPersonTourDate: [''],
            InPersonTime: [''],
            Message: ['', [Validators.required, Validators.minLength(10)]],
            AddDirectApplyLink: [false],
            DirectApplyLink: [''],
            InviteCoListingEmail: [''],
            AllowColisterEditing: [true],
            CoListingDetails: ['']
        });
    }

    postTitle: string | null = null;
    postImage: string | null = null;

    ngOnInit() {
        if (this.contentTitle) this.postTitle = this.contentTitle;
        if (this.contentImage) this.postImage = this.contentImage;

        if (this.postId) {
            this.form.patchValue({ PostId: this.postId });
            if (!this.postTitle) {
                this.loadPostDetails(this.postId);
            }
        } else {
            this.route.queryParams.subscribe(params => {
                if (params['postId']) {
                    this.postId = +params['postId'];
                    this.form.patchValue({ PostId: this.postId });
                    this.loadPostDetails(this.postId);
                }
            });
        }

        this.setupDateConstraints();
    }

    private setupDateConstraints() {
        const now = new Date();
        this.todayDate = this.formatDateForInput(now);

        if (this.authorization) {
            // Apply preferences if they exist
            if (this.authorization.preferredContactDate) {
                const date = this.formatDateForInput(this.authorization.preferredContactDate);
                this.minContactDate = date;
                this.maxContactDate = date;
                this.form.patchValue({ PrefContactDate: date });
                if (this.authorization.preferredContactTime) {
                    this.form.patchValue({ PrefContactTime: this.authorization.preferredContactTime });
                }
            } else {
                this.minContactDate = this.todayDate;
            }

            if (this.authorization.preferredVirtualTourDate) {
                const date = this.formatDateForInput(this.authorization.preferredVirtualTourDate);
                this.minVirtualDate = date;
                this.maxVirtualDate = date;
                this.form.patchValue({ ScheduleVirtualDate: date });
                if (this.authorization.preferredVirtualTourTime) {
                    this.form.patchValue({ VirtualTime: this.authorization.preferredVirtualTourTime });
                }
            } else {
                this.minVirtualDate = this.todayDate;
            }

            if (this.authorization.preferredInPersonTourDate) {
                const date = this.formatDateForInput(this.authorization.preferredInPersonTourDate);
                this.minInPersonDate = date;
                this.maxInPersonDate = date;
                this.form.patchValue({ InPersonTourDate: date });
                if (this.authorization.preferredInPersonTourTime) {
                    this.form.patchValue({ InPersonTime: this.authorization.preferredInPersonTourTime });
                }
            } else {
                this.minInPersonDate = this.todayDate;
            }
        } else {
            // Fallback: No authorization info, just prevent past dates
            this.minContactDate = this.todayDate;
            this.minVirtualDate = this.todayDate;
            this.minInPersonDate = this.todayDate;
        }

        this.form.patchValue({ MoveInDate: this.todayDate });
    }

    private formatDateForInput(dateInput: any): string {
        if (!dateInput) return '';
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    loadPostDetails(id: number) {
        this.postsService.getPostById(id).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.postTitle = res.data.title;
                    if (res.data.attachments && res.data.attachments.length > 0) {
                        this.postImage = res.data.attachments[0].url;
                    } else {
                        this.postImage = res.data.imageUrl || null;
                    }
                }
            }
        });
    }

    cancel() {
        this.close.emit();
        // Fallback for if still used as a page (unlikely but safe)
        if (window.history.length > 1) {
            // this.router.navigate(['/public/housing/details', this.postId]);
        }
    }

    toggleContactDropdown(event: Event) {
        event.stopPropagation();
        this.showContactDropdown = !this.showContactDropdown;
        this.showHouseholdDropdown = false;
    }

    selectContactType(type: any, event: Event) {
        event.stopPropagation();
        this.form.patchValue({ PreferredContactType: type.value });
        this.showContactDropdown = false;
    }

    toggleHouseholdDropdown(event: Event) {
        event.stopPropagation();
        this.showHouseholdDropdown = !this.showHouseholdDropdown;
        this.showContactDropdown = false;
    }

    selectHouseholdType(type: any, event?: Event) {
        if (event) event.stopPropagation();
        this.form.patchValue({ HouseholdType: type.value });
        this.showHouseholdDropdown = false;
    }

    get selectedContactLabel(): string {
        const val = this.form.get('PreferredContactType')?.value;
        const found = this.contactTypes.find(t => t.value === val);
        return found ? found.label : 'Select Option';
    }

    get selectedHouseholdLabel(): string {
        const val = this.form.get('HouseholdType')?.value;
        const found = this.householdTypes.find(t => t.value === val);
        return found ? found.label : 'Select Option';
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        this.closeDropdowns();
    }

    closeDropdowns() {
        this.showContactDropdown = false;
        this.showHouseholdDropdown = false;
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.form.get(fieldName);
        return field ? (field.invalid && (field.dirty || field.touched)) : false;
    }

    errorMessage: string | null = null;

    onSubmit() {
        console.log('AgentRequestComponent: onSubmit called');
        if (this.form.invalid) {
            console.log('AgentRequestComponent: Form is invalid', this.form.errors);
            // Log exactly which field is invalid
            Object.keys(this.form.controls).forEach(key => {
                const controlErrors = this.form.get(key)?.errors;
                if (controlErrors != null) {
                    console.log('Key control: ' + key + ', errors: ', controlErrors);
                }
            });
            this.form.markAllAsTouched();
            this.toastService.error('Please check the form for errors.');
            return;
        }

        console.log('AgentRequestComponent: Submitting form...', this.form.value);
        this.isSubmitting = true;
        this.errorMessage = null;
        const rawData = this.form.value;

        // Helpers for formatting
        const toDateOnly = (val: string | Date | null | undefined): string | null => {
            if (!val) return null;

            let dateStr = '';
            if (val instanceof Date) {
                const year = val.getFullYear();
                const month = String(val.getMonth() + 1).padStart(2, '0');
                const day = String(val.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            } else {
                dateStr = String(val);
            }

            // Handle ISO string or other formats if necessary
            if (dateStr.includes('T')) {
                return dateStr.split('T')[0];
            }
            return dateStr;
        };

        const toTimeOnly = (val: string | null | undefined): string | null => {
            if (!val) return null;
            const timeStr = String(val);
            if (timeStr.length === 5) return timeStr + ':00'; // Append seconds HH:mm -> HH:mm:ss
            return timeStr;
        };

        const payload = {
            PostId: Number(rawData.PostId) || 0,
            Name: rawData.Name,
            Email: rawData.Email,
            PhoneNumber: rawData.PhoneNumber,

            PreferredContactType: Number(rawData.PreferredContactType),
            PreferredContactDate: toDateOnly(rawData.PrefContactDate)!, // Required field
            PreferredContactTime: toTimeOnly(rawData.PrefContactTime)!, // Required field

            HouseholdType: Number(rawData.HouseholdType),

            MoveInDate: toDateOnly(rawData.MoveInDate)!, // Required
            MoveOutDate: toDateOnly(rawData.MoveOutDate)!, // Required

            ScheduleVirtualDate: toDateOnly(rawData.ScheduleVirtualDate),
            ScheduleVirtualTimeWindow: toTimeOnly(rawData.VirtualTime),

            InPersonTourDate: toDateOnly(rawData.InPersonTourDate),
            InPersonTourTimeWindow: toTimeOnly(rawData.InPersonTime),

            Message: rawData.Message
        };

        console.log('Final Payload:', payload);

        this.postsService.submitHousingApplication(payload).subscribe({
            next: (res) => {
                this.isSubmitting = false;
                if (res.isSuccess) {
                    this.isSuccess = true;
                    this.toastService.success('Request submitted successfully!');
                    this.requestSubmitted.emit();
                    this.cancel(); // Close modal immediately after success
                } else {
                    this.errorMessage = res.error?.message || 'Something went wrong. Please try again.';
                    this.toastService.error(this.errorMessage || 'Error');
                }
            },
            error: (err) => {
                this.isSubmitting = false;
                this.errorMessage = 'Failed to submit request. Please check your connection and try again.';
                this.toastService.error(this.errorMessage);
            }
        });
    }

    resetForm() {
        this.isSuccess = false;
        this.form.reset();
        this.form.patchValue({
            PostId: this.postId,
            PreferredContactType: 0,
            HouseholdType: 0
        });
        this.showContactDropdown = false;
        this.showHouseholdDropdown = false;
    }
}
