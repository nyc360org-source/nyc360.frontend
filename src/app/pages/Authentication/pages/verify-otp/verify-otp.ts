import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// 1. استيراد المكتبات الخاصة بالفورم
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, style, animate, transition } from '@angular/animations';
import { AuthService } from '../../Service/auth'; // تأكد من المسار الصحيح للخدمة
import { LoginService } from '../../Service/login-service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  // 2. تأكد من وجود ReactiveFormsModule هنا لحل مشكلة Can't bind to formGroup
  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
  templateUrl: './verify-otp.html',
  styleUrls: ['../login/login.scss'], // استخدام الستايل الموحد
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class VerifyOtpComponent implements OnInit {
  
  // --- Dependencies ---
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
private loginService = inject(LoginService);  // --- State ---


  form!: FormGroup; 
  email = '';
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit() {
    // جلب الإيميل من الرابط
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    
    // إعادة التوجيه إذا لم يوجد إيميل
    if (!this.email) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // تهيئة الفورم
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.pattern('^[0-9]*$')]]
    });
  }

  // 4. تعريف دالة onSubmit لحل مشكلة Property 'onSubmit' does not exist
  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.loginService.verify2FA(this.email, this.form.value.code).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage = res.error?.message || 'Invalid verification code.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Verification failed. Please try again.';
      }
    });
  }
}