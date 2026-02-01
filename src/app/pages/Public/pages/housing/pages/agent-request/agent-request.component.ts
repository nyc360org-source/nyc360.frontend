import { Component, OnInit, inject, HostListener } from '@angular/core';
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

    form: FormGroup;
    isSubmitting = false;
    isSuccess = false;
    postId: number = 0;

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
            PreferredContactDate: ['', Validators.required],
            MoveInDate: ['', Validators.required],
            MoveOutDate: [''],
            ScheduleVirtual: [''],
            TimeWindow: [''],
            InPersonTour: [''],
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
        this.route.queryParams.subscribe(params => {
            if (params['postId']) {
                this.postId = +params['postId'];
                this.form.patchValue({ PostId: this.postId });
                this.loadPostDetails(this.postId);
            }
        });
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
        if (this.postId) {
            this.router.navigate(['/public/posts/details', this.postId]);
        } else {
            this.router.navigate(['/public/housing']);
        }
    }

    toggleContactDropdown(event: Event) {
        event.stopPropagation();
        this.showContactDropdown = !this.showContactDropdown;
        this.showHouseholdDropdown = false;
    }

    selectContactType(type: any) {
        this.form.patchValue({ PreferredContactType: type.value });
        this.showContactDropdown = false;
    }

    toggleHouseholdDropdown(event: Event) {
        event.stopPropagation();
        this.showHouseholdDropdown = !this.showHouseholdDropdown;
        this.showContactDropdown = false;
    }

    selectHouseholdType(type: any) {
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
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toastService.error('Please check the form for errors.');
            return;
        }

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
            PreferredContactDate: this.formatDate(rawData.PreferredContactDate),
            MoveInDate: this.formatDate(rawData.MoveInDate),
            MoveOutDate: this.formatDate(rawData.MoveOutDate),
            ScheduleVirtual: this.formatDate(rawData.ScheduleVirtual),
            TimeWindow: this.formatDate(rawData.TimeWindow),
            InPersonTour: this.formatDate(rawData.InPersonTour),
            Message: rawData.Message
        };

        this.postsService.submitHousingApplication(payload).subscribe({
            next: (res) => {
                this.isSubmitting = false;
                if (res.isSuccess) {
                    this.isSuccess = true;
                    this.toastService.success('Request submitted successfully!');
                    this.form.reset();
                    this.form.patchValue({
                        PreferredContactType: 0,
                        HouseholdType: 0,
                        PostId: this.postId
                    });
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

    private formatDate(dateStr: string): string | undefined {
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
