import { Component } from '@angular/core';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [],
  template: `
    <section id="features" class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features for Everyone
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Whether you're a player, field owner, or administrator, we have the tools you need.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          @for (feature of features; track feature.title) {
            <div class="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition transform hover:-translate-y-2">
              <div class="text-5xl mb-4">{{ feature.icon }}</div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">
                {{ feature.title }}
              </h3>
              <p class="text-gray-600 leading-relaxed">
                {{ feature.description }}
              </p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class FeaturesSectionComponent {
  features: Feature[] = [
    {
      icon: '🏟️',
      title: 'Find & Book Fields',
      description: 'Browse and book sports fields in your city. Search by location, type, and availability.',
    },
    {
      icon: '⚽',
      title: 'Join Sports Events',
      description: 'Discover and join public events or get invited to private matches. Connect with other players.',
    },
    {
      icon: '📅',
      title: 'Manage Your Fields',
      description: 'Field owners can easily manage availability, bookings, and track revenue all in one place.',
    },
    {
      icon: '⭐',
      title: 'Rate & Review',
      description: 'Share your experience by rating fields and players. Help the community make better choices.',
    },
    {
      icon: '👥',
      title: 'Connect with Players',
      description: 'Build your network, find teammates, and create lasting connections in the sports community.',
    },
    {
      icon: '🔔',
      title: 'Real-time Notifications',
      description: 'Stay updated with instant notifications about bookings, invitations, and important updates.',
    },
    {
      icon: '📊',
      title: 'Analytics & Insights',
      description: 'Track your bookings, events, and performance with detailed statistics and reports.',
    },
    {
      icon: '🔒',
      title: 'Secure & Reliable',
      description: 'Your data is protected with industry-standard security and reliable infrastructure.',
    },
  ];
}

