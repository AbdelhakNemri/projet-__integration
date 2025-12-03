import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [],
  template: `
    <div class="flex items-center justify-center p-8" [class.min-h-screen]="fullScreen">
      <div class="flex flex-col items-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        @if (message) {
          <p class="text-gray-600">{{ message }}</p>
        }
      </div>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() message?: string;
  @Input() fullScreen = false;
}

