import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventApiService } from '../../../../player/services/event-api.service';
import { Event } from '../../../../../core/models/event.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-all-events',
    standalone: true,
    imports: [CommonModule, LoadingSpinnerComponent],
    template: `
    <div>
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">All Events</h2>
        <p class="text-gray-600">View and manage all events in the system</p>
      </div>

      @if (isLoading()) {
        <app-loading-spinner message="Loading events..."></app-loading-spinner>
      } @else if (errorMessage()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p class="text-red-700">{{ errorMessage() }}</p>
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow">
          <div class="p-6">
            <div class="mb-4 flex items-center justify-between">
              <p class="text-sm text-gray-600">Total Events: <span class="font-semibold">{{ events().length }}</span></p>
            </div>

            @if (events().length === 0) {
              <div class="text-center py-12">
                <p class="text-gray-500">No events found</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    @for (event of events(); track event.id) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="font-medium text-gray-900">{{ event.title }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {{ formatDate(event.date) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {{ event.location || 'N/A' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {{ event.organizerEmail || 'N/A' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ event.currentParticipants || 0 }}{{ event.maxParticipants ? '/' + event.maxParticipants : '' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span [class]="getStatusClass(event.status)">
                            {{ event.status || 'UPCOMING' }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span [class]="event.isPublic ? 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800' : 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800'">
                            {{ event.isPublic ? 'Public' : 'Private' }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class AllEventsComponent implements OnInit {
    private eventApi = inject(EventApiService);

    events = signal<Event[]>([]);
    isLoading = signal(true);
    errorMessage = signal<string | null>(null);

    ngOnInit(): void {
        this.loadEvents();
    }

    loadEvents(): void {
        this.isLoading.set(true);
        this.errorMessage.set(null);

        this.eventApi.getAvailableEvents().subscribe({
            next: (events: Event[]) => {
                this.events.set(events);
                this.isLoading.set(false);
            },
            error: (error: any) => {
                console.error('Error loading events:', error);
                this.errorMessage.set('Failed to load events. Please try again.');
                this.isLoading.set(false);
            }
        });
    }

    formatDate(date: string): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getStatusClass(status?: string): string {
        const statusClasses: Record<string, string> = {
            'UPCOMING': 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
            'ONGOING': 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
            'COMPLETED': 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800',
            'CANCELLED': 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800'
        };
        return statusClasses[status || 'UPCOMING'] || statusClasses['UPCOMING'];
    }
}
