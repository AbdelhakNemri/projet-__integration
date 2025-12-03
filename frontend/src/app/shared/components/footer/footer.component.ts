import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-gray-900 text-gray-300">
      <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="col-span-1 md:col-span-2">
            <h3 class="text-2xl font-bold text-white mb-4">Sports Arena</h3>
            <p class="text-gray-400 mb-4">
              Your one-stop platform for managing sports fields, events, and connecting with players.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-white font-semibold mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li>
                <a routerLink="/" class="hover:text-white transition">Home</a>
              </li>
              <li>
                <a href="#features" class="hover:text-white transition">Features</a>
              </li>
              <li>
                <a href="#about" class="hover:text-white transition">About</a>
              </li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h4 class="text-white font-semibold mb-4">Support</h4>
            <ul class="space-y-2">
              <li>
                <a routerLink="/login" class="hover:text-white transition">Login</a>
              </li>
              <li>
                <a routerLink="/register" class="hover:text-white transition">Register</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {{ currentYear }} Sports Arena. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}

