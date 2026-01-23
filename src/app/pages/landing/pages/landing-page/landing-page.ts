import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  showSuccessPopup: boolean = false;
  isSubmitting: boolean = false;

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
        if (res && res.IsSuccess) {
          this.showSuccessPopup = true;
          this.resetForm();
        } else {
          // Handle specific API error format if needed
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error sending support ticket', err);
      }
    });
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.subject = '';
    this.message = '';
  }

  closePopup() {
    this.showSuccessPopup = false;
  }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
  }
}
