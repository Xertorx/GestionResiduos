import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class IconService {
  private loaded = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const feather = await import('feather-icons');
      feather.replace();
      this.loaded = true;

      // Observa el DOM y refresca Feather automáticamente cuando se agregan nodos
      const observer = new MutationObserver(async (mutations) => {
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            const feather = await import('feather-icons');
            feather.replace();
            break;
          }
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } catch (e) {
      console.warn('Could not load feather-icons', e);
    }
  }

  // Call when new DOM nodes with data-feather may have been added
  async refresh(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const feather = await import('feather-icons');
      // Small delay to allow DOM to settle after navigation
      setTimeout(() => feather.replace(), 0);
    } catch (e) {
      // ignore
    }
  }
}
