import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalLoaderService } from './global-loader.service';
import { map, switchMap, timer, of, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-nyc-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-overlay" *ngIf="displayLoading$ | async">
      <div class="logo-loader">
        <svg viewBox="0 0 400 150" class="nyc-logo-svg">
          <!-- NYC Text - Blue Paths -->
          <g class="nyc-group">
            <path class="letter-n" d="M 40,100 V 60 c 0,-20 30,-20 30,0 v 40" />
            <path class="letter-y" d="M 80,60 v 40 c 0,20 -30,20 -30,30 c 0,10 12,12 20,4" />
            <path class="letter-c" d="M 140,65 c -5,-7 -15,-10 -25,-10 -15,0 -25,10 -25,25 0,15 10,25 25,25 10,0 20,-3 25,-10" />
          </g>

          <!-- 360 Text - Orange Paths -->
          <g class="group-360">
            <!-- 3 -->
            <path class="char-3" d="M 160,60 c 20,-5 30,5 20,15 c 10,0 20,10 10,25 c -10,10 -25,5 -25,5" />
            <!-- 6 -->
            <path class="char-6" d="M 225,60 c -15,0 -25,10 -25,25 c 0,15 10,15 25,15 c 15,0 25,-10 25,-20 c 0,-10 -10,-20 -25,-20" />
            <!-- 0 -->
            <path class="char-0" d="M 265,80 c 0,-25 20,-25 20,0 c 0,25 -20,25 -20,0 Z" />
          </g>
          
          <!-- Orange Swoosh -->
          <path class="swoosh" d="M 20,75 Q 40,115 100,55" />
        </svg>
      </div>
      <div class="loading-bar-container">
        <div class="loading-bar"></div>
      </div>
      <div class="writing-status">NYC360 is Loading...</div>
    </div>
  `,
  styles: [`
    /* Brand Colors */
    $nyc-blue: #003580;
    $nyc-orange: #FF7A00;
    
    .loader-overlay {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.4s ease-out;
    }

    .logo-loader {
      width: 320px;
      max-width: 90%;
      margin-bottom: 30px;

      .nyc-logo-svg {
        width: 100%;
        height: auto;
        filter: drop-shadow(0 10px 15px rgba(0, 53, 128, 0.1));

        path {
          fill: none;
          stroke-width: 7;
          stroke: #003580;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .letter-n, .letter-y, .letter-c {
          stroke: #003580;
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: writeLogo 2s ease-in-out forwards;
        }

        .letter-y { animation-delay: 0.1s; }
        .letter-c { animation-delay: 0.2s; }

        .char-3, .char-6, .char-0 {
          stroke: #FF7A00;
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: writeLogo 2s ease-in-out forwards;
          animation-delay: 0.3s;
        }

        .char-6 { animation-delay: 0.4s; }
        .char-0 { animation-delay: 0.5s; }

        .swoosh {
          stroke: #FF7A00;
          stroke-width: 9;
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: writeLogo 2s ease-in-out forwards;
          animation-delay: 0.6s;
        }
      }
    }

    .writing-status {
      margin-top: 20px;
      color: #003580;
      font-weight: 700;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-family: 'Inter', sans-serif;
      animation: pulseOpacity 1.5s ease-in-out infinite alternate;
    }

    @keyframes pulseOpacity {
      from { opacity: 0.4; }
      to { opacity: 1; }
    }

    .loading-bar-container {
      width: 200px;
      height: 4px;
      background: rgba(0, 53, 128, 0.1);
      border-radius: 10px;
      overflow: hidden;

      .loading-bar {
        width: 40%;
        height: 100%;
        background: linear-gradient(90deg, #003580, #FF7A00);
        border-radius: 10px;
        position: relative;
        animation: loadingMove 1.5s infinite ease-in-out;
      }
    }

    @keyframes writeLogo {
      to {
        stroke-dashoffset: 0;
      }
    }

    @keyframes loadingMove {
      0% { left: -40%; }
      100% { left: 100%; }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class GlobalLoaderComponent {
  private loaderService = inject(GlobalLoaderService);

  // Use switchMap to ensure that when loading turns false, we wait for 2 seconds (animation duration)
  displayLoading$ = this.loaderService.loading$.pipe(
    distinctUntilChanged(),
    switchMap(isLoading => {
      if (isLoading) {
        return of(true);
      } else {
        // Wait 2 seconds before actually hiding the loader to allow animation to finish
        return timer(2200).pipe(map(() => false));
      }
    })
  );
}
