import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss'
})
export class DashboardLayout implements OnInit, OnDestroy {
  private readonly authSubscriptions = new Subscription();

  isProfileMenuOpen = false;
  isSidebarOpen = false;
  isScrolled = false;
  authReady = false;
  isLoggedIn = false;
  nickname = '';
  email = '';

  constructor(private authState: AuthStateService) {}

  ngOnInit(): void {
    this.authSubscriptions.add(this.authState.initialized$.subscribe((value) => this.authReady = value));
    this.authSubscriptions.add(this.authState.isLoggedIn$.subscribe((value) => this.isLoggedIn = value));
    this.authSubscriptions.add(this.authState.nickname$.subscribe((value) => this.nickname = value));
    this.authSubscriptions.add(this.authState.email$.subscribe((value) => this.email = value));
  }

  ngOnDestroy(): void {
    this.authSubscriptions.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // activa sombra si se baja más de 10px
    this.isScrolled = window.scrollY > 10;
  }

  // Definición del menú de la barra lateral
  menuItems = [
    { label: 'Inicio', route: '/dashboard', icon: 'home' },
    { label: 'Usuarios', route: '/dashboard/usuarios', icon: 'users' },
    { label: 'Eco-puntos', route: '/dashboard/eco-puntos', icon: 'map-pin' },
    { label: 'Calendario', route: '/dashboard/calendario-recoleccion', icon: 'calendar' },
    { label: 'Reportes', route: '/dashboard/reportes', icon: 'BarChart2' },
    { label: 'Educación', route: '/dashboard/educacion', icon: 'book-open' },
    { label: 'Seguimiento', route: '/dashboard/seguimiento', icon: 'trending-up' },
    { label: 'Foro', route: '/dashboard/foro', icon: 'message-square' }
  ];

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  
  }

  onMenuClick(event: MouseEvent, item: any) {
    // Buscar data-father de forma robusta:
    // 1) intentar en currentTarget (el <a> al que se asoció el listener)
    // 2) si no está (por ejemplo click sobre el <i> transformado a <svg>), buscar el ancestro más cercano con [data-father]
    const el = event.currentTarget as HTMLElement | null;
    const target = event.target as HTMLElement | null;

    let father: string | null = null;
    if (el?.dataset && el.dataset['father']) {
      father = el.dataset['father'];
    } else if (target) {
      // closest encuentra el ancestro (incluye el propio elemento) que tenga el atributo
      const closestWithAttr = target.closest('[data-father]') as HTMLElement | null;
      father = closestWithAttr?.dataset ? (closestWithAttr.dataset['father'] ?? null) : null;
    }

    // Fallback: si no se encontró, usar label del item (útil si quieres asegurar valor)
    if (!father && item && item.label) father = item.label;

    console.log('menu click', { item, father });
    // Si quieres evitar la navegación por defecto (por ejemplo para procesar antes):
    // event.preventDefault();
  }

  ngAfterViewInit() {
    // No longer needed as we're using Lucide Angular components
  }
  openModal() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Confirma el cierre de sesión',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.authState.logout();
      }
    });
  }

}