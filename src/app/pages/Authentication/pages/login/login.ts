// src/app/pages/Authentication/pages/login/login.component.ts

import { Component, inject, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, style, animate, transition } from '@angular/animations'; 
import { LoginRequest } from '../../models/auth';
import { LoginService } from '../../Service/login-service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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
  
  // ✅ Inject LoginService instead of AuthService for login actions
  private loginService = inject(LoginService); 
  private router = inject(Router);
  private ngZone = inject(NgZone); 

  loginData: LoginRequest = { email: '', password: '' };
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit() {}

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
      this.errorMessage = null;
      
      // ✅ Use LoginService
      this.loginService.loginWithGoogle(response.credential).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.isSuccess) {
            this.router.navigate(['/']); // Navigate to home/dashboard
          } else {
            this.errorMessage = res.error?.message || 'Google login failed.';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Network error.';
        }
      });
    });
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = null;

    // ✅ Use LoginService
    this.loginService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          if (response.data.twoFactorRequired) {
            this.router.navigate(['/auth/verify-otp'], { queryParams: { email: this.loginData.email } });
          } else {
            this.router.navigate(['/public/home']); 
          }
        } else {
          this.errorMessage = response.error?.message || 'Login failed.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Network error.';
      }
    });
  }
}