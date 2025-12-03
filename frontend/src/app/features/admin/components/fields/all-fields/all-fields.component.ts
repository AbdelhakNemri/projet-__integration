import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldApiService } from '../../../../player/services/field-api.service';
import { Field } from '../../../../../core/models/field.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-all-fields',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">All Fields</h2>
        <p class="text-gray-600">View and manage all fields in the system</p>
      </div>

      @if (isLoading()) {
        <app-loading-spinner message="Loading fields..."></app-loading-spinner>
      } @else if (errorMessage()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p class="text-red-700">{{ errorMessage() }}</p>
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow">
          <div class="p-6">
            <div class="mb-4 flex items-center justify-between">
              <p class="text-sm text-gray-600">Total Fields: <span class="font-semibold">{{ fields().length }}</span></p>
            </div>

            @if (fields().length === 0) {
              <div class="text-center py-12">
                <p class="text-gray-500">No fields found</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Hour</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    @for (field of fields(); track field.id) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="font-medium text-gray-900">{{ field.name }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                            {{ field.type }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {{ field.city }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ field.pricePerHour ? field.pricePerHour + ' DT' : 'N/A' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {{ field.ownerEmail || 'N/A' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {{ formatDate(field.createdAt) }}
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
export class AllFieldsComponent implements OnInit {
  private fieldApi = inject(FieldApiService);

  fields = signal<Field[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFields();
  }

  loadFields(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.fieldApi.getAllFields().subscribe({
      next: (fields: Field[]) => {
        this.fields.set(fields);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading fields:', error);
        this.errorMessage.set('Failed to load fields. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  formatDate(date?: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
