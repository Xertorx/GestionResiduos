import { Component, signal, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { isPlatformBrowser } from '@angular/common';
import { IconService } from './services/icon.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Header,Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  protected readonly title = signal('GestionResiduos');

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router, private iconService: IconService) {}

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.iconService.init();

      // Initialize AOS (Animate On Scroll) for client-side only
      try {
        const AOS = (await import('aos')).default;
        AOS.init({ once: true, duration: 800 });
      } catch (e) {
        console.warn('AOS failed to initialize', e);
      }

      // Refresh icons after navigation ends (handles lazy-loaded/dynamically inserted DOM)
      this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
        this.iconService.refresh();
        // Refresh AOS after navigation too
        (async () => {
          try {
            const AOS = (await import('aos')).default;
            AOS.refresh();
          } catch { /* ignore */ }
        })();
      });
    }
  }
}
