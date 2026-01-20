import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationModalComponent } from './shared/components/confirmation-modal/confirmation-modal.component';
import { GlobalLoaderComponent } from './shared/components/global-loader/global-loader.component';
import { BackToTopComponent } from './shared/components/back-to-top/back-to-top';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmationModalComponent, GlobalLoaderComponent, BackToTopComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('my-ssr-app');
}
