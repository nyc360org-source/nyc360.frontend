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
    @Output() close = new EventEmitter<void>();

    form: FormGroup;
    isSubmitting = false;
    isSuccess = false;

    showContactDropdown = false;
    showHouseholdDropdown = false;

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
        if (this.postId) {
            this.form.patchValue({ PostId: this.postId });
            this.loadPostDetails(this.postId);
        } else {
            this.route.queryParams.subscribe(params => {
                if (params['postId']) {
                    this.postId = +params['postId'];
                    this.form.patchValue({ PostId: this.postId });
                    this.loadPostDetails(this.postId);
                }
            });
        }
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

        const payload = {
            PostId: Number(rawData.PostId) || 0,
            Name: rawData.Name,
            Email: rawData.Email,
            PhoneNumber: rawData.PhoneNumber,
            PreferredContactType: Number(rawData.PreferredContactType),
            HouseholdType: Number(rawData.HouseholdType),
            PreferredContactDate: this.mergeDateTime(rawData.PrefContactDate, rawData.PrefContactTime),
            MoveInDate: this.formatDate(rawData.MoveInDate),
            MoveOutDate: this.formatDate(rawData.MoveOutDate),
            ScheduleVirtual: this.mergeDateTime(rawData.ScheduleVirtualDate, rawData.VirtualTime),
            TimeWindow: this.mergeDateTime(rawData.InPersonTourDate || rawData.ScheduleVirtualDate || rawData.PrefContactDate, rawData.InPersonTime || rawData.VirtualTime),
            InPersonTour: this.mergeDateTime(rawData.InPersonTourDate, rawData.InPersonTime),
            Message: rawData.Message
        };

        this.postsService.submitHousingApplication(payload).subscribe({
            next: (res) => {
                this.isSubmitting = false;
                if (res.isSuccess) {
                    this.isSuccess = true;
                    this.toastService.success('Request submitted successfully!');
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

    private mergeDateTime(dateStr: any, timeStr: any): string | undefined {
        if (!dateStr && !timeStr) return undefined;

        // If we have time but no date, use today's date as a base to satisfy the DateTime requirement
        const baseDate = dateStr ? new Date(dateStr) : new Date();
        if (isNaN(baseDate.getTime())) return undefined;

        if (!timeStr) return baseDate.toISOString();

        try {
            const [hours, minutes] = timeStr.split(':').map(Number);
            baseDate.setHours(hours || 0, minutes || 0, 0, 0);
            return baseDate.toISOString();
        } catch (e) {
            return baseDate.toISOString();
        }
    }

    private formatDate(dateStr: any): string | undefined {
        if (!dateStr) return undefined;
        const date = new Date(dateStr);
        return !isNaN(date.getTime()) ? date.toISOString() : undefined;
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
