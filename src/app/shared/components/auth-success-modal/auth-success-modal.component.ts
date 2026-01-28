import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-auth-success-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="visible" @fadeIn (click)="close()">
      <div class="modal-content" @scaleIn (click)="$event.stopPropagation()">
        <div class="success-icon-wrapper">
          <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        
        <h2 class="title">{{ title }}</h2>
        <p class="message">{{ message }}</p>
        
        <button class="btn-continue" (click)="close()">
          {{ buttonText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(8, 18, 35, 0.85);
      backdrop-filter: blur(12px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-content {
      background: white;
      padding: 50px 40px;
      border-radius: 32px;
      text-align: center;
      max-width: 450px;
      width: 100%;
      box-shadow: 0 30px 100px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-content::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(188, 94, 61, 0.05) 0%, transparent 70%);
      pointer-events: none;
    }

    .success-icon-wrapper {
      width: 100px;
      height: 100px;
      margin: 0 auto 30px;
      background: rgba(188, 94, 61, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .title {
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }

    .message {
      font-family: 'Outfit', sans-serif;
      font-size: 17px;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 35px;
    }

    .btn-continue {
      background: linear-gradient(135deg, #BC5E3D 0%, #a34e30 100%);
      color: white;
      border: none;
      padding: 16px 40px;
      font-size: 18px;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
      border-radius: 18px;
      cursor: pointer;
      width: 100%;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 10px 25px rgba(188, 94, 61, 0.3);
      
      &:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 15px 35px rgba(188, 94, 61, 0.4);
      }

      &:active {
        transform: scale(0.98);
      }
    }

    /* Premium Checkmark */
    .checkmark {
      width: 52px;
      height: 52px;
      stroke: #BC5E3D;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }

    .checkmark__circle {
      stroke-dasharray: 166;
      stroke-dashoffset: 166;
      stroke: #BC5E3D;
      animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }

    .checkmark__check {
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
    }

    @keyframes stroke {
      100% { stroke-dashoffset: 0; }
    }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
    ])
  ]
})
export class AuthSuccessModalComponent {
  @Input() visible = false;
  @Input() title = 'Success!';
  @Input() message = 'Operation completed successfully.';
  @Input() buttonText = 'Continue';

  @Output() closed = new EventEmitter<void>();

  close() {
    this.visible = false;
    this.closed.emit();
  }
}
