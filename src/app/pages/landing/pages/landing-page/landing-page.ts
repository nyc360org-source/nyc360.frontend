import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.scss'],
})
export class LandingPage implements AfterViewInit, OnDestroy {
  
  @ViewChildren('animEl') animatedElements!: QueryList<ElementRef>;
  private observer: IntersectionObserver | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
    }
  }

  setupIntersectionObserver() {
    const options = { root: null, rootMargin: '0px', threshold: 0.1 };
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, options);
    
    this.animatedElements.forEach((el) => this.observer?.observe(el.nativeElement));
  }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
  }
}