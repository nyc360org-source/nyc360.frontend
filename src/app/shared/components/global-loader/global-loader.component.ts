import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalLoaderService } from './global-loader.service';

@Component({
  selector: 'app-nyc-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="global-loader" *ngIf="loading$ | async">
      <div class="loader-content">
        <div class="brand">NYC-360</div>
        <div class="bar"></div>
      </div>
    </div>
  `,
  styles: [`
    .global-loader {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(255, 255, 255, 0.9);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s;
    }

    .loader-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .brand {
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: -1px;
        background: linear-gradient(135deg, #0066cc 0%, #003d7a 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: pulse 1.5s infinite ease-in-out;
    }

    .bar {
        width: 120px;
        height: 4px;
        background: #e2e8f0;
        border-radius: 2px;
        position: relative;
        overflow: hidden;

        &::after {
            content: '';
            position: absolute;
            left: 0; top: 0; height: 100%; width: 40%;
            background: #0066cc;
            border-radius: 2px;
            animation: slide 1s infinite ease-in-out;
        }
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(0.95); opacity: 0.8; }
    }

    @keyframes slide {
        0% { left: -40%; }
        100% { left: 100%; }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class GlobalLoaderComponent {
  private loaderService = inject(GlobalLoaderService);
  loading$ = this.loaderService.loading$;
}
