import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ReportService } from '../../services/report.service';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-report-stats',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseChartDirective],
  templateUrl: './report-stats.component.html',
  styleUrls: ['./report-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ provideCharts(withDefaultRegisterables()) ]
})
export class ReportStatsComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  error: string | null = null;
  stats: any = null;
  cache = new Map<string, any>();
  // barrios removed: reports are not filtered by barrio anymore

  // Chart placeholders (use any to avoid chart.js dependency until installed)
  pieChartData: any = null;
  pieChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      tooltip: { enabled: true }
    }
  };

  barChartData: any = null;
  barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: {}, y: { beginAtZero: true } },
    plugins: { legend: { display: false }, tooltip: { enabled: true } }
  };

  lineChartData: any = null;
  lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: {}, y: { beginAtZero: true } },
    plugins: { legend: { position: 'top' }, tooltip: { enabled: true } }
  };

  constructor(private fb: FormBuilder, private reportService: ReportService, private cdr: ChangeDetectorRef) {
    this.filterForm = this.fb.group({
      startDate: [null],
      endDate: [null],
      status: ['']
    });
  }

  ngOnInit() {
    // Load global statistics on component init (no filters)
    this.loadAllStatistics();

    // Also keep reactive filter behavior for filtered stats if user changes dates
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      tap(() => { this.loading = true; this.error = null; }),
      switchMap(filters => {
        const key = JSON.stringify(filters);
        if (this.cache.has(key)) {
          this.stats = this.cache.get(key);
          console.log('[ReportStats] cache hit', this.stats);
          this.mapStatsToCharts(this.stats);
          this.loading = false;
          this.cdr.markForCheck();
          return of(null);
        }
        console.log('[ReportStats] calling getStats with', filters);
        return this.reportService.getStats(filters).pipe(
          tap(data => {
            console.log('[ReportStats] getStats response', data);
            this.stats = data;
            this.cache.set(key, data);
            this.mapStatsToCharts(data);
            this.loading = false;
            this.cdr.markForCheck();
          }),
          catchError(err => {
            console.error('[ReportStats] getStats error', err);
            this.error = 'Error al cargar estadísticas';
            this.loading = false;
            this.cdr.markForCheck();
            return of(null);
          })
        );
      })
    ).subscribe();
    this.filterForm.patchValue({ startDate: this.getDefaultStart(), endDate: this.getDefaultEnd() }, { emitEvent: false });
  }

  private loadAllStatistics() {
    this.loading = true;
    this.reportService.getStatistics().pipe(
      catchError((err) => {
        this.error = 'No se pudieron cargar las estadísticas generales';
        this.loading = false;
        console.error('[ReportStats] getStatistics error', err);
        return of(null);
      })
    ).subscribe(data => {
      if (data) {
        this.stats = data;
        this.mapStatsToCharts(data);
      }
      this.loading = false;
      this.cdr.markForCheck();
    });
  }


  private mapStatsToCharts(data: any) {
    if (!data) {
      this.pieChartData = null;
      this.barChartData = null;
      this.lineChartData = null;
      return;
    }

    // Pie: distribución por estado — construido desde los campos planos de la API
    const pending  = data.pending  ?? data.byStatus?.PENDIENTE   ?? 0;
    const inReview = data.inReview ?? data.byStatus?.EN_REVISION  ?? 0;
    const resolved = data.resolved ?? data.byStatus?.RESUELTO     ?? 0;
    const rejected = data.rejected ?? data.byStatus?.RECHAZADO    ?? 0;
    this.pieChartData = {
      labels: ['Pendiente', 'En revisión', 'Resuelto', 'Rechazado'],
      datasets: [{ data: [pending, inReview, resolved, rejected],
                   backgroundColor: ['#f59e0b', '#6366f1', '#059669', '#ef4444'] }]
    };

    // Bar: comparativa por tipo de reporte
    const criticalPoints       = data.criticalPoints        ?? 0;
    const calendarNonCompliance = data.calendarNonCompliance ?? 0;
    this.barChartData = {
      labels: ['Punto crítico', 'Incumplimiento calendario'],
      datasets: [{ label: 'Reportes', data: [criticalPoints, calendarNonCompliance],
                   backgroundColor: ['#059669', '#3b82f6'] }]
    };

    // Line: tendencia si la API la devuelve; si no, usa los totales por estado como snapshot
    const trend = data.trend || data.timeSeries || [];
    if (Array.isArray(trend) && trend.length > 0) {
      const lineLabels = trend.map((t: any) => t.label || t.date);
      const lineValues = trend.map((t: any) => t.count || t.value || 0);
      this.lineChartData = { labels: lineLabels,
        datasets: [{ label: 'Tendencia', data: lineValues, borderColor: '#3b82f6', fill: false, tension: 0.3 }] };
    } else {
      // Fallback: comparativa de estados como gráfico de línea puntual
      this.lineChartData = {
        labels: ['Pendiente', 'En revisión', 'Resuelto', 'Rechazado'],
        datasets: [{ label: 'Reportes por estado', data: [pending, inReview, resolved, rejected],
                     borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.15)', fill: true, tension: 0.3 }]
      };
    }

    // Asegurar que los campos planos estén en stats para las tarjetas KPI
    this.stats = { ...data, pending, inReview, resolved, rejected, criticalPoints, calendarNonCompliance };
    const totalCount = Math.max(data.total ?? (pending + inReview + resolved + rejected), 1);
    this.stats.total = totalCount;
    this.stats.percentResolved = data.percentResolved ?? Number(((resolved / totalCount) * 100).toFixed(1));
    this.stats.percentPending  = data.percentPending  ?? Number(((pending  / totalCount) * 100).toFixed(1));
    this.stats.avgResolutionTime = data.avgResolutionTime ?? data.avgHoursToResolve ?? null;
  }

  refresh() {
    // invalidar cache y volver a disparar
    this.cache.clear();
    this.filterForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }

  exportCSV() {
    if (!this.stats) return;
    // Exportar por ejemplo la tabla por barrio
    const rows: string[] = [];
    rows.push('Barrio,Count');
    const byBarrio = this.stats.byBarrio || this.stats.barrioCounts || [];
    if (Array.isArray(byBarrio)) {
      byBarrio.forEach((b: any) => rows.push(`${(b.name || b.barrio) ?? ''},${b.count ?? b.total ?? 0}`));
    } else {
      Object.keys(byBarrio).forEach(k => rows.push(`${k},${byBarrio[k]}`));
    }
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-stats-${this.filterForm.value.startDate || 'all'}-to-${this.filterForm.value.endDate || 'all'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getDefaultStart() {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().substring(0, 10);
  }
  getDefaultEnd() {
    return new Date().toISOString().substring(0, 10);
  }
}
