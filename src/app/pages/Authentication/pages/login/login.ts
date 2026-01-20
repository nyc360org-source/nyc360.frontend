import { Component, inject, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, style, animate, transition } from '@angular/animations';
import { LoginService } from '../../Service/login-service';
import { ToastService } from '../../../../shared/services/toast.service';

declare var google: any;

import { AuthSuccessModalComponent } from '../../../../shared/components/auth-success-modal/auth-success-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AuthSuccessModalComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit, AfterViewInit {

  private loginService = inject(LoginService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  loginForm!: FormGroup;
  isLoading = false;

  // Modal State
  showModal = false;
  modalTitle = 'Welcome Back!';
  modalMessage = 'You have successfully logged in.';
  redirectUrl = '/public/home';

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngAfterViewInit() {
    this.initializeGoogleButton();
  }

  initializeGoogleButton() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '124220032804-65up6tfjkjvch75p1k0skmou7csqi3c1.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleLogin(response)
      });
      google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' }
      );
    }
  }

  handleGoogleLogin(response: any) {
    this.ngZone.run(() => {
      this.isLoading = true;

      this.loginService.loginWithGoogle(response.credential).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.isSuccess) {
            this.modalTitle = 'Login Successful';
            this.modalMessage = `Welcome back, ${response.credential.name || 'User'}!`;
            this.redirectUrl = '/public/home';
            this.showModal = true;
          } else {
            this.toastService.error(res.error?.message || 'Google login failed.');
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastService.error('Network error.');
        }
      });
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.toastService.warning('Please fill in the form correctly.');
      return;
    }

    this.isLoading = true;
    const loginData = this.loginForm.value;

    this.loginService.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          // Check for 2FA
          if (response.data.twoFactorRequired) {
            this.router.navigate(['/auth/verify-otp'], { queryParams: { email: loginData.email } });
          } else {
            this.modalTitle = 'Welcome Back!';
            this.modalMessage = 'You have successfully logged in.';
            this.redirectUrl = '/public/home';
            this.showModal = true;
          }
        } else {
          this.toastService.error(response.error?.message || 'Login failed.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Network error.');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onModalClose() {
    this.showModal = false;
    this.router.navigateByUrl(this.redirectUrl);
  }
}