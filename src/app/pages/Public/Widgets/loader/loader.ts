import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../services/loader-service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loaderService.isLoading$ | async" class="loader-overlay">
      <div class="loader-container">
        <div class="pulse-ring"></div>
        <div class="logo-circle">
          <i class="bi bi-rocket-takeoff-fill"></i>
        </div>
      </div>
      <p class="loading-text">Loading...</p>
    </div>
  `,
  styleUrls: ['./loader.scss']
})
export class LoaderComponent {
  loaderService = inject(LoaderService);
}