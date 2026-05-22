import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';
import { EducationService } from '../../../services/education.service';

@Component({
  selector: 'app-admin-seguimiento',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './seguimiento.html',
  styleUrls: ['./seguimiento.scss']
})
export class SeguimientoAdmin implements OnInit {
  isLoading = true;
  error = '';
  lastUpdated: Date | null = null;

  // ── Datos crudos ──
  allUsers: any[] = [];
  allEcopoints: any[] = [];
  activeEcopoints: any[] = [];
  reportStats: any = null;
  educationCount = 0;

  constructor(
    private api: ApiService,
    private educationService: EducationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = '';
    forkJoin({
      users:          this.api.adminListUsers().pipe(catchError(() => of([]))),
      ecopoints:      this.api.getAllEcopoints().pipe(catchError(() => of([]))),
      activeEco:      this.api.getActiveEcopoints().pipe(catchError(() => of([]))),
      reportStats:    this.api.getReportStatistics().pipe(catchError(() => of(null))),
      education:      this.educationService.getAll().pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        this.allUsers       = Array.isArray(res.users)     ? res.users     : [];
        this.allEcopoints   = Array.isArray(res.ecopoints) ? res.ecopoints : [];
        this.activeEcopoints= Array.isArray(res.activeEco) ? res.activeEco : [];
        this.reportStats    = res.reportStats;
        this.educationCount = Array.isArray(res.education) ? res.education.length : 0;
        this.lastUpdated    = new Date();
        this.isLoading      = false;
      },
      error: () => { this.error = 'Error al cargar las métricas.'; this.isLoading = false; }
    });
  }

  // ── Usuarios ──
  get totalUsers():    number { return this.allUsers.length; }
  get activeUsers():   number { return this.allUsers.filter(u => u.status === 'ACTIVO' || u.status === 'activo' || u.status === 'VERIFICADO').length; }
  get inactiveUsers(): number { return this.totalUsers - this.activeUsers; }
  get activeUsersPercent(): number {
    return this.totalUsers ? Math.round((this.activeUsers / this.totalUsers) * 100) : 0;
  }
  get usersByRole(): { role: string; count: number }[] {
    const map: Record<string, number> = {};
    this.allUsers.forEach(u => { const r = u.role?.name ?? 'Sin rol'; map[r] = (map[r] ?? 0) + 1; });
    return Object.entries(map).map(([role, count]) => ({ role, count }));
  }

  // ── Ecopuntos ──
  get totalEcopoints():       number { return this.allEcopoints.length; }
  get activeEcopointsCount(): number { return this.activeEcopoints.length; }
  get inactiveEcopointsCount(): number { return this.totalEcopoints - this.activeEcopointsCount; }
  get activeEcopointsPercent(): number {
    return this.totalEcopoints ? Math.round((this.activeEcopointsCount / this.totalEcopoints) * 100) : 0;
  }
  get ecopointsByType(): { type: string; count: number }[] {
    const map: Record<string, number> = {};
    this.allEcopoints.forEach(ep => {
      (ep.residueTypes ?? []).forEach((t: string) => { map[t] = (map[t] ?? 0) + 1; });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, count }));
  }

  // ── Reportes ──
  get totalReports():    number { return this.reportStats?.total    ?? 0; }
  get pendingReports():  number { return this.reportStats?.pending   ?? 0; }
  get inReviewReports(): number { return this.reportStats?.inReview  ?? 0; }
  get resolvedReports(): number { return this.reportStats?.resolved  ?? 0; }
  get rejectedReports(): number { return this.reportStats?.rejected  ?? 0; }
  get resolvedReportsPercent(): number {
    return this.totalReports ? Math.round((this.resolvedReports / this.totalReports) * 100) : 0;
  }

  formatResidueType(type: string): string {
    const map: Record<string, string> = {
      ORGANICO: 'Orgánico', RECICLABLE: 'Reciclable',
      ESPECIAL: 'Especial', PELIGROSO: 'Peligroso', ELECTRONICO: 'Electrónico',
    };
    return map[type] ?? type;
  }
}
