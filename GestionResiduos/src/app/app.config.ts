import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withRouterConfig({ 
        paramsInheritanceStrategy: 'always',
        urlUpdateStrategy: 'eager',
        // Añade slash final a las URLs
        onSameUrlNavigation: 'reload'
      })
    ), 
    provideClientHydration(withEventReplay())
  ]
};
