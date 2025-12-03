import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center p-12 text-center">
      <div class="text-6xl mb-4">{{ icon || '📭' }}</div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-gray-600 max-w-md">{{ message }}</p>
      @if (actionLabel && actionRoute) {
        <a
          [routerLink]="actionRoute"
          class="mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          {{ actionLabel }}
        </a>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon?: string;
  @Input() title = 'No items found';
  @Input() message = 'There are no items to display at the moment.';
  @Input() actionLabel?: string;
  @Input() actionRoute?: string;
}

