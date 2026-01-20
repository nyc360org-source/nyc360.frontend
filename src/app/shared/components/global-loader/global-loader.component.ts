import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalLoaderService } from './global-loader.service';

@Component({
  selector: 'app-nyc-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-overlay" *ngIf="loading$ | async">
      <div class="loader-content">
        <!-- Spinner Animation -->
        <div class="spinner-wrapper">
          <div class="ring-one"></div>
          <div class="ring-two"></div>
          <div class="logo-center">
            <i class="bi bi-rocket-takeoff-fill"></i>
          </div>
        </div>
        
        <!-- Text Animation -->
        <div class="text-wrapper">
          <span class="brand-nyc">NYC</span>
          <span class="brand-separator">-</span>
          <span class="brand-360">360</span>
        </div>
        
        <div class="loading-bar-wrapper">
          <div class="loading-bar"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loader-overlay {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(8px);
      z-index: 99999;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.3s ease-out;
    }

    .loader-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      position: relative;
    }

    /* --- Spinner Rings --- */
    .spinner-wrapper {
      position: relative;
      width: 80px;
      height: 80px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .ring-one, .ring-two {
      position: absolute;
      border-radius: 50%;
      border: 3px solid transparent;
    }

    .ring-one {
      width: 100%;
      height: 100%;
      border-top-color: #0066cc;
      border-left-color: #0066cc;
      animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
    }

    .ring-two {
      width: 70%;
      height: 70%;
      border-bottom-color: #0f172a; /* Dark sleek color */
      border-right-color: #0f172a;
      animation: spin-reverse 1.2s linear infinite;
    }

    .logo-center {
      color: #0066cc;
      font-size: 1.5rem;
      animation: pulse-logo 2s infinite ease-in-out;
    }

    /* --- Typography --- */
    .text-wrapper {
      font-family: 'Inter', sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 2px;
      letter-spacing: -0.5px;
    }

    .brand-nyc {
      color: #0f172a;
      animation: slideInLeft 0.5s ease-out;
    }

    .brand-separator {
      color: #64748b;
      margin: 0 2px;
    }

    .brand-360 {
      background: linear-gradient(135deg, #0066cc 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      position: relative;
    }

    /* --- Loading Bar --- */
    .loading-bar-wrapper {
      width: 120px;
      height: 4px;
      background: #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
    }

    .loading-bar {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 40%;
      background: #0066cc;
      border-radius: 10px;
      animation: shuttle 1.5s infinite ease-in-out;
    }

    /* --- Animations --- */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes spin-reverse {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(-360deg); }
    }

    @keyframes pulse-logo {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(0.85); opacity: 0.7; }
    }

    @keyframes shuttle {
      0% { left: -40%; }
      50% { left: 40%; width: 60%; }
      100% { left: 100%; width: 40%; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes slideInLeft {
      from { transform: translateX(-10px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class GlobalLoaderComponent {
  private loaderService = inject(GlobalLoaderService);
  loading$ = this.loaderService.loading$;
}
