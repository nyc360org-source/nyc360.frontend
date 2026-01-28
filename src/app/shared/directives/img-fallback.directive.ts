import { Directive, Input, ElementRef, HostListener, inject } from '@angular/core';
import { ImageService } from '../services/image.service';

@Directive({
    selector: 'img[appImgFallback]',
    standalone: true
})
export class ImgFallbackDirective {
    @Input() appImgFallback: 'post' | 'avatar' | 'housing' | string = 'post';

    private el = inject(ElementRef);
    private imageService = inject(ImageService);
    private isFallbackApplied = false;

    @HostListener('error')
    onError() {
        if (this.isFallbackApplied) return; // Prevent infinite loop

        const img: HTMLImageElement = this.el.nativeElement;
        console.warn('[ImgFallback] Image failed to load:', img.src, 'Using fallback for type:', this.appImgFallback);
        this.isFallbackApplied = true;

        if (this.appImgFallback === 'avatar') {
            img.src = this.imageService.DEFAULT_AVATAR;
        } else if (this.appImgFallback === 'housing') {
            img.src = this.imageService.DEFAULT_HOUSING;
        } else if (this.appImgFallback === 'post') {
            img.src = this.imageService.DEFAULT_POST;
        } else if (this.appImgFallback && typeof this.appImgFallback === 'string') {
            // If a specific string path is provided, use it
            img.src = this.appImgFallback;
        } else {
            img.src = this.imageService.PLACEHOLDER;
        }
    }
}
