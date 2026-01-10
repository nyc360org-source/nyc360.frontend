import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, style, animate, transition } from '@angular/animations';
import { AuthService } from '../../Service/auth';
import { ForgotPasswordRequest } from '../../models/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // Use ReactiveFormsModule
  templateUrl: './forgot-password.html',
  styleUrls: ['../login/login.scss'], // Reuse unified styles
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // Use Reactive Forms for consistency
  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const requestData: ForgotPasswordRequest = { email: this.form.value.email };

    this.authService.forgotPassword(requestData).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.successMessage = 'Password reset link sent! Check your inbox.';
          this.form.reset();
        } else {
          this.errorMessage = res.error?.message || 'Something went wrong.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Network error. Please try again.';
        console.error('Forgot Password Error:', err);
      }
    });
  }
}