import { Component } from '@angular/core';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { FeaturesSectionComponent } from '../features-section/features-section.component';
import { AboutSectionComponent } from '../about-section/about-section.component';
import { CtaSectionComponent } from '../cta-section/cta-section.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    HeroSectionComponent,
    FeaturesSectionComponent,
    AboutSectionComponent,
    CtaSectionComponent,
  ],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-header></app-header>
      <main class="flex-grow">
        <app-hero-section></app-hero-section>
        <app-features-section></app-features-section>
        <app-about-section></app-about-section>
        <app-cta-section></app-cta-section>
      </main>
      <app-footer></app-footer>
    </div>
  `,
})
export class LandingPageComponent {}

