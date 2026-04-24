import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { AUTH_INTERCEPTOR_PROVIDER } from './interceptors/auth.interceptor';
import { routes } from './app.routes';
import { LUCIDE_ICONS } from './shared/components/lucide-icons';
import { LucideAngularModule } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
        urlUpdateStrategy: 'eager',
        onSameUrlNavigation: 'reload'
      })
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    AUTH_INTERCEPTOR_PROVIDER,
    importProvidersFrom(LucideAngularModule.pick(LUCIDE_ICONS))
    // ← sin nada de Google aquí
  ]
};