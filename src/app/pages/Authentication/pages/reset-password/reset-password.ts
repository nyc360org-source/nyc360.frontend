import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../Service/auth';
import { ResetPasswordRequest } from '../../models/auth';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['../login/login.scss'], // Reuse shared styles + overrides
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ResetPasswordComponent implements OnInit {
  
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  resetForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  
  emailParam: string | null = null;
  tokenParam: string | null = null;

  constructor() {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.emailParam = this.route.snapshot.queryParamMap.get('email');
    this.tokenParam = this.route.snapshot.queryParamMap.get('token');

    if (this.tokenParam) {
      this.tokenParam = this.tokenParam.replace(/ /g, '+');
    }

    if (!this.emailParam || !this.tokenParam) {
      this.errorMessage = 'Invalid link. Please request a new password reset.';
      this.resetForm.disable();
    }
  }

  onSubmit() {
    if (this.resetForm.invalid) return;

    const { newPassword, confirmPassword } = this.resetForm.value;
    
    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const requestData: ResetPasswordRequest = {
      email: this.emailParam!,
      token: this.tokenParam!,
      newPassword: newPassword
    };

    this.authService.resetPassword(requestData).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.successMessage = 'Password reset successful!';
          setTimeout(() => this.router.navigate(['/Login']), 3000);
        } else {
          this.errorMessage = res.error?.message || 'Failed to reset password.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.errorMessage = 'Network error or expired token.';
      }
    });
  }
}