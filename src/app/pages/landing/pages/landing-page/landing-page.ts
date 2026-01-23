import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { StatusModalComponent } from '../../../../shared/components/status-modal/status-modal.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.scss'],
})
export class LandingPage implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren('animEl') animatedElements!: QueryList<ElementRef>;
  private observer: IntersectionObserver | null = null;

  // Form Data
  name: string = '';
  email: string = '';
  subject: string = '';
  message: string = '';

  isSubmitting: boolean = false;

  // Status Modal State
  statusModalOpen: boolean = false;
  statusModalType: 'success' | 'error' = 'success';
  statusModalTitle: string = '';
  statusModalMessage: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
    }
  }

  setupIntersectionObserver() {
    const options = { root: null, rootMargin: '0px', threshold: 0.1 };
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, options);

    this.animatedElements.forEach((el) => this.observer?.observe(el.nativeElement));
  }

  onSubmit() {
    if (!this.email || !this.message || !this.name || !this.subject) {
      return; // Basic validation
    }

    this.isSubmitting = true;

    const payload = {
      Email: this.email,
      Name: this.name,
      Subject: this.subject,
      Message: this.message
    };

    const url = `${environment.apiBaseUrl}/support-tickets/ticket/create/public`;

    this.http.post<any>(url, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        // Check for both cases just to be safe, though user showed isSuccess (camelCase)
        if (res && (res.IsSuccess || res.isSuccess)) {
          this.openModal('success', 'Message Sent', 'Your ticket has been successfully submitted to our support team.');
          this.resetForm();
        } else {
          const jsError = res.message || res.error || (res.Message ? res.Message : null);
          this.openModal('error', 'Submission Failed', jsError || 'Something went wrong. Please try again.');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error sending support ticket', err);
        this.openModal('error', 'Error', 'Failed to connect to the server. Please check your internet connection.');
      }
    });
  }

  openModal(type: 'success' | 'error', title: string, message: string) {
    this.statusModalType = type;
    this.statusModalTitle = title;
    this.statusModalMessage = message;
    this.statusModalOpen = true;
  }

  closeModal() {
    this.statusModalOpen = false;
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.subject = '';
    this.message = '';
  }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
  }
}
