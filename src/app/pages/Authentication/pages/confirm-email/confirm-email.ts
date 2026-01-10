import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../Service/auth';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirm-email.html',
  styleUrls: ['../login/login.scss'], // Reuse shared styles + specific overrides
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ConfirmEmailComponent implements OnInit {
  
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = true;
  isSuccess = false;
  errorMessage = '';

  ngOnInit() {
    this.processConfirmation();
  }

  processConfirmation() {
    const email = this.route.snapshot.queryParamMap.get('email');
    let token = this.route.snapshot.queryParamMap.get('token');

    if (!email || !token) {
      this.handleError('Invalid Link. Missing email or token.');
      return;
    }

    // Fix token encoding issue
    token = token.replace(/ /g, '+');

    this.authService.confirmEmail({ email, token }).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        if (res.isSuccess) {
          this.isSuccess = true;
          // Auto-redirect
          setTimeout(() => this.router.navigate(['/Login']), 5000);
        } else {
          this.handleError(res.error?.message || 'Verification failed. Please try logging in.');
        }
      },
      error: (err) => {
        console.error('Confirmation Error:', err);
        this.handleError('Link expired or invalid. Please login to request a new one.');
      }
    });
  }

  private handleError(msg: string) {
    this.isLoading = false;
    this.isSuccess = false;
    this.errorMessage = msg;
  }
}