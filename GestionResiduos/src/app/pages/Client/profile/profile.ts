import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../../services/api.service';
import { AuthStateService } from '../../../services/auth-state.service';
import { Subscription } from 'rxjs';

interface AchievementItem {
  id: number;
  nombre: string;
  descripcion: string;
  condicion: string;
  puntosOtorgados: number;
  icono: string;
  unlocked: boolean;
  fechaObtenido: string | null;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class UserProfile implements OnInit, OnDestroy {
  profile: any = null;
  isLoading = true;
  error = '';
  authReady = false;
  private subs = new Subscription();

  // ── Logros ──
  achievements: AchievementItem[] = [];
  isLoadingAchievements = false;

  constructor(
    private api: ApiService,
    private authState: AuthStateService
  ) {}

  ngOnInit(): void {
    this.subs.add(this.authState.initialized$.subscribe(v => {
      this.authReady = v;
      if (v) {
        this.loadProfile();
        this.loadAchievements();
      }
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.api.getUserProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar tu perfil.';
        this.isLoading = false;
      }
    });
  }

  private loadAchievements(): void {
    this.isLoadingAchievements = true;
    this.api.getMyAchievements().subscribe({
      next: (data) => {
        this.achievements = data;
        this.isLoadingAchievements = false;
      },
      error: () => {
        this.isLoadingAchievements = false;
      }
    });
  }

  get unlockedCount(): number {
    return this.achievements.filter(a => a.unlocked).length;
  }

  get totalCount(): number {
    return this.achievements.length;
  }

  get progressPercent(): number {
    if (this.totalCount === 0) return 0;
    return Math.round((this.unlockedCount / this.totalCount) * 100);
  }

  formatAchievementDate(fecha: string | null): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}