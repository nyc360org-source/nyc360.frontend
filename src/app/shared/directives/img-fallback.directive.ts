import { Directive, Input, ElementRef, HostListener, inject } from '@angular/core';
import { ImageService } from '../services/image.service';

@Directive({
    selector: 'img[appImgFallback]',
    standalone: true
})
export class ImgFallbackDirective {
    @Input() appImgFallback: 'post' | 'avatar' | string = 'post';

    private el = inject(ElementRef);
    private imageService = inject(ImageService);

    @HostListener('error')
    onError() {
        const img: HTMLImageElement = this.el.nativeElement;

        if (this.appImgFallback === 'avatar') {
            img.src = this.imageService.DEFAULT_AVATAR;
        } else if (this.appImgFallback === 'post') {
            img.src = this.imageService.DEFAULT_POST;
        } else if (this.appImgFallback) {
            // If a specific string path is provided, use it
            img.src = this.appImgFallback;
        } else {
            img.src = this.imageService.PLACEHOLDER;
        }
    }
}
