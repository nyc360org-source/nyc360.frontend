import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RssService } from '../service/rss.service';

@Component({
    selector: 'app-connect-rss',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './connect-rss.component.html',
    styleUrls: ['./connect-rss.component.scss']
})
export class ConnectRssComponent {
    private fb = inject(FormBuilder);
    private rssService = inject(RssService);
    private router = inject(Router);

    rssForm = this.fb.group({
        Url: ['', [Validators.required, Validators.pattern(/^(http|https):\/\/[^ "]+$/)]],
        Category: [0, [Validators.required]],
        Name: ['', [Validators.required]],
        Description: ['', [Validators.required]],
        ImageUrl: ['', [Validators.pattern(/^(http|https):\/\/[^ "]+$/)]]
    });

    isSubmitting = signal(false);
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    categories = [
        { id: 0, name: 'General' },
        { id: 1, name: 'Housing' },
        { id: 2, name: 'News' },
        { id: 3, name: 'Events' },
        { id: 4, name: 'Technology' },
        { id: 5, name: 'Lifestyle' }
    ];

    onSubmit() {
        if (this.rssForm.invalid) {
            this.rssForm.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set(null);
        this.successMessage.set(null);

        const formData = this.rssForm.value as any;
        formData.Category = Number(formData.Category);

        this.rssService.connectRss(formData).subscribe({
            next: (res) => {
                if (res.IsSuccess) {
                    this.successMessage.set('RSS Feed connected successfully!');
                    setTimeout(() => {
                        this.router.navigate(['/housing/home']);
                    }, 2000);
                } else {
                    this.errorMessage.set(res.Error?.Message || 'Failed to connect RSS feed.');
                }
                this.isSubmitting.set(false);
            },
            error: (err) => {
                console.error(err);
                this.errorMessage.set('An unexpected error occurred.');
                this.isSubmitting.set(false);
            }
        });
    }
}
