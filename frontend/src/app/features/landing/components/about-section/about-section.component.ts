import { Component } from '@angular/core';

interface Benefit {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [],
  template: `
    <section id="about" class="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Sports Arena
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive platform designed to bring together players, field owners, 
            and sports enthusiasts in one seamless ecosystem.
          </p>
        </div>

        <div class="max-w-4xl mx-auto mb-16">
          <div class="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <p class="text-lg text-gray-700 leading-relaxed mb-6">
              Sports Arena revolutionizes how sports facilities are managed and how players connect. 
              Our platform provides an intuitive interface for booking fields, organizing events, 
              and building a vibrant sports community.
            </p>
            <p class="text-lg text-gray-700 leading-relaxed">
              Whether you're looking to play a casual game, organize a tournament, or manage 
              multiple sports facilities, Sports Arena has everything you need to succeed.
            </p>
          </div>
        </div>

        <!-- Benefits for Different Users -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (benefit of benefits; track benefit.title) {
            <div class="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition">
              <div class="text-4xl mb-4">{{ benefit.icon }}</div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">
                {{ benefit.title }}
              </h3>
              <p class="text-gray-600 leading-relaxed">
                {{ benefit.description }}
              </p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class AboutSectionComponent {
  benefits: Benefit[] = [
    {
      icon: '👤',
      title: 'For Players',
      description: 'Easily find and book sports fields, join events, connect with other players, and build your sports network.',
    },
    {
      icon: '🏢',
      title: 'For Field Owners',
      description: 'Manage your facilities efficiently, track bookings and revenue, set availability, and grow your business.',
    },
    {
      icon: '🛡️',
      title: 'For Administrators',
      description: 'Monitor system health, manage users, and ensure smooth operations across all services.',
    },
  ];
}

