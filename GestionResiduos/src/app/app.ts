import { Component, signal, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { LucideAngularModule, Users, MapPin } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  protected readonly title = signal('GestionResiduos');

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // ✅ Inicializa AOS solo en el cliente
      try {
        const AOS = (await import('aos')).default;
        AOS.init({ once: true, duration: 800 });
      } catch (e) {
        console.warn('⚠️ AOS failed to initialize', e);
      }

      // ✅ Refresca animaciones después de cada navegación
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(async () => {
          try {
            const AOS = (await import('aos')).default;
            AOS.refresh();
          } catch { /* ignore */ }
        });
    }
  }
}
