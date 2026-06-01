import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About implements AfterViewInit, OnDestroy {
  private observers: IntersectionObserver[] = [];

  values = [
    { icon: 'leaf',        title: 'Sostenibilidad', desc: 'Promovemos prácticas que preservan el medio ambiente para las generaciones futuras.' },
    { icon: 'users',       title: 'Comunidad',      desc: 'Creemos en el poder colectivo para transformar la realidad ambiental de Ciudad Bolívar.' },
    { icon: 'shield',      title: 'Transparencia',  desc: 'Operamos con honestidad y claridad en cada proceso y decisión.' },
    { icon: 'trending-up', title: 'Innovación',     desc: 'Usamos tecnología para resolver problemas ambientales de forma eficiente.' },
    { icon: 'heart',       title: 'Compromiso',     desc: 'Estamos dedicados a generar un impacto positivo real y medible en nuestra comunidad.' },
    { icon: 'map-pin',     title: 'Localidad',      desc: 'Nuestro enfoque es hiperlocal: conocemos y servimos directamente a nuestra comunidad.' },
  ];

  stats = [
    { value: '500+', label: 'Usuarios registrados', icon: 'users' },
    { value: '120+', label: 'Reportes resueltos',   icon: 'check-circle' },
    { value: '45',   label: 'Eco-puntos activos',   icon: 'map-pin' },
    { value: '30+',  label: 'Barrios cubiertos',    icon: 'home' },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initRevealAnimations();
    this.onScroll(); // initial render
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const wrapper = document.querySelector<HTMLElement>('.panels-wrapper');
    const panels  = Array.from(document.querySelectorAll<HTMLElement>('.stack-panel'));
    if (!wrapper || panels.length < 2) return;

    // Total scrollable distance inside the wrapper
    const totalScroll = wrapper.offsetHeight - window.innerHeight; // 200vh
    const scrolled    = Math.max(0, -wrapper.getBoundingClientRect().top);

    // Each transition occupies an equal share of the total scrollable distance
    const segmentH = totalScroll / (panels.length - 1); // 200vh per pair

    // holdFraction: portion of each segment where the current panel stays static
    // before the next one starts overlapping. 0.40 → 80vh hold, 120vh transition.
    const holdFraction = 0.40;
    const transH = segmentH * (1 - holdFraction);

    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut

    panels.forEach((panel, i) => {
      const isFirst = i === 0;
      const isLast  = i === panels.length - 1;

      // ── ENTER: panel i rises from below, starting after the hold delay ────
      const enterStart = (i - 1) * segmentH + holdFraction * segmentH;
      const enterRaw   = isFirst
        ? 1
        : Math.max(0, Math.min(1, (scrolled - enterStart) / transH));
      const enterP = ease(enterRaw);

      // ── EXIT: panel i fades out in sync with the entering panel ───────────
      const exitStart = i * segmentH + holdFraction * segmentH;
      const exitRaw   = isLast
        ? 0
        : Math.max(0, Math.min(1, (scrolled - exitStart) / transH));
      const exitP = ease(exitRaw);

      // ── Apply transforms ───────────────────────────────────────────────────
      // Enter: slide up from 60 % below (not full 100 % — starts visible at half)
      const translateY = (1 - enterP) * 60;    // 60% → 0
      // Exit: slight scale down + drift up + fade
      const scale      = 1 - exitP * 0.08;
      const driftY     = -exitP * 3;           // % units
      const opacity    = enterP === 0 ? 0 : Math.max(0, 1 - exitP);
      const blur       = exitP * 7;

      panel.style.transform = `translateY(calc(${translateY}% + ${driftY}%)) scale(${scale})`;
      panel.style.opacity   = String(opacity);
      panel.style.filter    = blur > 0.05 ? `blur(${blur}px)` : '';
      panel.style.transformOrigin = 'center top';
    });
  }

  ngOnDestroy() {
    this.observers.forEach(o => o.disconnect());
  }

  private initRevealAnimations() {
    // Reveal individual elements with class "reveal"
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('revealed');
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
    this.observers.push(revealObs);

    // Split reveal: left/right for panel inners
    const splitObs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('revealed');
          }
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up, .reveal-scale').forEach(el => splitObs.observe(el));
    this.observers.push(splitObs);
  }
}
