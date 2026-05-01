import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';

interface RankingUser {
  position: number;
  names: string;
  lastName: string;
  nickName: string;
  photo: string | null;
  points: number;
  neighborhoodName: string;
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './ranking.html',
  styleUrl: './ranking.scss'
})
export class Ranking implements OnInit {
  rankingList: RankingUser[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadRanking();
  }

  loadRanking(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.api.getRanking(50).subscribe({
      next: (data) => {
        this.rankingList = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar ranking:', err);
        this.errorMessage = 'No se pudo cargar el ranking. Intenta de nuevo más tarde.';
        this.isLoading = false;
      }
    });
  }

  /** Retorna las iniciales del usuario para el avatar fallback */
  getInitials(user: RankingUser): string {
    const first = user.names?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  /** Icono de medalla según la posición */
  getMedalIcon(position: number): string {
    switch (position) {
      case 1: return 'crown';
      case 2: return 'medal';
      case 3: return 'medal';
      default: return '';
    }
  }

  /** Clase de color para la medalla del top 3 */
  getMedalColorClass(position: number): string {
    switch (position) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-gray-400';
    }
  }

  /** Clase de fondo para la tarjeta del top 3 */
  getTopCardClass(position: number): string {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 ring-2 ring-yellow-200';
      case 2: return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 ring-1 ring-gray-200';
      case 3: return 'bg-gradient-to-r from-orange-50 to-amber-50 border-amber-200 ring-1 ring-amber-200';
      default: return 'bg-white border-gray-100';
    }
  }

  /** Clase del badge de posición */
  getPositionBadgeClass(position: number): string {
    switch (position) {
      case 1: return 'bg-yellow-400 text-yellow-900 shadow-yellow-200';
      case 2: return 'bg-gray-300 text-gray-800 shadow-gray-200';
      case 3: return 'bg-amber-400 text-amber-900 shadow-amber-200';
      default: return 'bg-emerald-100 text-emerald-700';
    }
  }

  /** Clase del avatar según posición */
  getAvatarRingClass(position: number): string {
    switch (position) {
      case 1: return 'ring-2 ring-yellow-400';
      case 2: return 'ring-2 ring-gray-300';
      case 3: return 'ring-2 ring-amber-400';
      default: return 'ring-1 ring-emerald-200';
    }
  }

  /** Nombre para mostrar: nickname o nombres + apellido */
  getDisplayName(user: RankingUser): string {
    if (user.nickName) return user.nickName;
    return `${user.names} ${user.lastName}`.trim();
  }

  /** Nombre completo (para tooltip o subtexto) */
  getFullName(user: RankingUser): string {
    return `${user.names} ${user.lastName}`.trim();
  }
}