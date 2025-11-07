import { Injectable } from '@angular/core';
import * as icons from 'lucide-angular';

/**
 * Minimal IconService adapter for Lucide Angular.
 * Lucide Angular renders icons via components, so no DOM replace is required.
 * This service keeps a reference to the icons map (if needed elsewhere)
 * and exposes init()/refresh() helpers used across the app.
 */
@Injectable({ providedIn: 'root' })
export class IconService {
  readonly icons = icons;

  /** No-op for compatibility with previous feather-based calls. */
  async init(): Promise<void> {
    return;
  }

  /** No-op for compatibility; kept for places that call refresh() after navigation. */
  refresh(): void {
    // Lucide Angular uses components; nothing to refresh at runtime.
  }
}
