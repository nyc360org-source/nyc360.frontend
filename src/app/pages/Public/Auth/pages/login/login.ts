import { Component, inject, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Service/auth';
import { LoginRequest } from '../../models/auth';
import { environment } from '../../../../../environments/environment';

// تعريف متغير جوجل العام لتجنب أخطاء TypeScript
declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'] 
})
export class LoginComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone); // مهم لتحديث الواجهة بعد رد جوجل

  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit() {
    // يمكنك هنا التحقق مما إذا كان المستخدم مسجلاً للدخول بالفعل
  }

  ngAfterViewInit() {
    // تهيئة زر جوجل بعد تحميل الواجهة
    this.initializeGoogleButton();
  }

  // --- تهيئة زر جوجل ---
  initializeGoogleButton() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '124220032804-65up6tfjkjvch75p1k0skmou7csqi3c1.apps.googleusercontent.com', // 🔴 ضع معرف العميل الخاص بك هنا
        callback: (response: any) => this.handleGoogleLogin(response)
      });

      google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' } // تخصيص شكل الزر
      );
    } else {
      console.error('Google SI library not loaded!');
    }
  }

  // --- معالجة رد جوجل ---
  handleGoogleLogin(response: any) {
    // تشغيل الكود داخل NgZone لأن رد جوجل يأتي من خارج إطار عمل Angular
    this.ngZone.run(() => {
      this.isLoading = true;
      this.errorMessage = null;

      // إرسال الـ Token للباك إند
      this.authService.loginWithGoogleBackend(response.credential).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.isSuccess) {
            this.router.navigate(['/']);
          } else {
            this.errorMessage = res.error?.message || 'Google login failed.';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Network error during Google login.';
          console.error(err);
        }
      });
    });
  }

  // --- تسجيل الدخول العادي ---
  onSubmit() {
    this.isLoading = true;
    this.errorMessage = null;

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.isSuccess) {
          if (response.data.twoFactorRequired) {
            this.router.navigate(['/verify-otp'], { 
              queryParams: { email: this.loginData.email } 
            });
          } else {
            this.router.navigate(['/']); 
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