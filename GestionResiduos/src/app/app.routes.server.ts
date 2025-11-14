import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // Use server-side rendering for catch-all/dynamic routes so parameterized
    // routes (like `foro/:id`) are rendered on demand and don't require
    // `getPrerenderParams` which is only needed for prerendering (SSG).
    renderMode: RenderMode.Server
  }
];
