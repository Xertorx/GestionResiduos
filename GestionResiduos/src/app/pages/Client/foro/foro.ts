import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthStateService } from '../../../services/auth-state.service';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-foro',
  imports: [RouterOutlet, CommonModule, RouterLink, FormsModule],
  templateUrl: './foro.html',
  styleUrl: './foro.scss'
})
export class Foro implements OnInit, OnDestroy {
  mostrandoDetalles = signal(false);
  isAuthenticated = false;
  authReady = false;
  private subs = new Subscription();

  temas: any[] = [];
  isLoading = false;
  error = '';

  nuevoTema = '';
  tituloTema = '';
  isCreating = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authState: AuthStateService,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.subs.add(this.authState.initialized$.subscribe(v => {
      this.authReady = v;
      if (v) this.loadTopics();
    }));
    this.subs.add(this.authState.isLoggedIn$.subscribe(v => this.isAuthenticated = v));
    this.route.firstChild?.params.subscribe(() => {
      this.mostrandoDetalles.set(true);
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  loadTopics(): void {
    this.isLoading = true;
    this.error = '';
    this.api.getActiveTopics().subscribe({
      next: (data) => { this.temas = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  verTema(id: number) {
    this.mostrandoDetalles.set(true);
    this.router.navigate(['/foro', id]);
  }

  crearNuevoTema() {
    if (!this.tituloTema.trim() || !this.nuevoTema.trim()) return;
    this.isCreating = true;
    this.mensajeError = null;

    this.api.createTopic({ titulo: this.tituloTema.trim(), descripcion: this.nuevoTema.trim() }).subscribe({
      next: () => {
        this.tituloTema = '';
        this.nuevoTema = '';
        this.isCreating = false;
        this.mensajeExito = 'Tu nuevo tema se ha creado correctamente.';
        setTimeout(() => (this.mensajeExito = null), 3000);
        this.loadTopics();
      },
      error: (err) => {
        this.isCreating = false;
        this.mensajeError = err?.error?.message || 'No se pudo crear el tema.';
        setTimeout(() => (this.mensajeError = null), 4000);
      }
    });
  }
}
